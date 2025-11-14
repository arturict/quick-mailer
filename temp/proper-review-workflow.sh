#!/bin/bash

# Proper Review Workflow - Only comment when ready + with @copilot

REPO="arturict/quick-mailer"

echo "🔍 Checking for PRs ready for final review..."
echo ""

# Get all non-draft PRs
ready_prs=$(gh pr list --repo $REPO --json number,isDraft,title --jq '.[] | select(.isDraft==false) | .number')

if [ -z "$ready_prs" ]; then
  echo "ℹ️  No PRs ready for review (all still in draft)"
  exit 0
fi

for pr in $ready_prs; do
"  echo "════════════════════════════
  echo "PR #$pr - Conducting Final Review"
"  echo "════════════════════════════════════════════════
  
  # Get PR info
  pr_info=$(gh pr view $pr --repo $REPO --json title,additions,deletions,files,reviews)
  
  title=$(echo "$pr_info" | jq -r '.title')
  additions=$(echo "$pr_info" | jq -r '.additions')
  deletions=$(echo "$pr_info" | jq -r '.deletions')
  file_count=$(echo "$pr_info" | jq '.files | length')
  review_count=$(echo "$pr_info" | jq '.reviews | length')
  
  echo "Title: $title"
  echo "Changes: +$additions -$deletions"
  echo "Files: $file_count"
  echo "Reviews: $review_count"
  echo ""
  
  # Check if we already reviewed
  if [ "$review_count" -gt 0 ]; then
    echo "✅ Already reviewed - checking for @copilot mention..."
    
    # Get latest review
    latest_review=$(gh pr view $pr --repo $REPO --json reviews --jq '.reviews[-1].body')
    
    if echo "$latest_review" | grep -q "@copilot"; then
      echo "✅ Review contains @copilot mention"
    else
      echo "⚠️  Review missing @copilot - needs update"
      echo "   Would add follow-up comment with @copilot"
    fi
  else
    echo "📝 No reviews yet - ready for comprehensive review"
    echo "   Would post detailed review with @copilot mention"
  fi
  
  echo ""
done

echo "✅ Review workflow check complete"
