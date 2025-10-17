# RCCG Graceland - Code Optimization Script
# PowerShell version for better error handling

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RCCG Graceland - Code Optimization" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$cleaned = 0
$moved = 0
$errors = 0

# Function to safely remove file
function Remove-SafeFile {
    param($path)
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "✓ Removed: $path" -ForegroundColor Green
        $script:cleaned++
    }
}

# Function to safely remove directory
function Remove-SafeDir {
    param($path)
    if (Test-Path $path) {
        Remove-Item $path -Recurse -Force
        Write-Host "✓ Removed directory: $path" -ForegroundColor Green
        $script:cleaned++
    }
}

# Function to safely move file
function Move-SafeFile {
    param($source, $dest)
    if (Test-Path $source) {
        Move-Item $source $dest -Force
        Write-Host "✓ Moved: $source -> $dest" -ForegroundColor Yellow
        $script:moved++
    }
}

Write-Host "🗑️ Cleaning up duplicate and unnecessary files..." -ForegroundColor Yellow
Write-Host ""

# Remove duplicate server files
Write-Host "1. Removing duplicate server files..."
Remove-SafeFile "server-debug.js"
Remove-SafeFile "server-debug-fixed.js"
Remove-SafeFile "server-simple.js"

# Remove duplicate database managers
Write-Host "`n2. Removing duplicate database managers..."
Remove-SafeFile "database\db-manager-clean.js"
Remove-SafeFile "database\db-manager-mysql.js"

# Remove *_new model files
Write-Host "`n3. Removing duplicate model files..."
Remove-SafeFile "database\models\BlogPost_new.js"
Remove-SafeFile "database\models\Category_new.js"
Remove-SafeFile "database\models\Sermon_new.js"
Remove-SafeFile "database\models\Settings_new.js"
Remove-SafeFile "database\models\User_new.js"
Remove-SafeFile "database\models\BlogPostMySQL.js"
Remove-SafeFile "database\models\SermonMySQL.js"

# Remove backup models folder
Write-Host "`n4. Removing backup models folder..."
Remove-SafeDir "database\models_backup"

# Remove Railway deployment files
Write-Host "`n5. Removing Railway deployment files..."
Remove-SafeFile "railway-check.js"
Remove-SafeFile "railway.json"
Remove-SafeFile "nixpacks.toml"
Remove-SafeFile "RAILWAY-DEPLOY.md"
Remove-SafeFile "RAILWAY-STATUS.md"
Remove-SafeFile "RAILWAY-TROUBLESHOOT.md"
Remove-SafeFile "deploy-shared.sh"
Remove-SafeFile "deploy-vps.sh"
Remove-SafeFile "deploy.bat"

# Remove obsolete init scripts
Write-Host "`n6. Removing obsolete initialization scripts..."
Remove-SafeFile "database\init-railway.js"
Remove-SafeFile "database\migrate-to-mysql.js"
Remove-SafeFile "setup-production-db.js"
Remove-SafeFile "database\init-db.js"

# Remove duplicate admin/blog scripts
Write-Host "`n7. Removing duplicate admin/blog scripts..."
Remove-SafeFile "admin-script.js"
Remove-SafeFile "blog-script.js"

# Remove temporary/garbage files
Write-Host "`n8. Removing temporary/garbage files..."
Remove-SafeFile "edb-manager-clean.js databasedb-manager.js -Force"
Remove-SafeFile "ersPCDocumentsgracelandweb"
Remove-SafeFile "t"
Remove-SafeFile "database\graceland.db"

# Create tests folder and move test files
Write-Host "`n9. Organizing test files..."
if (-not (Test-Path "tests")) {
    New-Item -ItemType Directory -Path "tests" | Out-Null
    Write-Host "✓ Created tests folder" -ForegroundColor Green
}

$testFiles = @(
    "test-server.js",
    "test-login.js",
    "test-env.js",
    "test-direct-db.js",
    "diagnose-db.js",
    "health-check.js",
    "test.html",
    "quick-test.html",
    "admin-test.html"
)

foreach ($file in $testFiles) {
    Move-SafeFile $file "tests\$file"
}

# Remove obsolete documentation
Write-Host "`n10. Removing obsolete documentation..."
Remove-SafeFile "DATABASE-SETUP.md"
Remove-SafeFile "DEPLOY-CHECKLIST.md"
Remove-SafeFile "DEPLOYMENT.md"
Remove-SafeFile "LOCALHOST-SETUP.md"
Remove-SafeFile "SETUP-COMPLETE.md"
Remove-SafeFile "STATUS-FIXED.md"
Remove-SafeFile "FINAL-STATUS.md"
Remove-SafeFile "MYSQL-SETUP.md"

# Remove obsolete batch files
Write-Host "`n11. Removing obsolete batch files..."
Remove-SafeFile "cleanup.bat"
Remove-SafeFile "create-database.bat"
Remove-SafeFile "setup-mysql.bat"
Remove-SafeFile "start-server.bat"
Remove-SafeFile "start.bat"
Remove-SafeFile "quick-start.bat"

# Remove obsolete HTML/scripts
Write-Host "`n12. Removing obsolete files..."
Remove-SafeFile "rccg-graceland-website.html"
Remove-SafeFile "create-db.js"
Remove-SafeFile "create-database.sql"
Remove-SafeFile "create-database.ps1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor White
Write-Host "   - Files removed: $cleaned" -ForegroundColor Green
Write-Host "   - Files moved: $moved" -ForegroundColor Yellow
Write-Host "   - Errors: $errors" -ForegroundColor Red
Write-Host ""
Write-Host "🎉 Your codebase is now optimized!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Run: npm start" -ForegroundColor White
Write-Host "   2. Or use: .\start-optimized.bat" -ForegroundColor White
Write-Host "   3. Access admin at: http://localhost:3000/admin.html" -ForegroundColor White
Write-Host ""
