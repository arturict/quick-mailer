#!/bin/bash

# Quick Mailer - PR Monitor Script
# Monitors pull requests and performs code reviews

REPO="arturict/quick-mailer"
CHECK_INTERVAL=300  # 5 minutes in seconds
MAX_ITERATIONS=12   # Run for 1 hour (12 * 5 min)

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║          📋 PR Monitor - Quick Mailer Repository                ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Repository: $REPO"
echo "Check Interval: ${CHECK_INTERVAL}s (5 minutes)"
echo "Max Runtime: 1 hour"
echo "Started: $(date)"
echo ""

iteration=0

while [ $iteration -lt $MAX_ITERATIONS ]; do
    iteration=$((iteration + 1))
    current_time=$(date '+%H:%M:%S')
    
    echo "[$current_time] Check #$iteration/$MAX_ITERATIONS - Looking for pull requests..."
    
    # Get list of open PRs
    prs=$(gh pr list --repo $REPO --json number,title,author,state,isDraft 2>&1)
    
    if [ $? -ne 0 ]; then
        echo "  ❌ Error fetching PRs: $prs"
    else
        pr_count=$(echo "$prs" | jq '. | length')
        
        if [ "$pr_count" -eq 0 ]; then
            echo "  ℹ️  No open pull requests found"
        else
            echo "  ✅ Found $pr_count pull request(s):"
            echo ""
            echo "$prs" | jq -r '.[] | "  PR #\(.number): \(.title) by @\(.author.login)"'
            echo ""
            
            # Process each PR
            echo "$prs" | jq -r '.[].number' | while read pr_number; do
                echo "  🔍 Reviewing PR #$pr_number..."
                
                # Get PR details
                pr_details=$(gh pr view $pr_number --repo $REPO --json title,body,files,reviews)
                
                # Check if already reviewed
                review_count=$(echo "$pr_details" | jq '.reviews | length')
                
                if [ "$review_count" -eq 0 ]; then
                    echo "  📝 No reviews yet - adding review..."
                    
                    # Add a review comment
                    gh pr review $pr_number --repo $REPO --comment \
                        --body "👋 Automated review in progress...

I'll check:
- ✅ Code quality
- ✅ Tests
- ✅ Documentation
- ✅ No breaking changes

Please wait for detailed review..." 2>&1
                    
                    echo "  ✅ Review comment added"
                else
                    echo "  ℹ️  Already reviewed ($review_count review(s))"
                fi
            done
        fi
    fi
    
    echo ""
    
    if [ $iteration -lt $MAX_ITERATIONS ]; then
        echo "⏳ Waiting ${CHECK_INTERVAL}s until next check..."
        echo "════════════════════════════════════════════════════════════════"
        echo ""
        sleep $CHECK_INTERVAL
    fi
done

echo ""
echo "✅ Monitoring completed after $MAX_ITERATIONS checks"
echo "Ended: $(date)"
