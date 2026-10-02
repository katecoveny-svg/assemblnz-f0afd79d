#!/usr/bin/env bash
set -euo pipefail
# Dedicated local container transport: no remote/production database URI is used.
test "${DO_STORAGE_PROOF_ALLOWED:-}" = synthetic_disposable_only
test "$(docker inspect --format '{{ index .Config.Labels "assembl.synthetic-proof" }}' do-storage-proof-task11)" = do-storage-only
test "$(docker inspect --format '{{ index .Config.Labels "assembl.proof.run" }}' do-storage-proof-task11)" = "${GITHUB_RUN_ID:?CI run identity required}"
exec docker exec --interactive --env "PGAPPNAME=${PGAPPNAME:-do-storage-proof-ci}" do-storage-proof-task11 \
  psql --username postgres --dbname do_storage_proof "$@"
