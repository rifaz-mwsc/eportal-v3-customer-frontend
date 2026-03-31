# Create Asana tasks from the latest git commit message
# Each line starting with "- " in the commit body becomes a separate task
# The commit subject becomes a prefix/parent context
#
# Usage:
#   .\scripts\asana-from-commit.ps1                  # Uses latest commit
#   .\scripts\asana-from-commit.ps1 -CommitHash "abc123"  # Specific commit
#   .\scripts\asana-from-commit.ps1 -Section "1213352724065568"  # Into a section

param(
    [string]$CommitHash = "HEAD",
    [string]$Section = ""
)

$token = $env:ASANA_TOKEN
if (-not $token) {
    Write-Error "ASANA_TOKEN environment variable is not set."
    exit 1
}

$projectGid = "1213352724065566"
$headers = @{ "Authorization" = "Bearer $token" }

# Get commit message
$subject = git log -1 --format="%s" $CommitHash
$body = git log -1 --format="%b" $CommitHash

Write-Host "`nCommit: $subject" -ForegroundColor Yellow

# Extract task lines: lines starting with - or *
$lines = ($body -split "`n") | ForEach-Object { $_.Trim() } | Where-Object {
    $_ -match "^[-*]\s+" -or $_ -match "^\d+[\.\)]\s+"
}

# Strip bullet/number prefix
$tasks = $lines | ForEach-Object {
    $_ -replace "^[-*]\s+", "" -replace "^\d+[\.\)]\s+", ""
}

if ($tasks.Count -eq 0) {
    Write-Host "No bullet points found in commit body. Creating single task from subject." -ForegroundColor Cyan
    $tasks = @($subject)
}

Write-Host "Creating $($tasks.Count) task(s)...`n" -ForegroundColor Cyan

foreach ($taskTitle in $tasks) {
    $taskBody = @{
        data = @{
            name     = $taskTitle
            notes    = "From commit: $subject"
            projects = @($projectGid)
        }
    } | ConvertTo-Json -Depth 3

    try {
        $result = Invoke-RestMethod -Method Post `
            -Uri "https://app.asana.com/api/1.0/tasks" `
            -Headers $headers `
            -Body $taskBody `
            -ContentType "application/json"

        $taskGid = $result.data.gid
        Write-Host "  + $taskTitle (gid: $taskGid)" -ForegroundColor Green

        if ($Section) {
            $sectionBody = @{ data = @{ task = $taskGid } } | ConvertTo-Json -Depth 3
            Invoke-RestMethod -Method Post `
                -Uri "https://app.asana.com/api/1.0/sections/$Section/addTask" `
                -Headers $headers `
                -Body $sectionBody `
                -ContentType "application/json" | Out-Null
        }
    }
    catch {
        Write-Host "  x Failed: $taskTitle - $_" -ForegroundColor Red
    }
}

Write-Host "`nDone." -ForegroundColor Green
