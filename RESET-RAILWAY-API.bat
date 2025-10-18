@echo off
echo ========================================
echo   RAILWAY DATABASE RESET (API Method)
echo   Uses Private Network - NO EGRESS FEES!
echo ========================================
echo.
echo This method:
echo   - Runs INSIDE Railway (uses private network)
echo   - Completely FREE (no egress fees)
echo   - Safer than public endpoint
echo.
echo WARNING: This will DELETE ALL existing blog posts!
echo.
set /p confirm="Are you sure you want to continue? (y/n): "
if /i not "%confirm%"=="y" (
    echo.
    echo Operation cancelled.
    pause
    exit /b
)

echo.
echo Enter your Railway URL (or press Enter for default):
set /p RAILWAY_URL="URL [https://gracelandweb-production.up.railway.app]: "
if "%RAILWAY_URL%"=="" set RAILWAY_URL=https://gracelandweb-production.up.railway.app

echo.
echo Enter reset token (set in Railway as ADMIN_RESET_TOKEN):
set /p RESET_TOKEN="Token: "

if "%RESET_TOKEN%"=="" (
    echo.
    echo ERROR: Reset token is required!
    echo.
    echo To set it up:
    echo   1. Go to Railway Dashboard
    echo   2. Click on your web service
    echo   3. Click "Variables" tab
    echo   4. Add: ADMIN_RESET_TOKEN=your-secret-token
    echo   5. Redeploy
    pause
    exit /b
)

echo.
echo Resetting database via Railway API...
echo.

curl -X POST "%RAILWAY_URL%/api/admin/reset-database" ^
  -H "Authorization: Bearer %RESET_TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo If successful, you should see:
echo   - success: true
echo   - users: 1
echo   - authors: 1
echo   - categories: 6
echo   - blog_posts: 0
echo.
echo Next steps:
echo   1. Go to: %RAILWAY_URL%/admin.html
echo   2. Login: admin / admin123
echo   3. Create your first blog post!
echo.
pause
