# Site cohesion audit — assembl.co.nz

**Date:** 17 September 2026  
**Scope:** Public site doors `/`, `/do`, `/pursuit`, `/creative-studio` (+ redirects), shared header/footer, demo honesty  
**Canon loaded:** `START_HERE.md`, `AGENTS.md`, `config/context-manifest.json`, `docs/context/CURRENT.md`, `docs/assembl-context.md`, `docs/assembl-brand-system.md`, `DESIGN.md`, `docs/assembl-copy-standard.md`  
**Architecture lock:** assembl the work — find it (Pursuit) · do it (DO) · show it (Studio). Factory underneath.  
**Brand lock:** deep plum `#240B21` / muted plum `#654A4E` / dusty rose `#916A70` / chalk `#F5F1F2` / paper `#FFFDFB`; Instrument Sans + IBM Plex Mono for evidence. No Jost / Cormorant / gold / brass / grape-purple / neon. Aotearoa is fine (soft preference).  
**Demo honesty:** never present personal / operator / PREVIEW as live personal product on the public site.

---

## Executive verdict

The three product doors and homepage **mostly share the plum + Instrument story**, but the public site still reads as **several products stitched together**:

1. **P0 — DO personal / operator leakage on splash-exempt public routes** (household private seed historically shipped real household PII in the client bundle; task seeds exposed engineering backlog + private GitHub PR URLs; meeting preview notes used real first names). Sibling urgent DO PRs may continue deeper runtime work — this audit + PREVIEW PR closes the public-facing honesty gap.
2. **P0/P1 — Fragmented Studio door** (`/creative-studio` live vs `/studio` workbench rewritten to home on apex).
3. **P1 — Chrome inconsistency** (ATW home / Pursuit / Studio own nav vs V2 global chrome vs DO utility dock).
4. **P1 — Legacy brand residue** (Cormorant / gold-thread / grape accents still in older component trees; DO appearance had lilac/violet chips).
5. **P2 — Long tail of concept demos** (`/genome`, `/a`, motion/pattern studios, etc.) still live without a clear LIVE vs PREVIEW map for visitors.

---

## Route register

| URL | Live status (apex `www.assembl.co.nz`) | What it shows | Nav/footer | Recommendation | Priority |
|---|---|---|---|---|---|
| `/` | **LIVE** (200) | Assembl The Work home — find / DO / show; plum + Instrument; own ATW chrome | Product links OK (`/pursuit`, `/do`, `/creative-studio`) | **KEEP LIVE** | — |
| `/do` | **LIVE** (200, splash-exempt) | Portable DO workforce; plum D mark; spatial / reveal | Own DO chrome (Office / Builder / Tasks / …) | **KEEP LIVE** + keep demos honest | P1 chrome unify |
| `/do/tasks` | **LIVE** (200, `noindex`) | Per-DO task rollup; was seeded with operator engineering backlog + private PR links | Linked from DO chrome | **FIX** → demo seeds only; keep noindex | **P0** |
| `/do/household` | **LIVE** (200, splash-exempt) | Household Floor; public scrubbed template + (was) owner-private install | Linked from DO home specialists | **FIX** → public template only; noindex; private install closed on public | **P0** |
| `/do/meetings` | **LIVE** (200) | Meeting DO; `?previewNotes=1` sample used real names | DO surfaces | **FIX** → fictional sample names; noindex | **P0** |
| `/do/family` | **LIVE** (200, noindex) | School-admin inbox pilot | Specialist link | **PREVIEW-ONLY** / badge | P1 |
| `/do/office`, `/do/builder`, `/do/connections`, … | **LIVE** prototypes | Mixed maturity; some PREVIEW copy | DO dock | **DEMO-BADGE** where not productised | P1 |
| `/do/linda` | **Redirect** → `/do/tasks` | Legacy personal name in URL | Bookmarks | **RETIRE** redirect after grace; never revive name | P1 |
| `/pursuit` | **LIVE** (200, splash-exempt) | Pursuit landing — find it | Own / shared product nav OK | **KEEP LIVE** | — |
| `/pursuit/playground` | **PREVIEW** (merged capability) | NZBN / journey playground | Linked from Pursuit | **PREVIEW-ONLY** — do not claim live client integrations | P1 |
| `/creative-studio` | **LIVE** (200, splash-exempt) | Studio product door (show it) | Nav “Studio” → here | **KEEP LIVE** | — |
| `/studio` | **Apex rewrite → home** (middleware); works on preview hosts | Agent workbench / gold-thread residue | Not in primary nav (good) | **PREVIEW-ONLY** — never label as public Studio | **P0** clarity |
| `/studio/do-maker` | Preview host / gated | Task DO Maker | Studio subtree | **PREVIEW-ONLY** | P1 |
| `/about`, `/contact`, `/legal/*` | Live | Company / legal | Footer OK | **KEEP LIVE** | — |
| `/genome`, `/a`, `/motion-studio`, `/pattern-studio`, … | Live concept demos | Mixed brand eras | Footer/concept lists | **PREVIEW / concept map** or retire from public lists | P2 |
| Legacy cinematic / editorial footers | In-tree, mostly unmounted | Champagne / Cormorant-era | Dead chrome | **RETIRE** from tree when safe | P2 |

### Middleware / splash (runtime truth)

- Splash gate on apex hosts rewrites non-exempt paths to `/` (URL may stay).
- Exempt product doors include `/`, `/do`, `/pursuit`, `/creative-studio`.
- `/studio` is **not** splash-exempt on apex → visitors land on homepage content (confirmed live title). Document as intentional until Studio IA is unified.

---

## Brand tokens by door

| Surface | Tokens / fonts | D mark | Drift |
|---|---|---|---|
| Home (ATW) | Plum / chalk / Instrument | Soft product strip | Aligned |
| Pursuit | Plum / Instrument | — | Aligned |
| Creative Studio door | Plum / Instrument | — | Aligned |
| DO home / reveal | Plum + dusty rose blooms; Instrument | SVG D + dot (not grape PNG) | Appearance chips were lilac/violet (**fixed in PREVIEW PR**); canvas accent was lilac (**fixed**) |
| V2 chrome | Plum canon; forbids gold/Cormorant/grape in comments | Wordmark | Aligned when shown |
| `/studio` workbench | Gold-thread residues historically | — | **Do not promote** |
| Legacy globals / vessel / EvidenceDrawer | Cormorant, gold-thread, pounamu | — | Residual; keep off public doors |

---

## Nav / footer cohesion

| Chrome | Where used | Links | Status |
|---|---|---|---|
| ATW home nav/footer | `/` | Pursuit, DO, Studio→`/creative-studio`, Contact, Privacy | **OK** |
| `PUBLIC_NAV_LINKS` + V2 | Non-own-chrome marketing pages | Pursuit, DO, Studio, About + Try DO | **OK** |
| Site footer | Same suppression list as V2 | Pursuit, DO, Studio, Contact, About, Privacy | **OK** |
| DO dock / home header | `/do/*` | Office, Builder, Tasks, Meetings, Connections, Household… | **OK structure** / **honesty risk** on destinations |
| Dead `SiteHeader` / cinematic / editorial footers | Mostly unmounted | Old marketplace / champagne paths | **Stale** — do not remount |
| Command palette | Residual | Marketplace / operator routes | **Wrong** if exposed publicly |

**Personal leak flags**

- `/do/household?install=owner-private` historically installed a client-bundled seed with real names, schools, and street addresses (**scrubbed + public install closed in PREVIEW PR**).
- `/do/tasks` seed boards linked private GitHub PRs and read as Kate’s engineering backlog (**demo-scrubbed in PREVIEW PR**).
- `/do/meetings?previewNotes=1` used Kate/Adrian (**fictionalised in PREVIEW PR**).
- `/do/linda` → `/do/tasks` keeps a personal name in redirect map (**retire**).

---

## Recommendations summary

### P0 — do now (this PREVIEW PR + any sibling DO PR)

1. **Close public owner-private Household install**; never ship real household PII in the web bundle.
2. **Demo-only `/do/tasks` seeds**; no private repo URLs.
3. **Fictional Meeting DO sample notes**; `noindex` on household/meetings.
4. **State clearly:** public Studio door is `/creative-studio`; `/studio` is not the public Studio.

### P1 — next cohesion PR

1. Single public chrome story across home / Pursuit / DO / Studio (or intentional product-owned chrome with identical link targets).
2. PREVIEW badges on `/do/family`, sponsored, browser, playground, do-maker.
3. Remove or gate `/do/linda` redirect; scrub “Linda” legacy storage prefixes from public docs.
4. Strip lilac/grape DO customisation leftovers site-wide; replace gold-thread on any still-linked surfaces.

### P2 — cleanup

1. Concept-demo inventory with LIVE / PREVIEW / CONCEPT labels in one public map (or remove from footers).
2. Delete unmounted cinematic/editorial chrome when imports are proven dead.
3. Align leftover docs that still say Jost/Cormorant/gold as company defaults.

---

## Sibling work note

Kate flagged that an urgent sibling PR may also be fixing public `/do` personal leakage. This audit treats **runtime honesty on public routes** as non-negotiable regardless: even if deeper DO auth/storage work lands elsewhere, the public bundle must not contain owner-private household context or operator backlog seeds.

---

## Proof expectations for cohesion fixes

- Unit tests: household templates have no real address/school/name markers; task seeds have no private GitHub hosts.
- Manual: `/do/household` shows public template only; private CTA refuses; `/do/tasks` shows demo language; `/` `/pursuit` `/do` `/creative-studio` share product door targets.
- Do **not** merge without explicit authority. Draft PREVIEW PR only.
