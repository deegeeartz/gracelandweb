@echo off
echo.
echo RCCG Graceland - Quick Cleanup
echo ===============================
echo.
PowerShell -ExecutionPolicy Bypass -File "%~dp0quick-cleanup.ps1"
pause
