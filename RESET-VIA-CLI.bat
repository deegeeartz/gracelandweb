@echo off
echo ========================================
echo   RAILWAY DATABASE RESET - CLI Method
echo ========================================
echo.
echo This will reset your Railway MySQL database using the CLI.
echo.
echo Prerequisites:
echo   1. Railway CLI installed (railway.app/cli)
echo   2. Logged into Railway (railway login)
echo   3. Linked to your project (railway link)
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
echo Connecting to Railway MySQL...
echo.

railway connect MySQL

echo.
echo.
echo ========================================
echo   INSTRUCTIONS
echo ========================================
echo.
echo You're now connected to MySQL. Copy/paste this:
echo.
echo -- Drop and recreate tables
echo SET FOREIGN_KEY_CHECKS = 0;
echo DROP TABLE IF EXISTS blog_posts;
echo DROP TABLE IF EXISTS categories;
echo DROP TABLE IF EXISTS authors;
echo DROP TABLE IF EXISTS users;
echo SET FOREIGN_KEY_CHECKS = 1;
echo.
echo Then run the CREATE TABLE commands from FULL-DATABASE-RESET.md
echo.
echo Or just paste the entire SQL script!
echo.
pause
