# DO browser quality checkpoint

Base: `b9bbdc7b8` (current main at isolation). Publication belongs to the designated release coordinator; this candidate does not activate a retailer or change installed browser permissions.

## Fixed capture boundary

The selected-page image port awaited a tab lookup before invoking `captureVisibleTab`. A cancellation or tab switch during that lookup could still invoke the screenshot API, although the reader's later identity checks rejected the evidence. The reader now passes its abort signal through the port, which checks cancellation and the current active tab, window and URL immediately before invoking capture. The existing document/owner/expiry checks still run after capture and before releasing evidence. Chrome's window-based capture is not an atomic document screenshot; navigation after invocation still requires discarding the result, not claiming it was never captured.

Two actual-worker/browser-API regression fixtures fail against the old boundary and pass with the fix: cancellation during lookup, and tab switch before its event is delivered. Both assert zero screenshot API calls and zero evidence messages. All 133 browser/API tests across 10 files pass. Worker syntax passes. No page content, provider request or real retailer was used.

Rebuilt selected-page package SHA256: `e356fe1d919bb9b62a8e0b12ff7cb42b167529238f483103848bf2d339b9e4fe`. Manifest unchanged: `activeTab`, `scripting`, `sidePanel`; first-party host `https://www.assembl.co.nz/*`. Generated unpacked source and public ZIP travel together.

## Interface and execution status

- Portable source already exposes Write/Talk/Add into the same first-party workspace. Selected-page panel embeds that workspace; Talk remains explicit microphone consent, Add remains image review. This patch changes no visible interface and claims no fresh installed UI proof.
- Existing cart tests cover exact SKU/variant/pack/price/context, total-quantity commands, durable claims, interruption, fresh readback and no duplicate retry. Fixture success is not Woolworths execution.
- The existing packaged MV3 CI proof exercises setup and worker/browser restart without granting cart access. Interrupted real MV3 action/recovery remains unverified; do not relabel it as passed.
- Prior Chrome-management denials remain in force. No installed manifest/profile inspection, extension installation, persistent permission expansion or native app execution was performed here.

## Exact remaining setup

For selected-page installed proof, Kate must approve the reviewed unpacked installation at the device boundary (if not already completed elsewhere), then connect it using its toolbar on a signed-in DO workspace. Use a nonprivate controlled page, toolbar activation, screenshot/text review, cancellation/navigation/expiry and offer-to-conversation checks. No background-tab enumeration or unrelated private capture.

For a real Woolworths trolley test, first verify the native authority/DOM mapping and durable recovery gates; the source-controlled live gate remains OFF. Kate must select her Woolworths session and confirm store/fulfilment/cart plus one exact SKU, variant, pack size, quantity and maximum price. Permit one bounded addition, verify fresh cart readback, and stop on ambiguity/interruption without retrying an uncertain effect. Never submit checkout. This approval is not present in this checkpoint.
