@echo off
cls
echo ========================================
echo RCCG Graceland Church Website
echo Optimized Version
echo ========================================
echo.

REM Check Node.js
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    ❌ Node.js not installed
    pause
    exit /b 1
)
echo    ✅ Node.js installed

REM Check MySQL
echo [2/5] Checking MySQL service...
sc query MySQL80 >nul 2>&1
if %errorlevel% neq 0 (
    echo    ⚠️ MySQL80 not found, trying MySQL...
    sc query MySQL >nul 2>&1
    if %errorlevel% neq 0 (
        echo    ❌ MySQL not running
        echo    Please start MySQL service first
        pause
        exit /b 1
    )
)
echo    ✅ MySQL service running

REM Test database connection
echo [3/5] Testing database connection...
call npm run test-connection >nul 2>&1
if %errorlevel% neq 0 (
    echo    ⚠️ Database connection test failed
    echo    Server will attempt to initialize...
) else (
    echo    ✅ Database connection OK
)

REM Check if optimization has been run
echo [4/5] Checking code optimization...
if exist "OPTIMIZATION-REPORT.md" (
    echo    ℹ️ Run optimize-cleanup.bat to clean duplicate files
)

echo [5/5] Starting server...
echo.
echo ========================================
echo 🚀 Server Configuration
echo ========================================
echo Main Site:  http://localhost:3000
echo Blog:       http://localhost:3000/blog.html
echo Admin:      http://localhost:3000/admin.html
echo Health API: http://localhost:3000/api/health
echo.
echo Default Login: admin / admin123
echo ⚠️ Change password after first login!
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Use optimized server if it exists, otherwise use regular server
if exist "server-optimized.js" (
    echo Using optimized server...
    node server-optimized.js
) else (
    echo Using regular server...
    node server.js
)

pause
