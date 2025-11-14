#!/bin/bash

# Manager Loop - Continuous PR Review and Testing
REPO="arturict/quick-mailer"
LOOP_COUNT=0
MAX_LOOPS=100

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          🎯 MANAGER MODE - CONTINUOUS IMPROVEMENT LOOP          ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

while [ $LOOP_COUNT -lt $MAX_LOOPS ]; do
  LOOP_COUNT=$((LOOP_COUNT + 1))
  echo ""
"  echo "═══════════════════════════
  echo "🔄 LOOP #$LOOP_COUNT - $(date '+%H:%M:%S')"
"  echo "═════════════════════════
  
  # Check PRs
  echo "📊 Checking pull requests..."
  pr_count=$(gh pr list --repo $REPO --json number --jq '. | length' 2>&1)
  
  if [ "$pr_count" -gt 0 ]; then
    echo "✅ Found $pr_count open PR(s)"
    
    # List all PRs
    gh pr list --repo $REPO --json number,title,state,isDraft,additions | \
      grep -v "^\[" | head -20
    
    echo ""
    echo "Detailed status wird separat geprüft..."
  else
    echo "ℹ️  No open PRs currently"
  fi
  
  echo ""
  echo "⏳ Waiting 90 seconds before next check..."
  sleep 90
done

echo ""
echo "✅ Loop completed after $MAX_LOOPS iterations"
