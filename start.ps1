#!/usr/bin/env pwsh
# start.ps1 - launch local dev server for baziai

$port = 3000
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$url  = "http://localhost:$port/"

Write-Host "`n=== Bazi Local Server ===" -ForegroundColor Cyan

# check if port is already in use
$inUse = netstat -an 2>$null | Select-String "LISTENING" | Select-String ":$port "
if ($inUse) {
    Write-Host "[OK] Server already running on port $port" -ForegroundColor Green
    Start-Process $url
    exit 0
}

# find available tool: python > npx serve
$cmd = $null
$args = $null
$tool = ""

try {
    $v = python --version 2>&1
    if ($LASTEXITCODE -eq 0) { $tool = "python"; $cmd = "python"; $args = @("-m", "http.server", $port.ToString()) }
} catch { }

if (-not $cmd) {
    try {
        $v = node --version 2>&1
        if ($LASTEXITCODE -eq 0) { $tool = "npx serve"; $cmd = "npx"; $args = @("serve", ".", "--listen", $port.ToString()) }
    } catch { }
}

if (-not $cmd) {
    Write-Host "[ERR] Please install Python or Node.js" -ForegroundColor Red
    Write-Host "      https://nodejs.org/" -ForegroundColor Cyan
    Write-Host "      https://www.python.org/" -ForegroundColor Cyan
    exit 1
}

Write-Host "[INFO] Starting server using $tool ..." -ForegroundColor Yellow

try {
    Start-Process -FilePath $cmd -ArgumentList $args -WorkingDirectory $root -WindowStyle Normal
} catch {
    Write-Host "[ERR] Failed to start: $_" -ForegroundColor Red
    exit 1
}

Start-Sleep 3

$ok = $false
for ($i = 0; $i -lt 5; $i++) {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $ok = $true; break }
    } catch { Start-Sleep 1 }
}

if ($ok) {
    Write-Host "[OK] Server is running -> $url" -ForegroundColor Green
} else {
    Write-Host "[WARN] Could not verify server, try opening manually: $url" -ForegroundColor Yellow
}

Start-Process $url
