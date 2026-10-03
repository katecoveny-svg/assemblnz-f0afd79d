# Optional atomic finalization proposal — unmounted and unapplied

Current adapters perform source and run completion in separate requests. The run
success trigger advances last_successful_fetch. Checked JavaScript prevents known
failed durability from becoming an HTTP success, but cannot tell whether a remotely
committed write lost its acknowledgement. No compensation is safe after an unknown
ACK: it could overwrite a newer successful poll.

The adjacent SQL is a review-only proposal, outside migrations. No adapter imports
or invokes it. It locks source then run, checks the expected attempted-check timestamp,
updates both finalization rows in one transaction, and returns an idempotent receipt
for an already-finished run. The existing success trigger participates in that same
transaction. It does not make earlier document/change writes transactional: partial
document persistence still needs honest counts and explicit error runs. Failure-count
policy is deliberately separate; no fabricated counter increment is included.

Review requirements: exact production column types and constraints; source/run lock
order against existing triggers; service_role-only invoker permissions; expected-check
nonce uniqueness across concurrent dispatch; clock ordering; ledger/idempotency semantics;
real disposable PostgreSQL fault and concurrency tests. The test SQL refuses databases
other than `assembl_ingestion_fixture`, rolls back fixtures, and has not been run.

Even an atomic RPC can lose its commit ACK. The client must report finalization_unknown
and reconcile using the existing run ID/read-only receipt; it must not retry document
writes, create a new run, reset timestamps, or label the source fresh on assumption.

No installation, migration, deployment, credential/security modification or collector
activation is authorised by these files. Until approved and proved, this is not a
runtime guarantee. The narrower checked-error handling can be reviewed separately;
strong atomic freshness remains an explicit release gate.
