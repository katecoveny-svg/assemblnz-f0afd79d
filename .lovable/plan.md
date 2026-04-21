

# Site Audit & Pitch-Ready Plan

A pragmatic, end-to-end pass to get you confident for tomorrow. Three deliverables: (1) a written audit you can read on a phone, (2) targeted fixes to the two things that will embarrass us on stage, (3) a clean Pikau demo path you can walk a customs/freight prospect through.

---

## Part A — Audit (read-only output, ~30 min, no code changes)

I'll produce a single `/mnt/documents/assembl-pitch-audit.md` covering:

### 1. Route map — what's live
A table of every route in `App.tsx` (~140 routes) grouped by:
- **Public marketing pages** (`/`, `/pikau`, `/manaaki`, `/waihanga`, `/auaha`, `/arataki`, `/hoko`, `/ako`, `/toro`, `/pricing`, `/about`, `/how-it-works`, `/contact`)
- **Kete dashboards** (`/pikau/dashboard`, `/manaaki/dashboard`, `/waihanga/*`, `/auaha/*`, `/arataki/dashboard`, `/toro/dashboard`)
- **Demos & evidence** (`/demos`, `/demos/pipeline`, `/demos/evidence-pack`, `/sample/:kete`, `/evidence`)
- **Admin** (`/admin/messaging`, `/admin/messaging-live`, `/admin/dashboard`, `/admin/health`)
- **Legacy/redirect** (everything pointing to `/` or another kete)

For each: status flag — **Live**, **Live but empty data**, **Cosmetic only**, **Redirect**, **Broken**.

### 2. Backend wiring — what's actually connected
- **Messaging**: TNZ inbound + outbound is **working** (verified live: 22 inbound + 23 outbound SMS in `messaging_messages`, latest inbound today). The `tnz-inbound` router resolves tenants, picks ketes, calls Gemini, sends back. Real conversations exist.
- **Pikau data**: `shipments` table exists but is **empty** (0 rows). `customs_declarations` table exists. The dashboard works but a fresh signed-in user sees an empty state.
- **Edge functions**: `tick`, `chat`, `embed-worker`, `health-check`, `nz-fuel-prices`, `nz-routes` all booting cleanly (verified via recent logs).
- **AI**: Gemini + OpenRouter + Anthropic + Lovable AI Gateway all keyed; `chat` function active.
- **Stripe**: `STRIPE_SECRET_KEY` set, `create-checkout` + `customer-portal` deployed.

### 3. Branding consistency check
A page-by-page list of which pages are on **Warm Pearl** (locked palette: `#FAF6EF` bg, `#0F2A26` ink, `#1F4D47` pounamu) versus which still have legacy cool-teal/dark-glass styling. (Homepage, BrandNav, BrandFooter, Pikau landing, hero backdrop = ✓. Pricing, About, several admin pages = drift.)

### 4. Terminology sweep
List of files still using "pack" where "kete" is locked (excluding "evidence pack").

---

## Part B — Two fixes that matter for tomorrow

### Fix 1 — The "Text us" button (the actual blocker you're hitting)

**Root cause**: `TextUsButton.tsx` ships a US phone number (`+14785516606`) and the WhatsApp option is force-disabled (`WHATSAPP_LIVE = false`). On desktop, the `sms:` link does nothing. On a NZ mobile, it opens but the destination is a US number — nobody on stage will text it.

**Fix**:
1. Replace `TextUsButton` with a **two-mode** component:
   - On mobile: existing `sms:` deep-link (with the number now configurable via `kete_channel_config`).
   - On desktop: opens the on-page **`KeteAgentChat`** widget instead (already exists, already wired to the same Gemini + Iho router as the SMS path) — same agent, same answers, no phone needed.
2. Add a third option always visible: a **"Chat with Pikau now"** button that scrolls to / opens the embedded chat. This is the demo path.
3. Re-enable the WhatsApp deep-link (`wa.me/...`) — it already works; only the UI flag was off. Use the WhatsApp number that's already in `TWILIO_WHATSAPP_NUMBER` secret.
4. Update the public-facing number to a configured value pulled from `kete_channel_config` (table exists, currently empty for public routes — I'll seed it). If you don't have a NZ Twilio number yet, the desktop chat path means you can still demo without one.

### Fix 2 — Pikau demo dataset

**Root cause**: `shipments` table is empty. A clean demo account on `/pikau/dashboard` shows "no shipments." Bad for a freight pitch.

**Fix**: Insert 5–6 seed shipments tied to a demo user, covering:
- A clean import (HS-coded, FOB, declared, cleared)
- A held shipment with MPI biosecurity flag (cold-chain visible)
- A draft with dangerous-goods classification pending
- Two cleared shipments with broker hand-off complete
- One reefer-temperature alert (cold-chain integrity)

This makes the dashboard charts (status pie, shipment bar) populated, gives Pikau an actual story, and lets MARINER/HAVEN/GATEWAY agent cards have something to point at.

---

## Part C — Your pitch-day Pikau walkthrough

A one-page printable I'll write to `/mnt/documents/pikau-demo-script.md` that gives you:

1. **URL sequence** — exact paths to click in order:
   - `/pikau` (landing) → "this is the public face"
   - Click "Chat with Pikau" → demo the in-page agent chat (works on stage Wi-Fi, no phone)
   - `/pikau/dashboard` → show seeded shipments + status charts
   - `/sample/pikau` → show the evidence pack format
   - `/demos/pipeline` → show the Kahu→Iho→Tā→Mahara→Mana governance pipeline running
   - `/admin/messaging-live` → show real inbound/outbound messages from today (proof the SMS path is live)

2. **What to say at each step** — three lines of voiceover per page, plus the one canonical line ("A platform of practical AI agents that finish the work — and give the time back.").

3. **Fail-safes** — what to do if Wi-Fi drops, what to do if a customer asks a question the agent can't answer (point at the trust stack: Simulation-tested · Policy-governed · Human-in-the-loop).

---

## Files I'll touch

| File | Change |
|---|---|
| `/mnt/documents/assembl-pitch-audit.md` | New — full audit doc |
| `/mnt/documents/pikau-demo-script.md` | New — pitch script |
| `src/components/kete/TextUsButton.tsx` | Add desktop chat fallback, re-enable WhatsApp, swap to configurable number |
| `src/components/kete/KeteAgentChat.tsx` | Add an `openOnDemand` ref so the new TextUsButton can open it |
| Migration: seed `shipments` + `kete_channel_config` | Demo data + public messaging config |

## What I will NOT touch
- No new image assets (kete visuals stay locked).
- No re-skin of Pricing/About on this pass — flagged in audit, fixed after the pitch.
- No edge function rewrites — the messaging path works.
- No admin auth changes.

## Risk
- Seed shipments need a `user_id`. I'll seed against the admin user (`ADMIN_EMAIL` exists as a secret). If you log in as someone else for the demo, I'll provide a 1-line SQL snippet to retag them.
- The `KeteAgentChat` desktop fallback needs a tiny imperative open API. Low risk — it's already a self-contained component.

