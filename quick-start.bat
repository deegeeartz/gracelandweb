@echo off
cls
echo ========================================
echo RCCG Graceland Church Website - STARTUP
echo ========================================
echo.

echo 🔍 System Check...
echo.

echo Testing Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found
    pause
    exit /b 1
) else (
    echo ✅ Node.js OK
)

echo Testing MySQL...
sc query MySQL80 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ MySQL80 not found, checking MySQL...
    sc query MySQL >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ MySQL service not running
        pause
        exit /b 1
    ) else (
        echo ✅ MySQL OK
    )
) else (
    echo ✅ MySQL80 OK
)

echo.
echo 🚀 Starting Website...
echo.
echo 📄 Main Site: http://localhost:3000
echo 📖 Blog: http://localhost:3000/blog.html
echo ⚙️ Admin: http://localhost:3000/admin.html
echo 🔧 Test: http://localhost:3000/quick-test.html
echo.
echo 👤 Admin Login: admin / admin123
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

node server.js

pause
