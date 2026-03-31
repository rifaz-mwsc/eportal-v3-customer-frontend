# Create Asana Task Script
# Usage: .\scripts\create-asana-task.ps1 -Title "Task name" -Description "Details" -Section "Section GID"
#
# Setup:
#   1. Get a Personal Access Token from https://app.asana.com/0/my-apps
#   2. Set environment variable: [System.Environment]::SetEnvironmentVariable("ASANA_TOKEN", "YOUR_TOKEN", "User")
#   3. Update $projectGid below with your Asana project GID
#   4. Restart terminal

param(
    [Parameter(Mandatory)][string]$Title,
    [string]$Description = "",
    [string]$Section = ""
)

$token = $env:ASANA_TOKEN
if (-not $token) {
    Write-Error "ASANA_TOKEN environment variable is not set."
    Write-Host "Set it with: [System.Environment]::SetEnvironmentVariable('ASANA_TOKEN', 'YOUR_TOKEN', 'User')"
    exit 1
}

# ── Configure these ──────────────────────────────
$projectGid = "1213352724065566"
# ─────────────────────────────────────────────────

$headers = @{ "Authorization" = "Bearer $token" }

$body = @{
    data = @{
        name     = $Title
        notes    = $Description
        projects = @($projectGid)
    }
} | ConvertTo-Json -Depth 3

try {
    $result = Invoke-RestMethod -Method Post `
        -Uri "https://app.asana.com/api/1.0/tasks" `
        -Headers $headers `
        -Body $body `
        -ContentType "application/json"

    $taskGid = $result.data.gid
    Write-Host "Task created: $($result.data.name) (gid: $taskGid)" -ForegroundColor Green

    # Assign to section if specified
    if ($Section) {
        $sectionBody = @{ data = @{ task = $taskGid } } | ConvertTo-Json -Depth 3
        Invoke-RestMethod -Method Post `
            -Uri "https://app.asana.com/api/1.0/sections/$Section/addTask" `
            -Headers $headers `
            -Body $sectionBody `
            -ContentType "application/json" | Out-Null
        Write-Host "Moved to section: $Section" -ForegroundColor Cyan
    }
}
catch {
    Write-Error "Failed to create task: $_"
    exit 1
}
