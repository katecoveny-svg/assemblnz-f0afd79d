# Local browser recovery candidate

Base: `f62bf077a`. Race fixes are isolated in `24bd1acf`; candidate `8222ef17` wires the existing extension-origin IndexedDB journal into the packaged MV3 worker and adds explicit companion setup and recovery controls. The local candidate therefore includes persistence and visible UI changes. Installed production and pilot files remain unchanged; no new native permissions, production schema or flags are activated. Follow-up `6ab3d286` preserves the blocked actual-MV3 interruption attempt and its reproducible platform evidence.

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

## Separate MV3 continuation (local, independently reviewed bounded scope)

The packaged worker now resumes an existing extension-origin journal at startup and supplies it to the actual connection broker. Missing/corrupt storage blocks edits; only the trusted companion page can explicitly initialize it. Existing records cannot be reset. Durable claims and the global unresolved-action lock survive task cancellation, reconnect and restart. Connection, read and action consent remain memory-only and expire normally.

Companion recovery requires reconnection and a newly approved read. It displays SKU plus before/requested/current quantities. A separate acknowledgement is bound to a fresh observation digest and rechecks owner, tab, document, expiry and cart facts. Acknowledgement records reconciliation, never success or retry; consumed action IDs remain stored. A same-boot claimed/in-flight record cannot be reconciled. Finished uncertain records can be acknowledged in the same boot. The page protocol has no setup or recovery command.

New evidence:
- 126 browser/action/download unit tests, full TypeScript and scoped ESLint pass.
- 33 actual IndexedDB assertions pass, including actual broker integration with synthetic cart transport: uncertain receipt lock, fresh-ID rejection after reconnect, restart without consent, before/requested/current review, wrong/changed digest rejection and acknowledgement without replay.
- `review-do-browser-mv3.cjs` loads the exact pilot ZIP/manifest in a disposable full Chromium profile. Four checks pass: explicit missing-storage setup, trusted companion setup, actual worker restart (changed persisted boot UUID), and full browser restart retaining setup without connection/read consent. No host permissions or activeTab grant are added.
- Companion synthetic UI checks cover explicit digest-bound recovery acknowledgement, keyboard/error/expiry behaviour, and 320/375/900px layouts. Narrow recovery was visually inspected locally; no capture uploaded.

**Remaining gap:** actual packaged MV3 interruption while a cart effect is dispatched is blocked by the available runtime and native activeTab invocation boundary, and is not proved. The headless setup test does not simulate a native toolbar activeTab grant or claim cart execution. Before/after-effect termination remains the separately labelled web service-worker/synthetic-host proof above. Native transport/document routing during an uncertain effect needs a separately reviewed isolated native fixture run. No retailer readiness claim follows from any of these checks.

The attempt recorded in `6ab3d286` reached the real companion connection handler, which rejected missing tab access. Chromium `141.0.7390.37` rejected browser-level `Extensions.triggerAction` with `wasn't found`; the read-only scripting probe was also denied and both fictional quantities stayed zero. Neither interruption cut point reached execution. See [reproduction and next gate](MV3-INTERRUPTION-NEXT-GATE.md) and [exact evidence](MV3-INTERRUPTION-BOUNDARY.json). No manifest broadening or synthetic permission grant was used.

The synchronous recovery fence protects observed revocation/expiry at commit; external owner/cart changes cannot be made atomic with an IndexedDB transaction. Storage deletion/corruption and capacity exhaustion fail closed; recovery never silently discards tombstones. Independent review has cleared `8222ef17` only for the bounded fictional-cart journal/setup/recovery source scope. This is not clearance of actual interrupted-cart execution or retailer readiness. Publication remains unapproved, and any installed-file update/reload requires explicit approval.

## Smallest Woolworths gap

Existing public evidence is recorded in `WOOLWORTHS-PUBLIC-EVIDENCE.md`; it was not refreshed through the user's overnight browser. The staged typed adapter expects verified account/store/cart context and compare-and-set total quantity. The observed public product detail had an Add to cart button, not the input-plus-commit control used by the staged DOM port. Public price or an empty header total does not establish account-bound price, availability or cart quantity.

The smallest implementation step is a bounded product-facts binding against a current permitted public page and offline fixtures (exact product path/title/pack, unambiguous selling price, reject member/multibuy/weighted ambiguity), returning unavailable cart context instead of guessing zero. It must remain read-only and non-executable. Completing cart context and quantity control mapping requires a separately authorised retailer session/read inspection and a reviewed live-gate decision. No real-account inspection, retailer mutation, permission expansion, login, anti-bot bypass or checkout is authorised here. Existing live gates remain hard false.

## Review and release

This branch is local only. No publication, merge, installed-file update, reload, production database or flag change. The candidate adds local journal setup and recovery UI within the existing glass companion presentation; disposable test profiles exercised journal initialization. Review the runtime source and regenerated archives together; do not treat the service-worker harness as a production transport. Rollback is the broker source/tests/bundle/archive commit; proof files are inert test assets.

Author validation: 126 unit tests across browser/action/download paths, full TypeScript and scoped ESLint, 33 IndexedDB assertions, four packaged MV3 setup/restart checks, companion UI checks and 18 web service-worker restart assertions pass. Earlier race-fix validation also passed 21 connection/DOM and seven dedicated-worker assertions. The independent reviewer separately reran 108 unit tests, all 33 IndexedDB assertions and all four packaged MV3 setup/restart checks successfully. These are distinct test scopes, not additive totals. The three original broker regression failures were observed before the fixes. The actual MV3 interrupted-cart proof remains blocked as documented above.

Local disk exhaustion was recovered by removing only the obsolete clean extension-parity checkout after confirming it had no uncommitted files (its committed branch/head `4f563402e` remains recoverable). No user files, installed pilot, shared dependencies or another agent's release checkouts were removed.
