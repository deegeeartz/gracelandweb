@echo off
REM RCCG Graceland - Quick Test & Deploy
REM Double-click this file to run all tests

echo.
echo ========================================
echo   RCCG Graceland - Test Suite
echo ========================================
echo.

REM Run the PowerShell script
PowerShell -ExecutionPolicy Bypass -File "%~dp0test-and-deploy.ps1"

echo.
pause
