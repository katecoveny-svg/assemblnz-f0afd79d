#!/usr/bin/env bash
set -u

# Vercel calls this before building. Exit 0 = skip, exit 1 = build.
case "${VERCEL_GIT_COMMIT_REF:-}" in
  assets/*|pr-assets/*|*shots*|*screenshots*|*screens*) exit 0 ;;
esac

base="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}"
changed="$(git diff --name-only "$base" HEAD 2>/dev/null || git diff --name-only HEAD^ HEAD 2>/dev/null || true)"

# If Git cannot determine a diff, build rather than accidentally suppressing runtime work.
if [ -z "$changed" ]; then
  exit 1
fi

while IFS= read -r file; do
  case "$file" in
    docs/*|.github/*|plugins/*|*.md|*.mdx)
      ;;
    *)
      exit 1
      ;;
  esac
done <<< "$changed"

# Only documentation / CI / plugin-memory files changed.
exit 0
