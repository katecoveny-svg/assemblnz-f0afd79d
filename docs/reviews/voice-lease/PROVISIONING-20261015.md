# Voice ledger provisioning — 15 October 2026 NZDT

Supersedes the earlier statement that the SQL is unapplied. Kate authorised normal release and required configuration. The companion release owner retains Vercel configuration ownership; no environment flag or allowance was changed here.

## Production evidence

Repository `supabase/config.toml`, connected project list and release owner independently identified `assembl-prod`, ref `wurwcrgxjjwqdaxqceey`. Before provisioning, both ledger and CAS function were absent. Migration `20261014202527_do_voice_lease_ledger` was applied successfully and confirmed in hosted migration history. The local filename matches that observed hosted version.

- RLS enabled; anon/authenticated table access denied and function execute denied.
- Service role has SELECT/INSERT/UPDATE and RPC execution; DELETE denied. Function is SECURITY INVOKER with empty search_path.
- A rollback-only transaction created a synthetic auth owner and exercised CAS initial insert, duplicate insert rejection, stale version rejection, successful update/version increment and invalid JSON-state rejection. All assertions passed; synthetic owner and ledger rows were rolled back.
- Security advisors ran. The ledger has the expected informational RLS-with-no-policy notice: browser access is intentionally denied. Existing unrelated project findings remain; this is not a project-wide clean-security claim. [Advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Focused voice rerun: 51 tests across 7 files passed (policy, legacy allowance/token, lease service/store/runtime/route). Companion owner separately reported 146 combined tests at commit46886ea0b; that is owner-reported combined evidence, not a second run here.

## Release and activation

Keep DO_VOICE_LEASE_ENABLED absent/false for the current companion release. Legacy /live-token preserves 300-second calls and default900 reserved seconds/day. Enabling the lease flag globally disables legacy POST; it is not yet suitable for an unreviewed account-only rollout. Required gates: real bounded Google same-token resumption, account allocation/revision and consent, legacy-reservation cutover at NZ day boundary or explicit migration, retention/compaction review. Provisioning alone is not activation.

No Gemini credential exists in this shell or local .env (presence checks only). Release owner has been asked for an approved secret-safe test runtime; no key requested in chat. No provider call or microphone activation occurred. NZ acoustic acceptance remains FAILED from Kate's listening report; database and fixture checks cannot repair it.

Trusted usage ingestion/currency accounting remains unimplemented; reserved time is not measured spend. Default finite allowance preserved, no pricing/payment/purchase change.

## Office persistence read-only check

do_workspaces, do_agents, do_receipts and do_job_events all exist with RLS enabled. Authenticated owner policies include WITH CHECK; agent, receipt and event policies bind workspace owner and nested agent identity. Existing broad anon/authenticated grants remain; row access is constrained by RLS, but this inspection is not complete endpoint or privilege validation. No Office schema/data changed here. Release owner owns live board/Clear acceptance.

## Canonical document

Existing Library master remains libfile_018ba3e0f6388191b53afc80a188460f, version18, /DO delivery/DO-master-working-handover-2026-10-13.md. A fresh exact-title search confirmed that version. Supported complete-file download retried with network access and again returned Library prepare_materialize unavailable. No partial replacement or competing master created. The coordinator holds the additive decision text; board owner has acknowledged the canonical link without automatic sync claims.
