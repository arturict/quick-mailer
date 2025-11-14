#!/bin/bash

# Starter Script für den Autonomous Manager

SESSION_NAME="quick-mailer-manager"

# Check if session already exists
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
  echo "⚠️  Session '$SESSION_NAME' existiert bereits!"
  echo ""
  echo "Optionen:"
  echo "  1. Attach:  tmux attach -t $SESSION_NAME"
  echo "  2. Kill:    tmux kill-session -t $SESSION_NAME"
  echo ""
  exit 1
fi

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║       🚀 STARTING AUTONOMOUS MANAGER IN TMUX SESSION           ║"
echo "║                                                                  ║"
echo "╚═══════════════════════════════
echo ""
echo "Session Name: $SESSION_NAME"
echo ""
echo "Commands:"
echo "  Attach:  tmux attach -t $SESSION_NAME"
echo "  Detach:  Ctrl+B then D"
echo "  Kill:    tmux kill-session -t $SESSION_NAME"
echo ""
echo "Starting in 3 seconds..."
sleep 3

# Create new tmux session and run manager
tmux new-session -d -s $SESSION_NAME "bash /home/nex/repos/quick-mailer/temp/autonomous-manager-tmux.sh"

echo "✅ Session started!"
echo ""
echo "Attach now with:"
echo "  tmux attach -t $SESSION_NAME"
echo ""

