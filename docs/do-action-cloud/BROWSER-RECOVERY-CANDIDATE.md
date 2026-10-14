# Local browser recovery candidate

Base: `f62bf077a`. Scope: bounded broker race fixes, synthetic service-worker restart proof and sanitized native evidence. Uses the existing connection broker, executor and local journal; no new persistence, native permission or user interface is activated.

## Demonstrated defects and correction

Three new deterministic tests failed on the unchanged broker:

1. A tab navigation event during pending owner verification was ignored because no task existed yet. The broker now tracks both pending tab IDs and cancels that generation.
2. An owner switch during tab verification could establish the old owner. Connection and task guards now recheck owner after tab verification, with generation/session checks protecting publication.
3. Cancellation discarded the task busy flag, allowing reconnect while a dispatched edit was still unsettled. A broker-lifetime execution latch now prevents reconnect until settlement; cancellation still revokes immediately. It cannot recall an already-dispatched effect.

Five focused tests cover these failures plus owner changes during a read guard and concurrent approvals over the entire pending effect. Existing checks continue to cover revocation, expiry, document identity, read consent and exact review binding. The compiled broker and both ZIP mirrors are regenerated, but installed files remain untouched.

## New restart evidence

`review-do-browser-service-worker.cjs` serves only a local synthetic fixture and starts an isolated Chromium instance. It uses the staged journal/controller with a test-only service-worker transport. The test terminates the actual service worker through that isolated browser's protocol and checks a new random worker-realm marker, rather than merely reconstructing a controller.

Both cut points are exercised: durable claim committed before DOM effect, and fictional effect applied before acknowledgement/receipt. Each verifies destroyed realm, no restored connection/read consent, fresh-ID rejection while uncertain, correct fresh quantity readback, rejected wrong acknowledgement digest, acknowledgement without retry, nonrepeatable acknowledgement, and no extra effect (18 assertions). A test-only claim cut point is never bundled in the extension.

**This is real web service-worker lifecycle evidence with a simulated host, not installed MV3 proof.** It covers neither extension-origin storage retention across browser restart nor native Chrome message/document routing during suspension. The installed worker remains unchanged; the local continuation below now imports the journal into the candidate package.

## Separate MV3 continuation (local, awaiting independent review)

The packaged worker now resumes an existing extension-origin journal at startup and supplies it to the actual connection broker. Missing/corrupt storage blocks edits; only the trusted companion page can explicitly initialize it. Existing records cannot be reset. Durable claims and the global unresolved-action lock survive task cancellation, reconnect and restart. Connection, read and action consent remain memory-only and expire normally.

Companion recovery requires reconnection and a newly approved read. It displays SKU plus before/requested/current quantities. A separate acknowledgement is bound to a fresh observation digest and rechecks owner, tab, document, expiry and cart facts. Acknowledgement records reconciliation, never success or retry; consumed action IDs remain stored. A same-boot claimed/in-flight record cannot be reconciled. Finished uncertain records can be acknowledged in the same boot. The page protocol has no setup or recovery command.

New evidence:
- 126 browser/action/download unit tests, full TypeScript and scoped ESLint pass.
- 33 actual IndexedDB assertions pass, including actual broker integration with synthetic cart transport: uncertain receipt lock, fresh-ID rejection after reconnect, restart without consent, before/requested/current review, wrong/changed digest rejection and acknowledgement without replay.
- `review-do-browser-mv3.cjs` loads the exact pilot ZIP/manifest in a disposable full Chromium profile. Four checks pass: explicit missing-storage setup, trusted companion setup, actual worker restart (changed persisted boot UUID), and full browser restart retaining setup without connection/read consent. No host permissions or activeTab grant are added.
- Companion synthetic UI checks cover explicit digest-bound recovery acknowledgement, keyboard/error/expiry behaviour, and 320/375/900px layouts. Narrow recovery was visually inspected locally; no capture uploaded.

**Remaining gap:** actual packaged MV3 interruption while a cart effect is dispatched is not proved. The headless setup test does not simulate a native toolbar activeTab grant or claim cart execution. Before/after-effect termination remains the separately labelled web service-worker/synthetic-host proof above. Native transport/document routing during an uncertain effect needs a separately reviewed isolated native fixture run. No retailer readiness claim follows from any of these checks.

The synchronous recovery fence protects observed revocation/expiry at commit; external owner/cart changes cannot be made atomic with an IndexedDB transaction. Storage deletion/corruption and capacity exhaustion fail closed; recovery never silently discards tombstones. Independent review is required before publication, and explicit approval before any installed-file update/reload.

## Smallest Woolworths gap

Existing public evidence is recorded in `WOOLWORTHS-PUBLIC-EVIDENCE.md`; it was not refreshed through the user's overnight browser. The staged typed adapter expects verified account/store/cart context and compare-and-set total quantity. The observed public product detail had an Add to cart button, not the input-plus-commit control used by the staged DOM port. Public price or an empty header total does not establish account-bound price, availability or cart quantity.

The smallest implementation step is a bounded product-facts binding against a current permitted public page and offline fixtures (exact product path/title/pack, unambiguous selling price, reject member/multibuy/weighted ambiguity), returning unavailable cart context instead of guessing zero. It must remain read-only and non-executable. Completing cart context and quantity control mapping requires a separately authorised retailer session/read inspection and a reviewed live-gate decision. No real-account inspection, retailer mutation, permission expansion, login, anti-bot bypass or checkout is authorised here. Existing live gates remain hard false.

## Review and release

This branch is local only. No publication, merge, installation, reload, database or flag change. Existing glass companion presentation is preserved. Review the runtime source and regenerated archives together; do not treat the service-worker harness as a production transport. Rollback is the broker source/tests/bundle/archive commit; proof files are inert test assets.

Validation on this candidate: 126 unit tests across browser/action/download paths; full TypeScript check and scoped ESLint; 21 existing connection/DOM browser assertions, seven dedicated-worker recovery assertions, 22 journal assertions and 18 new service-worker restart assertions. All pass. The three original broker regression failures were observed before the fixes. No new visible UI was introduced.

Local disk exhaustion was recovered by removing only the obsolete clean extension-parity checkout after confirming it had no uncommitted files (its committed branch/head `4f563402e` remains recoverable). No user files, installed pilot, shared dependencies or another agent's release checkouts were removed.
