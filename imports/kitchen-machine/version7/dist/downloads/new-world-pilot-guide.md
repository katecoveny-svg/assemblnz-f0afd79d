# New World shopping pilot

Built for Kitchen Machine on 23 October 2026. **Browser linking was verified in Chrome on 25 October 2026. New World still showed Log in; a signed-in end-to-end test remains pending.** This is a desktop Chrome browser companion, not an official New World account API or a public launch.

## What is implemented

- The customer enables access to exactly two websites: their Kitchen Machine site and `www.newworld.co.nz`. They sign in directly with New World / Club+ in their own browser profile.
- Kitchen Machine sends one reviewed shop’s ingredient names, quantities and units to the local companion. Main shops and fresh top-ups are separate.
- The customer chooses a real product, pack and quantity on New World. The companion reads the selected store, product identifier, displayed regular price, price unit and chosen quantity from that page.
- The customer approves one specific addition in the extension’s own screen. A fresh read must match the approved product, store, quantity, unit and price before the fixed Add action can run.
- The companion attempts to verify the exact product and quantity in the trolley. Ambiguous or interrupted results remain unresolved until the customer checks them. They are never automatically retried. An existing selected product is left for direct adjustment on New World.
- The customer reviews the real trolley, offers, delivery slot, substitutions and fees on New World, then personally completes checkout. The companion has no checkout or payment action.

## Install and connect

1. Extract `assembl-new-world-companion.zip`.
2. In desktop Chrome, open `chrome://extensions`, enable Developer mode and select **Load unpacked**. Select the extracted `assembl-new-world-companion` folder containing `manifest.json`.
3. Click the extension’s toolbar icon, then **Enable browser connection**. Chrome asks for access to the two websites above. Only approve this if you want to test the pilot.
4. Open [Kitchen Machine](https://kitchen-machine-kate.katecoveny.chatgpt.site/) in the **same Chrome profile**. Choose **Connect New World**, **Check connection**, then the main shop or fresh top-up and **Send shop to companion**.
5. Accept the list in the companion. Open New World and sign in there; select your store. For each line choose a product, set the quantity/unit on its New World product page, return to the companion and choose **Read the selected product**.
6. Check the product match, pack conversion, diet/allergens, store and quantity. Approve the addition. Inspect the result in the trolley before moving on.
7. Review and approve checkout yourself on New World. No order is submitted by Kitchen Machine.

This does not run inside the Codex in-app browser, Safari or mobile browsers. A Chrome Web Store release has not been submitted. The retailer demonstration uses sample data and requires no extension. Site sharing does not share your browser-session shopping records.

## Data and permissions

No password, cookie, session-token, payment, account-history or address capture is implemented. The extension has no cookies, debugger, broad browsing-history or arbitrary-network-proxy permission. The Club+ login host is not granted to the extension.

The New World reader is only invoked on shopping product pages and the trolley drawer. Scripts are excluded from account, fulfilment, shopping-cart checkout and checkout paths. Product snapshots and approval records are stored with `chrome.storage.session`, not a server or cloud-synced extension storage. They clear when the browser closes. Downloaded records are ordinary files you control.

**Disconnect & clear** clears the session records and removes both website permissions. It does not sign you out of New World or change your trolley. Closing the browser also clears the session records; website permission grants persist until disconnected or removed in Chrome.

The website cannot send arbitrary browser actions or approve additions. Approval messages are accepted only from the companion’s own extension page. A lost result is recorded before a click can be retried; a customer can record an exact trolley check as present or absent. That is identified separately from an automatically observed result.

## Price boundaries

The companion reads the displayed regular/non-Club+ price. Conditional Club+ offers or multibuys may reduce the actual trolley amount; it does not assume eligibility or invent discounts. Prices have timestamps and approvals expire after five minutes. Per-kg products must be selected in kg. Variable-weight totals remain estimates.

These product snapshots are kept separate from the simulator’s editable example prices. No whole-market comparison, best-price guarantee or realised saving is claimed. Final charges depend on New World’s current checkout, quantities, weight, availability and fees.

## Verification completed

- Inspected current public New World product, quantity, regular price, store and empty-trolley controls. No authenticated account was accessed and no trolley addition was observed in the signed-out probe.
- Verified the main product heading is distinct from repeated recommendation headings.
- Automated model and integration-boundary tests cover price/store/product/quantity changes, expiry, weight units, untrusted callers, website approval denial, duplicate requests, interrupted writes, lost responses, customer reconciliation and disconnect.
- Rendered the new website connection/setup screen. Disconnected actions remain disabled and main/top-up selection is explicit.

## Required before broader use

- Install and test the extension in a signed-in Chrome profile: empty and existing trolleys, regular and Club+ products, weighted produce, store change, login expiry, network failure and disconnect. Current tests are fixtures; they do not prove signed-in retailer behaviour.
- Validate product matching and conversion with customers. This pilot deliberately requires a human product choice rather than silently substituting a SKU.
- Confirm Foodstuffs’ permitted integration/distribution route and relevant brand/data terms. No integration entitlement or partnership has been established.
- Complete extension review/distribution and privacy/security review before inviting customers. A seamless web/mobile account connection will need a supported retailer or commerce partner interface.

## Sources

- [New World online shopping terms](https://www.newworld.co.nz/shop/terms-and-conditions): account requirements, store selection, pricing, variable weight, service fees and use terms; checked 23 October 2026.
- [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), [optional permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions), [session storage](https://developer.chrome.com/docs/extensions/reference/api/storage) and [loading an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

Independent assembl pilot. Not affiliated with or endorsed by New World or Foodstuffs.
