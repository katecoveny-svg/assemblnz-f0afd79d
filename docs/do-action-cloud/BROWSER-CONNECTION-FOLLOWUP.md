# Personal DO companion task connection — staged follow-up

Objective: close the missing same-browser transport/review path between actual Personal DO and the companion. Reuse verified `/api/do/session` identity, existing Chrome activeTab/scripting permissions, and the reviewed cart executor. This is not persistent or phone-to-desktop pairing.

Surface: existing Personal DO composer and reviewed voice handoff; one shared browser task review. Companion-owned final approval prevents page messages alone from changing a cart. Grocery missions never carry cart authority. No new launcher shell.

Expected files: apps/do/browser/connection, extension connection controller/page/bundle, PersonalDo/PersonalDoAssistant callback and review component, controlled fixtures/tests, package file lists. Canon: START_HERE, context router/CURRENT, factory primitives, browser-cart foundation. Done: synthetic end-to-end connection, explicit read review, item/quantity preview, companion approval, observed receipts and cancellation/owner/navigation/expiry/replay tests.

Boundary: code and fictional proof only. No installed extension changes, permissions, production pairing credentials, OAuth, private-page capture, shopping, payment or checkout. Installed manifest denial remains respected. Real retailer adapters and phone commands remain unavailable. Production API stays fail-closed. New code is staged for independent review; merge/publication stays with coordinator.

## Implemented boundary

The companion owns a two-minute, worker-memory connection to an exact tab ID, document ID, URL and verified first-party workspace owner. Restart discards it; this is deliberately not a durable job queue. The sole adapter URL is `http://127.0.0.1:4198/cart-fixture.html`. Remote pairing, real retailer adapters and payment/checkout operations do not exist in this slice.

The fixed isolated relay accepts only status, bounded product read, proposal preparation and cancellation. It cannot approve or execute. Preparing a proposal binds observed revision, exact products/quantities, digest and expiry. Only the extension-owned review page can approve; the existing executor rechecks authority, claims the action once and observes each result. Tab navigation/closure, owner loss, expiry or explicit cancellation revoke remaining authority. An in-flight edit cannot be undone and ambiguous results never automatically retry. No model-generated JavaScript, credentials or arbitrary page text enter this protocol.

PersonalDoAssistant exposes an explicit draft callback; PersonalDo mounts the shared review for typed text and an already-reviewed shopping voice brief. A shopping plan is context only, never cart approval. Other DO surfaces retain the foundation's unavailable capability status; this local connection does not imply phone-to-desktop or all-surface transport. `/api/do/browser-actions` remains unavailable. No DB migration, persistent pairing or production flag is introduced.

## Evidence and limits

`broker.test.ts` exercises the connection/owner/document boundary, cancellation during asynchronous operations, expiry, revision-bound approvals, replay rejection and worker restart. `scripts/review-do-browser-connection.cjs` renders the actual composer and shared review, runs the exact extension worker/relay/review scripts against a real fictional DOM, and checks text preparation, companion approval, observed receipt, page/forged-approval rejection, reviewed voice entry, 375px fit and owner loss. Every request is intercepted; owner identity and Chrome API transport are simulated. This is not an installed-extension or real-audio integration test. The full PersonalDo parent wiring is typechecked; the fixture mounts its constituent components directly.

Run `node scripts/build-do-browser-connection.mjs`, focused Vitest tests, and the browser script with `ASSEMBL_PLAYWRIGHT_MODULE` pointing to Playwright. Hosted workflow records exact-head synthetic evidence. Extension 1.9.0 packaging includes the generated broker and fixed adapter scripts; regenerate shared mirrors and the extension ZIP after combining presentation changes. Manifest permissions remain unchanged.

## Outstanding gates

The installed v1.3.0 companion has not been replaced. Its installed manifest could not be inspected through the permitted browser route, and that denial must not be circumvented. User-supplied manifest/permission review and approved desktop update/testing remain necessary. Native Chrome sender/document/activeTab behaviour needs an explicitly authorised test installation before claiming operational readiness. Woolworths UI/terms, selectors and account/cart execution are unvalidated; no real shopping account was used. Persistent or phone pairing, broader browser permissions, durable jobs and new retailer access require separate design/review and user approval.
