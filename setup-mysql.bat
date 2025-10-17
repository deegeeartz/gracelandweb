@echo off
echo ========================================
echo Setting up MySQL Database for RCCG Graceland
echo ========================================
echo.

echo Step 1: Creating database...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS graceland_church;"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Database created successfully
    echo.
    echo Step 2: Initializing tables...
    node database/init-database.js
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================
        echo ✅ MySQL Database Setup Complete!
        echo ========================================
        echo.
        echo You can now start the server with: npm start
        echo Or run: node server.js
        pause
    ) else (
        echo ❌ Database initialization failed
        pause
    )
) else (
    echo ❌ Database creation failed
    echo 💡 Make sure MySQL server is running
    echo 💡 Check that root user has proper permissions
    pause
)
