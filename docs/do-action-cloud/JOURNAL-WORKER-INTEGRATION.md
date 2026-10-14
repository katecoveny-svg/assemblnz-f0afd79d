# Dependent fictional worker and recovery proof

Depends on the local journal PR. This source-only candidate runs `executeReviewedCart` through `withLocalJournal` inside a real dedicated Worker, not a same-realm library test. It adds an explicit recovery controller and synthetic review page. The controller accepts companion-authorized commands only, uses fresh owner/document checks, drops authority on restart, requires fresh read approval and binds acknowledgement to an unchanged observation digest. Acknowledgement never adds an item or retries an action.

No installed extension, manifest, existing connection broker, core bundle, downloadable archive or prepared installation folder is changed. The current pilot still has the memory-Set fixture broker. This is a dependent proof candidate, **not completion of MV3 integration**. Replacing that broker safely requires a separately reviewed candidate worker bundle/recovery UI package. Updating shipping broker source now would force generated bundle/archive changes, conflicting with preserving the package Kate is about to install.

The test host uses an explicitly fictional localhost scope without a fabricated retailer account/store/cart context. The journal accepts that context only for the existing localhost fixture origin. Real retailer proposals still require the existing verified retailer context. Setup in this controlled proof is explicit: the harness mints an epoch, initializes once, and retains it outside the worker during termination. This is not native installation-epoch storage; a reviewed extension-owned setup/epoch bootstrap remains required. Missing storage still fails rather than initializing silently.

## Proof boundary

The runner mutates only a fictional quantity in its intercepted browser harness, drops the effect acknowledgement, terminates the Worker, starts a new Worker, and verifies that fresh-ID execution is blocked by the durable lock. Reconnect and read approval are required again. The recovery screen shows before, target and current quantities, then records an explicit acknowledgement without an additional effect. Requests attributed to a page are rejected. Chrome transport/sender verification and script injection are not simulated as proven native behavior.

A stopped worker cannot recall an already dispatched DOM effect. The native design must keep the cart lock, wait for outstanding browser injection to settle or classify it uncertain, obtain fresh current-document/cart evidence and human reconciliation, and never imply that fencing cancelled an effect. Account switches, missing journal, stale document and worker changes must all deny new mutation. Browser crash/power loss and MV3 script-injection timing remain native tests, not claims of this runner.

## Retention

The journal now hard-stops at 256 claims per installation epoch. It deletes no replay tombstones automatically. This bounds local storage while retaining replay protection. Capacity exhaustion requires a separately reviewed disposal/reset workflow after all uncertain effects are resolved; no such destructive control is exposed here. Removal/reset must invalidate old authority and must never resume an old proposal. No real user data was persisted in this work.

Finder was not opened; the existing manual installation folder remains unchanged. No new permissions or provider calls are introduced. Live retailer gate remains off.
