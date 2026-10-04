#!/usr/bin/env bash
set -euo pipefail
# Dedicated local container transport: no remote/production database URI is used.
test "${DO_STORAGE_PROOF_ALLOWED:-}" = synthetic_disposable_only
test "$(docker inspect --format '{{ index .Config.Labels "assembl.synthetic-proof" }}' do-storage-proof-task11)" = do-storage-only
test "$(docker inspect --format '{{ index .Config.Labels "assembl.proof.run" }}' do-storage-proof-task11)" = "${GITHUB_RUN_ID:?CI run identity required}"
case "${DO_STORAGE_PROOF_DATABASE:-do_storage_proof}" in
  do_storage_proof|do_storage_original_acl) proof_database="${DO_STORAGE_PROOF_DATABASE:-do_storage_proof}" ;;
  *) echo 'synthetic_database_not_allowed' >&2; exit 64 ;;
esac
# Caller PGDATABASE/PGHOST never changes this fixed container transport.
exec docker exec --interactive --env "PGAPPNAME=${PGAPPNAME:-do-storage-proof-ci}" do-storage-proof-task11 \
  psql --username postgres --dbname "$proof_database" "$@"
