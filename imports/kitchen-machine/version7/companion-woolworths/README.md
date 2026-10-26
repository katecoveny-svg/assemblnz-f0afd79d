# Woolworths NZ companion pilot

Built on 25 October 2026 for Kitchen Machine. Independent assembl pilot, not an official Woolworths integration.

## Install and connect
1. Extract `assembl-woolworths-companion.zip`.
2. In desktop Chrome, open `chrome://extensions`, enable Developer mode and select **Load unpacked**. Choose the extracted `assembl-woolworths-companion` folder.
3. Open **assembl Kitchen · Woolworths NZ pilot** and choose **Enable browser connection**. Review access to **www.woolworths.co.nz** and **kitchen-machine-kate.katecoveny.chatgpt.site**.
4. In the same Chrome profile, open Kitchen Machine → **Connect Woolworths** → **Check connection**. Send one planned shop and accept it in the companion.
5. Sign in directly on Woolworths, choose a **pickup store**, then open a plan ingredient and choose its product.
6. Read the selected product in the companion, check the pack and price, then approve **one pack**. Open the Woolworths trolley and record whether that exact addition happened. Checkout is manual.

## First-pilot limits
- Fixed-price packs only; one pack per approval. Adjust larger quantities and buy weighed foods directly on Woolworths.
- Pickup store required. Delivery addresses are not read or stored; delivery support is not validated.
- Cart results require a customer check. An Add click never establishes success. No automatic retry.
- Existing trolley products, unclear pages, ambiguous prices, signed-out sessions and changed prices or stores block additions.
- A read expires after five minutes. Simulator assumptions are never passed off as retailer prices.
- Plan quantities are ingredient needs, not automatic pack conversions or proof that the whole list is fulfilled.

## Permissions and privacy
Only the two named HTTPS origins. Storage and scripting permissions; no cookies, debugger, arbitrary browsing, authentication or payment access. Shopping records stay in session memory and clear when Chrome closes. Enable again after a browser restart. **Disconnect & clear** removes permissions and records without changing the trolley or signing you out.

The New World and Woolworths packages use separate channels, host permissions and records. Installing one does not enable the other.

## Verification
Public milk and weighed-apple pages were inspected on Woolworths NZ. The price parser and approval boundaries have local automated checks. The signed-in pickup header is covered by a synthetic fixture, not yet a live customer test. Installation, account connection and real additions remain unverified until your pilot test.

Prices and availability vary by location. Estimated totals may differ due to actual weights, substitutions and service fees. Check retailer checkout.

[Woolworths shopping terms](https://www.woolworths.co.nz/help/terms-conditions/online-shopping-website-app)
