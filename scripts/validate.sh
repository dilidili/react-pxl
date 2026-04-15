#!/usr/bin/env bash
set -euo pipefail

# react-pxl validation script
# Runs unit tests + E2E visual diff, saves results for human review.
#
# Usage:
#   ./scripts/validate.sh          # Run full validation
#   ./scripts/validate.sh --ut     # Unit tests only
#   ./scripts/validate.sh --e2e    # E2E tests only

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
RESULTS_DIR="$ROOT_DIR/validation-results"

cd "$ROOT_DIR"

mkdir -p "$RESULTS_DIR"

MODE="${1:-all}"

echo "╔══════════════════════════════════════╗"
echo "║     react-pxl Validation Suite       ║"
echo "╚══════════════════════════════════════╝"
echo ""

UT_PASSED=false
E2E_PASSED=false

# --- Unit Tests ---
if [[ "$MODE" == "all" || "$MODE" == "--ut" ]]; then
  echo "━━━ Step 1: Unit Tests (vitest) ━━━"
  if npx vitest run --reporter=verbose 2>&1 | tee "$RESULTS_DIR/ut-output.txt"; then
    echo "✅ Unit tests PASSED"
    UT_PASSED=true
  else
    echo "❌ Unit tests FAILED"
    UT_PASSED=false
  fi
  echo ""
fi

# --- E2E Visual Diff ---
if [[ "$MODE" == "all" || "$MODE" == "--e2e" ]]; then
  echo "━━━ Step 2: E2E Visual Diff (playwright) ━━━"
  if LD_LIBRARY_PATH="${HOME}/lib:${LD_LIBRARY_PATH:-}" npx playwright test --config=e2e/playwright.config.ts 2>&1 | tee "$RESULTS_DIR/e2e-output.txt"; then
    echo "✅ E2E visual diff PASSED"
    E2E_PASSED=true
  else
    echo "❌ E2E visual diff FAILED"
    E2E_PASSED=false
  fi
  echo ""
fi

# --- Summary ---
echo "━━━ Validation Summary ━━━"
echo "  Unit Tests:  $( [[ "$UT_PASSED" == "true" ]] && echo '✅ PASS' || echo '❌ FAIL' )"
echo "  E2E Diff:    $( [[ "$E2E_PASSED" == "true" ]] && echo '✅ PASS' || echo '❌ FAIL' )"
echo ""
echo "  Results saved to: $RESULTS_DIR/"
echo "  Files:"
ls -la "$RESULTS_DIR/" 2>/dev/null | grep -v "^total" | grep -v "^\." || echo "    (no artifacts yet)"
echo ""

if [[ "$UT_PASSED" == "true" && "$E2E_PASSED" == "true" ]]; then
  echo "🎉 All validations PASSED"
  exit 0
else
  echo "⚠️  Some validations FAILED — check results above"
  exit 1
fi
