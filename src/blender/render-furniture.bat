@echo off
setlocal

REM EDIT if Blender installed elsewhere
set "BLENDER_EXE=C:\Users\rob\OneDrive\Desktop\blender-5.1.0-alpha+main.91800d13ff20-windows.amd64-release\blender.exe"

set "ROOT=%~dp0"
set "BLEND_FILE=%ROOT%kite-sofa-ready1.blend"
set "SCRIPT=%ROOT%colorflex-batch-render-multires-portable.py"

REM args
set "COLLECTION=english-cottage"
set "PIECE=Sofa-Kite"
set "PIECE_OBJECT=Sofa-Kite"

"%BLENDER_EXE%" ^
  --factory-startup ^
  "%BLEND_FILE%" ^
  --background ^
  --python "%SCRIPT%" ^
  -- --collection="%COLLECTION%" --piece="%PIECE%" --piece-object="%PIECE_OBJECT%"

endlocal
