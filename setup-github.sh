#!/bin/bash
# Run this ONCE from your terminal (not Claude Code) to create the repo and push.
# Requires: gh CLI authenticated  →  brew install gh && gh auth login

set -e

cd "$(dirname "$0")"

echo "→ Creating private GitHub repo 26Q2-fast-activation under phyllisfei-bg..."
gh repo create phyllisfei-bg/26Q2-fast-activation \
  --private \
  --description "BitGo fast-activation prototype — KYB, KYC, and Getting Started dashboard" \
  --source . \
  --remote origin \
  --push

echo ""
echo "✓ Done! Repo is at:"
echo "  https://github.com/phyllisfei-bg/26Q2-fast-activation"
echo ""
echo "To push future updates:"
echo "  git add -A && git commit -m 'your message' && git push"
