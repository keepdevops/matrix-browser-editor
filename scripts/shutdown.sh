#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-3001}

echo "Shutting down matrix-browser-editor on port $PORT..."

# Kill by port
PIDS=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)

if [ -n "$PIDS" ]; then
  echo "Killing PID(s) on port $PORT: $PIDS"
  kill -TERM $PIDS 2>/dev/null || true
else
  echo "No process found on port $PORT."
fi

# Kill by process name
pkill -TERM -f "node server/index.js" 2>/dev/null && echo "Sent SIGTERM to node server/index.js" || true
pkill -TERM -f "node --watch server/index.js" 2>/dev/null && echo "Sent SIGTERM to node --watch server/index.js" || true

sleep 1

# Force-kill any survivors
REMAINING=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
if [ -n "$REMAINING" ]; then
  echo "Process still on port $PORT, sending SIGKILL..."
  kill -KILL $REMAINING 2>/dev/null || true
fi

pkill -KILL -f "node server/index.js" 2>/dev/null || true
pkill -KILL -f "node --watch server/index.js" 2>/dev/null || true

echo "Done."
