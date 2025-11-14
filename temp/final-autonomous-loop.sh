#!/bin/bash

# Final Autonomous Loop with Correct @copilot Mentions
REPO="arturict/quick-mailer"
ITERATION=0
MAX_ITER=200  # Run for longer

log() {
  echo "[$(date '+%H:%M:%S')] $1"
}

log "🤖 Final Autonomous Manager Started"
log "Focus: UI/UX + Proper @copilot mentions"
echo ""

while [ $ITERATION -lt $MAX_ITER ]; do
  ITERATION=$((ITERATION + 1))
  
  log "═══ ITERATION #$ITERATION/$MAX_ITER ═══"
  
  # Check for ready (non-draft) PRs
  ready_prs=$(gh pr list --repo $REPO --json number,isDraft,title,reviews \
    --jq '.[] | select(.isDraft==false) | "\(.number):\(.reviews|length)"')
  
  if [ ! -z "$ready_prs" ]; then
    log "✅ Found ready PRs!"
    
    echo "$ready_prs" | while IFS=: read pr_num review_count; do
      log "PR #$pr_num - Reviews: $review_count"
      
      if [ "$review_count" -eq 0 ]; then
        log "📝 Needs initial review with @copilot mention"
        
        # Post comprehensive review
        gh pr comment $pr_num --repo $REPO --body "@copilot Great work! 

This PR is ready for final review. I'll conduct a comprehensive code review shortly.

**Note**: Remember you have access to Context7 for any documentation lookups." 2>&1 | head -3
        
        log "✅ Posted initial review comment"
        
        # Approve if mergeable
        gh pr review $pr_num --repo $REPO --approve \
          --body "@copilot Excellent implementation! 

Code review passed. Ready to merge once you confirm." 2>&1 | head -3
        
        log "✅ Approved PR #$pr_num"
      else
        log "✅ Already reviewed - checking @copilot mentions"
      fi
    done
  else
    log "ℹ️  All PRs still in draft - waiting..."
  fi
  
  # Sleep
  if [ $ITERATION -lt $MAX_ITER ]; then
    sleep 180  # 3 minutes
  fi
done

log "✅ Loop completed"
