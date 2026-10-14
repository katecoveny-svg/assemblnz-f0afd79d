# Owned supermarket adapter — disabled release

Objective: provider-neutral, bounded product/cart read, exact preparation and approved addition, using the existing DO cart executor and reviewed text/voice entry. Surface: DO companion + Personal DO. Canon: START_HERE, context router/CURRENT, factory browser primitive and browser-action contract. Changed areas: browser/retailers, shared cart contract/executor, extension-owned read grant, generated package, tests. Done evidence: controlled typed facts and real fixture DOM; no live-site claim. No production flags/schema/secrets, checkout, installation, provider transmission or independent merge.

## Implemented

- Source-controlled disabled Woolworths factory and execution gate. Page requests and environment variables cannot enable it. Capability projection exposes the same unavailable state/blockers to API, extension and existing consumer surfaces.
- Typed fixed-price unrestricted products: canonical SKU, variant, pack size, cents, availability and total cart quantity. Complete cart context binds opaque non-credential account identity, store and cart. Ambiguity, duplicates, weights, restricted goods, stale state and variant/price/context changes fail closed.
- One-SKU addition prepares a target total from an observed starting quantity. Same runtime/digest/owner approval/claim/per-item receipt for voice and text; channel or conversation is never approval. No new reasoning provider is required. Gemini voice remains unchanged.
- Narrow DOM port performs one compare-and-set quantity operation, revalidates before effect, rejects form-submit controls and changed/detached controls, then relies on whole-cart readback. No generic click/evaluate/navigation/checkout/payment API. No automatic retries or substitutions.
- The companion issues product/cart read authority from its own screen. A page observe message or checkbox cannot mint it. Reconnect, expiry and normal task revocation discard it. Browser status events remain forgeable display data; extension-owned approval is authoritative.

## What is NOT implemented or validated

A verified Woolworths DOM binding is still missing. The DOM port accepts compiled trusted bindings, never model/page selector strings. Controlled bindings prove its mechanics; they are not claimed to match the current retailer website. The existing companion target remains the exact localhost fixture. There is no retailer account/cart reader injected into a user's tab, no live write, and no production enable switch.

Native Chrome sender/document/activeTab lifecycle and account/store/cart binding need an authorised test. A durable atomic claim/tombstone implementation is required before live effects; fixture worker memory is not durable. Private browser contents have not been transmitted to OpenAI or another new provider. Phone pairing and Mac OS control are separate future scopes.

## Narrow new-installation candidate

Kate reported removing the old extension on 14 October; do not request its old Details again. The separately packaged `assembl-do-browser-pilot-1.9.0.zip` is a **fixture-only installation candidate**, not installed software or live shopping. Its manifest lives at `apps/do/extension/pilot/manifest.json` and requests only activeTab, scripting, sidePanel and the Assembl first-party host needed to verify the chosen Personal DO session. No global content scripts, tabs/storage permission, optional third-party hosts or external connection grant. The normal legacy-feature extension package remains separate and retains its existing manifest.

Before loading this unpacked candidate, review the exact archive/manifest and obtain action-time approval for installation and the specific fixture-tab access. No remote-debugging or DevTools autoConnect setup is needed or authorised. A Chrome-team guide is technical reference, not permission. Do not work around prior blocked browser/file routes.

## First live-item dependencies and acceptance

1. Approved narrow installation and successful native fixture checks, including denial before read grant and revocation on navigation/account change.
2. Permitted inspection and a verified static Woolworths binding for product identity, variant/pack, price, complete trolley, account/store/cart context and the bounded quantity control. Test against captured/sanitised fixtures; reject unknown layout. No anti-bot bypass.
3. Site-access review for the personal pilot; commercial/multi-user rollout needs separate partner/terms review. Any additional browser host grant or private model-provider transmission needs specific approval.
4. Durable owner/action claim store and crash tombstones, independently reviewed. Only then consider a code-reviewed gate change.
5. User selects exact SKU/variant and quantity in one tab, approves the product/cart read and final addition, then observes one verified trolley readback. If acknowledgement is lost, inspect current state rather than retry. Stop before checkout, payment, order submission, login or prescriptions.

## Official site research — 14 October 2026

[Woolworths online/website/app terms](https://www.woolworths.co.nz/help/terms-conditions/online-shopping-website-app) describe household/workplace use and restrict resale; general clauses6/11 distinguish personal use from copying/scraping/distribution requiring consent. They are not a blanket grant for a multi-user automation service. Pricing/range vary by store, and weighted products/substitutions can change totals. Those facts motivate context binding and excluding weighted/substituted items in this pilot. The [terms index](https://www.woolworths.co.nz/help/terms-conditions) links separate loyalty and privacy terms. This is an implementation/access-review note, not a legal determination or retailer partnership claim.
