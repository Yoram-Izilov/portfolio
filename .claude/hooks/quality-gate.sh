#!/usr/bin/env bash
# quality-gate.sh - runs lint / typecheck / build after edits to source files.
# BLOCKING: exit 2 tells Claude Code the edit introduced a problem to fix.
# Skips quietly when there's no package.json or no relevant script defined.

set -uo pipefail

INPUT="$(cat 2>/dev/null || true)"
FILE="$(printf '%s' "$INPUT" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]+"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"

# Only gate on source files; let everything else pass.
case "${FILE:-}" in
  *.js|*.jsx|*.ts|*.tsx|*.svelte|*.astro|*.vue|*.css|*.scss) ;;
  "") ;;  # no file in payload (manual run) - still run the gate
  *) exit 0 ;;
esac

# Find the project root (nearest package.json walking up from FILE or cwd).
find_root() {
  local dir
  dir="$(cd "$(dirname "${FILE:-$PWD/x}")" 2>/dev/null && pwd || echo "$PWD")"
  while [[ "$dir" != "/" ]]; do
    [[ -f "$dir/package.json" ]] && { echo "$dir"; return 0; }
    dir="$(dirname "$dir")"
  done
  [[ -f "$PWD/package.json" ]] && { echo "$PWD"; return 0; }
  return 1
}

ROOT="$(find_root)" || { echo "ℹ️  [quality-gate] No package.json found - skipping."; exit 0; }
cd "$ROOT" || exit 0

# Pick a package manager.
if   [[ -f pnpm-lock.yaml ]]; then PM="pnpm";       RUN="pnpm run";
elif [[ -f yarn.lock ]];      then PM="yarn";       RUN="yarn";
else                               PM="npm";        RUN="npm run"; fi
command -v "$PM" >/dev/null 2>&1 || { echo "ℹ️  [quality-gate] $PM not installed - skipping."; exit 0; }

has_script() { grep -qE "\"$1\"[[:space:]]*:" package.json 2>/dev/null; }

FAIL=0
run_step() {
  local name="$1"; shift
  echo "▶  [quality-gate] $name"
  if ! "$@"; then
    echo "🔴 [quality-gate] $name FAILED"
    FAIL=1
  fi
}

# Run only the scripts that exist. Keep it fast: lint + typecheck always, build optional.
has_script lint      && run_step "lint"      $RUN lint
has_script typecheck && run_step "typecheck" $RUN typecheck
# 'build' is the slow one - run it but allow opt-out via env.
if [[ "${QUALITY_GATE_SKIP_BUILD:-0}" != "1" ]] && has_script build; then
  run_step "build" $RUN build
fi

if (( FAIL )); then
  echo "🔴 [quality-gate] One or more checks failed. Fix before continuing."
  exit 2
fi

echo "✅ [quality-gate] passed"
exit 0
