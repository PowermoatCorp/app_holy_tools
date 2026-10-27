package config

import "time"

// Config 主設定結構
type Config struct {
	Version     string          `json:"version"`
	Database    Database        `json:"database"`
	Application Application     `json:"application"`
	Backup      BackupSettings  `json:"backup"`
	Metadata    Metadata        `json:"metadata"`
}

// Database 資料庫連線設定
type Database struct {
	Type     string `json:"type"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
	Database string `json:"database"`
}

// Application 應用程式設定
type Application struct {
	Language string `json:"language"`
	Theme    string `json:"theme"`
}

// Metadata 設定檔元數據
type Metadata struct {
	CreatedAt    time.Time `json:"createdAt"`
	LastModified time.Time `json:"lastModified"`
	ModifiedBy   string    `json:"modifiedBy"`
}

// ConnectionTestResult 連線測試結果
type ConnectionTestResult struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Latency int    `json:"latency"`
}
