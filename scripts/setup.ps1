# Installs dependencies for backend and frontend.
# Run from the infinity-hack folder:  .\scripts\setup.ps1
$root = Split-Path -Parent $PSScriptRoot
Push-Location "$root\backend"
npm install
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env"; Write-Host "Created backend\.env - add your API key." }
Pop-Location
Push-Location "$root\frontend"
npm install
Pop-Location
Write-Host "Setup complete."
