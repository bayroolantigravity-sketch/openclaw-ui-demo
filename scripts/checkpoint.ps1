param(
  [Parameter(Mandatory=$true)]
  [string]$Name,

  [Parameter(Mandatory=$false)]
  [string]$Message = ""
)

if (-not $Message -or $Message.Trim() -eq "") {
  $Message = "checkpoint: $Name"
}

Write-Host "==> Creating checkpoint: $Name" -ForegroundColor Cyan

git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) { throw "git commit failed" }

git push
if ($LASTEXITCODE -ne 0) { throw "git push failed" }

git tag $Name
if ($LASTEXITCODE -ne 0) { throw "git tag failed (tag may already exist)" }

git push origin $Name
if ($LASTEXITCODE -ne 0) { throw "git push tag failed" }

Write-Host "==> Done. Tag pushed: $Name" -ForegroundColor Green
