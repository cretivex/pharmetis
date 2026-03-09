# Create All Tables Script
# This will create all tables directly using SQL

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Create All Database Tables" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get database connection details
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

$env:PGPASSWORD = $dbPasswordPlain

# Check if database exists
$dbExists = psql -U $dbUser -h $dbHost -p $dbPort -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$dbName'" 2>$null

if (-not $dbExists) {
    Write-Host "Creating database: $dbName" -ForegroundColor Yellow
    psql -U $dbUser -h $dbHost -p $dbPort -d postgres -c "CREATE DATABASE $dbName;" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database" -ForegroundColor Red
        $env:PGPASSWORD = ""
        exit 1
    }
} else {
    Write-Host "✅ Database already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Creating all tables..." -ForegroundColor Yellow

# Execute SQL file
$sqlFile = Join-Path $PSScriptRoot "create-tables-updated.sql"
$result = psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -f $sqlFile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ SUCCESS! All tables created!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Created 21 tables:" -ForegroundColor Cyan
    Write-Host "  Core: users, suppliers, products, rfqs, orders" -ForegroundColor Gray
    Write-Host "  Auth: refresh_tokens" -ForegroundColor Gray
    Write-Host "  Supporting: 15 additional tables" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Update your .env file with:" -ForegroundColor Yellow
    Write-Host "DATABASE_URL=postgresql://$dbUser`:***@$dbHost`:$dbPort/$dbName?schema=public" -ForegroundColor DarkGray
} else {
    Write-Host ""
    Write-Host "❌ Error creating tables!" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
}

$env:PGPASSWORD = ""
