# DO Enquiries verification — 30 September 2026

Application source tree: `b275cc1e3fa4b9d43f3b73154083280637ee62ae`.
The subsequent database-only follow-up outcome migration is covered by the
expanded rollback integration test; it does not change the browser application.
Base: `4b16968a0e6d0f6b184185890f03f472cf4de886`.

## Passed

- Production Next.js build, including TypeScript and all page generation,
  using `NODE_OPTIONS=--max-old-space-size=6144 node scripts/build-next.mjs`.
- Focused ESLint with zero warnings for the new workflow, MCP, scheduler,
  transport and browser verification code.
- Brand guard and macron guard (`node --import tsx scripts/lint-macrons.ts`;
  the workspace blocks the tsx CLI's temporary IPC socket).
- 41 focused Vitest checks: approval transport, auth boundaries, owner binding,
  webhook restrictions, actual MCP SDK discovery/tool invocation, audit and revocation.
- Real database rollback-only integration assertions for idempotent intake,
  changed-source conflict, foreign-owner denial, stale/duplicate approval denial,
  receipt requirement, measured outcomes, one follow-up, cancellation on reply,
  outcome deduplication, RLS and role grants. No fixture users remained afterwards.
- Expanded database check: missing revision rejected; reply and booking after
  a follow-up update the original enquiry's funnel while retaining child evidence.
- Applied both missing MCP membership and new enquiry migrations to assembl-prod.
- Supabase advisors: no new exposed-data warning. The event-key table's
  `rls_enabled_no_policy` INFO is intentional: browser roles have no grants and
  only the authorised server service role can access the hashes.
- Browser flow at desktop and 375px: actual signed-out boundary, then fictional
  API fixtures for receive → edit → save → explicit approval → provider receipt
  → recorded reply. No overflow, no page errors, and one approval request.

The browser helper daemon could not start in this workspace; verification used
the available Playwright/Chromium installation and the actual running Next.js
application. A duplicate bottom navigation bar caused a 10px mobile overflow;
Enquiries now uses its own shared task frame, matching other focused DO pages.

## Baseline failures

Full suite: **2,244 passed, four failed, two skipped** (253 test files).
The exact four failures reproduce on an isolated checkout of unchanged base:

- `lib/do/craft-canon.test.ts` — pre-existing copy assertion.
- `lib/do/public-do-specialists.test.ts` — expects the retired widget planning link.
- `lib/design/franklin-scene.test.ts` — pre-existing homepage structure assertion.
- `components/site/assembl-the-work/copy.test.ts` — expects retired `#do-input` CTA.

These tests were not weakened or changed in this feature.

## Not yet proven live

- A real signed-in founder email approval/send and provider receipt. Browser
  fixture results are not represented as an actual send or customer outcome.
- Production scheduled execution: audit found 12 hourly 401 responses in 12 hours
  and no worker heartbeat. The new diagnostics distinguish missing cron secret
  from a bearer mismatch without exposing credentials. Vercel's Production
  `CRON_SECRET` and a redeploy/authorised invocation still need verification.
- A completed ChatGPT OAuth connection. Supabase authorization-server discovery
  returns HTTP 200, but advertises no dynamic `registration_endpoint`; a registered
  client or enabled supported registration path is needed.
- Directory publication, MCP event push/subscriptions, automatic inbox reply
  reconciliation, and hosted-computer execution are not included.
- Sign in with ChatGPT remains a commercial partner application. The application
  brief is prepared in `docs/OPENAI-AGENTS-AND-CHATGPT-SIGNIN.md`; it was not submitted.

## Screenshots

All enquiry/customer content shown below is fictional. No email was sent.

- [Signed-out page](signed-out.png)
- [Desktop review](desktop-review-fictional.png)
- [375px review](mobile-review-fictional.png)
- [375px receipt and outcome](mobile-evidence-fictional.png)
- [Machine-readable browser checks](browser-check.json)
