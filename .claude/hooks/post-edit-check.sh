#!/usr/bin/env bash
# PostToolUse hook — runs formatting/lint checks and appends to log.md

set -euo pipefail

FINAL_CHECK="${1:-}"
MODIFIED_FILE="${CLAUDE_TOOL_OUTPUT_FILE:-}"

# ── Auto-log every file change to log.md ────────────────────────────────────
LOG_FILE="$(git rev-parse --show-toplevel 2>/dev/null)/log.md"
if [[ -z "$LOG_FILE" || ! -f "${LOG_FILE%/log.md}/log.md" ]]; then
  LOG_FILE="$(dirname "$(dirname "$(dirname "$0")")")/log.md"
fi

if [[ -n "$MODIFIED_FILE" && -f "$LOG_FILE" && "$MODIFIED_FILE" != "$LOG_FILE" ]]; then
  TIMESTAMP="$(date '+%Y-%m-%d %H:%M')"
  TODAY="$(date '+%Y-%m-%d')"
  REL_PATH="${MODIFIED_FILE#$(git rev-parse --show-toplevel 2>/dev/null)/}"
  TOOL_NAME="${CLAUDE_TOOL_NAME:-Edit}"

  # Determine log type from tool name
  case "$TOOL_NAME" in
    Write) LOG_TYPE="ADD" ;;
    Edit)  LOG_TYPE="UPDATE" ;;
    *)     LOG_TYPE="UPDATE" ;;
  esac

  LOG_ENTRY="- \`$LOG_TYPE\` — \`$REL_PATH\` — $TIMESTAMP"

  # Insert under today's date section if it exists, otherwise prepend a new section
  if grep -q "^## $TODAY" "$LOG_FILE"; then
    sed -i "s|^## $TODAY|## $TODAY\n$LOG_ENTRY|" "$LOG_FILE" 2>/dev/null || true
  else
    # Prepend new date section after the header block (first blank line after frontmatter)
    SECTION="\n## $TODAY\n\n$LOG_ENTRY\n"
    sed -i "0,/^---$/{/^---$/a\\
$SECTION
}" "$LOG_FILE" 2>/dev/null || true
  fi
fi
# ────────────────────────────────────────────────────────────────────────────

# If a Python file was modified, run basic syntax check
if [[ "$MODIFIED_FILE" == *.py ]]; then
  if command -v python3 &>/dev/null; then
    python3 -m py_compile "$MODIFIED_FILE" 2>&1 && echo "Python syntax OK: $MODIFIED_FILE" || echo "Python syntax ERROR: $MODIFIED_FILE" >&2
  fi
fi

# If a TypeScript/JavaScript file was modified, note it for review
if [[ "$MODIFIED_FILE" == *.ts || "$MODIFIED_FILE" == *.tsx ]]; then
  echo "TypeScript file modified: $MODIFIED_FILE — run 'npm run tsc' to verify types"
fi

# Final check: ensure no hardcoded secrets slipped in
if [[ -n "$MODIFIED_FILE" && -f "$MODIFIED_FILE" ]]; then
  SECRET_PATTERNS=("password\s*=\s*[\"'][^\"']+[\"']" "api_key\s*=\s*[\"'][^\"']+[\"']" "secret\s*=\s*[\"'][^\"']+[\"']")
  for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -qiE "$pattern" "$MODIFIED_FILE" 2>/dev/null; then
      echo "WARNING: Possible hardcoded secret in $MODIFIED_FILE — review before committing" >&2
    fi
  done
fi

if [[ "$FINAL_CHECK" == "--final" ]]; then
  echo "=== Final validation check ==="
  echo "Reminder: Run 'pytest' and 'npm run test' before marking any feature complete."
fi

exit 0
