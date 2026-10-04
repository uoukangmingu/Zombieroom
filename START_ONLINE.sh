#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then echo 'Install Node.js 20 or newer first.'; exit 1; fi
node -e 'process.exit(Number(process.versions.node.split(".")[0]) < 20 ? 1 : 0)'
if [ ! -d node_modules/express ]; then npm ci --omit=dev; fi
printf 'Open http://localhost:%s — use a LAN IP or public server URL to invite friends.\n' "${PORT:-3000}"
exec node server/server.js
