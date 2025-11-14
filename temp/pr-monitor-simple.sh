#!/bin/bash

REPO="arturict/quick-mailer"
CHECKS=12
INTERVAL=300

echo "🔍 PR Monitoring für $REPO"
echo "📊 $CHECKS Checks über $(($CHECKS * $INTERVAL / 60)) Minuten"
echo ""

for i in $(seq 1 $CHECKS); do
"  echo "═════
  echo "Check #$i/$CHECKS - $(date '+%H:%M:%S')"
"  echo "═══════════════════════════════
  
  prs=$(gh pr list --repo $REPO 2>&1 | head -10)
  
  if echo "$prs" | grep -q "no pull requests"; then
    echo "ℹ️  Keine PRs offen"
  else
    echo "✅ PRs gefunden:"
    echo "$prs"
  fi
  
  echo ""
  
  if [ $i -lt $CHECKS ]; then
    echo "⏳ Warte 5 Minuten..."
    sleep $INTERVAL
  fi
done

echo "✅ Monitoring abgeschlossen"
