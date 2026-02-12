#!/bin/bash
# One-time setup: add ColorFlex aliases to your shell profile so they load in every terminal.
# Run from project root:  ./scripts/cf-source-setup.sh
# Then run  source ~/.zshrc   (or  source ~/.bashrc)  or open a new terminal.

set -e
CF_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/cf-aliases.sh"
SOURCE_LINE="source $CF_SCRIPT"

# Detect profile file
if [ -n "$ZSH_VERSION" ] || [ -n "$ZSH_NAME" ]; then
    PROFILE="${HOME}/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    PROFILE="${HOME}/.bashrc"
    # On macOS, bash often only reads .bash_profile for login shells
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

if grep -q "cf-aliases.sh" "$PROFILE" 2>/dev/null; then
    echo "✅ ColorFlex source line is already in $PROFILE"
else
    echo "$SOURCE_LINE" >> "$PROFILE"
    echo "✅ Appended to $PROFILE:"
    echo "   $SOURCE_LINE"
fi

echo ""
echo "To load in this terminal, run:"
echo "  source $PROFILE"
echo ""
echo "Or open a new terminal tab/window."
