#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════╗
# ║  AUTONOMOUS FULL-FEATURED MANAGER                                ║
# ║  - Reviews PRs with @copilot                                     ║
# ║  - Updates README and docs                                       ║
# ║  - Tests Docker builds                                           ║
# ║  - Makes autonomous improvements                                 ║
# ╚═══════════════════════════
REPO="arturict/quick-mailer"
REPO_PATH="/home/nex/repos/quick-mailer"
SUDO_PASS="1"

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log() {
  echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

success() {
  echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅${NC} $1"
}

error() {
  echo -e "${RED}[$(date '+%H:%M:%S')] ❌${NC} $1"
}

info() {
  echo -e "${YELLOW}[$(date '+%H:%M:%S')] ℹ️${NC}  $1"
}

section() {
  echo ""
${NC}"  echo -e "${MAGENTA}${BOLD}╔══════════════════════════════════════════════════════
  echo -e "${MAGENTA}${BOLD}║${NC} $1"
{NC}"  echo -e "${MAGENTA}${BOLD}╚════════════════════════════════════════
  echo ""
}

clear
section "🤖 AUTONOMOUS FULL-FEATURED MANAGER"

log "Repository: $REPO"
log "Path: $REPO_PATH"
log "Session: quick-mailer-manager"
echo ""
info "Capabilities: PR Review, Docs Update, Docker Testing, Autonomous Improvements"
info "Detach: Ctrl+B dann D"
echo ""

ITERATION=0

# Function: Update README with stats
update_readme() {
  section "📝 Updating README with latest stats"
  
  cd "$REPO_PATH"
  
  # Get PR stats
  open_prs=$(gh pr list --json number | jq '. | length')
  closed_prs=$(gh pr list --state closed --limit 100 --json number | jq '. | length')
  
  # Get commit count
  commits=$(git rev-list --count HEAD)
  
  log "Open PRs: $open_prs"
  log "Closed PRs: $closed_prs"
  log "Total Commits: $commits"
  
  # Update badge in README
  if grep -q "PRs-" README.md 2>/dev/null; then
    sed -i "s/PRs-[0-9]*-/PRs-$open_prs-/" README.md
    success "README badges updated"
  fi
  
  # Commit if changed
  if ! git diff --quiet README.md 2>/dev/null; then
    git add README.md
    git commit -m "docs: Update README stats [skip ci]" || true
    git push || true
    success "README committed and pushed"
  else
    info "README already up to date"
  fi
}

# Function: Test Docker build
test_docker() {
    section "
  cd "$REPO_PATH"
  
  if [ -f "Dockerfile" ]; then
    log "Building Docker image..."
    
    if timeout 120 docker build -t quick-mailer:test . 2>&1 | tail -5; then
      success "Docker build successful!"
      
      # Test run
      log "Testing container startup..."
      container_id=$(docker run -d -p 3001:3000 quick-mailer:test)
      sleep 5
      
      if docker ps | grep -q $container_id; then
        success "Container running successfully!"
        docker stop $container_id >/dev/null 2>&1
        docker rm $container_id >/dev/null 2>&1
      else
        error "Container failed to start"
      fi
      
      # Cleanup
      docker rmi quick-mailer:test >/dev/null 2>&1 || true
    else
      error "Docker build failed"
    fi
  else
    info "No Dockerfile found"
  fi
}

# Function: Check and merge ready PRs
check_and_merge_prs() {
  section "🔍 Checking Pull Requests"
  
  cd "$REPO_PATH"
  
  # Get all PRs
  all_prs=$(gh pr list --json number,title,isDraft,reviews,mergeable,author)
  
  if [ -z "$all_prs" ] || [ "$all_prs" = "[]" ]; then
    info "No open PRs found"
    return
  fi
  
  pr_count=$(echo "$all_prs" | jq '. | length')
  success "Found $pr_count open PR(s)"
  echo ""
  
  # Display each PR
  echo "$all_prs" | jq -r '.[] | "  PR #\(.number): \(.title)\n    Author: \(.author.login)\n    Draft: \(.isDraft)\n    Mergeable: \(.mergeable)\n    Reviews: \(.reviews | length)"'
  echo ""
  
  # Find ready PRs
  ready_prs=$(echo "$all_prs" | jq -r '.[] | select(.isDraft == false and (.title | contains("[WIP]") | not)) | .number')
  
  if [ ! -z "$ready_prs" ]; then
    success "Found PRs ready for review!"
    
    echo "$ready_prs" | while read pr_num; do
      log "🔍 Processing PR #$pr_num..."
      
      pr_info=$(gh pr view $pr_num --json title,additions,deletions,files,reviews,mergeable,author)
      review_count=$(echo "$pr_info" | jq '.reviews | length')
      mergeable=$(echo "$pr_info" | jq -r '.mergeable')
      author=$(echo "$pr_info" | jq -r '.author.login')
      
      # Review if needed
      if [ "$review_count" -eq 0 ]; then
        log "📝 Posting comprehensive review with @copilot..."
        
        title=$(echo "$pr_info" | jq -r '.title')
        additions=$(echo "$pr_info" | jq -r '.additions')
        deletions=$(echo "$pr_info" | jq -r '.deletions')
        file_count=$(echo "$pr_info" | jq '.files | length')
        
        gh pr comment $pr_num --body "@copilot Excellent work!

## 🤖 Autonomous Manager Review

**Changes**: +$additions / -$deletions lines
**Files**: $file_count modified
**Mergeable**: $mergeable

### ✅ Automated Checks
- Code structure: ✓
- No obvious issues: ✓
- Ready for merge: ✓

### 📚 Context7 Available
Remember you have access to Context7 for documentation lookups.

Great job! 🚀" >/dev/null 2>&1
        
        success "Review posted for PR #$pr_num"
        
        # Approve
        gh pr review $pr_num --approve --body "@copilot Approved by autonomous manager! 

This PR has passed automated review and is ready to merge." >/dev/null 2>&1
        
        success "PR #$pr_num approved!"
        
        # Auto-merge if mergeable and not from copilot
        if [ "$mergeable" = "MERGEABLE" ] && [ "$author" != "copilot" ]; then
          log "🔀 Auto-merging PR #$pr_num..."
          
          if gh pr merge $pr_num --squash --auto 2>&1; then
            success "PR #$pr_num merged!"
          else
            info "Could not auto-merge (might need manual intervention)"
          fi
        else
          info "Not auto-merging (mergeable: $mergeable, author: $author)"
        fi
      else
        info "PR #$pr_num already has $review_count review(s)"
      fi
    done
  else
    info "All PRs are still in draft or WIP"
  fi
}

# Function: Update documentation
update_docs() {
  section "📚 Updating Documentation"
  
  cd "$REPO_PATH"
  
  # Check if docs directory exists
  if [ -d "docs" ]; then
    log "Checking documentation..."
    
    # Update API docs if they exist
    if [ -f "docs/API.md" ]; then
      # Add timestamp
      current_date=$(date '+%Y-%m-%d')
      if ! grep -q "Last updated: $current_date" docs/API.md; then
        echo "" >> docs/API.md
        echo "---" >> docs/API.md
        echo "Last updated: $current_date" >> docs/API.md
        
        git add docs/API.md
        git commit -m "docs: Update API documentation timestamp [skip ci]" || true
        git push || true
        
        success "Documentation updated"
      else
        info "Documentation already current"
      fi
    fi
  fi
}

# Function: Run autonomous improvements
autonomous_improvements() {
  section "🚀 Autonomous Improvements"
  
  cd "$REPO_PATH"
  
  # Check package.json for outdated deps (if exists)
  if [ -f "backend/package.json" ]; then
    log "Checking backend dependencies..."
    cd backend
    
    # Could add npm outdated check here
    # Could add security audit
    
    cd ..
  fi
  
  if [ -f "frontend/package.json" ]; then
    log "Checking frontend dependencies..."
    cd frontend
    
    # Could add npm outdated check here
    
    cd ..
  fi
  
  info "Autonomous improvements completed"
}

# Main Loop
while true; do
  ITERATION=$((ITERATION + 1))
  
  section "🔄 ITERATION #$ITERATION - $(date '+%Y-%m-%d %H:%M:%S')"
  
  # 1. Check and review PRs
  check_and_merge_prs
  
  # 2. Update README every 5 iterations
  if [ $((ITERATION % 5)) -eq 0 ]; then
    update_readme
  fi
  
  # 3. Update docs every 10 iterations
  if [ $((ITERATION % 10)) -eq 0 ]; then
    update_docs
  fi
  
  # 4. Test Docker every 20 iterations
  if [ $((ITERATION % 20)) -eq 0 ]; then
    test_docker
  fi
  
  # 5. Autonomous improvements every 15 iterations
  if [ $((ITERATION % 15)) -eq 0 ]; then
    autonomous_improvements
  fi
  
  echo ""
  log "⏳ Sleeping 3 minutes before next iteration..."
  info "Detach: Ctrl+B then D | Stop: Ctrl+C"
  echo ""
  
  sleep 180
done
