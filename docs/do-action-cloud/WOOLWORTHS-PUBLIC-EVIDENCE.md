# Public retailer evidence and minimal local claims

Observed 14 October 2026 through the connected Chrome browser, using public navigation and read-only DOM inspection. No account login, cart navigation, add button, address/store selection, private account fields, network interception or security bypass was used. Search and product detail pages loaded successfully; no CAPTCHA or bot/security restriction appeared on this route. This closes public visibility discovery, not live execution readiness.

## Observed product semantics

Sources: [rolled oats search](https://www.woolworths.co.nz/shop/search/products?search=rolled%20oats) and [Woolworths rolled oats detail](https://www.woolworths.co.nz/shop/product-details/321220/woolworths-oats-rolled).

| Field | Observed evidence | Binding implication |
| --- | --- | --- |
| Product identity | Product link path contains `321220`; quick oats is `321222` | Use exact same-origin product path identity, never name-only match. Numeric path is observed identity, not proof of a universal SKU API. |
| Title, variant, pack | Detail H1 reads Woolworths Oats Rolled 750g; search also lists Quick 750g and Whole Grain Australian 1.5kg | Preserve full title and explicit pack. Variant is title-derived in these observations; no separate variant field or selector was found. Require reviewed exact match. |
| Selling price | Rolled 750g shows $2.49 | Parse cents separately from comparison price, then reobserve after store/account selection. This public value is not an account-bound quote. |
| Comparison price | $0.33 / 100g | This is a unit comparison, not quantity sold by weight. Do not confuse it with item price or infer saleUnit from it alone. |
| Promotions | Harraways 1.3kg shows current $5.90 and previous $6.60; bran 500g shows member $2.40 and non-member $2.60 | Never take the first currency token. Unknown member eligibility/multibuy pricing must fail review eligibility. |
| Availability | Public oats Add to cart button enabled; two promotional cards explicitly show Out of stock and disabled Add to cart | Enabled means the public UI offers an action, not confirmed stock at the user's store. Disabled/out-of-stock always excludes an item. |
| Context | Header offers Log in or Sign up, Select a time, Select an address | No verified owner/store/cart binding. Header $0.00 is not proof of complete cart contents or quantity zero. |

Search product cards expose an accessible link containing title, pack and price and a second title link to the same detail path. Cards may also contain previous prices, member/non-member prices, comparison prices and unrelated promoted products. Search rank is not product identity. No generic first-link/first-price/first-button selection is acceptable.

## Observed DOM contract and limits

Detail page: one `h1` for the observed title; its immediate parent contains the hero price, comparison price, an empty unit-toggle section and the Add to cart control. The Add to cart control is a `button type="button"`, with a visible span of the same name. Observed classes include `price-panel_productName__QEIQj`, `price-panel_pricePanel__6rzVr`, `product-price_value__ahw_i` and `price-panel_unitToggleSection__K76Ha`. Search image links carry an explicit `aria-label` and same-origin product-details href.

The semantic heading, exact product href and button role/name are usable evidence-backed anchors. The hashed classes are implementation details, not a stable published contract; do not ship them as unguarded selectors. A single observation does not establish cross-release stability. Future parsing must require uniqueness, matching identity/title/pack and known price structure, rejecting changed or ambiguous layouts.

Crucially, this unadded product page has **no quantity input**. The staged DOM port currently expects an input plus commit button. These observations do not validate that write contract for Woolworths. Do not click Add to cart to discover it without the separately approved live-item test. Cart line structure, complete-cart readback, revision derivation, account/store identity and navigation invalidation remain unobserved. No executable retailer binding or live-gate change is included in this evidence update.

## Published terms checked in the same browser

The [online/website/app terms](https://www.woolworths.co.nz/help/terms-conditions/online-shopping-website-app) were readable without a challenge. General clauses 6 and 11 distinguish personal use from broader copying/scraping/distribution and restrict interference; clause 8 also addresses hyperlinks. Specific pricing terms require local-store context and distinguish estimated totals, weights, substitutions and member offers. These are access-review inputs, not affirmative permission for commercial automation. Existing staged documentation retains the personal-pilot versus multi-user distinction. No terms acceptance control was operated.

## Minimum durable claims for one account on one browser

A remote database, multi-tenant service, queue, phone pairing and general browser fleet are **not prerequisites** for this deliberately local pilot. A small extension-origin IndexedDB journal is a candidate implementation, subject to native crash/persistence tests. It must not be confused with process memory or a non-atomic storage get/set sequence. No storage implementation or extra permission is granted by this document.

1. Limit the pilot to one extension installation, one verified DO owner, one retailer account and one active cart scope. All execution enters the extension service worker. Other devices/installations cannot execute or inherit approvals.
2. Mint action IDs and short-lived approvals in the extension. Store the reviewed digest, owner binding, installation epoch, retailer context digest, document/tab scope and expiry. Page-provided IDs or new retry IDs cannot create execution authority. Approvals/read grants do not survive worker/browser restart; replay tombstones do.
3. In one IndexedDB readwrite transaction, insert an absent `(installationEpoch, owner, actionId)` claim and acquire an exclusive active-cart lock. Commit before any DOM effect. Unique keys/transaction serialization decide competing attempts. Journal failure, missing initialization, quota errors or unexpected schema state disables writes.
4. Persist a claimed/in-flight tombstone before mutation. After verified whole-cart readback, persist the receipt and terminal state. A crash anywhere after claim leaves a non-replayable uncertain action and cart lock. Never release it merely because a lease expired. A DOM effect and local commit cannot be atomic together, so exactly-once success cannot be promised; at-most-one attempt plus explicit uncertainty is the goal.
5. On restart, permit only an explicitly approved fresh read to reconcile the same account/store/cart. Show uncertain before/target/current quantities. Matching quantity alone does not prove this action caused it. Require user reconciliation before releasing the cart lock and creating any new action; no automatic retry or compensation.
6. Retain consumed IDs/tombstones through approval expiry and recovery. A reset, reinstall, cleared journal or account change invalidates every previous connection/approval and requires fresh setup/review. Do not silently recreate a missing journal and resume pending work. Persist only bounded reviewed facts/digests and receipts, never credentials or full account DOM.

Required proof: two concurrent claim transactions; worker termination after claim/before click and after click/before receipt; browser restart; failed receipt commit; storage loss/quota failure; owner/account/store change; stale revision; revocation during the effect; forged page retry; and fresh-ID attempts while a cart lock is uncertain. Claims must be checked again against current authority before the effect. External/manual cart edits cannot be locked by this journal: reobservation must detect them, and unsupported concurrent changes stop execution.

This narrows the dependency to one reviewed local journal and its recovery UI/tests. It does not remove owner/context verification, native installation approval, verified retailer controls, or the live gate.
