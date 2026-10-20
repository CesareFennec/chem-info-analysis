@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未找到 Node.js。
  echo 请安装 Node.js 22.5 或更高版本：https://nodejs.org/
  pause
  exit /b 1
)

node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=5)?0:1)"
if errorlevel 1 (
  echo [错误] 当前 Node.js 版本为：
  node -v
  echo 需要 22.5 或更高版本。
  pause
  exit /b 1
)

if exist "node_modules\express" if exist "node_modules\webtex" goto deps_ready
echo [1/2] 首次运行或依赖更新：安装依赖，请稍候...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo [错误] 依赖安装失败，请检查网络后重试。
  pause
  exit /b 1
)
:deps_ready

if "%PORT%"=="" set "PORT=3088"
set "DISPLAY_DATA=%CD%\data"
if not "%CHEMINTEL_DATA_DIR%"=="" set "DISPLAY_DATA=%CHEMINTEL_DATA_DIR%"
if "%CHEMINTEL_DATA_DIR%"=="" if not "%LIT_DATA_DIR%"=="" set "DISPLAY_DATA=%LIT_DATA_DIR%"
echo [2/2] 启动 ChemIntelAnalysis：http://127.0.0.1:%PORT%
echo       数据目录：%DISPLAY_DATA%
echo       关闭此窗口或按 Ctrl+C 停止服务。
start "" /min cmd /c "timeout /t 2 >nul & start http://127.0.0.1:%PORT%"
call npm start
if errorlevel 1 pause
