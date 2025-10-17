@echo off
echo ========================================
echo Creating RCCG Graceland Church Database
echo ========================================
echo.

echo Setting up SQLite database...
echo.

node database/init-db.js

echo.
echo Adding sample data...
node database/add-sample-data.js

echo.
echo ========================================
echo Database Setup Complete!
echo ========================================
echo.
echo Your church website database is ready!
echo.
echo Next steps:
echo 1. Run: npm start
echo 2. Visit: http://localhost:3000
echo 3. Admin: http://localhost:3000/admin.html
echo.

pause
