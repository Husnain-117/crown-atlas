# Install PostgreSQL CLI (psql) to D:\PostgreSQL
# Run in PowerShell (as Administrator if you want to add to system PATH):
#   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; .\scripts\install-psql-D-drive.ps1

$InstallDir = "D:\PostgreSQL"
$BinariesZipUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.6-1-windows-x64-binaries.zip"
$TempZip = "$env:TEMP\postgresql-windows-binaries.zip"

Write-Host "Installing PostgreSQL CLI (psql) to $InstallDir ..." -ForegroundColor Cyan

# Create D:\PostgreSQL
if (-not (Test-Path "D:\")) {
    Write-Host "ERROR: D: drive not found." -ForegroundColor Red
    exit 1
}
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

# Download
Write-Host "Downloading PostgreSQL Windows binaries..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $BinariesZipUrl -OutFile $TempZip -UseBasicParsing
} catch {
    Write-Host "Download failed. Try manual install:" -ForegroundColor Red
    Write-Host "1. Open https://www.enterprisedb.com/download-postgresql-binaries" -ForegroundColor White
    Write-Host "2. Download 'PostgreSQL 16.x Windows x64 binaries' (zip)" -ForegroundColor White
    Write-Host "3. Extract the zip and copy the 'bin' folder to $InstallDir\bin" -ForegroundColor White
    Write-Host "   (Also copy 'lib' to $InstallDir\lib if psql complains about DLLs)" -ForegroundColor White
    exit 1
}

# Extract
Write-Host "Extracting to $InstallDir ..." -ForegroundColor Yellow
Expand-Archive -Path $TempZip -DestinationPath "$InstallDir\temp" -Force
Remove-Item $TempZip -Force -ErrorAction SilentlyContinue

# Move contents: zip usually has one root folder (e.g. pgsql) with bin, lib, share
$extracted = Get-ChildItem "$InstallDir\temp" -Directory
if ($extracted.Count -eq 1) {
    $root = $extracted[0]
    Get-ChildItem $root.FullName | Move-Item -Destination $InstallDir -Force
} else {
    Get-ChildItem "$InstallDir\temp\*" | Move-Item -Destination $InstallDir -Force
}
Remove-Item "$InstallDir\temp" -Recurse -Force -ErrorAction SilentlyContinue

$psqlPath = "$InstallDir\bin\psql.exe"
if (-not (Test-Path $psqlPath)) {
    Write-Host "ERROR: psql.exe not found at $psqlPath. Check extraction." -ForegroundColor Red
    exit 1
}

# Add to user PATH
$binPath = "$InstallDir\bin"
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$binPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$binPath", "User")
    Write-Host "Added $binPath to user PATH." -ForegroundColor Green
} else {
    Write-Host "PATH already contains $binPath." -ForegroundColor Green
}

Write-Host ""
Write-Host "Done. PostgreSQL CLI installed to $InstallDir" -ForegroundColor Green
Write-Host "  psql: $psqlPath" -ForegroundColor White
Write-Host ""
Write-Host "Close and reopen PowerShell/terminal, then run:" -ForegroundColor Yellow
Write-Host "  psql -h 157.230.160.98 -p 5432 -U redata_user -d trestle_live" -ForegroundColor White
Write-Host "  Enter the password from your secure environment when prompted." -ForegroundColor Gray
Write-Host ""
Write-Host "To run the migration:" -ForegroundColor Yellow
Write-Host '  psql -h 157.230.160.98 -p 5432 -U redata_user -d trestle_live -c "ALTER TABLE city_statistics ADD COLUMN IF NOT EXISTS new_listings_30d integer DEFAULT 0;"' -ForegroundColor White
