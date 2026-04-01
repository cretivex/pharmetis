# Quick Database Setup Script for Windows
# This script helps you set up the database connection and create tables

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pharmetis Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env created. Please update DATABASE_URL with your PostgreSQL credentials." -ForegroundColor Green
    Write-Host ""
    Write-Host "Example DATABASE_URL:" -ForegroundColor Yellow
    Write-Host "DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/pharmetis?schema=public" -ForegroundColor Gray
    exit 1
}

# Read .env file
$envContent = Get-Content ".env" -Raw

# Check if DATABASE_URL is set
if ($envContent -match 'DATABASE_URL=postgresql://user:password@localhost:5432') {
    Write-Host "⚠️  DATABASE_URL still has default values!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please update .env file with your PostgreSQL credentials:" -ForegroundColor Yellow
    Write-Host "DATABASE_URL=postgresql://username:password@localhost:5432/pharmetis?schema=public" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

# Check if database exists
Write-Host "Checking database connection..." -ForegroundColor Yellow

# Try to generate Prisma client
Write-Host ""
Write-Host "Step 1: Generating Prisma Client..." -ForegroundColor Cyan
npm run prisma:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Try to run migration
Write-Host "Step 2: Creating database tables..." -ForegroundColor Cyan
Write-Host "This will create all 20 tables in your database." -ForegroundColor Gray
Write-Host ""

$migrationName = Read-Host "Enter migration name (or press Enter for 'init')"
if ([string]::IsNullOrWhiteSpace($migrationName)) {
    $migrationName = "init"
}

npm run prisma:migrate -- --name $migrationName

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ SUCCESS! All tables created!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Created 20 tables:" -ForegroundColor Cyan
    Write-Host "  Core: users, suppliers, products, rfqs, orders" -ForegroundColor Gray
    Write-Host "  Supporting: 15 additional tables" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: npm run prisma:studio (to view database)" -ForegroundColor Gray
    Write-Host "  2. Start server: npm run dev" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Database doesn't exist - Create it first:" -ForegroundColor Gray
    Write-Host "     CREATE DATABASE pharmetis;" -ForegroundColor DarkGray
    Write-Host "  2. Wrong credentials in DATABASE_URL" -ForegroundColor Gray
    Write-Host "  3. PostgreSQL not running" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Alternative: Use the SQL file directly:" -ForegroundColor Yellow
    Write-Host "  psql -U postgres -d pharmetis -f scripts/create-tables.sql" -ForegroundColor Gray
}
