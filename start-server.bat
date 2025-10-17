@echo off
echo ========================================
echo Starting RCCG Graceland Website Server
echo ========================================
echo.

echo Testing database connection...
call npm run test-connection

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database connection successful
    echo Starting server...
    echo.
    node server.js
) else (
    echo.
    echo ❌ Database connection failed
    echo Please check MySQL server is running
    pause
)
