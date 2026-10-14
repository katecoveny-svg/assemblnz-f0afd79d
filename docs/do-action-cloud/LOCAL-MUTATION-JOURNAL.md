# Staged local mutation journal

Extends the existing `AuthorityStore` executor seam. The implementation lives in `apps/do/browser/journal/local.ts`; it is deliberately not imported by the extension worker, entry bundle, API or page relay. No package, manifest, permission, live flag or production database changes. The approved ab5e8ac pilot folder/archive is unchanged. Future integration changes the pilot's persistence behaviour and needs independent review before repackaging/testing.

IndexedDB provides a small local journal; no remote database or new `chrome.storage` permission is required by this source. Native extension-origin durability, lifecycle and quota behaviour must still be validated before use. Tests run with fictional data in an isolated browser origin, never actual user/cart data.

## Contract

Explicit setup initializes a caller-held installation epoch once. Normal startup refuses missing/corrupt state, wrong epochs and incompatible schemas. It does not repair, reset or recover authority. Each worker startup rotates a boot nonce, fencing old handles. Setup/epoch storage and recovery UI integration remain staged dependencies; no auto-initialize fallback is provided.

`withLocalJournal` adapts the existing executor. Owner authentication, approval digest/revision/expiry and current native document checks remain with the existing authority implementation. Approved proposals are schema-copied into the wrapper. Every claim binds owner, action, retailer account/store/cart, task/tab/document/navigation scope, proposal digest, revision and expiry. Authority/grants remain memory-only and are not restored on restart.

A strict-durability IndexedDB readwrite transaction inserts both a unique action claim and a global mutation lock, and returns success only on commit. The single global lock is intentionally stricter than a cart lock for this one-account pilot: a new action ID, changed account or expired lease cannot bypass an uncertain operation. Claimed actions never execute a second time.

Verified matching executor receipts terminate the claim and release the lock. Stopped actions retain it. Any lost receipt/failed commit/crash after claiming leaves uncertainty and cannot authorize replay. The DOM mutation and IndexedDB transaction cannot be atomic together: the claim is at-most-one attempt, not exactly-once success.

After restart, recovery can return the pending bounded item intent to the same verified owner. A trusted extension-only recovery screen must obtain fresh read authority, verify the same retailer context, show before/target/current quantities, and obtain explicit human reconciliation. The staged method takes a digest of that reviewed observation and a trusted confirmation callback; neither is page/model authority. No message handler exposes this method. Matching quantities alone are not proof of causation. Reconciliation records acknowledgement, never success, retains the consumed action ID and only allows a new separately approved action. Recovery is rejected in the same boot as the claimed effect.

## Stored data

Salted owner/account/store/cart binding digests; task scope digest; action key; proposal digest/revision/expiry; boot nonce and state; up to 20 SKU identifiers with before/target quantities; receipt or reconciliation digest. No names, prices, DOM, credentials, auth/session tokens, voice text or general browsing data. Hashes are pseudonymous, not anonymous. Tombstones are retained; no automatic compaction/reset currently exists. Storage failures stop effects. Bounded journal retention/explicit disposal should be reviewed with integration, without allowing consumed IDs to become replayable.

## Proof and remaining limits

`scripts/review-do-browser-journal.cjs` exercises real Chromium IndexedDB: atomic duplicate claims, new-ID and lease bypass denial, initialization failure, epoch mismatch, old-worker fencing, before-effect crash, failed completion after effect, verified receipt, expiry, owner/context recovery rejection, explicit acknowledgement, retained replay guard, quota failure atomic abort, and closing/reopening the JS realm with persistent claims. It also drives the actual `executeReviewedCart` contract with a fictional adapter.

This is not an installed-extension test or power-loss proof. A future native test must include worker termination/browser restart, storage loss, real document revocation and a reviewed recovery screen. External/manual retailer cart changes cannot be locked by local storage; exact pre/post observation checks must stop unsupported concurrent changes. No live retailer binding or gate is enabled here.
