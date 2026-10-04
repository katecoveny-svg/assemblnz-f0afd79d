# Atomic ingestion contract — corrected review draft, unapplied

All five proposal files are source-only, outside migrations. No adapters invoke the
RPCs. No database, container, installation, grants or workflow activation occurred.
The frozen adapter v2 and PR1497 remain unchanged. The first v0 Library packet is
historical and unsafe to execute; its DSN harness has been replaced here, not approved.

## Attempt and completion contract

Start takes source ID plus a caller-durably-stored UUID idempotency key. Lock source;
return existing identity or increment a database-owned monotonic version and insert
one run. Both writes are atomic. Each intended write requires exactly one affected
row, validated RETURNING values, and reread stored postconditions. BEFORE suppression,
BEFORE rewriting, AFTER rewriting/deletion and run-trigger source side effects cannot
silently turn an incomplete start into an acknowledged attempt.

Finalize locks source then associated run. Validate input/source/run/version/state
using null-safe active/status guards. The currently owning source must be active and
running. Previous completed receipt lookup/retry remains historical, even if the source
is subsequently disabled. Source status/counters/freshness and run completion/payload/
receipt share one transaction. Source and run updates check affected rows/RETURNING,
then persisted full-row postconditions. Any mismatch raises a designated error and
rolls back; only the verified stored receipt is returned. This intentionally rejects
unexpected legitimate trigger changes too; reconcile exact deployed schema before use.

Payload identity is PostgreSQL jsonb equality (object-key order ignored; value/type
and array order significant), including source/run/version, outcome, counts and error.
Identical retries return immutable stored receipt without writes. Conflicting retries
reject P7103. Superseded attempts finish as audit errors, preserve all source health,
and return superseded receipts. Old receipts remain exact after newer success; they
never promote an old source snapshot to current health. Failed outcomes preserve last
successful-fetch/content timestamps. Successful unchanged polls advance successful
fetch only. Clock is taken after locks and cannot regress. Counters change once.

## Recovery and trigger interaction

Unknown transport/body/status-zero -> finalization_unknown. Read by exact attempt,
validate the complete receipt payload before acknowledging historical completion.
Missing/pending/unavailable/malformed/mismatched reads remain unknown; retry only the
same finalization. Never replay documents, create another run, compensate or assume
freshness. Lost start response reuses the same durable caller key. Intentional discarded
committed responses in the fixture simulate ACK loss, NOT actual wire-level lost ACK.

Draft removes the legacy run->source freshness/reliability trigger and adds a run
completion fence. All mutators must follow source->run lock order. NULL active/status
fails closed. The fence prevents UPDATE changes to completed rows, but does not stop
privileged direct writers forging initial receipts or source versions. Reliability policy
is not silently preserved. Deferred/other triggers, schema/types, all writers and commit-
time effects require deployed-schema review; offline results do not prove those facts.

## Corrected fixture transport and error discipline

No DSN, connection URL, arbitrary psql args, Docker context/endpoint or caller-selected
container is accepted. A future approved trusted CI runner must have a pre-provisioned
reviewed image; this harness never pulls/installs it. It creates one unpredictable,
nonce-labelled container on a fixed runner-local Docker Unix endpoint, records exact
container/image IDs, requires network none/no ports/no host binds/volumes/privilege,
uses fresh tmpfs data and fixed internal Unix socket. Docker inherits only an environment
allowlist with empty task Docker config; psql runs env -i, fixed arguments, no shell,
no libpq PGHOSTADDR/PGSERVICE routing or psqlrc. Every new session checks container
configuration plus server system identifier, socket/server metadata and instance nonce
originating from task-owned creation. Name/empty schema alone is not ownership proof.

No Python assert statements, no SQL calls inside assertions; unconditional checks work
under -O. Expected failures match exact SQLSTATE/message; timeout/permission failures
cannot satisfy success criteria. SQL error classes P7100-8 have designated meanings;
fixture injected error is P7190. Independent psql processes provide sessions. Duplicate
starts, start-first, finish-first, identical and conflicting finalizers require observed
ungranted lock waits before holder release. Thread-ready signals are not overlap proof.
Source-before-run order is tested with holder run NOWAIT acquisition while a finalizer
is demonstrably blocked on source. All processes and owned container have outer-finally
cleanup, atexit and SIGTERM/SIGINT handling. No process can guarantee cleanup after
SIGKILL/runner destruction; future CI must add run-owned always-cleanup/service lifecycle.
Cleanup refuses a different ownership identity, records/reports failure, and cannot adopt
or destroy a preexisting unrelated instance.

## Evidence boundaries and smallest later validation

19 deterministic Node contract-model tests PASS. 21 offline Python boundary checks
PASS both normally and under -O. These paths run no Docker, psql, SQL or dependencies.
Python AST parses with zero assert statements; git diff whitespace check passes.
These tests are independently implemented contract models, not SQL transaction proof.

Actual harness source includes: invalid args unchanged state; null guards; start-key
recovery; stored receipt identity; superseded/ABA preservation; error/unchanged freshness;
raised/suppressed/rewritten source/run-write rollback; AFTER rewrites; legacy-trigger
removal; fresh-connection receipt recovery after discarded response; all overlap cases.
ALL SQL, trigger, lock, container, isolation and actual driver paths are UNRUN. No real
wire fault injection or access-control proof. Image reference is taken from existing
repository proof workflow; runtime image/server/driver identities still need validation.
The harness records exact SQL/harness/Python/psql hashes, image ID/digest and isolation.

Prefer one bounded ephemeral CI proof based on existing do-storage-only-synthetic.yml
network-none pattern. Before activation: independently review exact files, pre-provision
reviewed image, fixed endpoint/socket paths and runner daemon trust, add always cleanup
and artifact retention, approve bounded execution. No persistent Mac install is needed.
No active workflow is included in this packet. Passing would establish fixture behavior
only, not production compatibility or the unresolved gates below.

## Separate unresolved release gates

- RLS, direct writers, default function exposure and invocation privileges (no grants here).
- DELETE/TRUNCATE, receipt/start-key deletion and reuse; durable retention enforcement.
- Restore/recreation epochs: version must not reset while old attempt identities survive.
- Legacy reliability policy and full inventory of deployed/deferred triggers/run writers.
- Durable caller-key storage, bounded reconciliation/receipt retention and unavailable reads.
- Earlier document/change persistence, honest attempt/confirmed/unknown counts; caller counts
  remain unverified by SQL and persistence_unknown must never finalize success.
- Real transaction/concurrency proof and optional actual wire-level ACK fault proof.
- Publisher-approved Beehive access; nothing here recovers or bypasses the feed.
