#!/usr/bin/env bash
set -euo pipefail

# Vercel convention: exit 0 = skip build, exit 1 = continue build.
# Fail open to BUILD whenever Git history is insufficient or any runtime/config
# file changed. This filter only skips branches dedicated to evidence assets or
# commits whose changed files are all non-runtime docs/research/context files.

case "${VERCEL_GIT_COMMIT_REF:-}" in
  assets/*|pr-assets/*|*shots*|*screenshots*|*screens*) exit 0 ;;
esac

base="${VERCEL_GIT_PREVIOUS_SHA:-}"
head="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

if [[ -z "$base" ]] || ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
  base="HEAD^"
fi
if ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
  exit 1
fi

changed="$(git diff --name-only "$base" "$head" 2>/dev/null || true)"
[[ -z "$changed" ]] && exit 1

while IFS= read -r file; do
  case "$file" in
    docs/*|research/*|outputs/*|pr-evidence/*|.pr-assets/*|.pr-screenshots/*|.pr-shots/*|.prshots/*|*.md|*.mdx)
      ;;
    *)
      exit 1
      ;;
  esac
done <<< "$changed"

exit 0
