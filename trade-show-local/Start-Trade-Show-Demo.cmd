@echo off
REM Run from repo root (parent of trade-show-local). Opens ColorFlex trade-show server on http://127.0.0.1:3340
cd /d "%~dp0\.."
if not exist "trade-show-local\server.js" (
  echo ERROR: Run this from the ColorFlex repo root, or keep Start-Trade-Show-Demo.cmd inside trade-show-local.
  pause
  exit /b 1
)
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not on PATH. Install Node.js LTS, then try again.
  pause
  exit /b 1
)
echo Starting ColorFlex trade-show demo...
echo URL: http://127.0.0.1:3340
node trade-show-local\server.js
pause
