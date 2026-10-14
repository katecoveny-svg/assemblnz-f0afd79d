#!/bin/bash
# UNRUN source. Requires separate approved ephemeral CI execution.
set -euo pipefail
fixture_dir="$(cd -- "$(dirname -- "$0")" && pwd)"
[ -n "$GITHUB_ACTIONS" ] && [ -n "$GITHUB_RUN_ID" ] && [ -n "$GITHUB_RUN_ATTEMPT" ] && [ -n "$RUNNER_TEMP" ]
cleanup() {
  prior_status="$?"
  trap - EXIT
  set +e
  /usr/bin/timeout --signal=TERM --kill-after=5s 30s \
    /usr/bin/env -i PATH=/usr/bin:/bin HOME=/tmp \
    GITHUB_ACTIONS="$GITHUB_ACTIONS" GITHUB_RUN_ID="$GITHUB_RUN_ID" \
    GITHUB_RUN_ATTEMPT="$GITHUB_RUN_ATTEMPT" RUNNER_TEMP="$RUNNER_TEMP" \
    /usr/bin/python3 "$fixture_dir/cleanup_owned.py"
  cleanup_status="$?"
  if [ "$cleanup_status" -ne 0 ]; then
    printf '%s\n' "Owned cleanup unresolved; fixture_status=$prior_status cleanup_status=$cleanup_status" >&2
    exit 1
  fi
  exit "$prior_status"
}
trap cleanup EXIT
/usr/bin/timeout --signal=TERM --kill-after=10s 150s \
  /usr/bin/env -i PATH=/usr/bin:/bin HOME=/tmp \
  GITHUB_ACTIONS="$GITHUB_ACTIONS" GITHUB_RUN_ID="$GITHUB_RUN_ID" \
  GITHUB_RUN_ATTEMPT="$GITHUB_RUN_ATTEMPT" RUNNER_TEMP="$RUNNER_TEMP" \
  /usr/bin/python3 "$fixture_dir/run_fixture.py" --owned-fixture-proof

