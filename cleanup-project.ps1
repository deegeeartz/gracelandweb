# 🧹 AUTOMATED PROJECT CLEANUP SCRIPT
# This script cleans up redundant files and consolidates documentation

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RCCG GRACELAND - PROJECT CLEANUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\PC\Documents\gracelandweb"
$backupFolder = Join-Path $projectRoot "_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Step 1: Create backup
Write-Host "📦 Step 1: Creating backup..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

$filesToBackup = @(
    "*.md",
    "server-*.js",
    "test-*.js",
    "*.bat",
    "*-old.js",
    "*-debug.js",
    "*.html" | Where-Object { $_ -like "*test*" }
)

foreach ($pattern in $filesToBackup) {
    Get-ChildItem -Path $projectRoot -Filter $pattern -File | ForEach-Object {
        Copy-Item $_.FullName -Destination $backupFolder -Force
    }
}

Write-Host "✅ Backup created at: $backupFolder" -ForegroundColor Green
Write-Host ""

# Step 2: Remove redundant documentation
Write-Host "📄 Step 2: Cleaning documentation files..." -ForegroundColor Yellow

$docsToRemove = @(
    "ADMIN-FIXED-STATUS.md",
    "BACKEND-VS-DATABASE-URL.md",
    "BLOG-POST-FEATURE.md",
    "BUG-ANALYSIS.md",
    "BUG-FIXED.md",
    "COMPLETE-OPTIMIZATION.md",
    "CORS-FIXED.md",
    "DATABASE-SETUP.md",
    "DEPLOY-CHECKLIST.md",
    "DEPLOYMENT-CHECKLIST.md",
    "DEPLOYMENT-READY.md",
    "DEPLOYMENT.md",
    "FINAL-PROJECT-STATUS.md",
    "FINAL-RESOLUTION.md",
    "FINAL-STATUS.md",
    "FIND-BACKEND-URL.md",
    "FIX-ADMIN-ACCESS.md",
    "FIX-CORS-GUIDE.md",
    "IMAGE-OPTIMIZATION-COMPLETE.md",
    "LOCALHOST-SETUP.md",
    "MYSQL-SETUP.md",
    "OPTIMIZATION-COMPLETE.md",
    "OPTIMIZATION-REPORT.md",
    "POST-OPTIMIZATION-COMPLETE.md",
    "POST-PAGE-OPTIMIZATION.md",
    "POST-PAGE-REDESIGN.md",
    "PROJECT-COMPLETE.md",
    "RAILWAY-DEPLOY.md",
    "RAILWAY-STATUS.md",
    "RAILWAY-TROUBLESHOOT.md",
    "READ-ME-FIRST.md",
    "README-OPTIMIZED.md",
    "READY-TO-DEPLOY.md",
    "SETUP-COMPLETE.md",
    "STATUS-FIXED.md",
    "CLOUDINARY-STATUS.md",
    "ARCHITECTURE-DIAGRAM.md"
)

$removedDocs = 0
foreach ($file in $docsToRemove) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        $removedDocs++
        Write-Host "  ❌ Removed: $file" -ForegroundColor Gray
    }
}

Write-Host "✅ Removed $removedDocs redundant documentation files" -ForegroundColor Green
Write-Host ""

# Step 3: Remove old server files
Write-Host "🖥️  Step 3: Cleaning old server files..." -ForegroundColor Yellow

$serverFilesToRemove = @(
    "server-old.js",
    "server-optimized.js",
    "server-simple.js",
    "server-debug.js",
    "server-debug-fixed.js"
)

$removedServers = 0
foreach ($file in $serverFilesToRemove) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        $removedServers++
        Write-Host "  ❌ Removed: $file" -ForegroundColor Gray
    }
}

Write-Host "✅ Removed $removedServers old server files" -ForegroundColor Green
Write-Host ""

# Step 4: Remove duplicate test files
Write-Host "🧪 Step 4: Cleaning test files..." -ForegroundColor Yellow

$testFilesToRemove = @(
    "test-server.js",
    "test-login.js",
    "test-env.js",
    "test-direct-db.js",
    "check-posts.js",
    "diagnose-db.js",
    "health-check.js",
    "railway-check.js",
    "quick-test.html",
    "admin-test.html",
    "test.html",
    "test-environment.html"
)

$removedTests = 0
foreach ($file in $testFilesToRemove) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        $removedTests++
        Write-Host "  ❌ Removed: $file" -ForegroundColor Gray
    }
}

Write-Host "✅ Removed $removedTests duplicate test files" -ForegroundColor Green
Write-Host ""

# Step 5: Remove redundant database files
Write-Host "🗄️  Step 5: Cleaning database files..." -ForegroundColor Yellow

$dbFilesToRemove = @(
    "database/db-manager-clean.js",
    "database/db-manager-mysql.js",
    "create-db.js",
    "setup-production-db.js"
)

$removedDbFiles = 0
foreach ($file in $dbFilesToRemove) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        $removedDbFiles++
        Write-Host "  ❌ Removed: $file" -ForegroundColor Gray
    }
}

Write-Host "✅ Removed $removedDbFiles redundant database files" -ForegroundColor Green
Write-Host ""

# Step 6: Remove redundant batch scripts
Write-Host "🔧 Step 6: Cleaning batch scripts..." -ForegroundColor Yellow

$batFilesToRemove = @(
    "start-server.bat",
    "start-optimized.bat",
    "quick-start.bat",
    "fix-admin.bat",
    "deploy.bat",
    "cleanup.bat",
    "optimize-cleanup.bat",
    "setup-mysql.bat",
    "update-backend-url.bat"
)

$removedBats = 0
foreach ($file in $batFilesToRemove) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        $removedBats++
        Write-Host "  ❌ Removed: $file" -ForegroundColor Gray
    }
}

Write-Host "✅ Removed $removedBats redundant batch files" -ForegroundColor Green
Write-Host ""

# Step 7: Remove other redundant files
Write-Host "📦 Step 7: Cleaning misc files..." -ForegroundColor Yellow

$miscFilesToRemove = @(
    ".env.production",
    "update-backend-url.js",
    "deploy-shared.sh",
    "deploy-vps.sh",
    "create-database.ps1",
    "create-database.sql",
    "optimize-cleanup.ps1"
)

$removedMisc = 0
foreach ($file in $miscFilesToRemove) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        $removedMisc++
        Write-Host "  ❌ Removed: $file" -ForegroundColor Gray
    }
}

Write-Host "✅ Removed $removedMisc misc files" -ForegroundColor Green
Write-Host ""

# Step 8: Update .gitignore
Write-Host "📝 Step 8: Updating .gitignore..." -ForegroundColor Yellow

$gitignorePath = Join-Path $projectRoot ".gitignore"
$gitignoreContent = @"
# Dependencies
node_modules/
package-lock.json

# Environment files
.env
.env.local
.env.production

# Logs
logs/
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Uploads (use Cloudinary in production)
uploads/*
!uploads/.gitkeep

# Backup folders
_backup*/

# Development files
*-old.*
*-debug.*
*-test.*
test-*.html
quick-test.*

# Temporary documentation (keep clean)
*-FIXED.md
*-STATUS.md
*-COMPLETE.md
BUG-*.md
CORS-*.md
CLEANUP-PLAN.md
cleanup-project.ps1
"@

Set-Content -Path $gitignorePath -Value $gitignoreContent -Force
Write-Host "✅ Updated .gitignore" -ForegroundColor Green
Write-Host ""

# Step 9: Summary report
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CLEANUP COMPLETE! 🎉" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalRemoved = $removedDocs + $removedServers + $removedTests + $removedDbFiles + $removedBats + $removedMisc

Write-Host "📊 SUMMARY:" -ForegroundColor Yellow
Write-Host "  Documentation files removed: $removedDocs" -ForegroundColor White
Write-Host "  Server files removed: $removedServers" -ForegroundColor White
Write-Host "  Test files removed: $removedTests" -ForegroundColor White
Write-Host "  Database files removed: $removedDbFiles" -ForegroundColor White
Write-Host "  Batch scripts removed: $removedBats" -ForegroundColor White
Write-Host "  Misc files removed: $removedMisc" -ForegroundColor White
Write-Host "  ─────────────────────────────" -ForegroundColor Gray
Write-Host "  TOTAL REMOVED: $totalRemoved files" -ForegroundColor Green
Write-Host ""

Write-Host "📁 KEPT ESSENTIAL FILES:" -ForegroundColor Yellow
Write-Host "  ✅ README.md" -ForegroundColor Green
Write-Host "  ✅ QUICK-START-GUIDE.md" -ForegroundColor Green
Write-Host "  ✅ GITHUB-DEPLOYMENT-GUIDE.md" -ForegroundColor Green
Write-Host "  ✅ CLOUDINARY-SETUP.md" -ForegroundColor Green
Write-Host "  ✅ CLOUDINARY-COMPLETE-GUIDE.md" -ForegroundColor Green
Write-Host "  ✅ server.js (production server)" -ForegroundColor Green
Write-Host "  ✅ tests/ folder (organized tests)" -ForegroundColor Green
Write-Host ""

Write-Host "💾 BACKUP LOCATION:" -ForegroundColor Yellow
Write-Host "  $backupFolder" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Review remaining files" -ForegroundColor White
Write-Host "  2. Test the application: npm start" -ForegroundColor White
Write-Host "  3. Commit clean codebase: git add . && git commit -m 'Clean up project'" -ForegroundColor White
Write-Host "  4. Deploy to Railway: git push" -ForegroundColor White
Write-Host ""

Write-Host "✅ Your project is now production-ready!" -ForegroundColor Green
Write-Host ""

# Open project folder
Write-Host "📂 Opening project folder..." -ForegroundColor Yellow
Start-Process explorer $projectRoot
