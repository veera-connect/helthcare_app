#!/usr/bin/env bash
# Format check hook — verifies code formatting standards

set -euo pipefail

FILE="${1:-}"

if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  exit 0
fi

if [[ "$FILE" == *.py ]]; then
  # Check if black is available and suggest formatting
  if command -v black &>/dev/null; then
    if ! black --check "$FILE" &>/dev/null; then
      echo "FORMAT: $FILE needs Black formatting — run: black $FILE"
    fi
  fi
  # Check if ruff is available
  if command -v ruff &>/dev/null; then
    ruff check "$FILE" && echo "Ruff lint OK: $FILE" || echo "Ruff lint issues in: $FILE" >&2
  fi
fi

if [[ "$FILE" == *.ts || "$FILE" == *.tsx ]]; then
  if command -v npx &>/dev/null; then
    echo "TypeScript file $FILE — run: cd frontend && npx eslint $FILE"
  fi
fi

exit 0
