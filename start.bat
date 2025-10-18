@echo off
REM RCCG Graceland Website - Quick Start Script
REM Version 2.0.0

echo ========================================
echo   RCCG GRACELAND WEBSITE - QUICK START
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org
    pause
    exit /b 1
)

echo [1/5] Checking Node.js version...
node --version
echo.

REM Check if MySQL is running
echo [2/5] Checking MySQL connection...
net start | find "MySQL" >nul
if %errorlevel% neq 0 (
    echo [WARNING] MySQL service not detected!
    echo Please ensure MySQL80 service is running.
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Please copy .env.example to .env and configure it.
    echo.
    pause
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [3/5] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
) else (
    echo [3/5] Dependencies already installed.
)
echo.

REM Check if Cloudinary is configured
echo [4/5] Checking Cloudinary configuration...
findstr /C:"CLOUDINARY_CLOUD_NAME=" .env >nul
if %errorlevel% neq 0 (
    echo [WARNING] Cloudinary not configured!
    echo For image optimization, add Cloudinary credentials to .env
    echo See CLOUDINARY-GUIDE.md for instructions.
    echo.
) else (
    echo [OK] Cloudinary configured!
    echo.
)

echo [5/5] Starting server...
echo.
echo ========================================
echo   Server starting on http://localhost:3000
echo ========================================
echo.
echo   Homepage:     http://localhost:3000
echo   Blog:         http://localhost:3000/blog.html
echo   Admin Panel:  http://localhost:3000/admin.html
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

pause
