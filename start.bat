@echo off
echo ========================================
echo RCCG Graceland Church Website - MySQL
echo ========================================
echo.

echo Testing MySQL connection...
npm run test-connection
echo.

if errorlevel 1 (
    echo ❌ MySQL connection failed!
    echo Please make sure:
    echo 1. MySQL server is running
    echo 2. Database 'graceland_church' exists
    echo 3. Check credentials in .env file
    echo.
    pause
    exit /b 1
)

echo Starting the website...
echo.
echo Website will be available at:
echo - Main site: http://localhost:3000
echo - Admin panel: http://localhost:3000/admin.html
echo.

npm start

pause
