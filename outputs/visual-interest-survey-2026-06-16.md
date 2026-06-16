# Visual interest survey — image placement plan

**Date:** 2026-06-16 · **Scope:** live Next.js app only (`app/`, `components/`, `lib/`). Legacy/duplicate trees ignored.

This is a placement plan, not an implementation. The marketing site reads clinical because most surfaces are headline + body copy stacked over glass cards, with motion (framer reveals, ambient blooms) standing in for actual imagery. A handful of pages (`/about`, `/hapai`, `/press`, `/kete`, `/kete/[slug]`, `/toro`) already carry real images; the high-traffic conversion pages (`/`, `/pricing`, `/how-it-works`, `/pilot-sprint`, `/platform`, `/evidence-pack`) carry almost none. Below is every user-facing surface, what it renders today, and where warmth should land. No chatbot/robot imagery anywhere (brand rule). Vessel renders are for business/marketing surfaces only — never the `/toro` whānau page, which gets warm family editorial or illustration.

**North star:** Kate's visual direction — see `outputs/visual-direction-2026-06-16.md` (+ `…-direction-2026-06-16.png`). Key moves: an **alternating dark-pounamu / cream rhythm where cream is the base and dark is the measured accent** (hero, stat callouts, the close — never dominant); **vessel renders whose gold "data-node glints" are the metaphor** (vessel = evidence pack, each glint = a piece of evidence held); cream Cormorant headlines on dark green; real **NZ landscape** photography at breaks; real **NZ human/working** photography at the close + About; **big stat callouts** (`35K` / `$8M` / `98%` / `100%`); clean kete-card grids in cream; a dark footer with a prominent `assembl` wordmark. The "Visual-direction layer" section below maps this onto every surface (background rhythm · imagery type · position).

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

## Visual-direction layer — background rhythm + imagery per surface

Maps Kate's direction onto each surface. **Rhythm rules:** cream (`#FAF7F2` / `#F7F3EE`) is the base; dark pounamu (`#0E5546` / `#2B6B57`) is the **measured accent** — reserved for the hero on product pages, big stat callouts, the "Let's build what's next" close, and the footer. Aim ~1 dark band per 2 cream sections; never two dark sections back-to-back except hero + footer. Vessel renders carry **gold data-node glints** (vessel = evidence pack, each glint = a piece of evidence held). Cream Cormorant headlines on every dark band.

| Route | Section background rhythm (cream base · dark accents) | Imagery slots — type · position |
|---|---|---|
| `/` (home) — *canonical reference, matches the mockup* | **dark hero** → cream (stat row) → **dark** (from-work-to-proof) → cream (kete grid) → cream/photo (coast + founder) → **dark footer** | vessel render w/ **data-node glints** (hero + proof band) · **stat callout** `35K/$8M/98%/100%` (cream band) · vessel-or-icon per kete card (cream grid) · **NZ coast photo** + **founder-at-desk photo** (pre-footer) · wordmark (dark footer) |
| `/pricing` | cream hero → cream (Sprint) → **dark "How a pack works"** accent → cream (3 tiers) → cream (Tōro cross-sell) → **dark CTA close** | light vessel accent per tier (cream) · **stat callout** (dark band, e.g. hours saved) · **family editorial photo** (Tōro band, no vessel) · cream Cormorant on the dark close |
| `/how-it-works` | cream hero → cream (3 steps, **dark step-2** for emphasis) → **NZ landscape** break → **dark CTA close** | 3-step illustration (draft/sign-off/receipt) · **NZ bush/landscape** half-bleed (break) · vessel glint motif (dark CTA) |
| `/kete` | cream hero (vessel composite) → cream (card grid, already vessels) → **dark CTA band** | vessel hero composite w/ data-node glints · existing per-card vessels · wordmark/CTA (dark) |
| `/kete/[slug]` | **dark hero** (sector vessel) → cream (body) → **NZ landscape** sector break → **dark CTA** | sector vessel render w/ glints (dark hero) · **NZ landscape** matched to the sector (break) · stat callout (optional) |
| `/toro` | **cream throughout** (warm, light) — at most one soft accent at the price CTA | **family/whānau editorial photo or illustration ONLY — no vessel, no dark dominance** · per-feature card thumbnail (warm) |
| `/hapai` | cream base · vessel hero · optional single dark divider before the industry-pack band | vessel hero (glints) · existing tool previews · optional **dark** divider |
| `/workflows` | cream hero (vessel) → cream (cards) → **dark CTA** | vessel hero · per-card illustration thumbnail · dark CTA |
| `/agents` | **dark hero** (vessel) → cream (kete groups) → **dark CTA** | vessel hero w/ glints · per-agent sigil/icon (cream) · vessel band (dark CTA) |
| `/industry-pack` | **dark hero** (vessel) → cream (included/add-ons) → cream **stat callouts** → **dark pricing CTA** | vessel hero w/ glints · add-on icon set (cream) · **stat callouts** · dark pricing close |
| `/about` | cream base (founder portraits) → **dark "Let's build what's next" close** | existing founder portraits · **NZ human/working photo** on the dark close (Cormorant cream headline) |
| `/pilot-sprint` | cream hero → cream (3 "how it runs" steps) → **NZ landscape** break → **dark price/CTA close** | editorial hero · step illustration · **NZ landscape** break · stat callout (time saved) · dark CTA |
| `/platform` | **dark hero** (vessel or landscape) → cream ("what's included") → **dark CTA** | vessel-or-landscape hero · included-block illustration (cream) · dark CTA |
| `/platform/hybrid-services` | cream hero → cream (archetype cards) → **dark CTA** | archetype icon set (cream) · dark CTA |
| `/evidence-pack` | cream hero → cream (pack visual + example) → **dark proof/stat band** | **evidence-pack/receipt visual** (the artefact, shown) · **stat callout** on the dark band |
| `/te-tiriti` | cream base → **NZ native-bush** break → cream (four pou, culturally-led motifs) | **NZ native bush/landscape** (break) · per-pou accent motif (culturally led, non-figurative) |
| `/ai-use` | cream base → one process illustration | draft → review → receipt illustration (non-robot) |
| `/contact` | cream base → strengthened form-side image | **NZ human/place photo** beside the form |
| `/press` | cream base → **dark footer wordmark** | existing wordmarks/portraits · dark footer brand moment |

**Stat-callout sourcing note:** the `35K/$8M/98%/100%` style numbers in the mockup are placeholders. Real figures must be backed by a register row before publishing (per `PRICING-LOCKED.md` forbidden-claims rule) — flag any unbacked stat to Kate rather than inventing one.

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

*Survey only. No imagery or code added, generated, or wired. North star: `outputs/visual-direction-2026-06-16.md` (+ `.png`). Cream is the base; dark pounamu is the measured accent, never dominant (Kate refinement 1). Every vessel render carries gold **data-node glints** — the vessel is the evidence pack and each glint is a piece of evidence held (Kate refinement 2). Lowercase `assembl` throughout; vessel imagery reserved for business/marketing surfaces; `/toro` gets warm whānau editorial or illustration; no chatbot/robot imagery anywhere.*
