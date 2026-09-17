# DO wherever you work

**User-approved goal: 18 September 2026.** Tracking issue: [#1360](https://github.com/katecoveny-svg/assemblnz-f0afd79d/issues/1360).

> One DO assistant that comes with the person: understands the context they choose to share, reasons about their goal, prepares useful work, remembers it in the right workspace, and completes specifically approved actions with evidence.

This is the next implementation goal for the existing DO product, not another standalone app or a claim that all capabilities are already live. It extends the original TypeSafe pilot scope. The original pilot's runtime restrictions remain until each follow-on integration is implemented and proven.

## What changes in this branch

The existing three TypeSafe pilot surfaces gain a second, explicit provider consent: **Also prepare through DO**. With that consent, `POST /api/do/decision/prepare` obtains a fresh server-side TypeSafe decision, then routes only a supported draft task into the existing `prepareDoDraft` service.

- Pursuit brief → existing DO `brief` task.
- Studio handoff → existing DO `plan` task.
- Exact details → existing DO `extract` task; no writing model.
- Uncertain or unsupported choice → no drafting reservation or generation.

The current trial service bypasses the anonymous three-task allowance for signed-in owners. This bridge preserves that existing rule; it is not subscription enforcement or a hard spending cap. Keep the pilot allowlist small.

The bridge uses the existing owner allowlist, origin checks, body limit, TypeSafe owner rate backstop, database-backed DO rate check, and task reservation/release. It does not manufacture a fallback result if either provider stage fails. TypeSafe's successful result remains visible if DO preparation fails.

A generated draft includes the existing DO preparation receipt. It is not marked independently verified, saved, sent or published. Private proof export omits source text, titles, URLs and draft content. The original code-assembled brief remains available and labelled separately.

This work **extends** `lib/typesafe/` and **uses** the DO preparation/router/policy/entitlement primitives. It does not create another agent execution runtime. It does not change `/api/do/prepare` or silently add TypeSafe calls to existing users' requests.

## Capability split

| Layer | Job | Authority boundary |
|---|---|---|
| Vision | Interpret a user-selected screenshot, window, crop or image; preserve source/time and uncertainty | No automatic screen surveillance; sharing and retention separately consented |
| Reasoning and drafting | Understand goals, plan, research with connected tools, write and revise | Useful plan/progress summaries; not private chain-of-thought disclosure |
| TypeSafe | Focused handler selection, evidence/claim checks, ranking and typed judgments | Confidence is not correctness, verified evidence or permission |
| DO runtime | Validate tools, budgets, account/workspace membership and action state | Explicit capability registry and server-enforced policy |
| Records and memory | Resume the same job and save versioned drafts/receipts to the correct workspace | Personal, client and Assembl records isolated by default |
| Connectors | Save, send, publish or other specifically approved work | Exact destination/content approval, idempotency and read-back verification |

Use current provider docs and the existing model router. Do not represent Jev as the vision or long-form reasoning provider. Installing a skill configures the coding agent; it does not authenticate the deployed product or install a browser/native bridge.

## Build order and acceptance gates

The complete checklist lives in issue #1360. The order matters: establish identity and durable state before making DO capable of consequential work from multiple surfaces.

### 0. configure and prove

Follow [SETUP.md](./SETUP.md). A key-presence flag is not a successful credential test. Capture a real allowed request, provider version, actual result, failures and a private trace. No customer data or unsupported performance claim is needed for this test.

### 1. one shared preparation path

This branch supplies the opt-in TypeSafe → existing DO preparation bridge. Validate it in the full app and through all three pilot routes. Keep mock tests, live inference, visual proof and release approval distinct.

### 2. shared identity and context across surfaces

Inventory the actual hosted workspace, browser popup, side panel, page widget, native Mac companion, Office and mobile/PWA/share surfaces. The current extension popup sends `credentials: 'omit'` to `/api/do/prepare`; it does not carry the signed-in identity required by TypeSafe or durable records.

Build registered-client authentication with short-lived scopes, PKCE/device pairing where appropriate, logout/revocation and secure OS/browser storage. Do not solve this by allowing every extension origin, putting long-lived credentials in URLs, or treating an arbitrary `userId`/`clientId` as authority. A ChatGPT-connected account is not automatically an OAuth connection owned by deployed DO.

### 3. permissioned vision and reasoning

Start with user-selected screenshots/images; DOM/text where it is more accurate and less intrusive. Show the capture before transfer and allow crop/redaction. Preserve capture time, hash, source and observation confidence. Keep observed text separate from visual inference. Stop on changed/stale pages before acting.

Choose a verified multimodal provider using existing routing. Return useful observations, a short plan, missing context and next actions. Do not run continuous capture by default; do not infer access to another tab/window. Consent to context processing is separate from permission to act or keep memory.

### 4. durable jobs and correct records

Audit/reuse existing DO Office jobs, receipts and client/Assembl schemas before adding tables. Require owner/tenant/client authorisation on every read and write. Store a versioned draft, provenance, review state and job ID; show `saved` only after database acknowledgement. Reopen after page refresh and device restart. Retry safely and handle conflicts.

Client work does not silently become Assembl-wide memory. Support explicit retention, correction, deletion and export. A browser download or sessionStorage handoff is not a database save.

### 5. the real Pursuit hubs

The separately hosted hub is `https://assembl-pursuit.katecoveny.chatgpt.site/`. Updating this repository does not edit that host. Resolve its actual editor/deployment control first. Preserve private `/studios` client hubs and existing Studio destinations.

Use an authenticated handoff to the same durable job, with audience binding, short expiry and one-time use. Resolve membership server-side. Avoid wildcard CORS, tokens in query strings and copying a client ID into a public iframe as an access mechanism. A static link is a navigation aid, not a working record integration.

### 6. save, send and publish

Start with a private draft save, then a message to the user's verified test address and a private/staging publication. Reuse the existing Action Cloud permit/receipt foundation where runtime verification supports it.

Bind each permit to actor, workspace, connector account, exact action, payload hash, destination/recipient, expiry and idempotency key. Changes invalidate review. Persist state before execution. Read back the provider result and attach evidence. On ambiguous timeout use `unknown`; reconcile before retrying. Do not send the same message twice or claim a submission completed because it was queued.

This user goal authorises building these functions, not sending arbitrary messages or publishing assets without a concrete approved transaction.

### 7. cross-surface quality

Test source changes, prompt injection, tenant denial, expired permits, reconnect/revoke, interrupted jobs, duplicate clicks and provider failures. Exercise desktop, 375px mobile, keyboard and reduced-motion behaviours. Measure end-to-end usefulness, task success, latency and cost on Assembl cases; do not substitute vendor headline benchmarks.

Preserve the three-free-task commercial intent in entitlement design: internal decision/evidence checks are not automatically additional customer tasks. Reconcile this with current billing logic explicitly; this branch reuses, rather than changes, the existing reservation behaviour.

## Demonstration of the finished goal

From a permitted page or selected screen image, ask DO to prepare a proposal for a fictional click-and-collect service problem. Inspect context; TypeSafe chooses a bounded handler and checks an unsupported uplift claim; DO prepares the useful brief. Save it to the selected test client record, reopen the same job in its private Pursuit hub and native companion, create the Studio handoff, then explicitly approve a test send/private publication. Finish with database/provider-confirmed receipts.

The steps after preparation are **acceptance targets**, not capabilities delivered by this branch.

## Proof and release

Local isolated checks: `node --test scripts/check-typesafe-workflow.cjs` → **27 passed, 0 failed**. The new workflow and route run as real source; established auth, provider, input-parser and quota dependencies are test doubles. A UI source check is not browser visual proof.

Before release: full checkout `pnpm typecheck`, relevant Vitest suites (including the original 36-check pilot suite), appropriate lint, brand/macron checks, production build, desktop/mobile visual proof, signed-in preview and real provider calls. No full checkout or browser evidence was available in the agent runtime due terminal DNS and preview-session limitations.

Rollback: revert this bridge/checkbox; the original decision endpoint remains. Disable `TYPESAFE_ENABLED` to stop pilot provider calls. No new database migrations or external actions are introduced.

Brand remains the canonical plum/rose/paper system and Instrument Sans / IBM Plex Mono. Do not redesign the public homepage or revive retired DO product shelves as part of this build.
