Write-Host "🚀 Starting Zlin Smart City application..." -ForegroundColor Cyan

# Function to stop all background processes
function Stop-AllProcesses {
    Write-Host "`nStopping all services..." -ForegroundColor Yellow
    if ($apiProcess) { Stop-Process -Id $apiProcess.Id -ErrorAction SilentlyContinue }
    if ($simProcess) { Stop-Process -Id $simProcess.Id -ErrorAction SilentlyContinue }
    if ($webProcess) { Stop-Process -Id $webProcess.Id -ErrorAction SilentlyContinue }
    exit
}

# Trap Ctrl+C
$host.UI.RawUI.FlushInputBuffer()
trap { Stop-AllProcesses }

# 1. Start API
Write-Host "📡 Starting API (http://localhost:5214)..." -ForegroundColor Gray
$apiProcess = Start-Process dotnet -ArgumentList "run", "--project", "ZlinSmartCity.Api/ZlinSmartCity.Api.csproj" -PassThru -NoNewWindow

# 2. Start Simulator
Write-Host "🤖 Starting Simulator..." -ForegroundColor Gray
$simProcess = Start-Process python -ArgumentList "ZlinSmartCity.Simulator/simulator.py" -PassThru -NoNewWindow

# 3. Start Web Frontend
Write-Host "💻 Starting Web Frontend (Vite)..." -ForegroundColor Gray
Set-Location ZlinSmartCity.Web
$webProcess = Start-Process npm -ArgumentList "run", "dev" -PassThru -NoNewWindow
Set-Location ..

Write-Host "`n✅ All services are starting up!" -ForegroundColor Green
Write-Host "   - API: http://localhost:5214"
Write-Host "   - Web: http://localhost:5173"
Write-Host "`nPress Ctrl+C to stop everything."

# Keep the script running
while ($true) {
    Start-Sleep -Seconds 1
}
