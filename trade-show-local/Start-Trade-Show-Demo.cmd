@echo off
REM Always use the launcher in the folder **above** this one ^(golden master root^).
setlocal EnableExtensions

if exist "%~dp0..\Start-Trade-Show-Demo.cmd" (
  call "%~dp0..\Start-Trade-Show-Demo.cmd"
  exit /b %ERRORLEVEL%
)

echo.
echo  ColorFlex — wrong place
echo  Double-click **Start-Trade-Show-Demo.cmd** in the **main** demo folder ^(one level up^),
echo  not inside the trade-show-local folder.
echo.
pause
exit /b 1
