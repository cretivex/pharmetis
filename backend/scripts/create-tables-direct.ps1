# Direct SQL Execution Script
# This script helps you create tables using the SQL file directly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Create Database Tables (Direct SQL)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "❌ psql command not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL or add it to your PATH." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Use Prisma Studio after fixing DATABASE_URL:" -ForegroundColor Yellow
    Write-Host "  1. Fix DATABASE_URL in .env file" -ForegroundColor Gray
    Write-Host "  2. Run: npm run prisma:migrate" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ psql found" -ForegroundColor Green
Write-Host ""

# Get database credentials
Write-Host "Enter PostgreSQL connection details:" -ForegroundColor Yellow
$dbUser = Read-Host "Username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) {
    $dbUser = "postgres"
}

$dbPassword = Read-Host "Password" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

$dbHost = Read-Host "Host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($dbHost)) {
    $dbHost = "localhost"
}

$dbPort = Read-Host "Port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($dbPort)) {
    $dbPort = "5432"
}

$dbName = Read-Host "Database name (default: pharmetis)"
if ([string]::IsNullOrWhiteSpace($dbName)) {
    $dbName = "pharmetis"
}

Write-Host ""
Write-Host "Creating database if it doesn't exist..." -ForegroundColor Yellow

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPasswordPlain

# Try to create database (ignore if exists)
$createDbQuery = "SELECT 1 FROM pg_database WHERE datname = '$dbName'"
$dbExists = psql -U $dbUser -h $dbHost -p $dbPort -d postgres -tAc $createDbQuery 2>$null

if (-not $dbExists) {
    Write-Host "Creating database: $dbName" -ForegroundColor Yellow
    psql -U $dbUser -h $dbHost -p $dbPort -d postgres -c "CREATE DATABASE $dbName;" 2>&1 | Out-Null
    Write-Host "✅ Database created" -ForegroundColor Green
} else {
    Write-Host "✅ Database already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Creating tables..." -ForegroundColor Yellow

# Execute SQL file
$sqlFile = Join-Path $PSScriptRoot "create-tables.sql"
$result = psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -f $sqlFile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ SUCCESS! All tables created!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Created 20 tables in database: $dbName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Update DATABASE_URL in .env:" -ForegroundColor Gray
    Write-Host "     DATABASE_URL=postgresql://$dbUser`:***@$dbHost`:$dbPort/$dbName?schema=public" -ForegroundColor DarkGray
    Write-Host "  2. Run: npm run prisma:generate" -ForegroundColor Gray
    Write-Host "  3. Start server: npm run dev" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Error creating tables!" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
}

# Clear password
$env:PGPASSWORD = ""
