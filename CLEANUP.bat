@echo off
REM Simple Project Cleanup
echo.
echo ========================================
echo   RCCG Graceland - Project Cleanup
echo ========================================
echo.

PowerShell -ExecutionPolicy Bypass -File "%~dp0cleanup-simple.ps1"

echo.
pause
