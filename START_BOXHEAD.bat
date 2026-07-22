@echo off
setlocal
cd /d "%~dp0"

set "GAME=%~dp0client\index.html"
set "GAME_URL=file:///%GAME:\=/%"

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%GAME_URL%" --no-first-run
  exit /b 0
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%GAME_URL%" --no-first-run
  exit /b 0
)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
  start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --app="%GAME_URL%" --no-first-run
  exit /b 0
)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%GAME_URL%" --no-first-run
  exit /b 0
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%GAME_URL%" --no-first-run
  exit /b 0
)
if exist "%ProgramFiles%\Mozilla Firefox\firefox.exe" (
  start "" "%ProgramFiles%\Mozilla Firefox\firefox.exe" -new-window "%GAME_URL%"
  exit /b 0
)

start "" "%GAME_URL%"
exit /b 0
