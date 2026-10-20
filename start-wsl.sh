#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[错误] 未找到 Node.js。请先安装 Node.js 22.5 或更高版本。"
  echo "        推荐：nvm install 22 && nvm use 22"
  exit 1
fi

NODE_OK="$(node -p "const [a,b]=process.versions.node.split('.').map(Number); (a>22||(a===22&&b>=5)) ? '1' : '0'")"
if [ "$NODE_OK" != "1" ]; then
  echo "[错误] 当前 Node.js 版本为 $(node -v)，需要 22.5 或更高版本。"
  exit 1
fi

if [ ! -d node_modules/express ] || [ ! -d node_modules/webtex ]; then
  echo "[1/2] 首次运行：安装依赖（约 1 分钟）..."
  npm install --no-audit --no-fund
fi

PORT="${PORT:-3088}"
URL="http://127.0.0.1:${PORT}"
echo "[2/2] 启动 ChemIntelAnalysis：${URL}"
echo "      数据目录：${CHEMINTEL_DATA_DIR:-${LIT_DATA_DIR:-$(pwd)/data}}"
echo "      按 Ctrl+C 停止服务"

# 在 WSL 中优先调用 Windows 浏览器；普通 Linux 使用 xdg-open。
if grep -qi microsoft /proc/version 2>/dev/null && command -v powershell.exe >/dev/null 2>&1; then
  ( sleep 2; powershell.exe -NoProfile -Command "Start-Process '${URL}'" >/dev/null 2>&1 ) &
elif command -v wslview >/dev/null 2>&1; then
  ( sleep 2; wslview "${URL}" >/dev/null 2>&1 ) &
elif command -v xdg-open >/dev/null 2>&1; then
  ( sleep 2; xdg-open "${URL}" >/dev/null 2>&1 ) &
fi

exec npm start
