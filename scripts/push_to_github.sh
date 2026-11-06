#!/usr/bin/env bash
# ==============================================================================
# Doc_video_automation - GitHub Push & Sync Automation Script
# Repository: https://github.com/markjosephcandy-bot/Doc_video_automation.git
# ==============================================================================

set -e

REPO_URL="https://github.com/markjosephcandy-bot/Doc_video_automation.git"
BRANCH="main"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}====================================================================${NC}"
echo -e "${CYAN}🐙 Doc_video_automation :: GitHub Automated Push Pipeline${NC}"
echo -e "${BLUE}====================================================================${NC}"

# Check for personal access token in env or prompt
COMMIT_MSG="${1:-"feat(pipeline): automated doc-to-video pipeline and deployment scripts"}"

# Ensure safe directory
git config --global --add safe.directory /app/applet 2>/dev/null || true

# Ensure branch is main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo -e "${YELLOW}Renaming branch to ${BRANCH}...${NC}"
    git branch -M "$BRANCH"
fi

# Ensure remote is set
if git remote | grep -q "^origin$"; then
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi

echo -e "${CYAN}Staging all changes...${NC}"
git add -A

# Check if there is anything to commit
if git diff --staged --quiet; then
    echo -e "${YELLOW}ℹ️  No changes to commit. Repository is clean.${NC}"
else
    echo -e "${CYAN}Committing changes: ${COMMIT_MSG}${NC}"
    git commit -m "$COMMIT_MSG"
fi

echo -e "\n${BLUE}Pushing to GitHub (${REPO_URL})...${NC}"

# Check if GITHUB_TOKEN or GH_TOKEN is provided in environment
if [ -n "$GITHUB_TOKEN" ]; then
    AUTH_URL="https://${GITHUB_TOKEN}@github.com/markjosephcandy-bot/Doc_video_automation.git"
    echo -e "${GREEN}Using GITHUB_TOKEN for authentication...${NC}"
    git push -u "$AUTH_URL" "$BRANCH"
elif [ -n "$GH_TOKEN" ]; then
    AUTH_URL="https://${GH_TOKEN}@github.com/markjosephcandy-bot/Doc_video_automation.git"
    echo -e "${GREEN}Using GH_TOKEN for authentication...${NC}"
    git push -u "$AUTH_URL" "$BRANCH"
else
    # Try normal git push (will use git credential store / SSH if configured)
    echo -e "${YELLOW}Notice: Attempting push with default git credentials.${NC}"
    echo -e "${YELLOW}If prompted for credentials, use your GitHub username and Personal Access Token (PAT).${NC}"
    git push -u origin "$BRANCH" || {
        echo -e "\n${RED}❌ Push failed due to GitHub authentication requirements.${NC}"
        echo -e "${YELLOW}To push with your GitHub Personal Access Token (PAT):${NC}"
        echo -e "  export GITHUB_TOKEN=\"your_github_token_here\""
        echo -e "  ./scripts/push_to_github.sh \"$COMMIT_MSG\""
        echo -e "\nOr run directly with token in remote URL:"
        echo -e "  git push https://<YOUR_GITHUB_TOKEN>@github.com/markjosephcandy-bot/Doc_video_automation.git main"
        exit 1
    }
fi

echo -e "\n${GREEN}✔ Successfully pushed to ${REPO_URL} on branch ${BRANCH}!${NC}"
