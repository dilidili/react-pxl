#!/usr/bin/env bash
# Install git hooks for react-pxl development.
# Run once after cloning: ./scripts/setup-hooks.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$ROOT_DIR/.git/hooks"

echo "Installing git hooks..."

cat > "$HOOKS_DIR/pre-push" << 'HOOK'
#!/usr/bin/env bash
# Pre-push hook: runs validation suite and saves report before pushing.
# To bypass in emergencies: git push --no-verify

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$(git rev-parse --git-dir)")" && pwd)"

echo "🔍 Running pre-push validation..."
echo ""

if ! LD_LIBRARY_PATH="${HOME}/lib:${LD_LIBRARY_PATH:-}" bash "$SCRIPT_DIR/scripts/validate.sh"; then
  echo ""
  echo "❌ Push rejected — validation failed. Fix issues and try again."
  echo "   To bypass: git push --no-verify"
  exit 1
fi

echo ""
echo "✅ Validation passed — pushing."
HOOK

chmod +x "$HOOKS_DIR/pre-push"

echo "✅ pre-push hook installed"
echo "   Validation runs automatically before every git push."
echo "   Bypass with: git push --no-verify"
