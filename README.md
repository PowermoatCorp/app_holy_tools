# PowerMoat Management Tools

這是一個以桌面產品化為目標的 Wails + React 應用程式，已具備自動備份、歷史管理、還原與刪除等完整工具流程。

## 產品定位

- 目標：做成可發佈、可部署的桌面工具
- 架構：Wails + Go + React + Vite
- 風格：原生桌面感、簡潔設定頁、明確操作流程
- 現況：已具備核心備份與設定管理功能，適合進一步包裝成正式發行版本

## 技術棧

- 後端：Go + Wails v2
- 前端：React 18 + Vite
- 平台：Windows / macOS / Linux
- 產出：可進行桌面應用打包與發行

## 功能總覽

- ✅ 自動備份排程
- ✅ 手動立即備份
- ✅ 備份資料夾設定
- ✅ 保留份數管理
- ✅ 備份歷史列表
- ✅ 還原備份
- ✅ 刪除舊備份
- ✅ 開啟備份資料夾
- ✅ 桌面化導覽與設定頁面

## 專案結構

```text
powermoat_app_tools/
├── app.go              # Wails 使用的 App 邏輯
├── main.go             # 程式入口
├── go.mod              # Go 模組配置
├── wails.json          # Wails 發行設定
├── config/             # 設定與備份邏輯
│   ├── backup.go
│   ├── service.go
│   ├── models.go
│   └── backup_test.go
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── pages/
│   │   └── style.css
│   ├── wailsjs/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── docs/
│   └── ...
├── build/
│   └── bin/
└── README.md
```

## 環境需求

- Go 1.21+
- Node.js 18+
- npm

### Linux 依賴（若要在 Linux 編譯）

```bash
# Ubuntu / Debian
sudo apt-get install build-essential libgtk-3-dev libwebkit2gtk-4.0-dev

# Fedora
sudo dnf install gtk3-devel webkit2gtk3-devel

# Arch
sudo pacman -S gtk3 webkit2gtk
```

## 安裝與開發

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest

export PATH=$PATH:$(go env GOPATH)/bin

go mod tidy
cd frontend
npm install
cd ..
```

### 啟動開發模式

```bash
wails dev
```

這會啟動熱重載桌面應用程式，方便直接測試 UI 與備份流程。

## 生產打包

```bash
wails build
```

輸出將會位於：

```text
build/bin/
```

### 進階平台打包

```bash
# Windows
wails build -platform windows/amd64

# Linux
wails build -platform linux/amd64

# macOS
wails build -platform darwin/universal
```

## 備份功能使用方式

1. 打開設定頁面
2. 啟用自動備份
3. 設定每次備份的間隔
4. 指定備份資料夾
5. 設定保留份數
6. 點擊 Save settings 儲存
7. 可使用 Backup now 立即執行備份
8. 在備份歷史中可還原或刪除舊備份

預設備份路徑：

```text
%USERPROFILE%\.powermoat_app_tools\backups
```

## 發佈準備建議

若要讓這個產品更接近正式發佈版本，建議補齊以下幾項：

- 應用程式 icon / splash screen
- 版本號與更新檢查流程
- 更完整的錯誤通知與 toast
- 程式啟動時的健康檢查
- 針對 Windows 安裝檔封裝與簽章
- 產品說明與使用者文件

## 授權

MIT

## 作者

Franco

