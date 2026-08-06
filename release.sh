#!/usr/bin/env bash
set -euo pipefail

export GIT_SSH_COMMAND="ssh -F /workspace/xiri/.ssh/config -i /workspace/xiri/.ssh/github/id_ed25519 -o StrictHostKeyChecking=accept-new"

# Version: explicit (./release.sh v0.4.0) or a bump keyword (./release.sh minor).
# Without an argument it stays a patch bump, like before.
BUMP="${1:-patch}"
if [[ "$BUMP" =~ ^v?[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  BUMP="${BUMP#v}" # npm version wants it without the leading v
  # Only reachable for an explicit version — with a keyword the number is known
  # after the bump, and the tag is created before the push either way.
  if git rev-parse "v$BUMP" >/dev/null 2>&1; then
    echo "Error: Tag v$BUMP already exists."
    exit 1
  fi
elif [[ ! "$BUMP" =~ ^(patch|minor|major)$ ]]; then
  echo "Error: Version must match vX.Y.Z (e.g. v0.4.0), or be patch|minor|major."
  exit 1
fi

# Check that the bundled Claude skill is present
if [[ ! -f projects/xiri-ng/skills/xiri-ng-expert/SKILL.md ]]; then
  echo "Error: projects/xiri-ng/skills/xiri-ng-expert/SKILL.md missing — refuse to release."
  exit 1
fi

# CHANGELOG-Prüfung vor dem Bump, aus demselben Grund wie die Tests: ein Abbruch soll keinen
# Versions-Commit hinterlassen. Gedreht wird der Abschnitt erst weiter unten, wenn bei einem
# Keyword-Bump die Nummer feststeht.
if ! grep -q '^## \[Unreleased\]' CHANGELOG.md; then
  echo "Error: '## [Unreleased]' not found in CHANGELOG.md — refuse to release."
  exit 1
fi

# Leerer Abschnitt heisst: für dieses Release ist nichts dokumentiert.
if [[ -z "$(awk '/^## \[Unreleased\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md | tr -d '[:space:]')" ]]; then
  echo "Error: '## [Unreleased]' in CHANGELOG.md is empty — nothing documented for this release."
  exit 1
fi

# Tests vor dem Bump, damit ein Fehlschlag keinen Versions-Commit hinterlässt.
# typecheck zusätzlich zu test: `ng test` läuft über esbuild und prüft keine Typen, ein
# Spec, der einen Typvertrag festnagelt (z. B. string-IDs via writeValue), fällt sonst durch.
npm test -- --watch=false
npm run typecheck

# Bump version
( cd projects/xiri-ng && npm version "$BUMP" )
VERSION="v$(node -p "require('./projects/xiri-ng/package.json').version")"

echo "Releasing $VERSION..."

# [Unreleased] in einen Versionsabschnitt drehen und ein leeres [Unreleased] darüber stehen
# lassen. Ohne das sammeln sich die Einträge mehrerer Releases dort an -- genau so gingen die
# Abschnitte für 0.4.2 und 0.4.3 unter.
awk -v ver="${VERSION#v}" -v date="$(date +%F)" '
  /^## \[Unreleased\]$/ && !done { print; print ""; print "## [" ver "] - " date; done = 1; next }
  { print }
' CHANGELOG.md > CHANGELOG.md.tmp && mv CHANGELOG.md.tmp CHANGELOG.md

# Build library
npm run build

# Verify skill landed in the dist bundle
if [[ ! -f dist/xiri-ng/skills/xiri-ng-expert/SKILL.md ]]; then
  echo "Error: dist/xiri-ng/skills/xiri-ng-expert/SKILL.md missing after build — refuse to release."
  exit 1
fi

# Commit, tag, push
git add projects/xiri-ng/package.json CHANGELOG.md
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
