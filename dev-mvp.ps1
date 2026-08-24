# SyncroBrain MVP — gateway + console（独立 PowerShell 窗口）
# 先运行 .\dev.ps1 完成 clone / install / docker
# Usage: .\dev-mvp.ps1

$ErrorActionPreference = "Continue"
$Root = $PSScriptRoot

$gateway = Join-Path $Root "iot-gateway"
$console = Join-Path $Root "iot-console-web"

foreach ($pair in @(
  @("iot-gateway", $gateway),
  @("iot-console-web", $console)
)) {
  if (-not (Test-Path (Join-Path $pair[1] "package.json"))) {
    Write-Host "❌ $($pair[0]) 未就绪 — 请先运行 .\dev.ps1" -ForegroundColor Red
    exit 1
  }
}

Write-Host "== SyncroBrain MVP ==" -ForegroundColor Cyan
Write-Host "Gateway :13200  |  Console :15180`n"

$gwCmd = @"
Set-Location '$Root'
`$env:NODE_ENV='development'
Write-Host 'pnpm --dir iot-gateway dev -> http://localhost:13200' -ForegroundColor Green
pnpm --dir iot-gateway dev
"@

Write-Host "[1] 启动 iot-gateway（新窗口）..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-Command", $gwCmd
)

Write-Host "      等待 http://localhost:13200/api/v1/health ..." -ForegroundColor DarkGray
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Seconds 1
  try {
    $h = Invoke-RestMethod -Uri "http://127.0.0.1:13200/api/v1/health" -TimeoutSec 2
    if ($h.status -eq "ok") { $ready = $true; break }
  } catch { }
}

if (-not $ready) {
  Write-Host "❌ 60 秒内 Gateway 未就绪，请查看 iot-gateway 窗口中的报错。" -ForegroundColor Red
  exit 1
}
Write-Host "      Gateway OK" -ForegroundColor Green

$webCmd = @"
Set-Location '$Root'
`$env:NODE_ENV='development'
Write-Host 'pnpm --dir iot-console-web dev -> http://localhost:15180' -ForegroundColor Green
pnpm --dir iot-console-web dev
"@

Write-Host "[2] 启动 iot-console-web（新窗口）..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-Command", $webCmd
)

Write-Host @"

════════════════════════════════════════════════════════════
  Gateway   http://localhost:13200/api/v1/health
  Console   http://localhost:15180

  Logto Redirect: http://localhost:15180/auth/callback
  统一登录需 LuminaryWorks/identity 已启动（见 ONBOARDING.md）
════════════════════════════════════════════════════════════

"@ -ForegroundColor Cyan
