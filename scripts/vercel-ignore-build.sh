#!/usr/bin/env bash
set -euo pipefail

case "${VERCEL_GIT_COMMIT_REF:-}" in
  assets/*|pr-assets/*|*shots*|*screenshots*|*screens*) exit 0 ;;
esac

changed="$(git diff --name-only HEAD^ HEAD || true)"

# Build when Git history is unavailable or the commit is empty/ambiguous.
if [[ -z "$changed" ]]; then
  exit 1
fi

runtime_changes="$(printf '%s\n' "$changed" | grep -Ev '^(docs/|\.github/|research/|outputs/|plugins/)|\.md$' || true)"

# Vercel convention: 0 = ignore this deployment, 1 = continue building.
if [[ -z "$runtime_changes" ]]; then
  echo "Only docs/CI/research/output changes detected; skipping Vercel build."
  exit 0
fi

exit 1
