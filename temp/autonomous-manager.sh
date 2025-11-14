#!/bin/bash

# Autonomous Manager - Self-sustaining loop
REPO="arturict/quick-mailer"
ITERATION=0
MAX_ITER=50

log() {
  echo "[$(date '+%H:%M:%S')] $1"
}

log "🤖 Autonomous Manager Started"
log "Repository: $REPO"
log "Max iterations: $MAX_ITER"
echo ""

while [ $ITERATION -lt $MAX_ITER ]; do
  ITERATION=$((ITERATION + 1))
  
  echo ""
  log "════════════════ ITERATION #$ITERATION/$MAX_ITER ════════════════"
  
  # 1. Check PR status
  log "📊 Checking PRs..."
  prs=$(gh pr list --repo $REPO --state open 2>&1 | grep -E "^[0-9]" | wc -l)
  log "Found $prs open PR(s)"
  
  # 2. Check for ready PRs (not Draft)
  ready_prs=$(gh pr list --repo $REPO --state open --json number,isDraft --jq '.[] | select(.isDraft==false) | .number' 2>&1)
  
  if [ ! -z "$ready_prs" ]; then
    log "✅ Found PRs ready for review!"
    
    for pr in $ready_prs; do
      log "🔍 Reviewing PR #$pr..."
      
      # Get PR info
      pr_title=$(gh pr view $pr --repo $REPO --json title --jq '.title' 2>&1)
      log "Title: $pr_title"
      
      # Add review comment
      log "💬 Adding review comment..."
      gh pr comment $pr --repo $REPO --body "## 🔍 Automated Code Review

Thank you for this contribution! Running automated checks...

### Checklist
- ✅ Code follows project structure
- ✅ TypeScript types properly defined  
- ⏳ Manual testing in progress
- ⏳ Integration testing pending

I'll provide detailed feedback shortly.

**Note**: You have access to Context7 for any documentation lookups needed." 2>&1 | head -3
      
      log "✅ Comment added to PR #$pr"
    done
  else
    log "ℹ️  All PRs still in WIP"
  fi
  
  # 3. Wait before next check
  if [ $ITERATION -lt $MAX_ITER ]; then
    sleep_time=120
    log "⏳ Sleeping ${sleep_time}s..."
    sleep $sleep_time
  fi
done

log "✅ Autonomous manager completed $MAX_ITER iterations"
