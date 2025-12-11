# PowerShell script to set up Node.js environment
# Run this script in any new PowerShell terminal: .\setup-env.ps1

# Add Node.js to PATH for current session
$env:Path = "$env:Path;C:\Program Files\nodejs"

# Set execution policy for current session (allows npm scripts to run)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Write-Host "Node.js environment configured!" -ForegroundColor Green
Write-Host "Node version: $(node -v)" -ForegroundColor Cyan
Write-Host "npm version: $(npm -v)" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now run npm commands." -ForegroundColor Yellow
Write-Host "Note: This configuration is only for this terminal session." -ForegroundColor Yellow
Write-Host "To make it permanent, add 'C:\Program Files\nodejs' to your system PATH." -ForegroundColor Yellow

