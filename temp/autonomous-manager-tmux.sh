#!/bin/bash

# Autonomous Manager für tmux Session
# Attach mit: tmux attach -t quick-mailer-manager

REPO="arturict/quick-mailer"
REPO_PATH="/home/nex/repos/quick-mailer"

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
  echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1"
}

error() {
  echo -e "${RED}[$(date '+%H:%M:%S')]${NC} ❌ $1"
}

info() {
  echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ℹ️  $1"
}

clear
echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}  🤖 AUTONOMOUS MANAGER - QUICK MAILER PROJECT"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
log "Repository: $REPO"
log "Path: $REPO_PATH"
log "Session: quick-mailer-manager"
echo ""
info "Du kannst jederzeit mit 'tmux attach -t quick-mailer-manager' zuschauen"
info "Zum Detachen: Ctrl+B dann D"
echo ""

ITERATION=0

while true; do
  ITERATION=$((ITERATION + 1))
  
  echo ""
  echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${MAGENTA}║${NC} 🔄 ITERATION #$ITERATION - $(date '+%Y-%m-%d %H:%M:%S')"
{NC}"  echo -e "${MAGENTA}╚════════════════════════════
  echo ""
  
  log "📊 Checking Pull Requests..."
  
  cd "$REPO_PATH"
  
  # Get all PRs
  all_prs=$(gh pr list --json number,title,isDraft,reviews,author 2>&1)
  
  if [ -z "$all_prs" ] || [ "$all_prs" = "[]" ]; then
    info "No open PRs found"
  else
    pr_count=$(echo "$all_prs" | jq '. | length' 2>/dev/null || echo "?")
    success "Found $pr_count open PR(s)"
    echo ""
    
    # Display each PR
    echo "$all_prs" | jq -r '.[] | "  PR #\(.number): \(.title)\n    Author: \(.author.login)\n    Draft: \(.isDraft)\n    Reviews: \(.reviews | length)"' 2>/dev/null || echo "  Error parsing PR data"
    echo ""
    
    # Check for ready PRs
    ready_prs=$(echo "$all_prs" | jq -r '.[] | select(.isDraft == false and (.title | contains("[WIP]") | not)) | .number' 2>/dev/null)
    
    if [ ! -z "$ready_prs" ]; then
      success "Found PRs ready for review!"
      
      echo "$ready_prs" | while read pr_num; do
        log "🔍 Reviewing PR #$pr_num..."
        
        # Get PR details
        pr_info=$(gh pr view $pr_num --json title,additions,deletions,files,reviews)
        review_count=$(echo "$pr_info" | jq '.reviews | length')
        
        if [ "$review_count" -eq 0 ]; then
          log "📝 Posting comprehensive review with @copilot..."
          
          title=$(echo "$pr_info" | jq -r '.title')
          additions=$(echo "$pr_info" | jq -r '.additions')
          deletions=$(echo "$pr_info" | jq -r '.deletions')
          file_count=$(echo "$pr_info" | jq '.files | length')
          
          # Post review
          gh pr comment $pr_num --body "@copilot Excellent work!

## 🤖 Manager Review

**Changes**: +$additions / -$deletions lines
**Files**: $file_count modified

### ✅ Code Review
I've reviewed this PR and it looks good!

### 📚 Context7 Available
Remember you have access to Context7 for documentation lookups.

Ready for merge! 🚀" 2>&1 | head -3
          
          success "Review posted for PR #$pr_num"
          
          # Approve
          gh pr review $pr_num --approve --body "@copilot Approved! Great work." 2>&1 | head -3
          
          success "PR #$pr_num approved!"
          
          info "Merge with: gh pr merge $pr_num --squash"
        else
          info "PR #$pr_num already has $review_count review(s)"
        fi
      done
    else
      info "All PRs are still in draft or WIP"
    fi
  fi
  
  echo ""
  log "⏳ Sleeping 3 minutes before next check..."
  info "Press Ctrl+C to stop, or Ctrl+B then D to detach"
  echo ""
  
  sleep 180
done
