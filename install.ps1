# Workouts, an add-on for Godspeed Mission Control: the installer for Windows.
#
#   irm https://raw.githubusercontent.com/MichaelZelbel/godspeed-workouts/main/install.ps1 | iex
#
# With options for the setup:
#
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/MichaelZelbel/godspeed-workouts/main/install.ps1))) --godspeed $env:USERPROFILE\godspeed-v2
#
# $env:HEVY_API_KEY gives the key without a question. It finds Node.js 22 or newer (on the PATH, or
# the one Godspeed's installer brought), downloads the newest release (main when there is none, or
# a git clone when the download is refused), and runs the setup: the key, the Workouts tracker,
# every workout so far, and a scheduled task "Godspeed Workouts" every hour. Safe to run again: it
# is also the update. To take it out: godspeed-workouts uninstall
$ErrorActionPreference = 'Stop'
$repo = 'MichaelZelbel/godspeed-workouts'

function Get-NodeMajor($exe) {
  try { $v = & $exe --version 2>$null; if ($v -match '^v(\d+)\.') { return [int]$Matches[1] } } catch {}
  return 0
}
$candidates = @()
$onPath = Get-Command node -ErrorAction SilentlyContinue
if ($onPath) { $candidates += $onPath.Source }
foreach ($d in @("$env:USERPROFILE\godspeed", "$env:USERPROFILE\godspeed-v2")) {
  $candidates += Get-ChildItem -Path "$d\.godspeed\integrated-runtime\runtime" -Filter node.exe -Recurse -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | ForEach-Object FullName
}
$candidates += "$env:ProgramFiles\nodejs\node.exe"
$node = $candidates | Where-Object { $_ -and (Test-Path $_) -and ((Get-NodeMajor $_) -ge 22) } | Select-Object -First 1
if (-not $node) {
  Write-Host 'Workouts needs Node.js 22 or newer, and none was found. Install Godspeed Mission Control first, or Node.js LTS from https://nodejs.org, then run this line again.'
  exit 1
}

$ref = $env:GODSPEED_WORKOUTS_REF
if (-not $ref) {
  try { $ref = (Invoke-RestMethod -Headers @{ 'User-Agent' = 'godspeed-workouts-installer' } "https://api.github.com/repos/$repo/releases/latest").tag_name } catch { $ref = $null }
  if (-not $ref) { $ref = 'main' }
}
$tmp = Join-Path ([IO.Path]::GetTempPath()) ("godspeed-workouts-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $tmp | Out-Null
try {
  $pkg = $null
  try {
    $zip = Join-Path $tmp 'src.zip'
    Invoke-WebRequest -UseBasicParsing "https://codeload.github.com/$repo/zip/$ref" -OutFile $zip
    Expand-Archive -Path $zip -DestinationPath $tmp
    $pkg = Get-ChildItem -Path $tmp -Directory -Filter 'godspeed-workouts-*' | Select-Object -First 1 | ForEach-Object FullName
  } catch {
    if (Get-Command git -ErrorAction SilentlyContinue) {
      git clone -q --depth 1 --branch $ref "https://github.com/$repo.git" (Join-Path $tmp 'godspeed-workouts') 2>$null
      if ($LASTEXITCODE -eq 0) { $pkg = Join-Path $tmp 'godspeed-workouts' }
    }
  }
  if (-not $pkg -or -not (Test-Path (Join-Path $pkg 'bin\godspeed-workouts.mjs'))) {
    Write-Host "Could not download Workouts ($ref) from GitHub. Check the internet connection and run this line again."
    exit 1
  }
  Write-Host "Workouts ($ref), with Node $(& $node --version) at $node"
  & $node (Join-Path $pkg 'bin\godspeed-workouts.mjs') setup @args
  if ($LASTEXITCODE -ne 0) {
    Write-Host "The setup stopped (exit $LASTEXITCODE). What it printed above says why; run this line again once that is fixed."
    exit $LASTEXITCODE
  }
} finally {
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}
