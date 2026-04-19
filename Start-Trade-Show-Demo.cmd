@echo off
REM ColorFlex trade-show demo — double-click this file (golden master: place this at the folder root next to trade-show-local and node_modules).
setlocal
cd /d "%~dp0"

if not exist "trade-show-local\server.js" (
  echo [ColorFlex] Missing trade-show-local\server.js — use the complete demo folder.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo [ColorFlex] Node.js was not found. Install the LTS version from https://nodejs.org/
  echo ^(During setup, keep the option to add Node to your PATH.^)
  pause
  exit /b 1
)

if not exist "node_modules\express\package.json" (
  echo [ColorFlex] Missing node_modules ^(Express^). Copy the full golden master folder including node_modules.
  pause
  exit /b 1
)

REM Server runs in a separate window so this script can exit after opening the browser.
REM /D sets the working directory for the new process (safe for paths with spaces).
start "ColorFlex Server — close this window to stop" /D "%~dp0" cmd /k node trade-show-local\server.js

timeout /t 2 /nobreak >nul

start "" "http://127.0.0.1:3340/"

endlocal
exit /b 0
