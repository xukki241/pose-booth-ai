# Pose-Booth AI — Start FastAPI Backend Server
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Starting Pose-Booth AI Backend Server     " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Target: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Docs:   http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host ""

Set-Location -Path "$PSScriptRoot\apps\api"

# Check if port 8000 is already in use
$portCheck = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "[WARN] Port 8000 is already in use by process PID: $($portCheck.OwningProcess[0])" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to abort, or press Enter to continue..."
    Read-Host
}

python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
