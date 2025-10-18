# Simple Project Cleanup Script
# Removes redundant files safely

Write-Host ""
Write-Host "RCCG Graceland - Project Cleanup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Gray
Write-Host ""

# Files to remove
$filesToRemove = @(
    # Redundant documentation
    "BUGFIX-CLOUDINARY-LINKS.md",
    "ENDPOINTS-VERIFIED.md",
    "ENV-SECURITY-EXPLAINED.md",
    "FIXES-APPLIED-README.md",
    "PRIVATE-NETWORK-EXPLAINED.md",
    
    # Temporary security scripts
    "EMERGENCY-SECURITY-FIX.bat",
    "remove-env-from-history.ps1",
    
    # Corrupted files (if they exist)
    "edb-manager-clean.js databasedb-manager.js -Force",
    "-files .env",
    "-files  Select-String -Pattern .env"
)

Write-Host "Files to be removed:" -ForegroundColor Yellow
Write-Host ""

$foundFiles = @()
$notFoundFiles = @()

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Write-Host "  [X] $file" -ForegroundColor Red
        $foundFiles += $file
    }
    else {
        $notFoundFiles += $file
    }
}

Write-Host ""
Write-Host "Found: $($foundFiles.Count) files to remove" -ForegroundColor Yellow
Write-Host "Not found: $($notFoundFiles.Count) files (already clean)" -ForegroundColor Green
Write-Host ""

if ($foundFiles.Count -eq 0) {
    Write-Host "Nothing to clean up! Project is already optimized." -ForegroundColor Green
    Write-Host ""
    exit 0
}

# Ask for confirmation
Write-Host "WARNING: This will permanently delete $($foundFiles.Count) files." -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Do you want to continue? Type 'yes' to confirm"

if ($confirm -ne "yes") {
    Write-Host ""
    Write-Host "Cleanup cancelled." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "Creating backup..." -ForegroundColor Cyan

# Create backup folder
$backupFolder = "cleanup_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

$backedUp = 0
foreach ($file in $foundFiles) {
    if (Test-Path $file) {
        try {
            Copy-Item $file -Destination $backupFolder -Force
            Write-Host "  Backed up: $file" -ForegroundColor Gray
            $backedUp++
        }
        catch {
            Write-Host "  Error backing up: $file" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Backed up $backedUp files to: $backupFolder" -ForegroundColor Green
Write-Host ""
Write-Host "Deleting files..." -ForegroundColor Cyan

$deleted = 0
$errors = 0

foreach ($file in $foundFiles) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force
            Write-Host "  Deleted: $file" -ForegroundColor Green
            $deleted++
        }
        catch {
            Write-Host "  Error deleting: $file - $($_.Exception.Message)" -ForegroundColor Red
            $errors++
        }
    }
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Gray
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Files deleted: $deleted" -ForegroundColor Green
Write-Host "  Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host "  Backup location: $backupFolder" -ForegroundColor Gray
Write-Host ""

if ($deleted -gt 0) {
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Run tests: node run-all-tests.js" -ForegroundColor Gray
    Write-Host "  2. Commit changes: git add . && git commit -m 'chore: Project cleanup'" -ForegroundColor Gray
    Write-Host "  3. Deploy: git push" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Done!" -ForegroundColor Green
Write-Host ""
