# Assembl delivery audit — 30 September 2026

Kate asked to recover continuity, build the Personal DO suggestions and simplify the crowded homepage. This audit distinguishes implemented code, tested flows and integrations still needed. It is a handover for the next working session, not a claim that every proposed agent is complete.

## Verified starting point

- Repository: `katecoveny-svg/assemblnz-f0afd79d`; main `ca4ef4afb6d31c3af7b6bf7680de8588a74cab23`.
- Personal DO PRs #1418, #1419, #1420 and #1421 are merged. Vercel production deployment `dpl_9vXUhgsX64CiUrppTY6dETWUVijN` was READY at the audit start. The older documents calling those changes review-only are historical.
- Native iOS PR #1417 remains an open draft. Development source is not an installable App Store/TestFlight release.
- No lost-dot handover was recovered. The code, database metadata and deployment records are the continuity source for this pass.
- Public mobile pages were inspected directly. Before refinement, the homepage measured 9,713px high at 390px width with reduced motion. Several repeated explanations, tools and demonstrations competed for attention.
- Assembl-prod has the profile and responsibility tables. The background-worker heartbeat was NULL at audit time. Production logs showed nine 401 responses for `/api/do/personal/cron` in the previous 12 hours. These establish a failed/unverified worker path; they do not identify whether the secret is missing, mismatched or the requests were probes.

## Changes in this delivery

1. **Homepage:** preserve the existing atelier scene, exact approved company/product positioning and interactive Living Brief. Replace the long repeated product sections with three compact product doors. Remove the duplicate slogan strip and statement banner. Move live research and the DO film behind explicit expandable controls. Private workspace links remain available in the footer. Reduced-motion visitors no longer see a duplicate set of product summaries.
2. **DO entry:** the principal Open DO and household entry now lead to `/do/personal`. The older writing workspace remains an explicit secondary destination. Meeting DO and Bills keep their existing routes.
3. **Personal DO:** one visible composer at a time, a working guest checklist as the default for signed-out visitors, optional fictional examples, and preserved drafts when switching between Ask DO and Make a checklist. Photo, paste/share and call entry remain available. The mobile task input is visible on the first screen.
4. **Recoverable checklists:** an explicit private account snapshot with save/open/remove, up to 30 validated checklists. It includes source notes, fields, prepared drafts and recorded evidence. Cloud save is opt-in; chat is not included. Restore preserves open edits and reports differences. Revision checks prevent stale-device overwrites and deleted-snapshot resurrection. An account-scope header must match the verified session; it never selects another database owner.
5. **Truthful background status:** configured, unverified, delayed and recently checked states are distinguished. Configuration alone no longer produces an apparently healthy label. No authentication bypass or invented heartbeat was added.

## What works, and what still needs building

| Area | Current implementation | Remaining work / evidence |
| --- | --- | --- |
| Personal DO conversation | Owner-allowlisted pilot with a bounded TypeSafe request check, Astra-only draft/question output, source quotes, explicit provider consent and editable draft. | A real signed-in TypeSafe + Astra exchange and quality acceptance still need proof. No executor, web browsing or durable chat history in this route. |
| NZ household admin | Twelve recipes: school/whānau, bills, WoF/rego/RUC, home/council, tradie quotes, meals/shopping, transport, returns, government paperwork, care appointments, moving and travel. Source review, missing fields, next-step mode and evidence packs exist. | These prepare/checklist work; they do not book, pay, file government forms, contact schools or change provider accounts. |
| Cross-device continuity | This delivery adds explicit private checklist snapshots. Name, character, style and responsibilities have separate owner-scoped storage. | No automatic sync, full conversation history, attachment vault or household membership system. Later edits require another Save. |
| Preemptive follow-through | Waiting reasons, on-screen follow-up dates, local date checks, ICS export and a separate scheduled preparation worker exist. | Repair and verify production cron; then add source-change events, opt-in push/reminders and delivery receipts. A checklist date does not create a worker responsibility. |
| Voice and photos | Existing Gemini live-call surface and consented vision intake are connected to reviewed notes. | Real microphone/voice-provider and physical-device testing; no always-listening phone or background screen observation. |
| NZ public information | NZTA notices, sourced model weather forecasts, GeoNet headlines and curated official care/admin links. | No live household accounts, booked appointments, personalised clinical advice, real-time local bus integration or emergency-monitoring service. |
| Portable DO | Shared movable companion, selected-context capture, desktop extension source, PWA/install guidance and reviewed share handoffs. | Installed-extension validation across permitted sites. Cross-app iPhone use needs the native distribution path; a website cannot supply an always-visible system agent. |
| iPhone app / keyboard | Native source is isolated in draft PR #1417; web layout works at narrow viewports. | Signing, capabilities, device tests, TestFlight/App Store distribution and the actual permitted Share Sheet/keyboard experience. No claim of an installed app. |
| Meeting DO | Existing recording/transcript preparation, closing review and reviewed work pack. | Owner/provider end-to-end proof and actual calendar/email destinations. No claim of Meet/Granola parity. |
| DO Bills / banking | Fictional demonstration, local CSV workflow, recurring-payment logic and a bounded read-only Redbark adapter. Public Bills explicitly says no bank connected. | Commercial provider agreement, per-customer OAuth/connection/revocation, durable authorised financial records and a private real-bank pilot. No bank authentication link is generated by this delivery. |
| DO Tradie + LockedIn | Tradie-admin recipe and shared financial groundwork. | Provider marketplace, availability/quotes, booking approval, Xero, messaging and payment reconciliation. These are not complete products yet. |
| DO Evidence | Source records, draft fingerprints, reviews, completion notes and bounded approvals exist in individual flows. | A unified action ledger with connector-confirmed external receipts. A user-recorded Done remains clearly labelled as such. |
| Pursuit + Studio | Existing public research, demonstrations, maker surfaces and approved system positioning remain. | The separately hosted signed-in hubs were not audited or modified by this repository pass. Their imagery/maker controls and durable client records require their actual source and session. |
| Personalisation/accessibility | Saved character/name/style, large phone inputs, reduced-motion support, text entry, read-aloud controls and one-next-step view. | Physical VoiceOver/TalkBack, switch access, longer NZ consumer usability testing and accessibility audit. Narrow viewport proof is not full WCAG certification. |

## The next build order

1. **Make saved work dependable:** ship and use the private checklist flow, then extend the same owner/revision pattern to durable conversations and user-approved attachments. Keep deletion and export discoverable.
2. **Fix background operations before selling always-on:** verify the Vercel production `CRON_SECRET` configuration and hourly `/api/do/personal/cron` schedule, redeploy if configuration changes, observe a 200 and non-null recent heartbeat, then test one owner's explicit responsibility through generation, review and deletion. Never expose the secret in URLs or remove Bearer authentication.
3. **Finish one valuable external job:** school/email → reviewed dates/actions → approved calendar entry, or bill notice → checked renewal terms → approved enquiry. Add the actual connector, preview, retry/idempotency and receipt. Start with one workflow before broadening claims.
4. **Add household permissions and notifications:** explicit invitations, per-item sharing and revocation; opt-in reminders with delivery/failed states. Keep child and financial details private by default.
5. **Bank pilot and native distribution:** commercial banking scope and per-user consent first; signed iPhone app and actual device tests separately. Keep live trading disabled.

## Verification and limits

- 124 focused tests across Personal DO, profiles, providers, life-admin and API boundaries pass, including new owner-scope, consent, conflict and worker-health tests.
- 12 executable local PostgreSQL-compatible checks pass: private RLS, service-only writes, stale revisions, removal tombstones, anonymous denial, bounds and account-deletion cascade.
- 22 browser checks pass with real local page rendering and fictional signed-in storage responses: 375/320px, first-screen input, one composer, explicit save, refresh/restore, conflict, cancel/remove, missing heartbeat, homepage doors and no runtime errors. The unauthenticated checklist API denial was exercised against the real local route.
- The standard full production build passes (Turbopack compilation, TypeScript, all 206 static pages). Typecheck, focused ESLint and brand/front-door guards pass. Macron check is invoked with `node --import tsx scripts/lint-macrons.ts` because the CLI's temporary IPC pipe is unavailable in this runner.
- Screenshots and test results are in `docs/evidence/do-refinement-20260930/`. Repeat with `scripts/review-do-refinement.cjs` and `scripts/test-do-personal-checklists-sql.cjs`.
- Migration `20260930063926_do_personal_checklist_cloud.sql` is applied to Assembl-prod; RLS and service-only RPC grants were verified against its actual schema. The filename matches the server migration history. The migration creates empty private storage only. No personal records, bank data or tasks were seeded. No provider generation, real booking, message, payment or account connection was triggered by the audit.
- Production build/deployment and final branch SHA are recorded in the delivery PR. Do not infer production success from local mocks or a READY deployment from an earlier commit.

## Recovery and rollback

Use `/do/personal` → **Saved checklists** → **Open saved checklists** on a signed-in device. Start with Open before saving; review conflicts before replacing the account copy. Removing the cloud collection leaves open/browser copies intact. This is a manual snapshot, not automatic synchronisation.

Revert this delivery's application commit to restore the old presentation. Keep the additive private table for user export/removal; do not drop customer data as an application rollback. The worker authentication boundary and existing external-action approvals are unchanged.
