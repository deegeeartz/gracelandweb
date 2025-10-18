@echo off
echo ========================================
echo   Cloudinary Setup - Quick Start
echo ========================================
echo.
echo This script will help you set up Cloudinary image optimization.
echo.
echo Step 1: Get Cloudinary Credentials
echo ----------------------------------------
echo.
echo Opening Cloudinary signup page...
start https://cloudinary.com/users/register/free
echo.
echo Please:
echo 1. Sign up for free account
echo 2. Go to Dashboard
echo 3. Copy these values:
echo    - Cloud Name
echo    - API Key
echo    - API Secret
echo.
pause
echo.
echo Step 2: Enter Your Credentials
echo ----------------------------------------
echo.
set /p CLOUD_NAME="Enter your Cloud Name: "
set /p API_KEY="Enter your API Key: "
set /p API_SECRET="Enter your API Secret: "
echo.

if "%CLOUD_NAME%"=="" (
    echo Error: Cloud Name is required!
    pause
    exit /b 1
)

if "%API_KEY%"=="" (
    echo Error: API Key is required!
    pause
    exit /b 1
)

if "%API_SECRET%"=="" (
    echo Error: API Secret is required!
    pause
    exit /b 1
)

echo Step 3: Creating .env file...
echo ----------------------------------------
echo.

REM Check if .env exists
if exist .env (
    echo .env file already exists!
    set /p OVERWRITE="Do you want to append Cloudinary config? (y/n): "
    if /i "%OVERWRITE%"=="y" (
        echo. >> .env
        echo # Cloudinary Configuration >> .env
        echo CLOUDINARY_CLOUD_NAME=%CLOUD_NAME% >> .env
        echo CLOUDINARY_API_KEY=%API_KEY% >> .env
        echo CLOUDINARY_API_SECRET=%API_SECRET% >> .env
        echo CLOUDINARY_FOLDER=graceland-church >> .env
        echo CLOUDINARY_AUTO_OPTIMIZE=true >> .env
        echo CLOUDINARY_QUALITY=auto:good >> .env
        echo ✅ Cloudinary config appended to .env
    )
) else (
    REM Copy from .env.example
    if exist .env.example (
        copy .env.example .env
        echo. >> .env
        echo # Cloudinary Configuration >> .env
        echo CLOUDINARY_CLOUD_NAME=%CLOUD_NAME% >> .env
        echo CLOUDINARY_API_KEY=%API_KEY% >> .env
        echo CLOUDINARY_API_SECRET=%API_SECRET% >> .env
        echo CLOUDINARY_FOLDER=graceland-church >> .env
        echo CLOUDINARY_AUTO_OPTIMIZE=true >> .env
        echo CLOUDINARY_QUALITY=auto:good >> .env
        echo ✅ Created .env file with Cloudinary config
    ) else (
        REM Create new .env
        echo # Cloudinary Configuration > .env
        echo CLOUDINARY_CLOUD_NAME=%CLOUD_NAME% >> .env
        echo CLOUDINARY_API_KEY=%API_KEY% >> .env
        echo CLOUDINARY_API_SECRET=%API_SECRET% >> .env
        echo CLOUDINARY_FOLDER=graceland-church >> .env
        echo CLOUDINARY_AUTO_OPTIMIZE=true >> .env
        echo CLOUDINARY_QUALITY=auto:good >> .env
        echo ✅ Created .env file with Cloudinary config
    )
)

echo.
echo Step 4: Railway Configuration
echo ----------------------------------------
echo.
echo You need to add these variables to Railway:
echo.
echo 1. Go to: https://railway.app/dashboard
echo 2. Click your project -^> Web Service
echo 3. Go to Variables tab
echo 4. Click "+ New Variable" and add:
echo.
echo CLOUDINARY_CLOUD_NAME = %CLOUD_NAME%
echo CLOUDINARY_API_KEY = %API_KEY%
echo CLOUDINARY_API_SECRET = %API_SECRET%
echo CLOUDINARY_FOLDER = graceland-church
echo.
echo Opening Railway dashboard...
start https://railway.app/dashboard
echo.
pause
echo.
echo Step 5: Test Locally
echo ----------------------------------------
echo.
echo Starting local server to test Cloudinary integration...
echo.
npm start
echo.
pause
