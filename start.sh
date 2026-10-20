#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[错误] 未找到 Node.js。请先安装 Node.js 22.5 或更高版本。"
  exit 1
fi

NODE_OK="$(node -p "const [a,b]=process.versions.node.split('.').map(Number); (a>22||(a===22&&b>=5)) ? '1' : '0'")"
if [ "$NODE_OK" != "1" ]; then
  echo "[错误] 当前 Node.js 版本为 $(node -v)，需要 22.5 或更高版本。"
  exit 1
fi

if [ ! -d node_modules/express ] || [ ! -d node_modules/webtex ]; then
  echo "首次运行：安装依赖..."
  npm install --no-audit --no-fund
fi

PORT="${PORT:-3088}"
URL="http://127.0.0.1:${PORT}"
echo "ChemIntelAnalysis 启动中：${URL}"
echo "数据目录：${CHEMINTEL_DATA_DIR:-${LIT_DATA_DIR:-$(pwd)/data}}"
echo "按 Ctrl+C 停止服务"

if command -v xdg-open >/dev/null 2>&1; then
  ( sleep 2; xdg-open "${URL}" >/dev/null 2>&1 ) &
elif command -v open >/dev/null 2>&1; then
  ( sleep 2; open "${URL}" >/dev/null 2>&1 ) &
fi

exec npm start
