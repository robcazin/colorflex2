@echo off
REM Render missing pantsuit collections in sequence
REM Collections: English Cottage, Farmhouse, Folksie, Geometry, Ikats
REM Plus: Traditions (both dress and pantsuit)

echo ============================================================
echo BATCH RENDERING MISSING PANTSUIT COLLECTIONS
echo ============================================================
echo.
echo Collections to render:
echo   1. English Cottage (pantsuit)
echo   2. Farmhouse (pantsuit)
echo   3. Folksie (pantsuit)
echo   4. Geometry (pantsuit)
echo   5. Ikats (pantsuit)
echo   6. Traditions (dress + pantsuit)
echo.
echo Press Ctrl+C to cancel, or
pause

SET SCRIPT_DIR=%~dp0

echo.
echo [1/6] Rendering english-cottage pantsuit...
python "%SCRIPT_DIR%batch-render-collection.py" english-cottage pantsuit 0
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: english-cottage failed!
    pause
    exit /b 1
)

echo.
echo [2/6] Rendering farmhouse pantsuit...
python "%SCRIPT_DIR%batch-render-collection.py" farmhouse pantsuit 0
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: farmhouse failed!
    pause
    exit /b 1
)

echo.
echo [3/6] Rendering folksie pantsuit...
python "%SCRIPT_DIR%batch-render-collection.py" folksie pantsuit 0
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: folksie failed!
    pause
    exit /b 1
)

echo.
echo [4/6] Rendering geometry pantsuit...
python "%SCRIPT_DIR%batch-render-collection.py" geometry pantsuit 0
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: geometry failed!
    pause
    exit /b 1
)

echo.
echo [5/6] Rendering ikats pantsuit...
python "%SCRIPT_DIR%batch-render-collection.py" ikats pantsuit 0
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ikats failed!
    pause
    exit /b 1
)

echo.
echo [6a/6] Rendering traditions dress...
python "%SCRIPT_DIR%batch-render-collection.py" traditions dress 0
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: traditions dress failed!
    pause
    exit /b 1
)

echo.
echo [6b/6] Rendering traditions pantsuit...
python "%SCRIPT_DIR%batch-render-collection.py" traditions pantsuit 0
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: traditions pantsuit failed!
    pause
    exit /b 1
)

echo.
echo ============================================================
echo ALL COLLECTIONS RENDERED SUCCESSFULLY!
echo ============================================================
pause
