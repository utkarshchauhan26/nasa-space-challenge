<#
create_dev_db.ps1

Creates a Postgres development user and database for this project.

Usage (recommended):
  - Open PowerShell as a user that can run psql (Postgres bin on PATH), then:
    .\create_dev_db.ps1

Parameters:
  -NasaPassword : password to set for the created 'nasa_user' (defaults to 'suraj121')

The script will prompt you for the postgres superuser (postgres) password securely.
If psql is not on PATH, you will need to run psql from the Postgres bin folder.
#>

param(
    [string]$NasaPassword = 'suraj121'
)

function Write-ErrAndExit($msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    exit 1
}

# Check for psql
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCmd) {
    Write-Host "psql not found on PATH. If PostgreSQL is installed, run this script from the Postgres bin folder or add it to PATH." -ForegroundColor Yellow
    Write-Host "Typical path: 'C:\Program Files\PostgreSQL\<version>\bin'"
    # still continue: psql may be available via full path later
}

# Prompt for postgres superuser password (secure)
$superSecure = Read-Host "Enter postgres superuser 'postgres' password (press Enter to let psql prompt interactively)" -AsSecureString
if ($superSecure.Length -gt 0) {
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($superSecure)
    try {
        $superPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
        $env:PGPASSWORD = $superPlain
    } finally {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

# SQL to create user and DB
$sql = @"
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'nasa_user') THEN
      CREATE USER nasa_user WITH PASSWORD '$NasaPassword';
   ELSE
      ALTER USER nasa_user WITH PASSWORD '$NasaPassword';
   END IF;
END
$$;

CREATE DATABASE nasa_air_quality OWNER nasa_user;
GRANT ALL PRIVILEGES ON DATABASE nasa_air_quality TO nasa_user;
"@

Write-Host "Running SQL to create user and database..."

try {
    # Run against the default 'postgres' maintenance DB so we can create the target DB
    & psql -v ON_ERROR_STOP=1 -U postgres -h localhost -d postgres -c $sql
    Write-Host "Success: created/updated user 'nasa_user' and created database 'nasa_air_quality'."
} catch {
    Write-ErrAndExit($_.Exception.Message)
} finally {
    # Clear sensitive env var
    if ($env:PGPASSWORD) { Remove-Item Env:PGPASSWORD }
}
