@echo off
echo Cleaning up SQLite and deployment files...

rem Remove SQLite database file
if exist "database\graceland.db" del "database\graceland.db"

rem Remove SQLite init file
if exist "database\init-db.js" del "database\init-db.js"

rem Remove SQLite migration file
if exist "database\migrate-to-mysql.js" del "database\migrate-to-mysql.js"

rem Remove Railway files
if exist "railway.json" del "railway.json"
if exist "nixpacks.toml" del "nixpacks.toml"
if exist "railway-check.js" del "railway-check.js"

rem Remove deployment files
if exist "RAILWAY-*.md" del "RAILWAY-*.md"
if exist "deploy-*.sh" del "deploy-*.sh"
if exist "deploy-*.bat" del "deploy-*.bat"
if exist "setup-production-db.js" del "setup-production-db.js"
if exist "health-check.js" del "health-check.js"

rem Remove backup model files
if exist "database\models\*_new.js" del "database\models\*_new.js"
if exist "database\models\*MySQL.js" del "database\models\*MySQL.js"

rem Clean up the temporary file
if exist "database\db-manager-clean.js" del "database\db-manager-clean.js"

echo Cleanup completed! MySQL-only setup ready.
echo.
echo Next steps:
echo 1. Make sure MySQL is running
echo 2. Run: npm run init-db
echo 3. Run: npm start
pause
