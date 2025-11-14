#!/bin/bash

# Comprehensive PR Review and Test Workflow
REPO="arturict/quick-mailer"

echo "� Starting comprehensive PR review..."
echo ""

# Check all PRs
for pr_num in $(gh pr list --repo $REPO --json number --jq '.[].number'); do
  echo "══════════════════════════════════════════════════════════════════"
  echo "📋 PR #$pr_num Review"
"  echo "
  
  # Get PR details
  pr_info=$(gh pr view $pr_num --repo $REPO --json title,isDraft,state,additions,deletions)
  is_draft=$(echo "$pr_info" | grep -o '"isDraft":[^,]*' | cut -d: -f2)
  title=$(echo "$pr_info" | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
  
  echo "Title: $title"
  echo "Draft: $is_draft"
  echo ""
  
  if [ "$is_draft" = "true" ]; then
    echo "⏳ Still in WIP - waiting for completion"
  else
    echo "✅ Ready for review - checking files..."
    
    # Get changed files
    gh pr diff $pr_num --repo $REPO --name-only
    
    echo ""
    echo "💬 Adding review comment..."
  fi
  
  echo ""
done

echo "✅ Review cycle complete"
