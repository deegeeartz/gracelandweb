# Project Cleanup & Optimization Script
# Removes redundant files and organizes the project

Write-Host "🧹 RCCG Graceland - Project Cleanup & Optimization" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

$cleanupItems = @()

# ============================================
# 1. REDUNDANT DOCUMENTATION FILES
# ============================================

Write-Host "📄 Step 1: Identifying Redundant Documentation..." -ForegroundColor Yellow
Write-Host ""

$redundantDocs = @(
    "BUGFIX-CLOUDINARY-LINKS.md",           # Info now in CHANGELOG.md
    "ENDPOINTS-VERIFIED.md",                # Info now in CHANGELOG.md
    "ENV-SECURITY-EXPLAINED.md",            # Covered in SECURITY-BREACH-FIX.md
    "FIXES-APPLIED-README.md",              # Covered in FIXES-SUMMARY.md
    "PRIVATE-NETWORK-EXPLAINED.md"          # Covered in PUBLIC-ACCESS-EXPLAINED.md
)

foreach ($file in $redundantDocs) {
    if (Test-Path $file) {
        $cleanupItems += @{
            Type = "Documentation"
            File = $file
            Reason = "Redundant - info consolidated in other docs"
        }
    }
}

# ============================================
# 2. CORRUPTED/INVALID FILES
# ============================================

Write-Host "🔧 Step 2: Identifying Corrupted Files..." -ForegroundColor Yellow
Write-Host ""

$corruptedFiles = @(
    "edb-manager-clean.js databasedb-manager.js -Force",  # Invalid filename
    "-files .env",                                         # Invalid filename
    "-files  Select-String -Pattern .env"                  # Invalid filename
)

foreach ($file in $corruptedFiles) {
    if (Test-Path $file) {
        $cleanupItems += @{
            Type = "Corrupted"
            File = $file
            Reason = "Invalid/corrupted filename"
        }
    }
}

# ============================================
# 3. TEMPORARY SECURITY FILES
# ============================================

Write-Host "🔒 Step 3: Identifying Temporary Security Files..." -ForegroundColor Yellow
Write-Host ""

$tempSecurityFiles = @(
    "EMERGENCY-SECURITY-FIX.bat",           # One-time use script
    "remove-env-from-history.ps1"           # One-time use script
)

foreach ($file in $tempSecurityFiles) {
    if (Test-Path $file) {
        $cleanupItems += @{
            Type = "Temporary"
            File = $file
            Reason = "One-time security fix script (already applied)"
        }
    }
}

# ============================================
# 4. DISPLAY CLEANUP PLAN
# ============================================

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "📋 CLEANUP PLAN" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

if ($cleanupItems.Count -eq 0) {
    Write-Host "✅ No files to clean up! Project is already optimized." -ForegroundColor Green
    exit 0
}

Write-Host "Found $($cleanupItems.Count) files to remove:" -ForegroundColor Yellow
Write-Host ""

$groupedItems = $cleanupItems | Group-Object -Property Type

foreach ($group in $groupedItems) {
    Write-Host "$($group.Name) Files:" -ForegroundColor Cyan
    foreach ($item in $group.Group) {
        Write-Host "  ❌ $($item.File)" -ForegroundColor Red
        Write-Host "     → $($item.Reason)" -ForegroundColor Gray
    }
    Write-Host ""
}

# ============================================
# 5. BACKUP OPTION
# ============================================

Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "💾 BACKUP OPTION" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

$backup = Read-Host "Create backup before cleanup? (y/n) [Recommended: y]"

if ($backup -eq "y") {
    $backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    Write-Host ""
    Write-Host "📦 Creating backup in: $backupDir" -ForegroundColor Cyan
    
    foreach ($item in $cleanupItems) {
        if (Test-Path $item.File) {
            Copy-Item $item.File -Destination $backupDir -Force
            Write-Host "  ✅ Backed up: $($item.File)" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "✅ Backup complete!" -ForegroundColor Green
}

# ============================================
# 6. CONFIRM CLEANUP
# ============================================

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "⚠️  CONFIRM CLEANUP" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

Write-Host "This will permanently delete $($cleanupItems.Count) files." -ForegroundColor Red
Write-Host "Are you sure you want to proceed?" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Type 'yes' to confirm"

if ($confirm -ne "yes") {
    Write-Host ""
    Write-Host "❌ Cleanup cancelled." -ForegroundColor Red
    exit 0
}

# ============================================
# 7. PERFORM CLEANUP
# ============================================

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "🗑️  CLEANING UP..." -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

$deletedCount = 0
$errorCount = 0

foreach ($item in $cleanupItems) {
    try {
        if (Test-Path $item.File) {
            Remove-Item $item.File -Force -ErrorAction Stop
            Write-Host "  ✅ Deleted: $($item.File)" -ForegroundColor Green
            $deletedCount++
        } else {
            Write-Host "  ⚠️  Not found: $($item.File)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Error deleting: $($item.File)" -ForegroundColor Red
        Write-Host "     $($_.Exception.Message)" -ForegroundColor Gray
        $errorCount++
    }
}

# ============================================
# 8. OPTIMIZE .gitignore
# ============================================

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "📝 OPTIMIZING .gitignore" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

$gitignoreContent = @"
# Environment Variables
.env
.env.local
.env.production
.env.*.local

# Dependencies
node_modules/
package-lock.json

# Logs
logs/
*.log
npm-debug.log*

# OS Files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build & Cache
dist/
build/
.cache/
.temp/

# Uploads
uploads/*
!uploads/.gitkeep

# Backups
backup_*/
*.backup

# Testing
coverage/
.nyc_output/

# Railway
.railway/
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent -Force
Write-Host "✅ .gitignore optimized" -ForegroundColor Green

# ============================================
# 9. CREATE uploads/.gitkeep
# ============================================

Write-Host ""
Write-Host "📁 Ensuring uploads directory exists..." -ForegroundColor Cyan

if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" -Force | Out-Null
    Write-Host "  ✅ Created uploads/ directory" -ForegroundColor Green
}

if (-not (Test-Path "uploads/.gitkeep")) {
    New-Item -ItemType File -Path "uploads/.gitkeep" -Force | Out-Null
    Write-Host "  ✅ Created uploads/.gitkeep" -ForegroundColor Green
}

# ============================================
# 10. ORGANIZE DOCUMENTATION
# ============================================

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "📚 DOCUMENTATION STRUCTURE" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

Write-Host "Essential Documentation (Keeping):" -ForegroundColor Green
Write-Host "  ✅ README.md               - Main project overview" -ForegroundColor Gray
Write-Host "  ✅ CHANGELOG.md            - Version history & bug fixes" -ForegroundColor Gray
Write-Host "  ✅ QUICK-START-GUIDE.md    - Getting started" -ForegroundColor Gray
Write-Host "  ✅ CLOUDINARY-GUIDE.md     - Image optimization" -ForegroundColor Gray
Write-Host "  ✅ GITHUB-DEPLOYMENT-GUIDE.md - Deployment instructions" -ForegroundColor Gray
Write-Host "  ✅ RAILWAY-PRIVATE-NETWORK.md - Cost optimization" -ForegroundColor Gray
Write-Host "  ✅ TESTING-GUIDE.md        - Testing procedures" -ForegroundColor Gray
Write-Host "  ✅ FIXES-SUMMARY.md        - Recent fixes summary" -ForegroundColor Gray
Write-Host "  ✅ PUBLIC-ACCESS-EXPLAINED.md - Network explanation" -ForegroundColor Gray
Write-Host "  ✅ SECURITY-BREACH-FIX.md  - Security documentation" -ForegroundColor Gray

# ============================================
# 11. FINAL SUMMARY
# ============================================

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Files deleted: $deletedCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  ❌ Errors: $errorCount" -ForegroundColor Red
}
Write-Host "  📝 .gitignore optimized" -ForegroundColor Green
Write-Host "  📁 uploads/ directory verified" -ForegroundColor Green
Write-Host ""

# ============================================
# 12. OPTIMIZATION RECOMMENDATIONS
# ============================================

Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "🚀 OPTIMIZATION RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Run tests to verify everything works:" -ForegroundColor Gray
Write-Host "     node run-all-tests.js" -ForegroundColor White
Write-Host ""
Write-Host "  2. Commit cleanup changes:" -ForegroundColor Gray
Write-Host "     git add ." -ForegroundColor White
Write-Host "     git commit -m 'chore: Project cleanup and optimization'" -ForegroundColor White
Write-Host "     git push" -ForegroundColor White
Write-Host ""
Write-Host "  3. Optional: Remove old Git commits with sensitive data" -ForegroundColor Gray
Write-Host "     (See SECURITY-BREACH-FIX.md for instructions)" -ForegroundColor White
Write-Host ""

# ============================================
# 13. FINAL FILE COUNT
# ============================================

Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "📂 PROJECT STRUCTURE" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

$jsFiles = (Get-ChildItem -Recurse -Include *.js -Exclude node_modules | Measure-Object).Count
$htmlFiles = (Get-ChildItem -Recurse -Include *.html | Measure-Object).Count
$cssFiles = (Get-ChildItem -Recurse -Include *.css | Measure-Object).Count
$mdFiles = (Get-ChildItem -Include *.md | Measure-Object).Count

Write-Host "File Statistics:" -ForegroundColor Yellow
Write-Host "  JavaScript files: $jsFiles" -ForegroundColor Gray
Write-Host "  HTML files: $htmlFiles" -ForegroundColor Gray
Write-Host "  CSS files: $cssFiles" -ForegroundColor Gray
Write-Host "  Documentation files: $mdFiles" -ForegroundColor Gray
Write-Host ""

Write-Host "🎉 Your project is now clean and optimized!" -ForegroundColor Green
Write-Host ""
