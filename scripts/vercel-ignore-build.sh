#!/usr/bin/env bash
# Keep the legacy entry point on the same tested policy. Node failure builds.
node "$(dirname "$0")/vercel-ignore-build.mjs"
status=$?
[[ "$status" -eq 0 ]] && exit 0
exit 1
