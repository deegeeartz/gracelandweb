# RCCG Graceland - Complete Test & Deployment Script
# This script will test everything and help you deploy

Write-Host "🧪 RCCG Graceland - Complete Test Suite" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

# Check if in correct directory
$currentDir = Get-Location
if ($currentDir.Path -notlike "*gracelandweb*") {
    Write-Host "❌ Error: Please run this from the gracelandweb directory" -ForegroundColor Red
    exit 1
}

# Test 1: Run automated tests
Write-Host "📋 Step 1: Running automated tests..." -ForegroundColor Yellow
Write-Host ""

node run-all-tests.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️  Some tests failed. Review the output above." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "🌐 Step 2: Server Test (Manual)" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

Write-Host "Now we'll start the server for manual testing..." -ForegroundColor Cyan
Write-Host ""
Write-Host "I will:"
Write-Host "  1. Start the server in the background"
Write-Host "  2. Open your browser to test the website"
Write-Host "  3. You can test:"
Write-Host "     - Upload an image in admin panel"
Write-Host "     - Click blog post links"
Write-Host "     - Verify everything works"
Write-Host ""

$startServer = Read-Host "Start server now? (y/n)"

if ($startServer -eq "y") {
    Write-Host ""
    Write-Host "🚀 Starting server..." -ForegroundColor Green
    
    # Start server in background
    $serverJob = Start-Job -ScriptBlock {
        Set-Location $using:currentDir
        node server.js
    }
    
    Write-Host "✅ Server started (Job ID: $($serverJob.Id))" -ForegroundColor Green
    
    # Wait for server to start
    Start-Sleep -Seconds 2
    
    # Open browser
    Write-Host "🌐 Opening browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
    Start-Process "http://localhost:3000/admin.html"
    
    Write-Host ""
    Write-Host "✅ Browser opened!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Manual Testing Checklist:" -ForegroundColor Yellow
    Write-Host "  [ ] 1. Login to admin panel"
    Write-Host "  [ ] 2. Create a test blog post with image"
    Write-Host "  [ ] 3. Verify image uploads to Cloudinary (not database)"
    Write-Host "  [ ] 4. Go to blog page"
    Write-Host "  [ ] 5. Click a blog post link"
    Write-Host "  [ ] 6. Verify post opens correctly (no 404)"
    Write-Host ""
    
    Read-Host "Press Enter when you're done testing"
    
    # Stop server
    Write-Host "🛑 Stopping server..." -ForegroundColor Yellow
    Stop-Job -Id $serverJob.Id
    Remove-Job -Id $serverJob.Id
    Write-Host "✅ Server stopped" -ForegroundColor Green
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "🚀 Step 3: Deployment" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

Write-Host "Ready to deploy to Railway?" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:"
Write-Host "  1. Check for uncommitted changes"
Write-Host "  2. Commit and push to GitHub"
Write-Host "  3. Railway will auto-deploy"
Write-Host ""

$deploy = Read-Host "Deploy now? (y/n)"

if ($deploy -eq "y") {
    Write-Host ""
    Write-Host "📊 Checking Git status..." -ForegroundColor Cyan
    git status --short
    
    Write-Host ""
    $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
    
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Test fixes: Cloudinary integration & blog link fixes"
    }
    
    Write-Host ""
    Write-Host "📝 Committing changes..." -ForegroundColor Cyan
    git add .
    git commit -m "$commitMsg"
    
    Write-Host ""
    Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Cyan
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Railway will now build and deploy your changes" -ForegroundColor Cyan
        Write-Host "   Check Railway dashboard: https://railway.app/dashboard" -ForegroundColor Gray
        Write-Host ""
        Write-Host "⏱️  Deployment usually takes 2-3 minutes" -ForegroundColor Yellow
        Write-Host ""
        
        $openRailway = Read-Host "Open Railway dashboard? (y/n)"
        if ($openRailway -eq "y") {
            Start-Process "https://railway.app/dashboard"
        }
    }
    else {
        Write-Host ""
        Write-Host "❌ Push failed. Check the error above." -ForegroundColor Red
    }
}
else {
    Write-Host ""
    Write-Host "ℹ️  Skipped deployment" -ForegroundColor Gray
    Write-Host "   You can deploy later with: git push" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "✅ Testing Complete!" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Monitor Railway deployment"
Write-Host "  2. Test production site when deployed"
Write-Host "  3. Verify Cloudinary images work on production"
Write-Host "  4. Check Railway logs for any errors"
Write-Host ""

Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "  - QUICK-START-GUIDE.md"
Write-Host "  - CLOUDINARY-GUIDE.md"
Write-Host "  - RAILWAY-PRIVATE-NETWORK.md"
Write-Host "  - CHANGELOG.md"
Write-Host ""

Write-Host "🎉 All done! Your website is ready!" -ForegroundColor Green
Write-Host ""
