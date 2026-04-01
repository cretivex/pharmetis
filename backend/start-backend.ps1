# Backend Startup Script
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "🚀 Starting Pharmetis Backend Server" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and configure it.`n" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check if Prisma client is generated
if (-not (Test-Path "node_modules/.prisma/client")) {
    Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
    npm run prisma:generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Starting development server...`n" -ForegroundColor Green
npm run dev
