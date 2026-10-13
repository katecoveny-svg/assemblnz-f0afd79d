# Reviewed browser cart foundation — 14 October 2026

Review build, not a live retailer integration. Extends the shared DO lifecycle and verified owner service; does not extend `action-stub` into an execution authority.

## Inspection and scope

Base main: `57b174df287d5d8adbbc56b38fce9b05cbd6fd69`.
The supplied Library image was materialized on the Mac with the supported Library helper and its actual pixels inspected. Chrome UI independently confirmed extension **1.3.0**, ID `dphkiipdjdioebikgifdcnjlgkehoacb`, enabled and unpacked. Its `sidepanel.html` embeds `/do/widget`; the purple-star outer shell and glass-D embedded website are different layers. The Chrome-installed DO app is a separate PWA, not proof of an updated extension.

Repository main was 1.7.0, `portable.html` + `portable-worker.js`, with selected-text/draft handoffs and a non-durable browser preview. Candidate 1.8.0 retains storage keys, advanced sidepanel, selected text, meeting, TypeSafe and floating companion. Write/Talk/Add open existing first-party reviewed tools. Talk never starts capture. Exact canonical glass artwork replaces outline shell marks; icon derivatives come from `public/do/icons/do-512.png`. No manifest permissions, host permissions, optional permissions or content-script scope changed relative to main. A comparison against installed 1.3.0 and action-time review are still needed before updating that unpacked installation.

## Contract and first vertical slice

- `apps/do/browser/contract.ts`: strict bounded `do.cart.v1`, exact connection/tab/document/origin/navigation revision, product identity/name/price/availability/current quantity and reviewed target quantity. Unknown keys, arbitrary JS and checkout are rejected. Owner identity never comes from action JSON.
- `executor.ts`: SHA-256 digest of the schema-normalised proposal; reviewed revision, expiry and owner-bound approval lookup; current connection checked before every action and after observation; atomic owner/action claim before effects. No retry after uncertain results or receipt persistence failure. Observe every item result and stop on unrelated cart changes, navigation, disconnect or revocation.
- `AuthorityStore`: **unbound port** requiring authenticated approval retrieval and durable atomic claims/tombstones. No production in-memory implementation or fallback. An interrupted action remains claimed until reconciliation; a new approval does not override a consumed action ID.
- `fixture-adapter.ts`: actual fixed DOM controls on exactly `http://127.0.0.1:4198/cart-fixture.html`. Rechecks document/navigation/cart revision synchronously before setting one quantity. No generic evaluate, click selector, login, payment, checkout or navigation API. Never injected into retailer pages or included in the extension archive.
- `/api/do/browser-actions`: uses existing verified non-anonymous `doOwner`, same-origin POST, bounded body parsing and no-store responses. GET projects unavailable status. Valid mutations return **503** until a reviewed production store and paired channel exist; no token/pairing endpoint is created.
- `capability.ts`: shared unavailable projection. Extension copy generated with `node --import tsx scripts/generate-do-browser-capability.ts`; parity test prevents drift. Shop/voice owners can consume the same module/API; their UI integration is separate work. Phone requests require an online approved paired browser; this is not phone browser control.

Receipts explicitly say `mode: controlled_fixture`, `retailerExecuted: false`, and include reviewed digest, scope, revision, time, per-item before/target/observed quantities and observed revisions. Uncertain results are not successful receipts.

## Repeatable proof

```
pnpm exec vitest run apps/do/browser/executor.test.ts app/api/do/browser-actions/route.test.ts apps/do/shared/sidepanel.test.ts apps/do/shared/portable-contract.test.ts
node --test scripts/check-do-portable.cjs
pnpm typecheck
pnpm exec eslint apps/do/browser app/api/do/browser-actions scripts/generate-do-browser-capability.ts scripts/serve-do-browser-fixture.mjs test/fixtures/do-browser/entry.ts --max-warnings=0
node scripts/brand-guard.mjs
node --import tsx scripts/lint-macrons.ts
node scripts/serve-do-browser-fixture.mjs
```

Open `/cart-fixture.html`: review → approve exact fictional items → execute. Check actual output quantities 2 oats/1 milk and per-item receipts; repeat execution must not mutate again. Prepare again, change a quantity manually, then execute: must stop before effects. Preview `/portable.html` at desktop and 375px; this previews assets, not Chrome extension APIs. Actual installed v1.8.0 execution remains unverified. Fixture authority is session-only, not durable pairing proof.

Tests cover owner mismatch, expiry, revocation, disconnected browser, stale revision, changed quantities/prices, domain/tab/document changes, duplicate products, JS injection, concurrent claims, replay, lost acknowledgement, receipt-store failure, and unexpected cart effects. Committed browser evidence in `docs/evidence/do-browser-foundation/` (working captures in `output/playwright/`) is controlled proof, with no real account/cart used.

## Activation and release ledger

| Layer | Staged in this PR | Applied / verified live |
|---|---|---|
| Extension | 1.8.0 source and packaged mirror | Installed 1.3.0 unchanged; not reloaded |
| Production schema | No migration; authority-store port only | No schema applied, no durable claim/receipt proof |
| Pairing / permissions | Contract and required gates below | No pairing, credentials, permission grants or access expansion |
| API / Vercel | Authenticated fail-closed route | No deployment/configuration/flag/secret changes |
| Retailer | Woolworths NZ named in contract; live adapter explicitly rejected | No public UI/terms validation, login, cart access, order or retailer endorsement |
| All DO surfaces | Shared capability module/API and extension projection | Shop/voice integration owned separately; no cross-device live execution |
| Persistence | Durable atomic claim interface specified | Only fictional session store exercised; not Supabase durability |

Before enabling any real adapter: approve exact SQL/owner isolation/retention/revocation model on an isolated staging database; verify two-account/anonymous/session expiry and crash/restart/concurrent claim behavior through hosted APIs; approve scoped device pairing without model-visible credentials; bind scope to Chrome's actual tab/document identity and revoke on navigation/removal/permission loss; validate permitted retailer UI/terms/access and static selectors against approved fixtures; user review of item identity, quantities, prices and revision; action-time approval for the installed extension permissions/pairing. Login/checkout/payment stay user-controlled. Reconcile Vercel deployed SHA, configuration, Supabase applied migrations and verified persistence separately before describing anything live. GitHub merge/tests are not activation evidence.

## Further integration seams

Save to DO remains separate from cart authority. The saved-space owner is preparing `lib/do/saved/save-intent.ts` and an explicit reviewed link/text/image/note contract. No automatic URL fetch, broad page capture, background save or new permissions are introduced here. Use the reviewed selection/first-party handoff, never put private content in URLs.

REA provenance is in `docs/do-messages/photon-rea.md`: `morluto/rea`, `rea-agents@6.4.0`, historical file inventory followed by a process-ownership failure. No executable was found on this Mac PATH and no matching REA entry was found in the inspected Codex/Claude configs. This is historical evidence, not a working installation claim. No REA software was installed or run in this task.

Rollback: restore the previous source/package release; do not delete extension settings or install a second extension identity. There are no schema or configuration changes to reverse in this PR.
