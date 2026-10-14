# Independent schema re-review packet — V2 owner only

Status: UNAPPLIED. Request independent re-review before any production migration or enablement. V1 rejection accepted; archived proposals are not activation instructions. Branch `review/client-hub-migration`; source base includes approved main/font `dd241e532519f00094a221d094a584840544ca06`.

Review these together:
- `owner-schema-proposal.sql`: generated one-time owner-only DDL/RPC proposal.
- `owner-schema-template.sql` and `owner-payload-schema.json`: readable SQL template/full JSON contract.
- `scripts/migration-review/generate-owner-payload-schema.ts`: original Zod3 conversion, explicit bounded/refinement additions, deterministic SQL embedding.
- `scripts/migration-review/test-owner-schema.py` and `synthetic-owner-payload.json`: isolated synthetic harness.
- `evidence/owner-schema-v2-results.json`:75 checks including separate concurrent sessions and real image defaults.
- `lib/client-hub-migration/owner-session.ts`, owner policy/API and their25 combined tests.
- `owner-activation-plan.md`: activation, retention, rollback and pending production acceptance.

| V1 rejection | V2 correction | Evidence / remaining boundary |
|---|---|---|
| API-only enablement bypassable | Operator-managed `studio_owner_access`; RLS/RPC/API require enabled approved owner | Direct RPC before/without enablement denied; DB disablement denies read/write/delete. Production seed and identity must be approved |
| Direct UPDATE bypasses CAS | No direct table writes; save/delete through narrow identity-checked fixed-search-path definer RPCs | Named roles and PUBLIC denied, direct writes denied, stale and concurrent CAS tested. Trusted function owner needs review |
| Missing/null schemaVersion and null revision | Explicit nonnull/type/version checks plus complete JSON Schema; required revision/payload/id rules | Missing/null/string/wrong version, null args and incomplete/unknown/nested invalid payloads denied |
| Payload only superficially bounded | All60 object schemas closed,289 strings bounded,30 arrays bounded;1.8MB JSONB cap; original refinements retained/added | Full schema generated from actual contract; URLs/logos/contrast/Cinema tested. Deliberate stricter checks documented |
| Quota races | Per-owner access lock, totals from all records including tombstones, bounded draft/byte quotas | Two real sessions: one winner for draft quota, one for byte quota; stale writers cannot bypass |
| No retention/deletion contract | Revision-bound soft delete; retained quota; operator-only due-tombstone purge; new-record auth cascade | Visibility/update/purge age/permissions/cascade tested. Monitored schedule and backup retention remain activation decisions |
| Inherited PUBLIC/default grants | Revoke PUBLIC, anon, authenticated and service_role for each new table/function/schema; regrant narrow privileges | Actual Supabase image default ACLs inspected and broad PUBLIC grants deliberately injected. Proposed objects end with no PUBLIC grants. Production project ACLs remain uninspected |
| Owner activation includes recipient/storage | V2 creates only owner access/drafts/helper/RPCs; storage file comments only | No recipient/media tables created. Endpoint stays404; old V1 owner/Storage SQL archived DO NOT APPLY |
| Recipient/media design underspecified | Not activated; separate design records bounded projection, revision binding, owned namespace/policy audit and signed-URL revocation limits | Future implementation and review required; no acceptance claim |

Limits: container is network-disabled, tmpfs, synthetic auth users only. Image auth.uid is real; auth.jwt accessor is supplied only for synthetic GUC claims because the image lacks Auth-installed auth.jwt. Tests use trusted `supabase_admin` installation, then SET ROLE for client checks. No real JWT/cookie/PostgREST/Storage delivery proved. No production secrets, provider calls, DB changes or original Site edits.

Dispatch: this environment exposes no cross-thread messaging tool for the existing independent reviewer. Parent should forward this packet and the exact final commit; reviewer approval has not been obtained or implied.

## Frozen artwork delta and review status

Prior independent review approved disabled owner-only SQL SHA256 `5b6d1e6672271887bae1e569a2dbefbe4214026947cfb630ecf0680bd7bd233f`. Current generated SQL SHA256 is `ce71a6f5cda98eee3a62ea48792d9e3a4e641d114082defaa0128a60e7668320`. The subsequent contract change permits exactly three locally authored illustration paths: `/cinematic/interview-cloud.svg`, `/cinematic/interview-research.svg`, `/cinematic/interview-advisory.svg`. It does not change ownership, RPCs, quotas, grants, retention or enablement. Current hash requires reviewer acknowledgement before production approval.

Parent reports metadata-only production preflight: no namespace collisions; pg_jsonschema absent, version 0.3.3 available; broad default ACLs addressed by explicit revokes; trusted postgres owner. Installation must remain a separate targeted operation containing only this frozen owner SQL and the necessary extension installation. No access rows or enablement are included. No production operation has been performed by this worker.

Purge is all-owner and unbounded: do not schedule it. A separately reviewed bounded operator strategy, retention/backup decision, exact owner/quotas and real cookie/PostgREST acceptance remain required before activation. Latest local validation: 31 unit tests, scoped lint and 75 synthetic Supabase checks passed; final reconciled production build remains pending.
