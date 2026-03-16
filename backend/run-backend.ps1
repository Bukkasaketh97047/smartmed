# SmartMed Backend Runner
# This script loads environment variables from .env and starts the backend

if (Test-Path ".env") {
    Write-Host "Loading environment variables from .env..." -ForegroundColor Cyan
    Get-Content .env | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), [System.EnvironmentVariableTarget]::Process)
    }
} else {
    Write-Warning ".env file not found! Using default/placeholder values."
}

Write-Host "Starting SmartMed Backend..." -ForegroundColor Green
.\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
