#!/usr/bin/env bash
set -euo pipefail

export GIT_SSH_COMMAND="ssh -F /workspace/xiri/.ssh/config -i /workspace/xiri/.ssh/github/id_ed25519 -o StrictHostKeyChecking=accept-new"

# Check that the bundled Claude skill is present
if [[ ! -f skills/xiri-ng-expert/SKILL.md ]]; then
  echo "Error: skills/xiri-ng-expert/SKILL.md missing — refuse to release."
  exit 1
fi

# Bump version
npm run version
VERSION="v$(node -p "require('./projects/xiri-ng/package.json').version")"

echo "Releasing $VERSION..."

# Build library
npm run build

# Commit, tag, push
git add projects/xiri-ng/package.json
git commit -m "Bump version to $VERSION"
git tag -a "$VERSION" -m "$VERSION"
git push --follow-tags

# Create GitHub release
if command -v gh &>/dev/null; then
  echo "Creating GitHub release..."
  PREV_TAG=$(git tag -l 'v*' --sort=-v:refname | sed -n '2p')
  if [[ -n "$PREV_TAG" ]]; then
    NOTES=$(git log --pretty=format:"- %s" "$PREV_TAG..$VERSION")
  else
    NOTES=$(git log --pretty=format:"- %s" "$VERSION")
  fi
  gh release create "$VERSION" --title "$VERSION" --notes "$NOTES"
else
  echo "Warning: 'gh' CLI not found — skipping GitHub release creation."
  echo "Install: https://cli.github.com/"
fi

echo ""
echo "Released $VERSION — GitHub Actions will publish to npm"
