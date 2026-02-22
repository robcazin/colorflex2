#!/bin/bash
# One-time setup: add ColorFlex aliases to your shell profile so they load automatically
# when a terminal starts inside a CF worktree (main or bassett). No need to type
# "source scripts/cf-aliases.sh" in each terminal.
# Run from project root:  ./scripts/cf-source-setup.sh
# Then open a new terminal (or run  source ~/.zshrc).

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"

# Block that auto-sources based on current directory (so left=main, right=bassett work)
CF_BLOCK='# ColorFlex: load aliases when shell starts in a CF worktree (main or bassett)
[[ -f "./scripts/cf-aliases.sh" ]] && source ./scripts/cf-aliases.sh
'

# Detect profile file
if [ -n "$ZSH_VERSION" ] || [ -n "$ZSH_NAME" ]; then
    PROFILE="${HOME}/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    PROFILE="${HOME}/.bashrc"
    if [[ "$(uname)" == Darwin ]] && [ -f "${HOME}/.bash_profile" ]; then
        if ! grep -q '\.bashrc' "${HOME}/.bash_profile" 2>/dev/null; then
            echo "Note: Add this to ~/.bash_profile so .bashrc is loaded:  [ -f ~/.bashrc ] && source ~/.bashrc"
        fi
    fi
else
    PROFILE="${HOME}/.zshrc"
    echo "Defaulting to ~/.zshrc (could not detect zsh vs bash)."
fi

if [ ! -f "$PROFILE" ]; then
    touch "$PROFILE"
    echo "Created $PROFILE"
fi

# Remove any old fixed-path source line so we don't load main everywhere
if grep -q "cf-aliases.sh" "$PROFILE" 2>/dev/null; then
    if grep -q "ColorFlex: load aliases when shell starts" "$PROFILE" 2>/dev/null; then
        echo "✅ ColorFlex auto-source block is already in $PROFILE"
        exit 0
    fi
    # Remove old "source ... cf-aliases.sh" line(s)
    sed -i.bak '/source.*cf-aliases\.sh/d' "$PROFILE"
    echo "Removed old ColorFlex source line from $PROFILE (backup: ${PROFILE}.bak)"
fi

echo "$CF_BLOCK" >> "$PROFILE"
echo "✅ Added ColorFlex auto-source block to $PROFILE"
echo "   Aliases load when a terminal starts in $REPO_ROOT or ${REPO_ROOT}-bassett"
echo ""
echo "Open a new terminal (or run: source $PROFILE)"
