# start-kule.ps1 - starts the multi-agent-observability server + client
# Usage: ./start-kule.ps1 [-ServerPort 4000] [-ClientPort 5173]

param(
    [int]$ServerPort = 4000,
    [int]$ClientPort = 5173
)

$ErrorActionPreference = 'Stop'
$repoRoot = $PSScriptRoot

function Resolve-Bun {
    $cmd = Get-Command bun.exe -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $candidate = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Filter "bun.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($candidate) { return $candidate.FullName }
    throw "bun.exe not found on PATH. Install with: winget install --id Oven-sh.Bun -e"
}

function Free-Port([int]$port, [string]$name) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
        $procIds = $conns.OwningProcess | Sort-Object -Unique
        foreach ($procId in $procIds) {
            Write-Host "Port $port ($name) is in use by PID $procId, stopping it..." -ForegroundColor Yellow
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 1
    }
}

function Wait-Ready([int]$port, [string]$path, [string]$name) {
    for ($i = 0; $i -lt 15; $i++) {
        try {
            Invoke-WebRequest -Uri "http://localhost:$port$path" -UseBasicParsing -TimeoutSec 2 | Out-Null
            Write-Host "$name is ready." -ForegroundColor Green
            return $true
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    Write-Host "$name did not respond in time (it may still be starting)." -ForegroundColor Yellow
    return $false
}

$bunPath = Resolve-Bun
Write-Host "Using bun: $bunPath"

Free-Port -port $ServerPort -name "server"
Free-Port -port $ClientPort -name "client"

Write-Host "Starting server on port $ServerPort..." -ForegroundColor Green
$env:SERVER_PORT = $ServerPort
$serverProc = Start-Process -FilePath $bunPath -ArgumentList "run", "dev" `
    -WorkingDirectory (Join-Path $repoRoot "apps\server") -PassThru -WindowStyle Normal

Wait-Ready -port $ServerPort -path "/events/filter-options" -name "Server" | Out-Null

Write-Host "Starting client on port $ClientPort..." -ForegroundColor Green
$env:VITE_PORT = $ClientPort
$clientProc = Start-Process -FilePath $bunPath -ArgumentList "run", "dev" `
    -WorkingDirectory (Join-Path $repoRoot "apps\client") -PassThru -WindowStyle Normal

Wait-Ready -port $ClientPort -path "/" -name "Client" | Out-Null

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Dashboard : http://localhost:$ClientPort" -ForegroundColor Green
Write-Host "Server API: http://localhost:$ServerPort" -ForegroundColor Green
Write-Host "WebSocket : ws://localhost:$ServerPort/stream" -ForegroundColor Green
Write-Host "Server PID: $($serverProc.Id)  Client PID: $($clientProc.Id)" -ForegroundColor DarkGray
Write-Host "Each process runs in its own window - close that window (or Stop-Process -Id <pid>) to stop it." -ForegroundColor DarkGray
Write-Host "============================================" -ForegroundColor Cyan
