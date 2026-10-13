# DO isolated persistence rollout plan — no rollout authorized

## Required separation

Keep four concepts separate in schema, consent and UI:

| Kind | Current truth | Required acceptance |
| --- | --- | --- |
| Conversation history | Text/voice largely page state | Explicit save, owner-only reload/reopen, retention and delete; never imply unsaved conversation is durable |
| Approved long-term memory | Proposed schema/RPC/cleanup and flags remain a separate gate | User review before promotion, list/edit/forget, provenance, deletion propagation, provider consent separate |
| Preferences/profile | Existing owner-filtered profile storage | Cross-account binding and stale revision conflict checks before wider rollout |
| Pending tasks/checklists | Existing explicit checklist storage with owner binding/revisions; broader responsibility readiness gated | Reopen/version conflicts, tombstones, expiry/retry states; no “running” claim while worker unavailable |

## Stage 0 — establish an isolated target

Use an existing authorized local PGlite environment for schema logic first. Identify a **distinct** approved hosted fixture project before hosted tests; verify public project URL/reference is different from production and contains no real users/conversations. A Vercel Preview label does not establish database isolation. Creating a paid resource, persistent credential, security setting, or production migration needs separate scoped approval. None is requested or executed by this plan.

## Stage 1 — local fixture proof

Reuse `scripts/test-do-personal-checklists-sql.cjs`, `scripts/test-do-personal-profile-sql.cjs` and `scripts/test-do-memory-sql.cjs`; do not introduce duplicate infrastructure. Use only fictional users A/B plus anonymous identity. Exercise owner predicates/RLS logic, expected-revision conflicts, delete/forget tombstones, idempotent retry, missing-schema/readiness failures and cleanup timing. Report actual SQL assertions and fixture limitations.

## Stage 2 — hosted fixture acceptance (blocked until target approval)

Approve an exact schema diff and isolated target, then apply only that diff there. Use short-lived fixture access through existing authorized mechanisms; never store credentials in code/evidence. Test real login, token expiry/refresh failure, signout in another tab, account A/B isolation via direct API and UI, offline pending edits, reconnect/retry, competing updates, delete plus reopen, cleanup/retention. Verify unauthenticated/cross-owner reads and mutations fail without bypassing auth. Record only statuses, IDs generated for fixtures, and redacted structural evidence.

## Stage 3 — device review

On desktop and iPhone Safari/installed PWA, test save → close → reopen, signout → other account → original account, expired session, airplane mode/reconnect, background/resume, and browser-storage loss. Separate public page evidence from fixture data and actual-device observations. Run microphone/provider checks only after the user initiates each call; confirm end/interrupt/failure releases the mic and no reconnect starts another call automatically.

## Stage 4 — production release proposal, not execution

Return exact reviewed commits/schema/RPC/cleanup diffs, passing isolated evidence, rollback and data-retention plan, remaining limitations, target and flags. Obtain scoped production approval before any migration, memory flag, provider-sharing change or security setting. A storage release does not imply permission to send remembered content to a model. Roll out one vertical slice, observe only non-content operational errors, verify owner-safe deletion, then separately review long-term memory.
