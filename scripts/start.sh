#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-3001}

# Check if already running
EXISTING=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
if [ -n "$EXISTING" ]; then
  echo "Server already running on port $PORT (PID: $EXISTING)"
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Starting matrix-browser-editor on port $PORT..."
exec node "$PROJECT_ROOT/server/index.js"
