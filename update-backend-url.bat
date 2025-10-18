@echo off
REM Quick script to update backend URL

echo.
echo ========================================
echo  RCCG Graceland - Backend URL Updater
echo ========================================
echo.

REM Check if Railway CLI is installed
where railway >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Found Railway CLI! Getting your deployment URL...
    echo.
    railway status
    echo.
)

echo To update your backend URL:
echo.
echo 1. Go to: https://railway.app
echo 2. Open your project
echo 3. Click on your backend service
echo 4. Go to Settings -^> Domains
echo 5. Copy the URL
echo.

set /p BACKEND_URL="Paste your Railway backend URL here: "

if "%BACKEND_URL%"=="" (
    echo.
    echo Error: No URL provided!
    echo.
    pause
    exit /b 1
)

echo.
echo Updating backend URL to: %BACKEND_URL%
echo.

node update-backend-url.js %BACKEND_URL%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUCCESS! Backend URL updated
    echo ========================================
    echo.
    echo Next: Commit and push to GitHub
    echo   git add .
    echo   git commit -m "Update backend URL for production"
    echo   git push
    echo.
) else (
    echo.
    echo Error updating backend URL!
    echo.
)

pause
