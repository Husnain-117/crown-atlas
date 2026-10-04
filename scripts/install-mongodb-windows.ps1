# MongoDB Installation Script for Windows (D: Drive)
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MongoDB Installation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Configuration
$MongoDBVersion = "7.0"  # Update this to the latest version
$InstallPath = "D:\MongoDB\Server\$MongoDBVersion"
$DataPath = "D:\MongoDB\Data"
$LogPath = "D:\MongoDB\Log"
$ServiceName = "MongoDB"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Install Path: $InstallPath" -ForegroundColor Gray
Write-Host "  Data Path: $DataPath" -ForegroundColor Gray
Write-Host "  Log Path: $LogPath" -ForegroundColor Gray
Write-Host ""

# Check if MongoDB is already installed
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "MongoDB service already exists!" -ForegroundColor Yellow
    $response = Read-Host "Do you want to reinstall? (y/N)"
    if ($response -ne "y") {
        Write-Host "Installation cancelled." -ForegroundColor Yellow
        exit 0
    }
    
    # Stop and remove existing service
    Write-Host "Stopping existing MongoDB service..." -ForegroundColor Yellow
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    & "$InstallPath\bin\mongod.exe" --remove --serviceName $ServiceName -ErrorAction SilentlyContinue
}

# Create directories
Write-Host "Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $InstallPath | Out-Null
New-Item -ItemType Directory -Force -Path $DataPath | Out-Null
New-Item -ItemType Directory -Force -Path $LogPath | Out-Null
Write-Host "✓ Directories created" -ForegroundColor Green

# Download MongoDB
Write-Host ""
Write-Host "Please download MongoDB Community Server manually:" -ForegroundColor Yellow
Write-Host "1. Visit: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
Write-Host "2. Select Windows x64" -ForegroundColor Cyan
Write-Host "3. Choose 'Complete' installation" -ForegroundColor Cyan
Write-Host "4. Set custom installation path to: $InstallPath" -ForegroundColor Cyan
Write-Host "5. Set data directory to: $DataPath" -ForegroundColor Cyan
Write-Host "6. Set log directory to: $LogPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "After installation, run this script again to configure the service." -ForegroundColor Yellow
Write-Host ""

# Check if mongod.exe exists
$mongodPath = "$InstallPath\bin\mongod.exe"
if (-not (Test-Path $mongodPath)) {
    Write-Host "MongoDB not found at $mongodPath" -ForegroundColor Red
    Write-Host "Please install MongoDB first, then run this script again." -ForegroundColor Yellow
    exit 1
}

# Install MongoDB as Windows Service
Write-Host "Installing MongoDB as Windows Service..." -ForegroundColor Yellow
& $mongodPath --install --serviceName $ServiceName --serviceDisplayName "MongoDB" --dbpath $DataPath --logpath "$LogPath\mongod.log" --service

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ MongoDB service installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install MongoDB service" -ForegroundColor Red
    exit 1
}

# Start MongoDB Service
Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
Start-Service -Name $ServiceName

# Wait for service to start
Start-Sleep -Seconds 5

# Verify service is running
$service = Get-Service -Name $ServiceName
if ($service.Status -eq "Running") {
    Write-Host "✓ MongoDB service is running" -ForegroundColor Green
} else {
    Write-Host "✗ MongoDB service failed to start" -ForegroundColor Red
    Write-Host "Check the log file at: $LogPath\mongod.log" -ForegroundColor Yellow
    exit 1
}

# Test connection
Write-Host "Testing MongoDB connection..." -ForegroundColor Yellow
$mongoPath = "$InstallPath\bin\mongo.exe"
if (Test-Path $mongoPath) {
    $version = & $mongoPath --version 2>&1
    Write-Host "✓ MongoDB installed successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "MongoDB Version:" -ForegroundColor Cyan
    Write-Host $version -ForegroundColor Gray
} else {
    Write-Host "⚠ MongoDB shell (mongo.exe) not found" -ForegroundColor Yellow
    Write-Host "You can use MongoDB Compass or mongosh instead" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "MongoDB is now running on:" -ForegroundColor Yellow
Write-Host "  Connection String: mongodb://localhost:27017" -ForegroundColor Cyan
Write-Host "  Data Directory: $DataPath" -ForegroundColor Cyan
Write-Host "  Log Directory: $LogPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "To manage the service:" -ForegroundColor Yellow
Write-Host "  Start:   net start MongoDB" -ForegroundColor Gray
Write-Host "  Stop:    net stop MongoDB" -ForegroundColor Gray
Write-Host "  Restart: Restart-Service MongoDB" -ForegroundColor Gray
Write-Host ""









