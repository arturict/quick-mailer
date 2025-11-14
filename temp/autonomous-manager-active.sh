#!/bin/bash

# Autonomous Manager - Active Mode
# Merges PRs, fixes conflicts, creates new issues

REPO="arturict/quick-mailer"
CHECK_INTERVAL=180  # 3 minutes
LOG_FILE="/tmp/manager-active.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

banner() {
${NC}"    echo -e "${MAGENTA}══════════════════════════════════
    echo -e "${MAGENTA}║ 🤖 AUTONOMOUS MANAGER - ACTIVE MODE${NC}"
    echo -e "${MAGENTA}║ 🔄 Auto-merge, Auto-fix, Auto-create${NC}"
${NC}"    echo -e "${MAGENTA}═════════════════════════════════════════════════════════
}

merge_pr() {
    local pr_number=$1
    local pr_title=$2
    
    log "🔀 Attempting to merge PR #$pr_number..."
    
    # Try to merge
    if gh pr merge "$pr_number" --squash --auto --delete-branch 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Merged PR #$pr_number: $pr_title"
        return 0
    else
        log_error "Failed to merge PR #$pr_number - checking for conflicts..."
        
        # Check if it's a merge conflict
        if gh pr view "$pr_number" --json mergeable --jq '.mergeable' | grep -q "CONFLICTING"; then
            fix_merge_conflict "$pr_number" "$pr_title"
        fi
        return 1
    fi
}

fix_merge_conflict() {
    local pr_number=$1
    local pr_title=$2
    
    log "🔧 Fixing merge conflict for PR #$pr_number..."
    
    # Checkout the PR
    if gh pr checkout "$pr_number"; then
        log_info "Checked out PR #$pr_number"
        
        # Try to merge main
        if git merge origin/main; then
            log_success "Auto-merged main successfully"
            git push
            
            # Try to merge again
            sleep 5
            merge_pr "$pr_number" "$pr_title"
        else
            log_error "Merge conflict detected - creating issue for manual resolution"
            
            # Create issue for manual conflict resolution
            gh issue create \
                --title "🔧 Merge conflict in PR #$pr_number: $pr_title" \
                --body "PR #$pr_number has merge conflicts that need manual resolution.

**PR:** #$pr_number
**Branch:** $(git branch --show-current)

Please resolve conflicts and merge.

@copilot Please help resolve the merge conflicts in this PR." \
                --assignee "@copilot" \
                --label "merge-conflict,help wanted"
            
            git merge --abort
            git checkout main
        fi
    else
        log_error "Failed to checkout PR #$pr_number"
    fi
}

create_new_feature_issue() {
    local feature=$1
    local description=$2
    
    log "📝 Creating new feature issue: $feature"
    
    gh issue create \
        --title "$feature" \
        --body "$description

@copilot Please implement this feature. You have access to Context7 for documentation.

**Requirements:**
- Follow existing code patterns
- Add tests if applicable
- Update documentation
- Ensure Docker compatibility" \
        --assignee "@copilot" \
        --label "enhancement,copilot"
    
    log_success "Created issue: $feature"
}

check_and_process_prs() {
    log "🔍 Checking Pull Requests..."
    
    # Get all PRs
    local prs=$(gh pr list --repo "$REPO" --json number,title,isDraft,state,mergeable --limit 20)
    
    if [ -z "$prs" ] || [ "$prs" = "[]" ]; then
        log_info "No open PRs"
        return
    fi
    
    # Process each PR
    echo "$prs" | jq -c '.[]' | while read -r pr; do
        local pr_number=$(echo "$pr" | jq -r '.number')
        local pr_title=$(echo "$pr" | jq -r '.title')
        local is_draft=$(echo "$pr" | jq -r '.isDraft')
        local mergeable=$(echo "$pr" | jq -r '.mergeable')
        
        # Skip drafts
        if [ "$is_draft" = "true" ]; then
            log_info "PR #$pr_number is draft - skipping"
            continue
        fi
        
        log "📋 Processing PR #$pr_number: $pr_title"
        
        # Check if mergeable
        if [ "$mergeable" = "MERGEABLE" ]; then
            log_success "PR #$pr_number is mergeable - attempting merge"
            merge_pr "$pr_number" "$pr_title"
        elif [ "$mergeable" = "CONFLICTING" ]; then
            log_error "PR #$pr_number has conflicts - will fix"
            fix_merge_conflict "$pr_number" "$pr_title"
        else
            log_info "PR #$pr_number status: $mergeable - waiting"
        fi
        
        sleep 2
    done
}

create_next_features() {
    log "💡 Checking if we need new features..."
    
    # Get current open issues
    local open_issues=$(gh issue list --repo "$REPO" --state open --json number | jq '. | length')
    
    log_info "Current open issues: $open_issues"
    
    # If we have less than 3 open issues, create more
    if [ "$open_issues" -lt 3 ]; then
        log "📝 Creating new feature issues..."
        
        # List of potential features
        local features=(
            "🎨 Add dark mode toggle|Add a dark mode toggle with system preference detection and smooth transitions"
            "📊 Add analytics dashboard|Create an analytics dashboard showing email statistics, success rates, and trends"
            "🔔 Add email scheduling|Allow users to schedule emails for future sending with timezone support"
            "👥 Add contact management|Implement a contact book with groups and import/export functionality"
            "📱 Add mobile responsive design improvements|Enhance mobile UX with touch gestures and optimized layouts"
            "🔐 Add two-factor authentication for admin panel|Implement 2FA for secure admin access"
            "📧 Add email templates library|Create a library of pre-made email templates"
            "🌐 Add internationalization (i18n)|Support multiple languages with locale switching"
            "🔍 Add advanced search with filters|Enhanced search with date ranges, status, and recipient filters"
            "📈 Add export functionality|Export email history to CSV/PDF formats"
        )
        
        # Select random feature
        local random_feature="${features[$RANDOM % ${#features[@]}]}"
        local title=$(echo "$random_feature" | cut -d'|' -f1)
        local description=$(echo "$random_feature" | cut -d'|' -f2)
        
        create_new_feature_issue "$title" "$description"
    fi
}

update_readme_stats() {
    log "📊 Updating README with latest stats..."
    
    local total_commits=$(git rev-list --count HEAD)
    local open_prs=$(gh pr list --repo "$REPO" --state open --json number | jq '. | length')
    local closed_prs=$(gh pr list --repo "$REPO" --state closed --json number | jq '. | length')
    local open_issues=$(gh issue list --repo "$REPO" --state open --json number | jq '. | length')
    
    # Update README badge section (if exists)
    if grep -q "<!-- STATS -->" README.md 2>/dev/null; then
        sed -i "s/<!-- STATS -->.*<!-- \/STATS -->/<!-- STATS -->![Commits](https:\/\/img.shields.io\/badge\/commits-$total_commits-blue) ![PRs](https:\/\/img.shields.io\/badge\/PRs-$open_prs%20open-green) ![Issues](https:\/\/img.shields.io\/badge\/issues-$open_issues%20open-orange)<!-- \/STATS -->/" README.md
        
        git add README.md
        git commit -m "📊 Auto-update stats: $total_commits commits, $open_prs PRs, $open_issues issues" 2>/dev/null || true
        git push 2>/dev/null || true
    fi
}

# Main loop
iteration=1
banner

log_success "Manager started in ACTIVE MODE"
log_info "Repository: $REPO"
log_info "Check interval: $CHECK_INTERVAL seconds"
log_info "Log file: $LOG_FILE"
echo ""

while true; do
${NC}"    echo -e "${MAGENTA}════════════════════════════════════════════════════════
    echo -e "${MAGENTA}🔄 ITERATION $iteration - $(date +'%Y-%m-%d %H:%M:%S')${NC}"
${NC}"    echo -e "${MAGENTA}══
    
    # Main workflow
    check_and_process_prs
    sleep 5
    
    create_next_features
    sleep 5
    
    update_readme_stats
    
    echo ""
    log "⏳ Next check in $((CHECK_INTERVAL / 60)) minutes..."
    log_info "Stats: Iteration #$iteration completed"
    echo ""
    
    ((iteration++))
    sleep $CHECK_INTERVAL
done
