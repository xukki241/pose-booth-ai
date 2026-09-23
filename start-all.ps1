# Pose-Booth AI — Launch Both Backend and Frontend in separate windows
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       Launching Pose-Booth AI Stack         " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "1. Spawning Backend on http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "2. Spawning Frontend on http://localhost:3000" -ForegroundColor Green
Write-Host ""

$root = $PSScriptRoot

# Launch backend in separate console window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\apps\api'; Write-Host '--- POSE-BOOTH BACKEND (Port 8000) ---' -ForegroundColor Cyan; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

# Launch frontend in separate console window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\apps\web'; Write-Host '--- POSE-BOOTH FRONTEND (Port 3000) ---' -ForegroundColor Cyan; npm run dev"

Write-Host "Both processes launched in dedicated windows!" -ForegroundColor Green
Write-Host "Open your browser at: http://localhost:3000" -ForegroundColor Yellow
