package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

// BackupSettings 定時備份設定
// 會備份 config.json，並保留指定數量的歷史備份檔案。
type BackupSettings struct {
	Enabled         bool      `json:"enabled"`
	IntervalMinutes int       `json:"intervalMinutes"`
	Folder          string    `json:"folder"`
	KeepCount       int       `json:"keepCount"`
	LastBackup      time.Time `json:"lastBackup"`
}

// BackupResult 備份執行結果
// 會用於前端顯示備份成功/失敗訊息。
type BackupResult struct {
	Success  bool      `json:"success"`
	Message  string    `json:"message"`
	FilePath string    `json:"filePath"`
	BackupAt time.Time `json:"backupAt"`
}

// BackupService 定時備份服務
// 由 App 啟動後自動檢查備份設定並定期執行。
type BackupService struct {
	configService *ConfigService
	ticker        *time.Ticker
	stopCh        chan struct{}
	mu            sync.Mutex
}

// BackupFileInfo 備份檔案資訊
// 用於前端列表顯示與還原操作。
type BackupFileInfo struct {
	Name      string    `json:"name"`
	Path      string    `json:"path"`
	Size      int64     `json:"size"`
	CreatedAt time.Time `json:"createdAt"`
}

// NewBackupService 建立備份服務
func NewBackupService(service *ConfigService) *BackupService {
	return &BackupService{configService: service}
}

// Start 啟動定時備份
func (s *BackupService) Start() {
	if s == nil || s.configService == nil || s.configService.GetConfig() == nil {
		return
	}

	cfg := s.configService.GetConfig()
	if !cfg.Backup.Enabled || cfg.Backup.IntervalMinutes <= 0 {
		return
	}

	s.mu.Lock()
	if s.ticker != nil {
		s.mu.Unlock()
		return
	}

	interval := time.Duration(cfg.Backup.IntervalMinutes) * time.Minute
	s.ticker = time.NewTicker(interval)
	s.stopCh = make(chan struct{})
	s.mu.Unlock()

	go func() {
		for {
			select {
			case <-s.stopCh:
				s.mu.Lock()
				if s.ticker != nil {
					s.ticker.Stop()
					s.ticker = nil
				}
				s.mu.Unlock()
				return
			case <-s.ticker.C:
				s.RunBackup()
			}
		}
	}()
}

// Stop 停止定時備份
func (s *BackupService) Stop() {
	if s == nil {
		return
	}

	s.mu.Lock()
	if s.stopCh != nil {
		close(s.stopCh)
		s.stopCh = nil
	}
	if s.ticker != nil {
		s.ticker.Stop()
		s.ticker = nil
	}
	s.mu.Unlock()
}

// RunBackup 執行一次備份
func (s *BackupService) RunBackup() BackupResult {
	if s == nil || s.configService == nil {
		return BackupResult{Success: false, Message: "backup service is nil"}
	}

	cfg := s.configService.GetConfig()
	if cfg == nil {
		return BackupResult{Success: false, Message: "config is not initialized"}
	}

	backupDir := cfg.Backup.Folder
	if backupDir == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			homeDir = "."
		}
		backupDir = filepath.Join(homeDir, ".powermoat_app_tools", "backups")
		cfg.Backup.Folder = backupDir
	}

	if err := os.MkdirAll(backupDir, 0755); err != nil {
		return BackupResult{Success: false, Message: fmt.Sprintf("failed to create backup folder: %v", err)}
	}

	sourcePath := s.configService.configPath
	if sourcePath == "" {
		sourcePath = filepath.Join(backupDir, "config.json")
	}
	if _, err := os.Stat(sourcePath); err != nil {
		if err := s.configService.SaveConfig(); err != nil {
			return BackupResult{Success: false, Message: fmt.Sprintf("failed to initialize config file: %v", err)}
		}
	}

	backupTime := time.Now()
	fileName := fmt.Sprintf("config-backup-%s.json", backupTime.Format("20060102-150405"))
	filePath := filepath.Join(backupDir, fileName)

	content, err := os.ReadFile(sourcePath)
	if err != nil {
		return BackupResult{Success: false, Message: fmt.Sprintf("failed to read config file: %v", err)}
	}

	if err := os.WriteFile(filePath, content, 0644); err != nil {
		return BackupResult{Success: false, Message: fmt.Sprintf("failed to write backup file: %v", err)}
	}

	cfg.Backup.LastBackup = backupTime
	if cfg.Backup.KeepCount <= 0 {
		cfg.Backup.KeepCount = 5
	}
	if err := s.configService.SaveConfig(); err != nil {
		return BackupResult{Success: false, Message: fmt.Sprintf("failed to update backup metadata: %v", err)}
	}

	if err := pruneOldBackups(backupDir, cfg.Backup.KeepCount); err != nil {
		return BackupResult{Success: false, Message: fmt.Sprintf("backup created but prune failed: %v", err)}
	}

	return BackupResult{
		Success:  true,
		Message:  "backup completed successfully",
		FilePath: filePath,
		BackupAt: backupTime,
	}
}

func pruneOldBackups(backupDir string, keepCount int) error {
	entries, err := os.ReadDir(backupDir)
	if err != nil {
		return err
	}

	files := make([]os.DirEntry, 0)
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if strings.HasPrefix(entry.Name(), "config-backup-") && strings.HasSuffix(entry.Name(), ".json") {
			files = append(files, entry)
		}
	}

	if len(files) <= keepCount {
		return nil
	}

	type backupFile struct {
		name string
		mod  time.Time
	}
	items := make([]backupFile, 0, len(files))
	for _, file := range files {
		info, err := file.Info()
		if err != nil {
			continue
		}
		items = append(items, backupFile{name: filepath.Join(backupDir, file.Name()), mod: info.ModTime()})
	}

	sort.Slice(items, func(i, j int) bool {
		return items[i].mod.Before(items[j].mod)
	})

	for i := 0; i < len(items)-keepCount; i++ {
		if err := os.Remove(items[i].name); err != nil {
			return err
		}
	}

	return nil
}

// ListBackups 列出備份檔案
func (s *BackupService) ListBackups() ([]BackupFileInfo, error) {
	if s == nil || s.configService == nil || s.configService.GetConfig() == nil {
		return nil, fmt.Errorf("backup service is not initialized")
	}

	backupDir := s.configService.GetConfig().Backup.Folder
	if backupDir == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			homeDir = "."
		}
		backupDir = filepath.Join(homeDir, ".powermoat_app_tools", "backups")
	}

	entries, err := os.ReadDir(backupDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []BackupFileInfo{}, nil
		}
		return nil, fmt.Errorf("failed to read backup directory: %w", err)
	}

	result := make([]BackupFileInfo, 0)
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if !strings.HasPrefix(entry.Name(), "config-backup-") || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}

		fullPath := filepath.Join(backupDir, entry.Name())
		info, err := entry.Info()
		if err != nil {
			continue
		}
		result = append(result, BackupFileInfo{
			Name:      entry.Name(),
			Path:      fullPath,
			Size:      info.Size(),
			CreatedAt: info.ModTime(),
		})
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].CreatedAt.After(result[j].CreatedAt)
	})

	return result, nil
}

// RestoreBackup 從指定備份檔還原設定
func (s *BackupService) RestoreBackup(fileName string) error {
	if s == nil || s.configService == nil {
		return fmt.Errorf("backup service is not initialized")
	}
	if fileName == "" {
		return fmt.Errorf("backup file name is empty")
	}

	backupDir := s.configService.GetConfig().Backup.Folder
	if backupDir == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			homeDir = "."
		}
		backupDir = filepath.Join(homeDir, ".powermoat_app_tools", "backups")
	}

	backupPath := filepath.Join(backupDir, fileName)
	content, err := os.ReadFile(backupPath)
	if err != nil {
		return fmt.Errorf("failed to read backup file: %w", err)
	}

	var restored Config
	if err := json.Unmarshal(content, &restored); err != nil {
		return fmt.Errorf("failed to parse backup file: %w", err)
	}

	if err := s.configService.UpdateConfig(&restored); err != nil {
		return fmt.Errorf("failed to restore config: %w", err)
	}
	return nil
}

// DeleteBackup 刪除指定備份檔
func (s *BackupService) DeleteBackup(fileName string) error {
	if s == nil || s.configService == nil {
		return fmt.Errorf("backup service is not initialized")
	}
	if fileName == "" {
		return fmt.Errorf("backup file name is empty")
	}

	backupDir := s.configService.GetConfig().Backup.Folder
	if backupDir == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			homeDir = "."
		}
		backupDir = filepath.Join(homeDir, ".powermoat_app_tools", "backups")
	}

	backupPath := filepath.Join(backupDir, fileName)
	if err := os.Remove(backupPath); err != nil {
		return fmt.Errorf("failed to delete backup file: %w", err)
	}
	return nil
}

// OpenBackupDir 開啟備份資料夾
func (s *BackupService) OpenBackupDir() string {
	if s == nil || s.configService == nil || s.configService.GetConfig() == nil {
		return ""
	}
	backupDir := s.configService.GetConfig().Backup.Folder
	if backupDir == "" {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			homeDir = "."
		}
		backupDir = filepath.Join(homeDir, ".powermoat_app_tools", "backups")
	}
	return backupDir
}
