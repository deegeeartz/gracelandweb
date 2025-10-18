@echo off
REM Test console error fixes
echo ========================================
echo Testing Console Error Fixes
echo ========================================
echo.

echo Starting server...
start cmd /k "node server.js"

timeout /t 3 /nobreak >nul

echo.
echo Opening browser to test...
start http://localhost:3000/blog.html

echo.
echo ========================================
echo CHECK YOUR BROWSER CONSOLE (F12):
echo ========================================
echo.
echo ✅ Should see NO errors about:
echo    - Service Worker 404
echo    - querySelector invalid selector
echo.
echo ========================================
echo TEST BLOG POST NAVIGATION:
echo ========================================
echo.
echo 1. Click any blog post
echo 2. Should navigate correctly
echo 3. Console should stay clean (no errors)
echo.
echo Press any key when done testing...
pause >nul
