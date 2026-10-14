# Actual MV3 interrupted-execution attempt

Candidate implementation remains `8222ef171b8d327663b8cf7a63ff739813b1784e`. This follow-up changes only the test reproduction and evidence. No permissions, runtime source, archive, installation or live browser changed.

## Observed blocker

The exact pilot ZIP/manifest was loaded in a disposable full Chromium profile. Setup succeeds. All web responses are local Playwright fixture responses, including a fictional first-party owner; there is no live account traffic. The fictional cart is the active tab, and the real extension companion message handler finds the fictional Personal DO tab.

Without a native action invocation, inspection says `Tab access is unavailable. Select the fictional cart and click the DO toolbar icon again.` The real connection handler rejects `Select the supported storefront tab first.` A read-only native scripting probe rejects `Cannot access contents of the page. Extension manifest must request permission to access the respective host.` Both cart quantities remain zero.

Chrome/141.0.7390.37, revision `9f043f63b0e5b728c8d09f3e3ddfc1681a4bd58e`, protocol 1.3 rejects the documented browser-level `Extensions.triggerAction` command with `'Extensions.triggerAction' wasn't found`. The page-level session was also checked. Exact output is preserved in `MV3-INTERRUPTION-BOUNDARY.json`.

The pilot declares only activeTab for the cart, no persistent loopback host permission, no command shortcut and no context menu invocation. Opening its HTML or clicking a button within it does not invoke the browser action. Headless Chromium has no native toolbar to click. No fake action listener invocation, permission mutation, private browser API, broker injection or manifest edit was used to get past this boundary.

Sources: [Chrome activeTab user gestures](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab), [CDP Extensions.triggerAction](https://chromedevtools.github.io/devtools-protocol/tot/Extensions/#method-triggerAction). The latter is current protocol documentation, not a claim of support in this installed runtime.

## Reproduce

From this checkout:

```sh
ASSEMBL_PLAYWRIGHT_MODULE=/Users/kateharland/.npm/_npx/e41f203b7505f1fb/node_modules/playwright \
ASSEMBL_CHROMIUM_PATH=/Users/kateharland/Library/Caches/ms-playwright/chromium-1194/chrome-mac/Chromium.app/Contents/MacOS/Chromium \
node scripts/review-do-browser-mv3-boundary.cjs
```

Output explicitly reports BLOCKED, not execution PASS. The disposable profile is removed. Evidence is also written to `output/playwright/mv3-interruption/platform-boundary.json`.

## Concrete next step

Use an approved isolated Chromium runtime supporting `Extensions.triggerAction` (verify the command before relying on it), or a separate headed test desktop where its real toolbar action can be clicked. Installing a runtime or disturbing Kate's desktop was not authorised here. Keep the exact manifest and fixture interception. Obtain the cart target ID with `Target.getTargetInfo`, then invoke `Extensions.triggerAction` on the browser-level CDP session with `{id: extensionId, targetId}`. Confirm that the real companion can inspect and connect before adding breakpoint tests.

Then run two independent profiles/cases using the real page relay and companion approvals:

1. Break in the worker adapter's `setQuantity` immediately before `chrome.scripting.executeScript`, after the journal claim has committed. Confirm the durable claim/lock and quantity zero, terminate the worker, detach the debugger and reconnect with new explicit read consent.
2. Break in the injected `editProduct` immediately after `button.click()` and before the scripting result returns to the worker. Confirm fictional quantity one and one effect, terminate the worker, then resume/detach the paused renderer. This order avoids falsely treating an unresolved old effect as settled. Reconnect/read again.

In both cases, a newly prepared action ID must remain blocked by the durable lock; readback must show the actual quantity; wrong/changed acknowledgement digest must fail; correct explicit acknowledgement must perform no edit, must not claim verified success, and must not replay. Also cancel before termination and change the synthetic owner before recovery to check that acknowledgement cannot release another owner's record. Restore the original synthetic owner only through explicit reconnect/read. Preserve event order, boot ID changes, journal state and per-item quantity/effect counts.

Neither interruption case nor the cancellation/owner-switch combination reached execution in this attempt. No claim is made that packaged MV3 interrupted execution is now proved. Existing broker/IndexedDB and web service-worker evidence remains separate.
