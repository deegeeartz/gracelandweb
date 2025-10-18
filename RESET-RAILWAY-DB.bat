@echo off
echo ========================================
echo   RAILWAY DATABASE RESET TOOL
echo ========================================
echo.
echo This will:
echo   1. Connect to your Railway MySQL database
echo   2. DROP all existing tables (clear old data)
echo   3. CREATE fresh tables with Cloudinary support
echo   4. INSERT default admin user, author, and categories
echo.
echo WARNING: This will DELETE ALL existing blog posts!
echo.
set /p confirm="Are you sure you want to continue? (y/n): "
if /i not "%confirm%"=="y" (
    echo.
    echo Operation cancelled.
    pause
    exit /b
)

echo.
echo Starting database reset...
echo.

node reset-railway-database.js

echo.
echo ========================================
echo   DONE!
echo ========================================
pause
