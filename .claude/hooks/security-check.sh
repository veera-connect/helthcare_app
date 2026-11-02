#!/usr/bin/env bash
# Security check hook — validates patient data access patterns

set -euo pipefail

FILE="${1:-}"

if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  exit 0
fi

ISSUES=0

# Check for missing authorization in API endpoints
if grep -qE "@router\.(get|post|put|delete)" "$FILE"; then
  if ! grep -qE "current_user|require_role|Depends\(get_current" "$FILE"; then
    echo "SECURITY WARNING: API endpoint in $FILE may be missing authentication dependency" >&2
    ISSUES=$((ISSUES + 1))
  fi
fi

# Check for raw SQL that bypasses ORM (SQL injection risk)
if grep -qE "execute\s*\(\s*[\"']SELECT|execute\s*\(\s*f[\"']" "$FILE"; then
  echo "SECURITY WARNING: Raw SQL detected in $FILE — use SQLAlchemy ORM queries instead" >&2
  ISSUES=$((ISSUES + 1))
fi

# Check for patient data in log statements
if grep -qiE "logger\.(info|debug|warning)\s*\(.*patient|print\s*\(.*patient_id|print\s*\(.*medical" "$FILE"; then
  echo "SECURITY WARNING: Possible patient data in log statement in $FILE" >&2
  ISSUES=$((ISSUES + 1))
fi

if [[ $ISSUES -gt 0 ]]; then
  echo "$ISSUES security issue(s) found in $FILE. Review before proceeding." >&2
fi

exit 0
