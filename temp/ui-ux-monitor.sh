#!/bin/bash

# UI/UX Focused Monitor
REPO="arturict/quick-mailer"
echo "🎨 UI/UX Monitor Started - $(date)"
echo ""

# Check for UI/UX PRs specifically
echo "Checking for UI/UX related PRs..."
gh pr list --repo $REPO --search "UI UX design frontend" --json number,title,isDraft

echo ""
echo "Checking current PR status..."
gh pr list --repo $REPO --json number,title,isDraft,files --jq '.[] | "PR #\(.number): \(.title)\n  Draft: \(.isDraft)\n  Files: \(.files | length)\n"'

echo ""
echo "✅ Monitor check complete"
