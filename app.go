package main

import (
	"context"
	"powermoat_app_tools/config"
)

// App struct
type App struct {
	ctx           context.Context
	configService *config.ConfigService
	backupService *config.BackupService
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		configService: config.NewConfigService(),
		backupService: nil,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// 載入設定檔
	if err := a.configService.LoadConfig(); err != nil {
		println("Failed to load config:", err.Error())
	}

	if a.backupService == nil {
		a.backupService = config.NewBackupService(a.configService)
	}
	a.backupService.Start()
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return "Hello " + name + ", It's show time!"
}

// GetConfig 取得應用程式設定
func (a *App) GetConfig() *config.Config {
	return a.configService.GetConfig()
}

// SaveConfig 儲存應用程式設定
func (a *App) SaveConfig(cfg *config.Config) error {
	if err := a.configService.UpdateConfig(cfg); err != nil {
		return err
	}
	if a.backupService != nil {
		a.backupService.Stop()
		a.backupService.Start()
	}
	return nil
}

// RunManualBackup 執行手動備份
func (a *App) RunManualBackup() *config.BackupResult {
	if a.backupService == nil {
		a.backupService = config.NewBackupService(a.configService)
	}
	result := a.backupService.RunBackup()
	return &result
}

// TestDatabaseConnection 測試資料庫連線
func (a *App) TestDatabaseConnection(db *config.Database) *config.ConnectionTestResult {
	return config.TestConnection(db)
}
