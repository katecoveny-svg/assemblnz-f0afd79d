# Migration reconciliation — repository review only

Authority: repository changes, isolated local tests and draft PR. No production DDL, history repair, resets, deployment, token reads or consumer migration changes.

## Evidence and scope

2026-09-30 read-only metadata: production `wurwcrgxjjwqdaxqceey` records `20260716090000/family_inbox_tokens`; family table exists, both creative tables and creative tenant slug are absent. All creative statements were audited: two tables, two indexes, two named policies, RLS enablement and a guarded tenant seed. No later migrations reference those tables. Table absence is not the sole basis for reconciliation. There is no evidence of deployed creative tables or current production exposure.

Existing DO preview `hrviafrlktynyztjnszx` and ingestion preview `rxsnurubbvqrnerlnhia` record `creative_agency_auaha` at the collided version. DO preview has creative tables and tenant seed, and lacks family table. Therefore moving creative alone would leave that preview's family table missing.

Preserve the original family migration byte-for-byte. Move creative to CLI-generated `20260930225331_reconcile_auaha_family_history.sql`, scope its named policies to service_role, revoke PUBLIC/anon/authenticated table privileges and grant service CRUD on the three affected tables. Replay original idempotent family statements in the forward migration for creative-first environments. Existing rows are preserved; seed uses `ON CONFLICT DO NOTHING` to preserve custom tenant settings. Unrelated policies/default privileges are not altered.

## Verification

Isolated PostgreSQL 17 (pgvector/pgvector:pg17), container network disabled. Fresh, family-first, creative-first databases passed forward migration twice; synthetic family/creative rows preserved; customised tenant seed preserved; RLS and ACL assertions passed; service CRUD succeeded; actual anon/authenticated SELECT denied on all three tables. Synthetic token values only; no real token contents read. SQL assertions are in `supabase/tests/reconciliation_access.sql`.

Full repository-history replay attempted on plain PostgreSQL; first historical migration fails because Supabase bootstrap `storage.buckets` is absent. Full Supabase fresh-history/preview replay remains pending. No claim that all previews are unblocked.

## Compatibility, approval and rollback

Existing affected previews are candidates for the forward migration after parent review of schema/policy metadata and complete replay. It creates missing tables, scopes the two known creative policies, adjusts only these three table ACLs, and preserves rows. It does not reconcile arbitrary divergent schemas or custom policies. Review unexpected customisations before applying. Explicit approval needed: apply this specific forward migration to the named non-production preview project(s), after validating schema compatibility; production application is outside this task. No apply was performed.

Before merge: review this PR; merge reconciliation first; rebase/update DO consumer PR1429, public-source PR1427 and Pursuit PRs onto main; rerun previews and role assertions; merge consumers only after green preview proof. Do not edit their migrations or branches.

Before any migration is applied, reverting the repository PR restores the collision and therefore is not a useful operational rollback. After application, retain history and data; repair via a reviewed new forward migration. Never restore permissive policies, drop token/creative tables or delete existing tenant rows automatically. Do not run migration repair/reset.

## Additional inherited blocker

Two files also shared `20260717090000`: alphassembl_waitlist and spark_tools. Production has no recorded version at this timestamp. Production contains alphassembl_waitlist, but no Spark table or named Spark index. Both previews have no recorded version at this timestamp; DO preview has neither table. Spark statements are only table/RLS/index creation, with no seed or other side effects. Preserve the alphassembl file; move Spark to CLI-generated 20260930225831_reconcile_spark_tools_history.sql with explicit service-only ACLs. All migration versions were scanned: these were the only two collisions; none remain. Existing alphassembl data/history remain unchanged.

Spark isolated PG17 verification: fresh creation and repeated execution pass; pre-existing synthetic Spark and alphassembl rows preserved; all anon/authenticated CRUD and other table grants absent; RLS enabled; service CRUD successful. Assertions: `supabase/tests/spark_reconciliation_access.sql`.
