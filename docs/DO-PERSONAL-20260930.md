# Personal DO · first cloud preparation release

Kate asked on 30 September 2026 for a personal DO like OpenAI's new always-on dots. The official reference is https://learn.chatgpt.com/docs/dots and https://learn.chatgpt.com/docs/dots/tasks-and-memory. This implementation builds on DO; it does not claim parity with dots or access to its proprietary runtime.

## Scope

`/do/personal` holds up to five private ongoing responsibilities. Each has a goal, explicitly saved notes, daily local hour and IANA time zone. Saving/renewing requires consent to store that exact context and use Assembl's configured generation provider for seven days. The person can inspect/edit/delete the notes, pause, run a check, review the output and explicitly share it. There is no hidden promotion of inferred personal facts into memory.

A cloud worker checks hourly at minute 5 UTC and prepares at most three due jobs per invocation, while the phone/page can be closed. Each responsibility runs at most once an hour, and each owner can consume five attempts in a rolling 24 hours. Failed attempts count. A separate short-lived usage ledger prevents deleting responsibilities from resetting the allowance. The daily hour is computed in PostgreSQL using the user's time zone, including daylight saving. Queued work may be delayed; this is not a precise-time alarm service.

Outputs are drafts for review. The worker uses only saved notes. No inbox, calendar, bank, web research, cloud browser, autonomous tool execution, push notification or native app bridge is added here. The existing phone PWA, companion, text preparation and explicit sharing remain available. Dots-style adaptive wakeups, cross-channel conversation and event-driven connected-app monitoring are follow-ups.

## Reused and new primitives

- **Uses:** verified `doOwner`, private/no-store headers, bounded JSON parsing, existing `prepareDoDraft` provider ladder and source/output hashes, `DoPresence`, original DO artwork, reviewed `DoShareButton`.
- **Creates:** responsibility/consent records, atomic database claim and finish functions, a separate quota ledger, saved run history and a worker heartbeat.
- **Extends:** DO home with one Personal DO navigation link and Vercel cron configuration.
- The front-door guard had banned all Personal DO promotion. Kate's current request authorises this product entry. The narrow exception permits only the exact new DO-home link; all other specialist/homepage restrictions remain.

## Boundaries

No tasks are installed for Kate or other users automatically. No prior ChatGPT memories, children's details, private emails or financial data are seeded into the repository or database. The first responsibility needs the person's own signed-in input and consent.

All HTTP mutations are same-origin and require a non-anonymous verified owner. Service-role writes carry that owner explicitly. Tables have RLS; authenticated users can select only their own context/results and cannot write or call worker RPCs directly. All functions are SECURITY INVOKER with an empty search path and execute grants only for service_role. The quota and heartbeat tables intentionally have no client policies or grants; Supabase reports these two deny-by-default service-only tables as informational RLS-without-policy notices.

Claims are atomic and serialized for this low-volume release, deduplicated, quota-bounded and recorded before model use. Pause/edit invalidates the current revision; finish rejects stale or revoked results. A pre-provider check narrows the revocation race. A provider request already in flight cannot be recalled. Interrupted attempts are marked failed on a later claim, without automatically retrying the same paid attempt. A task's next run is moved to its following local day when claimed.

Deleting a responsibility cascades its notes/results immediately. Results otherwise remain until deletion (the UI loads the latest 40). The separate quota ledger contains owner ID and attempt time only, and is pruned after 48 hours when the worker claims work. Database/service backups and provider retention are not erased by a client delete.

## Deployment

Requires existing `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` and at least one configured DO generation provider. Missing prerequisites disable new responsibilities. `CRON_SECRET` must be non-empty and match the worker Authorization header; no secret is accepted in URLs.

Additive migration `20260929213918_do_personal_responsibilities.sql` was applied to the verified assembl-prod project using the connected database tool. Its version matches server migration history. It created empty tables only. Runtime verification confirmed RLS on all four tables, no client execute grants, and zero installed responsibilities. A rolled-back fictional SQL test verified owner scoping, claims, pause rejection and RLS against the actual database, without any provider request or durable test data.

Code deployment and the first real user check are separate proof. The public runtime endpoint confirms existing generation is configured; this is not evidence that a Personal DO model run has succeeded. Cron only runs after a production deployment and cannot be proven from a preview. The workspace shows the recorded heartbeat rather than inventing a running status.

## Proof

- 19 executable database checks using PostgreSQL-compatible PGlite: RLS/role grants, owner isolation, consent expiry, duplicate claim prevention, pause/revision invalidation, review-only completion, deletion cascade, quota surviving deletion and NZ DST.
- 11 Vitest API/contract checks: auth, origin, payload scope, provider consent, non-cacheable private errors, owner binding, manual quota outcomes, unset/wrong cron secrets and bounded worker batch.
- Repeatable mobile/browser proof: `scripts/review-do-personal.cjs`. Signed-in browser interactions use fictional intercepted API fixtures, never another person's session.
- Typecheck, changed-file ESLint, brand/macron/front-door guards and production compilation are the release gates. Current results are recorded in the PR.

Local Turbopack first rejected cross-worktree dependency symlinks, which were replaced by a local dependency tree. It then failed while resolving pre-existing Cormorant font imports on unrelated demo pages. Webpack then hit network errors fetching unrelated Google fonts. Local runtime compilation reuses the actual font CSS and WOFF2 files from the previously successful web build through Next's offline font fixture hook; no production code or font selections are changed. Webpack compilation with those cached fonts is used for local runtime proof; the deployment's standard build remains unchanged and must pass before a merge.

## Rollback

Revert the isolated feature PR to remove the route, link and cron. Pause responsibilities if stopping an already deployed worker; leave private tables available for export/deletion. Do not drop user data as part of an application rollback.

## Next useful release

Connect one explicitly selected calendar/email source, add source-change events and notifications, and verify the signed-in account end to end. Keep personal and client data separate. Native keyboard/Share Sheet integration remains in the separate iPhone development branch, not silently merged here.
