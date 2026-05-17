Write-Host "---" -ForegroundColor Gray
Write-Host "🏙️  ZLIN SMART CITY SIMULATOR" -ForegroundColor Cyan -Style Bold
Write-Host "---" -ForegroundColor Gray
Write-Host "Starting data feed to http://localhost:5214/api/parking/update..." -ForegroundColor Yellow
Write-Host "Polling interval: 10 seconds" -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop simulation." -ForegroundColor Gray
Write-Host ""

python simulator.py
