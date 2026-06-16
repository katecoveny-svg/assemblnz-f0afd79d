# Visual interest survey — image placement plan

**Date:** 2026-06-16 · **Scope:** live Next.js app only (`app/`, `components/`, `lib/`). Legacy/duplicate trees ignored.

This is a placement plan, not an implementation. The marketing site reads clinical because most surfaces are headline + body copy stacked over glass cards, with motion (framer reveals, ambient blooms) standing in for actual imagery. A handful of pages (`/about`, `/hapai`, `/press`, `/kete`, `/kete/[slug]`, `/toro`) already carry real images; the high-traffic conversion pages (`/`, `/pricing`, `/how-it-works`, `/pilot-sprint`, `/platform`, `/evidence-pack`) carry almost none. Below is every user-facing surface, what it renders today, and where warmth should land. No chatbot/robot imagery anywhere (brand rule). Vessel renders are for business/marketing surfaces only — never the `/toro` whānau page, which gets warm family editorial or illustration.

---

## Full surface table

| Route | Current image count (approx) | Feels clinical? | Proposed image slots | Suggested type per slot |
|---|---|---|---|---|
| `/` (home) | 1 (VesselHero animated render only) | **y** | "The promise" mid-page band; per-card kete thumbnail (9 cards, currently colour-dot only); before-CTA pricing band | editorial photo (promise band) · vessel render or icon set (kete cards) · editorial photo (CTA band) |
| `/how-it-works` | 0 | **y** | hero-right panel; one image per the 3 steps (draft / sign-off / receipt); before-CTA band | illustration (3 steps) · editorial photo (hero + CTA) |
| `/kete` | 8 (one vessel render per `KeteVesselCard`) | n | hero-right panel beside "Choose the specialist pack" | vessel render (hero composite) |
| `/kete/[slug]` | 3 (hero vessel + 2 toro vessels in body) | n (hero only) — body still text-heavy | mid-page section divider(s) in the long body; before-CTA band | editorial photo (sector context) · vessel render (divider) |
| `/pricing` | 0 | **y** | hero-side panel; tier-card accent thumbnail (3 tiers); Tōro cross-sell band (bottom) | vessel render (tiers) · portrait or family editorial (Tōro band) |
| `/toro` | 1 (Tōro brand banner hero) | n (warm) — but single image | second whānau-life editorial break between features and trust band; per-feature card thumbnail (Term Planner / Budget / Holiday) | **family editorial photo or illustration only — no vessel** |
| `/hapai` | 3+ (hero vessel, per-tool `HapaiToolPreview` cards, founder portrait) | n | — already image-rich; optionally a section divider before the industry-pack band | editorial photo (optional divider) |
| `/hapai/*` tools (e.g. `/hapai/9am-brief`, `/study-helper`, `/meeting-notes`, etc.) | ~0–1 (functional tool UI, share-card preview) | partial | tool-header illustration / small explainer thumbnail above the working area | illustration · icon set |
| `/workflows` | 0 (text hero + `MarketplaceClient` cards, no thumbnails) | **y** | hero-right panel; per-workflow card thumbnail; kete-filter accent imagery | illustration (card thumbnails) · vessel render (hero) |
| `/agents` | 1 (hero image) | partial | per-agent / per-kete card thumbnail or sigil (currently icon-only); mid-page band between kete groups | icon set (per-agent sigil) · vessel render (kete band) |
| `/agents/[slug]` | 0 (no avatar/portrait) | **y** | agent header sigil/emblem; one in-body illustration of the agent's domain | icon set (agent emblem) · illustration |
| `/industry-pack` | 1 (Image) + `PipelineStickyScroll` | partial | hero-side panel; per-add-on card icon (6 add-ons, text-only); before-pricing band | vessel render (hero) · icon set (add-ons) |
| `/about` | 3 (founder portraits) | n | — well-served; optional team/Aotearoa context image in founder-note section | editorial photo (optional) |
| `/pilot-sprint` | 0 | **y** | hero-right panel; one image beside the 3 "How it runs" steps; before-price band | editorial photo (hero) · illustration (steps) |
| `/platform` | 0 (gradient blooms only) | **y** | hero-side panel; one image in "What's included" block; before-CTA band | vessel render or editorial photo (hero) · illustration (included block) |
| `/platform/hybrid-services` | 0 (assumed text + archetype cards) | **y** | per-archetype card thumbnail (6 archetypes); hero panel | icon set (archetypes) · illustration (hero) |
| `/contact` | 1 (faint ambient `ambient-warmth.webp` backdrop, opacity ~0.11) | partial | strengthen hero-side image beside the form; small place/Aotearoa context image in sidebar | editorial photo |
| `/press` | 4 (2 wordmarks + 2 founder portraits) | n | — well-served; optional brand-system sheet / banner in assets section | brand banner (optional) |
| `/evidence-pack` | 0 (glass "example" card is text `<dl>`) | **y** | hero-right panel; a real visual of an evidence pack / receipt mock beside the example list | illustration (evidence-pack visual) · editorial photo (hero) |
| `/te-tiriti` | 0 (four pou as bordered text cards) | **y** | section divider above/below the four pou; per-pou accent motif | illustration (pou motifs — culturally led) · brand banner (divider) |
| `/ai-use` | 0 (commitment text cards) | **y** | one hero-side or section illustration of the draft → review → receipt flow | illustration (process diagram, non-robot) |

**Other marketing surfaces found:** `/insurance`, `/electrify` (industry/campaign landing pages — both worth a hero image + per-section break, type: editorial photo / illustration); `/start` + `/start/signup` (conversion — light hero illustration or vessel render); `/docs` + `/docs/[slug]` (reference — icon set / illustration only as needed). Legal pages (`/legal/*`, `/privacy`) intentionally left bare — clinical is acceptable there.

---

## Prioritised shortlist — top 8 highest-impact placements

Ranked by how much each reduces the "clinical" feel relative to traffic and effort.

1. **`/` (home) — "The promise" mid-page editorial band.** The most-seen surface has only an animated vessel; one warm Aotearoa-work photo between hero and the kete grid breaks the wall of glass cards immediately.
2. **`/pricing` — Tōro cross-sell band + tier-card accents.** A high-intent page that is currently pure text; a warm family image on the Tōro band and light vessel accents on the three tiers add humanity exactly where people decide.
3. **`/` (home) — per-card kete thumbnails.** Nine cards distinguished only by a colour dot; a small vessel render or icon per kete turns the grid from a list into a visual menu.
4. **`/how-it-works` — three-step illustrations (draft / sign-off / receipt).** The core explainer is three text cards; simple illustrations make the promise legible at a glance and carry into the home page's matching section.
5. **`/evidence-pack` — a real visual of the pack/receipt.** The whole page sells an artefact it never shows; an illustrated evidence-pack mock beside the example list is the single most concrete win here.
6. **`/pilot-sprint` — hero photo + step imagery.** A $5,000 conversion page that is entirely text; one editorial hero and step visuals raise perceived substance and trust.
7. **`/platform` — hero panel + included-block visual.** Dense governance copy over gradient blooms reads coldest of all; a vessel render or editorial hero plus one supporting visual warms the highest-jargon surface.
8. **`/toro` — second whānau-life editorial break.** Already warm but single-image; one more family photo or illustration mid-page reinforces the whānau-first spine and keeps the page from thinning out below the fold (warm family imagery only — no vessel).

---

## Current vs proposed image count — per major page

- **`/` (home):** 1 (animated vessel only) → **~12** (1 promise band + 9 kete thumbnails + 1 CTA band, plus existing vessel)
- **`/how-it-works`:** 0 → **~5** (hero + 3 steps + CTA band)
- **`/kete`:** 8 → **~9** (add hero composite)
- **`/kete/[slug]`:** 3 → **~5–6** (add body dividers + CTA band)
- **`/pricing`:** 0 → **~5** (hero + 3 tier accents + Tōro band)
- **`/toro`:** 1 → **~5** (hero + 3 feature thumbnails + 1 mid-page break) — family editorial/illustration only
- **`/hapai`:** 3+ → **~4** (optional divider) — already strong
- **`/workflows`:** 0 → **~4+** (hero + per-card thumbnails)
- **`/agents`:** 1 → **~3+** (hero + kete band + per-agent sigils)
- **`/agents/[slug]`:** 0 → **~2** (emblem + domain illustration)
- **`/industry-pack`:** 1 → **~8** (hero + 6 add-on icons + pre-pricing band)
- **`/about`:** 3 → **3** (well-served; optional +1)
- **`/pilot-sprint`:** 0 → **~5** (hero + 3 steps + price band)
- **`/platform`:** 0 → **~3** (hero + included visual + CTA band)
- **`/contact`:** 1 (faint backdrop) → **~2** (form-side image + sidebar context)
- **`/press`:** 4 → **4** (well-served)
- **`/evidence-pack`:** 0 → **~2** (hero + pack visual)
- **`/te-tiriti`:** 0 → **~2** (divider + pou motifs)
- **`/ai-use`:** 0 → **~1** (process illustration)

---

*Survey only. No imagery or code added, generated, or wired. Lowercase `assembl` throughout; vessel imagery reserved for business/marketing surfaces; `/toro` gets warm whānau editorial or illustration; no chatbot/robot imagery anywhere.*
