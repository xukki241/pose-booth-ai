# Pose-Booth AI — Start Next.js Frontend Web App
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Starting Pose-Booth AI Frontend Web App   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "URL: http://localhost:3000" -ForegroundColor Green
Write-Host ""

Set-Location -Path "$PSScriptRoot\apps\web"
npm run dev
