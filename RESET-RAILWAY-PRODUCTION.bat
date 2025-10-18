@echo off
REM Reset Railway Production Database
REM This script resets your Railway MySQL database remotely

echo ========================================
echo   RAILWAY PRODUCTION DATABASE RESET
echo ========================================
echo.
echo This will reset your PRODUCTION database on Railway!
echo.
echo BEFORE running this, make sure you have:
echo 1. Added MYSQL_PUBLIC_URL to your .env file
echo 2. Got the URL from Railway dashboard -^> MySQL -^> Variables
echo.
echo Format: MYSQL_PUBLIC_URL=mysql://root:xxxxx@hostname.railway.app:3306/railway
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo Running reset script...
node reset-railway-production.js

echo.
echo Done!
pause
