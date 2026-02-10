#!/usr/bin/env bash
# One-step save: add all changed files and commit with your message.
# Use this when you're happy with your work and want to avoid forgetting "git add".
# Usage: ./scripts/git-save.sh "Commit message here"

set -e
MSG="${*:-}"
if [[ -z "$MSG" ]]; then
    echo "Usage: $0 \"Your commit message\""
    echo "Example: $0 \"ColorFlex page: black background\""
    exit 1
fi

if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    echo "Not a git repository. Run from project root."
    exit 1
fi

git add -A
if git diff --cached --quiet; then
    echo "Nothing to commit (no changes, or everything already committed)."
    exit 0
fi
git commit -m "$MSG"
echo "Committed: $MSG"
