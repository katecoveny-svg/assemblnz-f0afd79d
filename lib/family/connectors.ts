/**
 * Family OS connectors — Phase 1: HANDOFFS only. No external account is
 * touched; every "do it" is a deep link the adult opens (calendar, maps,
 * Uber, Woolworths) or a draft they send. This is the honest, approval-first
 * layer: the agent proposes, the human opens/sends.
 *
 * Phase 2/3 (real calendar writes, Uber ride requests, Woolworths baskets)
 * only after approvals + partner/compliance are clear (Uber ride-request API
 * needs privileged access; Uber Teens NZ is the family-friendly path).
 */

const enc = encodeURIComponent;

/** Add-to-Google-Calendar deep link (no auth; opens a prefilled event). */
export function googleCalendarLink(title: string, whenLabel?: string, location?: string): string {
  const parts = [
    `text=${enc(title)}`,
    location ? `location=${enc(location)}` : '',
    whenLabel ? `details=${enc(`When: ${whenLabel}\n\nProposed by your Family OS — check the time before you rely on it.`)}` : '',
  ].filter(Boolean).join('&');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${parts}`;
}

/** Google Maps directions (walk/scoot/drive) — the transport handoff. */
export function mapsDirections(to: string, from?: string): string {
  return `https://www.google.com/maps/dir/?api=1&${from ? `origin=${enc(from)}&` : ''}destination=${enc(to)}`;
}

/** Uber deep link with a prefilled dropoff (opens the app / m.uber; the ride
 *  is never requested for you — you confirm it, per "no Uber without approval"). */
export function uberDeepLink(dropoff: string, pickup?: string): string {
  const p = pickup ? `&pickup[formatted_address]=${enc(pickup)}` : '&pickup=my_location';
  return `https://m.uber.com/ul/?action=setPickup${p}&dropoff[formatted_address]=${enc(dropoff)}`;
}

/** Open a Woolworths NZ search for a shopping item (the "high-intent basket"
 *  handoff — we create the intent, their app does the shop). */
export function woolworthsSearch(item: string): string {
  return `https://www.woolworths.co.nz/shop/searchproducts?search=${enc(item)}`;
}

/** A copy-paste shopping list block (for their shared-list feature). */
export function shoppingListText(list: string, items: string[]): string {
  return `${list}\n${items.map((i) => `• ${i}`).join('\n')}`;
}

/** Uber Eats NZ search for a dish (opens the app/site pre-filled — the "order
 *  it" handoff for a meal we've planned; no API relationship needed). */
export function uberEatsSearch(dish: string, address?: string): string {
  const q = `q=${enc(dish)}`;
  const a = address ? `&pl=${enc(address)}` : '';
  return `https://www.ubereats.com/nz/search?${q}${a}`;
}

/** Delivereasy NZ — a real NZ-owned on-demand courier (Auckland/Wgtn/Chch).
 *  Their last-mile API exists but is partner-gated (contact-to-access, no
 *  self-serve), so this opens their site; booking is by hand until the partner
 *  deal lands. Kept honest in the UI. */
export function delivereasyHome(): string {
  return 'https://www.delivereasy.co.nz/';
}

/** Uber Connect — Uber's send-a-parcel courier, live in Auckland. We open Uber
 *  with the pickup + dropoff pre-filled; the adult chooses "Uber Connect" and
 *  confirms the fare. We deliberately DON'T pin a product_id (it's account- and
 *  region-specific and needs the OAuth Products API) — no invented IDs. */
export function uberConnectSend(pickup: string, dropoff: string): string {
  return uberDeepLink(dropoff, pickup);
}

/** Uber ride deep-link reused as a courier fallback — the adult adds the note
 *  for the driver. Fragile, but works where Delivereasy is off. */
export function uberCourierFallback(pickup: string, dropoff: string): string {
  return uberDeepLink(dropoff, pickup);
}
