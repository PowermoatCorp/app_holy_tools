package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestCreateDefaultConfigIncludesBackupSettings(t *testing.T) {
	service := NewConfigService()
	cfg := service.createDefaultConfig()

	if !cfg.Backup.Enabled {
		t.Fatal("expected default backup to be enabled")
	}

	if cfg.Backup.IntervalMinutes <= 0 {
		t.Fatalf("expected backup interval to be positive, got %d", cfg.Backup.IntervalMinutes)
	}

	if cfg.Backup.Folder == "" {
		t.Fatal("expected backup folder to be set")
	}
}

func TestBackupServiceCreatesBackupFile(t *testing.T) {
	dir := t.TempDir()
	configPath := filepath.Join(dir, "config.json")
	backupFolder := filepath.Join(dir, "backups")

	cfg := &Config{
		Version:     "1.0.0",
		Database:    Database{},
		Application: Application{Language: "zh-TW", Theme: "light"},
		Backup: BackupSettings{
			Enabled:          true,
			IntervalMinutes:  60,
			Folder:           backupFolder,
			KeepCount:        3,
			LastBackup:      time.Time{},
		},
		Metadata: Metadata{
			CreatedAt:    time.Now(),
			LastModified: time.Now(),
			ModifiedBy:   "tester",
		},
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		t.Fatalf("marshal config: %v", err)
	}
	if err := os.WriteFile(configPath, data, 0644); err != nil {
		t.Fatalf("write config file: %v", err)
	}

	service := &ConfigService{config: cfg, configPath: configPath}
	backupService := NewBackupService(service)
	result := backupService.RunBackup()

	if !result.Success {
		t.Fatalf("expected backup to succeed, got: %s", result.Message)
	}

	if _, err := os.Stat(result.FilePath); err != nil {
		t.Fatalf("expected backup file to exist: %v", err)
	}
}
