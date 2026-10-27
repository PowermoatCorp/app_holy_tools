# PowerMoat Management Tools

這是一個使用 Wails + React.js + JavaScript 建立的跨平台桌面應用程式。

## 技術棧

- **後端**: Go (使用 Wails v2.12.0 框架)
- **前端**: React 18 + Vite
- **語言**: JavaScript (前端)、Go (後端)
- **平台**: Windows、macOS、Linux

## 項目結構

```
powermoat_app_tools/
├── main.go              # 應用程式主入口
├── app.go               # 應用程式邏輯和 Go 方法
├── go.mod               # Go 模組依賴
├── wails.json           # Wails 配置文件
├── frontend/            # React 前端應用
│   ├── src/
│   │   ├── App.jsx      # 主應用組件
│   │   ├── main.jsx     # React 入口點
│   │   ├── App.css      # 應用樣式
│   │   ├── style.css    # 全局樣式
│   │   └── assets/      # 靜態資源
│   ├── wailsjs/         # Wails 生成的 JS 綁定
│   ├── package.json     # npm 依賴
│   ├── vite.config.js   # Vite 配置
│   └── index.html       # HTML 模板
└── .github/
    └── copilot-instructions.md  # Copilot 指引
```

## 先決條件

- Go 1.21 或更高版本
- Node.js 16 或更高版本
- npm 或 yarn

### Linux 需求
```bash
# Ubuntu/Debian
sudo apt-get install build-essential libgtk-3-dev libwebkit2gtk-4.0-dev

# Fedora
sudo dnf install gtk3-devel webkit2gtk3-devel

# Arch
sudo pacman -S gtk3 webkit2gtk
```

## 安裝

1. 克隆項目後，安裝 Wails CLI：
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

2. 確保 Go bin 目錄在您的 PATH 中：
```bash
export PATH=$PATH:$(go env GOPATH)/bin
```

3. 安裝 Go 依賴：
```bash
go mod tidy
```

4. 安裝前端依賴：
```bash
cd frontend
npm install
cd ..
```

## 開發

### 使用 VS Code 任務（推薦）

1. 在 VS Code 中打開項目
2. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS)
3. 選擇 "Tasks: Run Task"
4. 選擇 "Wails Dev"

### 使用命令行

```bash
# 開發模式（熱重載）
wails dev

# 或使用完整路徑
export PATH=$PATH:$(go env GOPATH)/bin
wails dev
```

應用程式將在開發模式下啟動，並自動打開一個視窗。

## 構建

### 構建生產版本

```bash
wails build
```

構建產物將在 `build/bin` 目錄中。

### 針對不同平台構建

```bash
# Linux
wails build -platform linux/amd64 -tags webkit2_41

# Windows (從 Linux/Mac)
wails build -platform windows/amd64

# macOS
wails build -platform darwin/universal
```

## 功能

- ✅ Go 後端與 React 前端完整集成
- ✅ 跨平台桌面應用支援
- ✅ 熱重載開發模式
- ✅ Go 方法可從 JavaScript 調用
- ✅ 原生外觀和感覺
- ✅ 小巧的應用體積

## 添加新功能

### 添加 Go 方法

在 `app.go` 中添加新方法：

```go
func (a *App) YourMethod(param string) string {
    // 您的邏輯
    return result
}
```

然後在 React 中使用：

```javascript
import { YourMethod } from '../wailsjs/go/main/App';

// 在組件中調用
YourMethod("參數").then(result => {
    console.log(result);
});
```

### 添加 React 組件

在 `frontend/src` 目錄中創建新組件：

```javascript
// frontend/src/MyComponent.jsx
export default function MyComponent() {
    return <div>我的組件</div>;
}
```

## 相關資源

- [Wails 文檔](https://wails.io/docs/introduction)
- [React 文檔](https://react.dev/)
- [Vite 文檔](https://vitejs.dev/)

## 授權

此項目使用 MIT 授權。

## 作者

Franco

