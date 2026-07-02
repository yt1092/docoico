<#
Windows PowerShell script to initialize git repo and push to GitHub using `gh` CLI.

Pre-reqs:
- Git installed and configured (`git config --global user.name` and `user.email`).
- GitHub CLI (`gh`) installed and authenticated (`gh auth login`).

Usage:
1. Open PowerShell in the project root.
2. Run: `./scripts/init-repo.ps1 -RepoOwner 'your-org-or-username' -RepoName 'docoico' -Private:$false`

#>
param(
    [string]$RepoOwner = 'your-username',
    [string]$RepoName = 'docoico',
    [bool]$Private = $false
)

Write-Host "Initializing local git repository..."
if (-not (Test-Path .git)) {
    git init
    git add .
    git commit -m "Initial commit: prepare CI and Vercel deploy"
} else {
    Write-Host "Git repository already initialized."
}

Write-Host "Creating GitHub repository via gh CLI..."
try {
    gh repo create $RepoOwner/$RepoName --source=. --remote=origin --push --public:($Private -eq $false) | Out-Null
    Write-Host "Repository created and pushed."
} catch {
    Write-Host "gh CLI creation failed or repo exists. Attempting to push to existing remote..."
    git remote add origin "https://github.com/$RepoOwner/$RepoName.git" -ErrorAction SilentlyContinue
    git push -u origin main
}

Write-Host "Done. Please set GitHub Secrets and Vercel project settings as described in README.md."
