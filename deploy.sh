#!/bin/bash
set -e

VERSION=$(node -e "console.log(require('./package.json').version)")
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "📦 Version: ${VERSION}"
echo "🕐 Build: ${BUILD_TIME}"

echo "🔨 Building..."
COMMIT=$(git rev-parse --short HEAD) pnpm build

# Compute file hash for cache-busting (not commit hash — jsDelivr CDN ignores ?v= with commit)
FILE_HASH=$(sha256sum dist/agent.js | cut -c1-12)
echo "🔑 File hash: ${FILE_HASH}"

echo "📦 Committing..."
git add -A
git commit -m "deploy: v${VERSION}+${FILE_HASH}" || echo "Nothing to commit"

# Generate IMPORT.md with cache-busted URL (using file hash, not commit hash)
IMPORT_URL="https://cdn.jsdelivr.net/gh/Fahell/agent-perchance@main/dist/agent.js?v=${FILE_HASH}"
cat > IMPORT.md << EOF
# Import URL

Copy-paste this into Perchance Custom Code:

\`\`\`
import("${IMPORT_URL}");
\`\`\`
EOF
echo "📄 Generated IMPORT.md"

# Amend commit to include updated IMPORT.md
git add IMPORT.md
git commit --amend --no-edit || true

echo "🚀 Pushing..."
git push

# Purge jsDelivr cache (best-effort)
echo "🧹 Purging jsDelivr cache..."
curl -s "https://purge.jsdelivr.net/gh/Fahell/agent-perchance@main/dist/agent.js" > /dev/null

echo ""
echo "✅ Deployed!"
echo "   Version: ${VERSION}+${FILE_HASH}"
echo "   URL: ${IMPORT_URL}"
