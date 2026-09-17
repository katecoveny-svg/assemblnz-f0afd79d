# Connected DO contracts implementation plan

> **For Hermes:** Use subagent-driven-development to implement bounded tasks with spec review then independent quality review.

**Goal:** Make the existing connector pack executable through truthful, validated contracts before adding the owner-bound portable job vertical.

**Architecture:** Extend the current pack, Pipedream transport, DO owner helpers and shared workspace. No parallel provider list, unowned runtime revival or broad Action Cloud activation. Keep the reviewed front-door repair in its existing PR; connected work is on `hermes/connected-do-runtime`.

**Tech stack:** Next.js, TypeScript/Zod, Vitest, existing Pipedream Connect, Supabase Office and Action Contract schema.

## Authority and context

User requested working connectors, portable agents/widgets and whole-site cohesion. Sign-in has been verified in the user's Chrome (`/api/do/runtime signedIn=true`). The Connections page shows Gmail and Calendar connected, not task-executed. Paid tests/assets have a NZ$50 total cap, no recurring subscriptions. Calendar data test is awaiting explicit consent; do not read private calendar/mail or write to a provider during development. Current canon and visual/copy docs were loaded; exact primary schemas are in `docs/reviews/site-repair/connector-contract-audit.md`. Broader durable design is `docs/plans/portable-do-vertical-discovery.md`; proposed database changes are not applied or authorised by this plan.

## Task 1: Correct the single action registry

Files: `apps/do/shared/do-connector-pack.ts`, its `.test.ts`, `lib/connectors/pipedream.ts`, its `.test.ts`.

1. RED: assert Sheets auth is `googleSheets`, Stripe auth is `app`, and exported transport map derives all entries (including approval metadata) from the pack. Retain Outlook `microsoftOutlook`, Salesforce `salesforce` and Slack `slack` auth props.
2. Run `pnpm exec vitest run apps/do/shared/do-connector-pack.test.ts lib/connectors/pipedream.test.ts` and observe failures.
3. Correct registry, explicit accountApp/version metadata, and use `actionMapFromPack` instead of the duplicated dispatcher map. Slack new connections/execution need `slack_v2`, not assumed legacy compatibility. Do not broaden Gmail scope.
4. Green focused tests and eslint. Owner/healthy account pinning must not regress.

## Task 2: Validate provider outcomes before claiming success

Files: new `lib/connectors/pipedream-results.ts` and `.test.ts`, existing transport.

1. RED separately for 2xx `error`, Linear `success:false`, missing required provider identifier, empty read array and transport ambiguity.
2. Parse documented Connect `ret` envelope; use action-specific minimal evidence. Do not use HTTP status or summary as proof. Calendar/Dropbox return arrays. Capture only bounded retained results and safe identifiers, not arbitrary logs/errors or invoice/mail payloads.
3. Keep `{ok,detail}` compatibility, adding explicit outcome classification if needed. Network failure after an action request is unknown, not permission to retry a write. Do not implement automatic write retries.
4. Green result/transport tests and current callers' regression tests.

## Task 3: Strict executable input contracts

Files: new `apps/do/shared/connector-contracts.ts` and `.test.ts`, integrate in `lib/connectors/pipedream.ts`.

1. Write one RED behaviour at a time for registered operations in the primary-source matrix. Unknown props, component/account owner/auth injection fail before provider use. Exact server auth injection happens last.
2. Enforce bounded calendar window/result count and compact fields, Drive metadata fields, nonrecursive limited Dropbox reads, reviewed literal Sheets cells (no formulas/row insertion), exact recipients/content/targets for writes, and no silent Slack join/schedule/footer.
3. Preserve actual specialist Outlook and Salesforce mappings. Disallow DO remote Gmail draft while only the readonly pilot exists. Unknown actions remain denied.
4. Run every pack entry through fixture input/output tests, then existing transport, specialist, Connections and ownership tests. Fixture success is contract proof only, never a live-provider claim.

## Task 4: Make Connections usable and honest

Files: `app/do/connections/DoConnections.tsx`, `connections.module.css`, new view/model tests, minimal `apps/do/shared/capability-catalogue.ts` adjustments.

1. RED: personal apps appear before developer infrastructure; signed-in/unknown/unhealthy states are distinct; Gmail readonly is not advertised as remote draft-write, Calendar create is an approval-required write.
2. Reuse the existing API and connections; preserve gateway/NZ capability information in accessible expandable technical details. Avoid provider jargon as the main journey. No new fake test buttons or success badges. Keep reconnect errors and accountsAvailable=false blocked.
3. Green tests, eslint and desktop/375px/keyboard screenshots. Do not change runtime account authority merely to make UI easier.

## Task 5: Durable first connected job (next gated increment)

After these contracts pass review, implement the explicit Calendar-window-to-DO-brief vertical from `portable-do-vertical-discovery.md`. Use existing Office identity and Action Contract hashes, real database atomic claims and owner-scoped immutable proof. First inspect available local database/test toolchain and actual schema state. Do not use the unowned demo Action Cloud store or process memory as durable storage. Add/apply no production migration without separate scope and verification. Request exact calendar-read consent before its live test.

## Final gates

Focused RED→GREEN, full `pnpm test`, `pnpm typecheck`, touched-source eslint, canon/brand/macron checks, production build, actual browser workflow, spec review followed by independent security review. Keep repair PR and connected-runtime work separately reviewable. No live dispatch activation until owner/permission/retry/storage/provider outcomes are verified.
