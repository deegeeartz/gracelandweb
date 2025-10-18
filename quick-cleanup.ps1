# Quick Cleanup - Remove redundant files
# Run this with: .\quick-cleanup.ps1

$files = @(
    "BUGFIX-CLOUDINARY-LINKS.md",
    "ENDPOINTS-VERIFIED.md", 
    "ENV-SECURITY-EXPLAINED.md",
    "FIXES-APPLIED-README.md",
    "PRIVATE-NETWORK-EXPLAINED.md",
    "EMERGENCY-SECURITY-FIX.bat",
    "remove-env-from-history.ps1"
)

Write-Host "`nRCCG Graceland - Quick Cleanup`n" -ForegroundColor Cyan

$found = $files | Where-Object { Test-Path $_ }

if ($found.Count -eq 0) {
    Write-Host "No files to remove. Already clean!`n" -ForegroundColor Green
    exit
}

Write-Host "Will remove $($found.Count) files:`n" -ForegroundColor Yellow
$found | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }

Write-Host "`nType 'yes' to confirm: " -NoNewline -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -eq 'yes') {
    $found | ForEach-Object { 
        Remove-Item $_ -Force
        Write-Host "Deleted: $_" -ForegroundColor Green
    }
    Write-Host "`nCleanup complete! Run: git add .`n" -ForegroundColor Green
} else {
    Write-Host "`nCancelled.`n" -ForegroundColor Yellow
}
