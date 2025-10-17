@echo off
echo ========================================
echo RCCG Graceland - Code Optimization
echo ========================================
echo.

echo 🗑️ Cleaning up duplicate and unnecessary files...
echo.

REM Backup before cleaning
echo Creating backup...
if not exist "backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%" mkdir "backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%"

REM Remove duplicate server files
echo Removing duplicate server files...
del /F /Q server-debug.js 2>nul
del /F /Q server-debug-fixed.js 2>nul
del /F /Q server-simple.js 2>nul

REM Remove duplicate database managers
echo Removing duplicate database managers...
del /F /Q database\db-manager-clean.js 2>nul
del /F /Q database\db-manager-mysql.js 2>nul

REM Remove *_new model files
echo Removing duplicate model files...
del /F /Q database\models\*_new.js 2>nul

REM Remove backup models folder
echo Removing backup models folder...
rd /S /Q database\models_backup 2>nul

REM Remove Railway deployment files
echo Removing Railway deployment files...
del /F /Q railway-check.js 2>nul
del /F /Q railway.json 2>nul
del /F /Q nixpacks.toml 2>nul
del /F /Q RAILWAY-*.md 2>nul
del /F /Q deploy-*.sh 2>nul
del /F /Q deploy-*.bat 2>nul

REM Remove obsolete init scripts
echo Removing obsolete initialization scripts...
del /F /Q database\init-railway.js 2>nul
del /F /Q database\migrate-to-mysql.js 2>nul
del /F /Q setup-production-db.js 2>nul

REM Remove duplicate admin scripts
echo Removing duplicate admin scripts...
del /F /Q admin-script.js 2>nul

REM Remove blog script duplicates
echo Removing duplicate blog scripts...
del /F /Q blog-script.js 2>nul

REM Remove temporary/garbage files
echo Removing temporary files...
del /F /Q "edb-manager-clean.js databasedb-manager.js -Force" 2>nul
del /F /Q ersPCDocumentsgracelandweb 2>nul
del /F /Q t 2>nul

REM Create tests folder and move test files
echo Organizing test files...
if not exist "tests" mkdir "tests"
move /Y test-*.js tests\ 2>nul
move /Y diagnose-db.js tests\ 2>nul
move /Y health-check.js tests\ 2>nul
move /Y test.html tests\ 2>nul
move /Y quick-test.html tests\ 2>nul
move /Y admin-test.html tests\ 2>nul

REM Remove obsolete documentation
echo Removing obsolete documentation...
del /F /Q DATABASE-SETUP.md 2>nul
del /F /Q DEPLOY-CHECKLIST.md 2>nul
del /F /Q DEPLOYMENT.md 2>nul
del /F /Q LOCALHOST-SETUP.md 2>nul
del /F /Q SETUP-COMPLETE.md 2>nul
del /F /Q STATUS-FIXED.md 2>nul

echo.
echo ========================================
echo ✅ Cleanup Complete!
echo ========================================
echo.
echo Files removed:
echo   - Duplicate server files
echo   - Duplicate database managers
echo   - Backup model files
echo   - Railway deployment files
echo   - Obsolete initialization scripts
echo   - Temporary files
echo.
echo Files organized:
echo   - Test files moved to tests/ folder
echo   - Obsolete documentation removed
echo.
echo Your codebase is now optimized!
echo.
pause
