#!/usr/bin/env bash
# no-generic-ai.sh — warns when edited files contain "instant AI" design tells.
# Non-blocking by design: it nudges, it doesn't halt. Exit 0 always.
# Claude Code passes hook context as JSON on stdin; we read the edited file path from it.

set -uo pipefail

# Pull the file path Claude just touched (best-effort; falls back to scanning src/).
INPUT="$(cat 2>/dev/null || true)"
FILE="$(printf '%s' "$INPUT" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]+"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')"

# What to scan
if [[ -n "${FILE:-}" && -f "$FILE" ]]; then
  TARGETS=("$FILE")
else
  mapfile -t TARGETS < <(find . -type f \( -name '*.css' -o -name '*.scss' -o -name '*.jsx' -o -name '*.tsx' -o -name '*.svelte' -o -name '*.astro' -o -name '*.vue' -o -name '*.html' \) -not -path './node_modules/*' 2>/dev/null)
fi

HITS=()

# Each check: run grep quietly (-q), and only record a HIT on a match.
scan() {
  local f="$1"
  [[ -f "$f" ]] || return 0

  # Purple/blue/indigo gradient — the #1 AI tell.
  if grep -niqE 'linear-gradient\([^)]*(purple|violet|indigo|#6[0-9a-f]{2}|#7[0-9a-f]{2}|#8[0-9a-f]{2})' "$f" 2>/dev/null; then
    HITS+=("$f: purple/blue/indigo gradient")
  fi

  # Generic glassmorphism: white-ish backdrop blur.
  if grep -niqE 'backdrop-filter:[[:space:]]*blur' "$f" 2>/dev/null \
     && grep -niqE 'rgba\(255,[[:space:]]*255,[[:space:]]*255' "$f" 2>/dev/null; then
    HITS+=("$f: generic glassmorphism (white blur)")
  fi

  # Cookie-cutter card shadow.
  if grep -niqE 'box-shadow:[[:space:]]*0[[:space:]]+4px[[:space:]]+6px[[:space:]]+rgba\(0,[[:space:]]*0,[[:space:]]*0,[[:space:]]*0?\.1' "$f" 2>/dev/null; then
    HITS+=("$f: cookie-cutter card shadow")
  fi

  # Default Inter — flag for justification, not as an error.
  if grep -niqE "font-family:[^;]*Inter" "$f" 2>/dev/null; then
    HITS+=("$f: default Inter — is this a deliberate choice?")
  fi

  # Leftover placeholder text.
  if grep -niqE 'lorem ipsum' "$f" 2>/dev/null; then
    HITS+=("$f: lorem ipsum placeholder still present")
  fi
}

for t in "${TARGETS[@]:-}"; do
  [[ -n "$t" ]] && scan "$t"
done

if (( ${#HITS[@]} > 0 )); then
  echo "⚠️  [no-generic-ai] Possible 'instant AI' tells detected:"
  printf '   - %s\n' "${HITS[@]}"
  echo "   → If these are deliberate and justified by the concept, keep them and note why. Otherwise, make a braver choice."
fi

exit 0
