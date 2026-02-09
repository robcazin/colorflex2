@echo off
REM Batch render all patterns in a collection on Windows
REM Usage: render-collection.bat <collection> <garment> [rotation]

SET SCRIPT_DIR=%~dp0
python "%SCRIPT_DIR%batch-render-collection.py" %*
