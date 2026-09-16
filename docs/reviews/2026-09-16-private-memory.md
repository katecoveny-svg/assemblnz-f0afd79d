# Private memory access repair

## Scope

Extends the existing agent-memory and authenticated-identity primitives. The June memory contract defines `personal` and `shared` as scopes within one owner's agents. Older permissive tenant policies survived that migration and contradicted the owner-only contract.

The owner explicitly approved the tested live database repair on 16 September. Migration `20260916011438_protect_private_agent_memory.sql` is applied to assembl-prod; its filename matches the recorded hosted migration version. All pre-existing rows were preserved. No memory contents were inspected or exported.

## Database result

- Legacy tenant read/write policies removed; existing owner CRUD and service-role policy retained.
- Anonymous table access revoked; authenticated clients retain CRUD, without TRUNCATE.
- Semantic search uses caller privileges and owner RLS, with anonymous execution revoked.
- Live catalogue verification: RLS enabled, legacy policies absent, anonymous SELECT/INSERT/search false, authenticated TRUNCATE false, owner policy intact, service search retained, row count unchanged.
- Supabase security advisors returned no notice for `agent_memory`. This is not a claim that the entire database or every service has been audited.

## Matching service changes prepared for release

- Recall verifies the Supabase session, derives the account ID, rejects a conflicting client ID, and bounds queries/results before provider access.
- Trusted service recall requires a concrete owner; maintenance extraction/backfill require the configured service credential.
- Agent router derives personal-context identity before making privileged downstream calls. Public anonymous chat does not inherit a client-claimed account.
- Removed duplicate router model-map keys that blocked Deno checking; retained their existing last-value behaviour.
- Push deployment selects changed functions and transitive consumers of changed shared imports. This patch selects exactly `agent-router`, `memory-recall`, `memory-extractor`, and `memory-backfill-embeddings`. Explicit manual full deployment remains available.

These Edge changes are separate from the already-applied database migration. Their production release must be verified separately.

## Proof

- `node scripts/test-private-memory-rls.mjs`: 20 checks against disposable PostgreSQL 17 + pgvector, including synthetic reproduction before repair, repeated migration application, anonymous and cross-owner denial, same-tenant isolation, owner CRUD, search, service access, and preserved rows. No host port or production connection is used.
- `pnpm exec vitest run lib/security/memory-auth.test.ts lib/security/memory-handler.test.ts lib/deployment/edge-targets.test.ts`: 18 passing tests. Handler tests execute actual Edge code with mocked provider/database dependencies; they are not live provider proof.
- Deno 2.9.6 checks all four affected functions.
- Root typecheck and changed-source ESLint pass.

## Release and reversal

Retain the restrictive database policy repair if a service release needs reversal. Reverting it would reopen the access defect. Changes do not delete data, add a provider, or create a customer connection. Successful signed-in recall and scheduled extraction still need appropriate account/service integration proof; the current project has no matching extraction/backfill cron job.

Reference: [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).
