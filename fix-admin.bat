@echo off
echo ========================================
echo   Find Your Railway Backend URL
echo ========================================
echo.
echo Opening Railway dashboard in your browser...
echo.
start https://railway.app/dashboard
echo.
echo INSTRUCTIONS:
echo 1. Look for your project in Railway
echo 2. Click on the WEB SERVICE (NOT MySQL)
echo 3. Go to Settings -^> Domains
echo 4. Copy the URL you see there
echo.
echo Example URL: gracelandweb-production.up.railway.app
echo.
echo ========================================
echo.
set /p RAILWAY_URL="Paste your Railway URL here: "

if "%RAILWAY_URL%"=="" (
    echo.
    echo Error: No URL provided!
    pause
    exit /b 1
)

echo.
echo Updating configuration with: %RAILWAY_URL%
echo.
node update-backend-url.js %RAILWAY_URL%

echo.
echo ========================================
echo   Configuration Updated!
echo ========================================
echo.
pause
