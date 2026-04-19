@echo off
REM Delegates to Start-Trade-Show-Demo.cmd in the parent folder (golden master root).
cd /d "%~dp0\.."
if exist "Start-Trade-Show-Demo.cmd" (
  call "Start-Trade-Show-Demo.cmd"
  exit /b %ERRORLEVEL%
)
echo [ColorFlex] Missing Start-Trade-Show-Demo.cmd in the folder above this one.
echo Use the complete golden master folder; double-click Start-Trade-Show-Demo.cmd at the top level.
pause
exit /b 1
