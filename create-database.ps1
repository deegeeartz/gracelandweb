Write-Host "========================================" -ForegroundColor Green
Write-Host "Creating RCCG Graceland Church Database" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Setting up SQLite database..." -ForegroundColor Yellow
Write-Host ""

# Initialize the database
& node database/init-db.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Adding sample data..." -ForegroundColor Yellow
    & node database/add-sample-data.js
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Database Setup Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your church website database is ready!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Run: npm start" -ForegroundColor Gray
    Write-Host "2. Visit: http://localhost:3000" -ForegroundColor Gray  
    Write-Host "3. Admin: http://localhost:3000/admin.html" -ForegroundColor Gray
    Write-Host ""
}
else {
    Write-Host "Error creating database. Please check the error messages above." -ForegroundColor Red
}

Read-Host "Press Enter to continue"
