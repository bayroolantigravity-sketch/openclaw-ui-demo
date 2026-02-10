param(
  [Parameter(Mandatory = $true)]
  [string]$Name,

  [Parameter(Mandatory = $false)]
  [string]$Message = ""
)

# ---------- Helpers ----------
function Fail([string]$msg) {
  Write-Host "[ERROR] $msg" -ForegroundColor Red
  exit 1
}

function Info([string]$msg) {
  Write-Host "[INFO]  $msg" -ForegroundColor DarkGray
}

function Ok([string]$msg) {
  Write-Host "[OK]    $msg" -ForegroundColor Green
}

function Warn([string]$msg) {
  Write-Host "[WARN]  $msg" -ForegroundColor Yellow
}

# ---------- Validate tag name ----------
if (-not $Name.StartsWith("cp-")) {
  Fail "Checkpoint tag must start with 'cp-'. Example: cp-m1-ui-skeleton"
}

# Git tag name basic validation (avoid spaces)
if ($Name -match "\s") {
  Fail "Checkpoint tag must not contain spaces. Use hyphens: cp-m1-ui-skeleton"
}

# ---------- Branch info ----------
$branch = git branch --show-current
if (-not $branch) {
  Fail "Detached HEAD state. Create or switch to a branch before checkpoint."
}
Info "Branch: $branch"

# ---------- Message ----------
if (-not $Message -or $Message.Trim() -eq "") {
  $Message = "checkpoint: $Name"
}

# ---------- Changes check ----------
$changes = git status --porcelain
if (-not $changes) {
  Warn "No changes detected. Skipping commit."
} else {
  Info "Committing changes..."
  git add -A

  # safer argument passing for commit message
  git commit -m "$Message"
  if ($LASTEXITCODE -ne 0) { Fail "git commit failed" }
}

# ---------- Push branch (auto set upstream if missing) ----------
Info "Pushing branch..."
git push
if ($LASTEXITCODE -ne 0) {
  Warn "git push failed; trying to set upstream (first push for this branch)."
  git push -u origin $branch
  if ($LASTEXITCODE -ne 0) { Fail "git push with upstream failed" }
}

# ---------- Tag handling ----------
# Local tag exists?
$localTag = git tag -l $Name
if ($localTag) {
  Warn "Tag '$Name' already exists locally."
} else {
  Info "Creating tag: $Name"
  git tag $Name
  if ($LASTEXITCODE -ne 0) { Fail "git tag failed" }
}

# Remote tag exists?
$remoteTag = git ls-remote --tags origin $Name
if ($remoteTag) {
  Warn "Tag '$Name' already exists on remote. Skipping tag push."
} else {
  Info "Pushing tag to origin: $Name"
  git push origin $Name
  if ($LASTEXITCODE -ne 0) { Fail "git push tag failed" }
}

Ok "Checkpoint completed: $Name"
