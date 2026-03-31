# Asana Helper: List workspaces, projects, and sections
# Usage: .\scripts\asana-info.ps1 -Action workspaces|projects|sections
#
# Examples:
#   .\scripts\asana-info.ps1 -Action workspaces
#   .\scripts\asana-info.ps1 -Action projects -WorkspaceGid "123456"
#   .\scripts\asana-info.ps1 -Action sections -ProjectGid "789012"

param(
    [Parameter(Mandatory)]
    [ValidateSet("workspaces", "projects", "sections")]
    [string]$Action,
    [string]$WorkspaceGid = "",
    [string]$ProjectGid = ""
)

$token = $env:ASANA_TOKEN
if (-not $token) {
    Write-Error "ASANA_TOKEN environment variable is not set."
    exit 1
}

$headers = @{ "Authorization" = "Bearer $token" }

switch ($Action) {
    "workspaces" {
        $result = Invoke-RestMethod -Uri "https://app.asana.com/api/1.0/workspaces" -Headers $headers
        Write-Host "`nWorkspaces:" -ForegroundColor Yellow
        $result.data | ForEach-Object { Write-Host "  $($_.gid)  $($_.name)" }
    }
    "projects" {
        if (-not $WorkspaceGid) { Write-Error "Provide -WorkspaceGid"; exit 1 }
        $result = Invoke-RestMethod -Uri "https://app.asana.com/api/1.0/workspaces/$WorkspaceGid/projects" -Headers $headers
        Write-Host "`nProjects:" -ForegroundColor Yellow
        $result.data | ForEach-Object { Write-Host "  $($_.gid)  $($_.name)" }
    }
    "sections" {
        if (-not $ProjectGid) { Write-Error "Provide -ProjectGid"; exit 1 }
        $result = Invoke-RestMethod -Uri "https://app.asana.com/api/1.0/projects/$ProjectGid/sections" -Headers $headers
        Write-Host "`nSections:" -ForegroundColor Yellow
        $result.data | ForEach-Object { Write-Host "  $($_.gid)  $($_.name)" }
    }
}
