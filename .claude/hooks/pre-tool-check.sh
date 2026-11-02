#!/usr/bin/env bash
# PreToolUse hook — blocks dangerous commands and secret exposure

set -euo pipefail

TOOL_INPUT="${CLAUDE_TOOL_INPUT:-}"

# Block patterns that could expose secrets or destroy data
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "DROP DATABASE"
  "DROP TABLE"
  "truncate.*patient"
  "ANTHROPIC_API_KEY"
  "SECRET_KEY"
  "DB_PASSWORD"
  "curl.*\|.*bash"
  "wget.*\|.*sh"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$TOOL_INPUT" | grep -qiE "$pattern"; then
    echo "BLOCKED: Command matches dangerous pattern: $pattern" >&2
    exit 1
  fi
done

# Warn if accessing production-like paths without explicit confirmation
if echo "$TOOL_INPUT" | grep -qiE "(prod|production)" && ! echo "$TOOL_INPUT" | grep -qi "confirm"; then
  echo "WARNING: Command references production. Ensure this is intentional." >&2
fi

exit 0
