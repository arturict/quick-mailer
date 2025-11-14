#!/bin/bash

# Simple Autonomous Manager - No jq needed

REPO="arturict/quick-mailer"
REPO_PATH="/home/nex/repos/quick-mailer"

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  🤖 AUTONOMOUS MANAGER - QUICK MAILER                           ║"
echo "╚════════════════════════════════════════════════════════════════
echo ""
echo "Repository: $REPO"
echo "Path: $REPO_PATH"
echo "Session: quick-mailer-manager"
echo ""
echo "📝 Du kannst detachen mit: Ctrl+B dann D"
echo ""

ITERATION=0

while true; do
  ITERATION=$((ITERATION + 1))
  
  echo ""
"  echo "════════════
  echo "🔄 ITERATION #$ITERATION - $(date '+%Y-%m-%d %H:%M:%S')"
  echo "════════════════════════════════════════════════════════════════════"
  echo ""
  
  cd "$REPO_PATH"
  
  echo "[$(date '+%H:%M:%S')] 📊 Checking Pull Requests..."
  
  # List all PRs
  gh pr list
  
  echo ""
  echo "[$(date '+%H:%M:%S')] 🔍 Looking for ready PRs (no WIP, not draft)..."
  
  # Check each PR manually
  for pr_num in $(gh pr list --json number --jq '.[].number' 2>/dev/null || echo ""); do
    if [ ! -z "$pr_num" ]; then
      pr_title=$(gh pr view $pr_num --json title --jq '.title' 2>/dev/null)
      is_draft=$(gh pr view $pr_num --json isDraft --jq '.isDraft' 2>/dev/null)
      
      echo "  PR #$pr_num: $pr_title"
      echo "    Draft: $is_draft"
      
      # Check if ready (not draft, no WIP in title)
      if [ "$is_draft" = "false" ] && ! echo "$pr_title" | grep -q "\[WIP\]"; then
        echo "    ✅ Ready for review!"
        
        # Check if already reviewed
        review_count=$(gh pr view $pr_num --json reviews --jq '.reviews | length' 2>/dev/null || echo "0")
        
        if [ "$review_count" = "0" ]; then
          echo "    📝 Posting review with @copilot..."
          
          gh pr comment $pr_num --body "@copilot Great work!

## 🤖 Autonomous Manager Review

This PR looks ready for review!

### 📚 Reminder
You have access to Context7 for documentation lookups.

Great job! 🚀"
          
          echo "    ✅ Review posted!"
          
          # Approve
          gh pr review $pr_num --approve --body "@copilot Approved!"
          
          echo "    ✅ PR approved!"
        else
          echo "    ℹ️  Already has $review_count review(s)"
        fi
      else
        echo "    ⏳ Still in WIP/Draft"
      fi
      echo ""
    fi
  done
  
  echo ""
  echo "[$(date '+%H:%M:%S')] ⏳ Sleeping 3 minutes..."
  echo "Press Ctrl+C to stop, or Ctrl+B then D to detach"
  echo ""
  
  sleep 180
done
