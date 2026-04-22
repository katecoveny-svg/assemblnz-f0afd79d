

# Brand & Functionality Audit — Single Pass to Launch-Ready

Goal: by end of today, every kete visual on the site matches the Brand Guidelines v1.0 sheet (the fluffy white feathered kete with subtle accent rim wash), all SMS + WhatsApp paths are verified working, and all retired-kete code is fully removed.

This plan splits the work into **four sequential passes**. Each pass is small enough to ship and verify before moving to the next.

---

## Pass 1 — Logo & nav cohesion (top-left fix + global)

**Issue:** `Nav3DKeteLogo` (used in `BrandNav`) renders the cinematic **master kete** PNG (`src/assets/kete-master/kete-1024.png`). At 36px in the header it reads as a generic blob, not the canonical feathered kete from the brand sheet. The brand bible memory says "hero kete = ONLY interactive kete; grid kete = static + twinkle only" — the nav should use a *static* canonical mark, not the hero asset.

**Fix:**
1. Replace `Nav3DKeteLogo` with a tiny static `<FeatherKete variant="base" size={36} drift="none" />` (or a pre-rasterised 72×72 PNG of that exact silhouette) so the header mark is identical in form to every grid kete.
2. Audit all 8 `kete/index.ts` accent values vs the brand sheet hex codes — confirm the per-industry tint matches (PIKAU `#B8C7B1`, HOKO `#D8C3C2`, AKO `#C7D6C7`, TORO `#C7D9E8`, MANAAKI `#E6D8C6`, WAIHANGA `#CBB8A4`, ARATAKI `#D5C0C8`, AUAHA `#C8DDD8`).
3. Confirm `BrandNav` `KETE` array `color` values are pulled from the same source-of-truth rather than hard-coded teals (`#4AA5A8` is used for Manaaki, Waihanga, Toro today — wrong per the sheet).

## Pass 2 — Remove retired kete code

The brand memory and `scripts/check-kete-names.ts` lock the 8 ketes. The codebase still ships several retired marks and a full `hanga/` component folder. These leak into bundles and risk regressions:

- Retired SVG marks to delete: `hanga-mark.svg`, `pakihi-mark.svg`, `hangarau-mark.svg`, `te-kahui-reo-mark.svg`, `te-kahui-reo-logo.svg`, `toroa-mark.svg`, `toroa-logo.svg`, `toroa-logo-2.svg` (TORO has its own kete photo now).
- Component folder to remove: `src/components/hanga/` (e.g. `WhakaaeDashboard.tsx` still uses Lato + JetBrains Mono + retired #1A1D29 black text).
- Run `scripts/check-kete-names.ts` in CI mode to confirm zero remaining `hanga` / `pakihi` / `hangarau` / retired-name references.

## Pass 3 — Typography sweep (Plus Jakarta → Inter)

The brand bible bans Plus Jakarta Sans, Lato, and JetBrains Mono. Search shows **1,745 hits across 89 files** still referencing `Plus Jakarta Sans` (including `TextUsButton`, every legacy hanga dashboard, etc.).

**Strategy** (low-risk, high-coverage):
1. Add a single global CSS shim in `src/index.css` that aliases `'Plus Jakarta Sans'`, `'Lato'`, `'JetBrains Mono'` to `'Inter'` / `'IBM Plex Mono'` so every legacy inline `style={{ fontFamily: ... }}` instantly inherits the right family without per-file rewrites. (Mirrors the existing `pearl-alignment-shim` pattern in memory.)
2. Codemod `TextUsButton.tsx` and the 8 industry landing pages to use `'Inter'` directly so new code reads correctly.
3. Replace any hard-coded `#1A1D29` / `#000` text colour with Twilight Taupe `#6F6158` via the same shim.

## Pass 4 — Messaging end-to-end verification (SMS + WhatsApp)

The infrastructure is in place but has not been smoke-tested in this session. Required checks:

| Path | Component → Function → Provider | Verify |
|------|----------------------------------|--------|
| SMS outbound | `TextUsButton` `sms:` link → device handler | Link opens with prefilled body on iOS/Android |
| SMS inbound | TNZ → `tnz-webhook` → `tnz-inbound` → kete handler → `tnz-send` | `TNZ_AUTH_TOKEN`, `TNZ_API_BASE`, `TNZ_FROM_NUMBER` set; webhook URL registered in TNZ portal |
| WhatsApp outbound (deep link) | `TextUsButton` → `wa.me/<number>` | `kete_channel_config.whatsapp_enabled = true` for each of the 8 ketes |
| WhatsApp outbound (server) | `AdminMessagesPage` / `food-safety-diary` → `send-whatsapp` → Twilio | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER` set; sandbox approved |
| Fallback number | `TextUsButton` `FALLBACK_PHONE = "+6448879880"` | Confirm this is the correct live Twilio NZ number, not a stale stub |

**Action:** I'll run `secrets fetch` to confirm all 6 secrets are present, query `kete_channel_config` for the 8 rows, and ping `tnz-send` + `send-whatsapp` with a dry-run payload to confirm 200 responses. Anything missing gets a masked-input form per the security memory.

---

## Acceptance criteria (the "done today" bar)

- [ ] Header kete (top-left, every page) is visually identical in silhouette to the 8 grid kete on the brand sheet.
- [ ] All 8 industry kete cards show the correct accent rim hex from the sheet.
- [ ] No `Plus Jakarta Sans` / `Lato` / `JetBrains Mono` / `#1A1D29` references render in the user-visible UI (shim catches legacy inline styles).
- [ ] `scripts/check-kete-names.ts` exits 0 (no retired kete names anywhere).
- [ ] SMS deep link prefills correctly on a real phone; WhatsApp deep link opens the right number.
- [ ] `tnz-send` and `send-whatsapp` both return `200` with valid Twilio/TNZ message IDs in a smoke test.

## Technical implementation notes

- The kete master PNG (`src/assets/kete-master/kete-1024.png`) stays — it's correct for the cinematic hero. The change is *only* swapping what the **nav** renders to the matched-silhouette static feathered kete.
- The font shim goes at the bottom of `src/index.css` (same place as the existing pearl alignment shim) using `@layer utilities { [style*="Plus Jakarta Sans"] { font-family: 'Inter', sans-serif !important; } }` etc. — zero per-file edits needed.
- Deleting `src/components/hanga/` will require checking `App.tsx` for orphaned routes; the guard script will surface any remaining imports.
- Messaging verification uses `supabase--curl_edge_functions` in dry-run mode (no live SMS sent unless you give the green light).

## What I need from you to start

Reply **"go"** and I'll execute Pass 1 → Pass 4 in order, pausing only if a secret is missing or the smoke test fails.

