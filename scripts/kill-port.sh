#!/bin/bash
#
# Free a port for this checkout's dev server.
#
# Only looks at processes LISTENING on the port, never clients connected to it
# (a browser tab talking to an old dev server isn't ours to kill). A listener
# is stopped only when it's a `next` process running from this checkout;
# anything else is reported and left alone, and we exit non-zero.
PORT="${1:-3000}"
ROOT="$(cd "$(dirname "$0")/.." && pwd -P)"

PIDS=$(lsof -ti tcp:"$PORT" -sTCP:LISTEN 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "Port $PORT is free"
    exit 0
fi

for pid in $PIDS; do
    cmd=$(ps -o command= -p "$pid" 2>/dev/null)
    cwd=$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p')
    if [[ "$cwd" != "$ROOT" || "$cmd" != *next* ]]; then
        echo "Port $PORT is held by a process this checkout didn't start:" >&2
        lsof -iTCP:"$PORT" -sTCP:LISTEN >&2
        echo "Stop it yourself, or run with PORT=<other> npm run dev." >&2
        exit 1
    fi
done

echo "Stopping this checkout's old dev server on port $PORT: $PIDS"
kill $PIDS 2>/dev/null
for _ in 1 2 3 4 5 6 7 8 9 10; do
    lsof -ti tcp:"$PORT" -sTCP:LISTEN >/dev/null 2>&1 || exit 0
    sleep 0.5
done
echo "Still listening after SIGTERM; sending SIGKILL"
kill -9 $PIDS 2>/dev/null
exit 0
