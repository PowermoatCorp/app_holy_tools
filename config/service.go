package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// ConfigService 設定檔服務
type ConfigService struct {
	config     *Config
	configPath string
}

// NewConfigService 創建設定服務實例
func NewConfigService() *ConfigService {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		homeDir = "."
	}

	configDir := filepath.Join(homeDir, ".powermoat_app_tools")
	configPath := filepath.Join(configDir, "config.json")

	return &ConfigService{
		configPath: configPath,
	}
}

// LoadConfig 載入設定檔
func (s *ConfigService) LoadConfig() error {
	// 確保設定目錄存在
	configDir := filepath.Dir(s.configPath)
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	// 檢查設定檔是否存在
	if _, err := os.Stat(s.configPath); os.IsNotExist(err) {
		// 創建預設設定
		s.config = s.createDefaultConfig()
		return s.SaveConfig()
	}

	// 讀取設定檔
	data, err := os.ReadFile(s.configPath)
	if err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	// 解析 JSON
	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return fmt.Errorf("failed to parse config file: %w", err)
	}

	needsBackupDefaults := config.Backup.Folder == ""
	if needsBackupDefaults {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			homeDir = "."
		}
		config.Backup = BackupSettings{
			Enabled:         true,
			IntervalMinutes: 60,
			Folder:          filepath.Join(homeDir, ".powermoat_app_tools", "backups"),
			KeepCount:       5,
			LastBackup:      time.Time{},
		}
	}

	s.config = &config
	if needsBackupDefaults {
		if err := s.SaveConfig(); err != nil {
			return fmt.Errorf("failed to upgrade legacy config with backup settings: %w", err)
		}
	}
	return nil
}

// SaveConfig 儲存設定檔
func (s *ConfigService) SaveConfig() error {
	if s.config == nil {
		return fmt.Errorf("config is nil")
	}

	// 更新最後修改時間
	s.config.Metadata.LastModified = time.Now()

	// 轉換為 JSON
	data, err := json.MarshalIndent(s.config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	// 寫入檔案
	if err := os.WriteFile(s.configPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	return nil
}

// GetConfig 取得當前設定
func (s *ConfigService) GetConfig() *Config {
	return s.config
}

// UpdateConfig 更新設定
func (s *ConfigService) UpdateConfig(config *Config) error {
	if config == nil {
		return fmt.Errorf("config is nil")
	}
	s.config = config
	return s.SaveConfig()
}

// createDefaultConfig 創建預設設定
func (s *ConfigService) createDefaultConfig() *Config {
	now := time.Now()
	homeDir, err := os.UserHomeDir()
	if err != nil {
		homeDir = "."
	}

	return &Config{
		Version: "1.0.0",
		Database: Database{
			Type:     "mssql",
			Host:     "localhost",
			Port:     1433,
			Username: "",
			Password: "",
			Database: "",
		},
		Application: Application{
			Language: "zh-TW",
			Theme:    "light",
		},
		Backup: BackupSettings{
			Enabled:         true,
			IntervalMinutes: 60,
			Folder:          filepath.Join(homeDir, ".powermoat_app_tools", "backups"),
			KeepCount:       5,
			LastBackup:      time.Time{},
		},
		Metadata: Metadata{
			CreatedAt:    now,
			LastModified: now,
			ModifiedBy:   "system",
		},
	}
}
