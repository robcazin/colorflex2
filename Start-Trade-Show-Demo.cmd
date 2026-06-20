@echo off
setlocal EnableExtensions
REM Golden master: keep this file at the folder root next to trade-show-local and node_modules.
REM Works when the folder path contains spaces.

cd /d "%~dp0"

if not exist "trade-show-local\server.js" (
  echo.
  echo  ColorFlex — folder incomplete
  echo  Missing file: trade-show-local\server.js
  echo.
  echo  Copy the **entire** golden master folder again. Do not move only some files.
  echo.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo  ColorFlex — Node.js not found
  echo.
  echo  Install **Node.js LTS** from:  https://nodejs.org/
  echo  During setup, leave **Add to PATH** checked, finish the install, then run this file again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\express\package.json" (
  echo.
  echo  ColorFlex — server support files missing
  echo.
  echo  The **node_modules** folder should be inside this same folder as this file.
  echo  Copy the **complete** golden master from the person who prepared it ^(it includes node_modules^).
  echo  See: trade-show-local\WINDOWS_DEPLOY.md
  echo.
  pause
  exit /b 1
)

REM Server window: close it to stop the demo. /D uses current dir ^(handles spaces^).
start "ColorFlex Server — close this window to stop" /D "%CD%" cmd /k node trade-show-local\server.js

REM Let Express start before the browser connects.
timeout /t 3 /nobreak >nul

REM Open default browser ^(reliable on Windows when URL is quoted^).
start "" "http://127.0.0.1:3340/"

echo.
echo  ColorFlex is starting.
echo  If the browser does not open by itself, open it and go to:  http://127.0.0.1:3340/
echo.
echo  To stop the demo: close the **other** window titled "ColorFlex Server — close this window to stop".
echo.
echo  This window will close in a few seconds…
timeout /t 6 /nobreak >nul
endlocal
exit /b 0
