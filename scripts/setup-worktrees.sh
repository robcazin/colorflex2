#!/usr/bin/env bash
# Create the bassett worktree so you can have two terminals: one for main, one for bassett.
# Run once from the main repo. Safe to run again (idempotent).
#
# Usage: ./scripts/setup-worktrees.sh

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
BASSETT_WORKTREE="${REPO_ROOT}-bassett"

cd "$REPO_ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Not a Git repo. Run from colorflex2 root."
    exit 1
fi

if git worktree list | grep -q "${BASSETT_WORKTREE}"; then
    echo "Bassett worktree already exists at: $BASSETT_WORKTREE"
else
    if ! git show-ref --verify --quiet refs/heads/bassett; then
        echo "Creating branch 'bassett' and worktree..."
        git worktree add -b bassett "$BASSETT_WORKTREE"
    else
        echo "Adding worktree for existing branch 'bassett'..."
        git worktree add "$BASSETT_WORKTREE" bassett
    fi
    echo "Created: $BASSETT_WORKTREE"
fi

echo ""
echo "Two terminals setup:"
echo "  Terminal 1 (main):    cd $REPO_ROOT"
echo "  Terminal 2 (bassett): cd $BASSETT_WORKTREE"
echo ""
echo "Aliases: run once  ./scripts/cf-source-setup.sh  so cfd/cfo/cfs load automatically when a terminal starts in either folder. Otherwise run  source scripts/cf-aliases.sh  in each terminal."
echo ""
