@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 20 or newer is required. Install Node.js and run this file again.
  pause
  exit /b 1
)
node -e "process.exit(Number(process.versions.node.split('.')[0]) < 20 ? 1 : 0)"
if errorlevel 1 (
  echo Please update Node.js to version 20 or newer.
  pause
  exit /b 1
)
if not exist "node_modules\express\package.json" (
  echo Installing server dependencies...
  call npm ci --omit=dev
  if errorlevel 1 (
    echo Installation failed. Check your internet connection.
    pause
    exit /b 1
  )
)
if not defined PORT set "PORT=3000"
echo Open http://localhost:%PORT% in your browser.
echo For a friend on the same LAN, use this PC's LAN IP instead of localhost.
echo For friends elsewhere, deploy this folder to a public Node server.
echo Keep this window open while playing. Ctrl+C stops the server.
call npm start
pause
