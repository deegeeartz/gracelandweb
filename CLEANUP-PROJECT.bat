@echo off
REM RCCG Graceland - Project Cleanup
REM Double-click to clean up redundant files

echo.
echo ========================================
echo   RCCG Graceland - Project Cleanup
echo ========================================
echo.

PowerShell -ExecutionPolicy Bypass -File "%~dp0cleanup-project.ps1"

echo.
pause
