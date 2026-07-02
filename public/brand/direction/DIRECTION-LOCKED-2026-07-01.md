# assembl visual direction — LOCKED 2026-07-01

Kate found the direction. This is it. Every surface follows.

Reference images live in this folder — treat them as canon:

- `hero-poster-mountains-wing.png` — the mood: silvery-gold particulate mountains + wing/bird form emerging from paper white, gold constellation top-right, `assembl` wordmark tiny centered bottom. Poster-grade art.
- `homepage-purpose-built.png` — homepage: Cormorant "Purpose-built agents. Limitless potential." lowercase serif hero, right half is a silver-gold particulate mountainscape with connectivity lines and star clusters. 5 bundle cards below (Communication / Trust / Workflow / Insights / Operations). Footer: `ADAPTIVE. CONNECTED. PURPOSE-BUILT.`
- `homepage-less-admin-more-mahi.png` — alternate homepage using existing "Less admin. More mahi." headline. Same silvery-gold particulate art on right. Trust bar of client logos (placeholder — see rules).
- `marketplace-floating-bundles.png` — /agents marketplace: "discover agents. explore purpose-built collections." with 5-6 bundle cards floating over the silver-gold mountain-and-wave landscape. Left sidebar navigation. `63 agents, 12 active` sparkline in the bottom left rail. User: `aroha kai · enterprise` (placeholder).
- `dashboard-matariki-moana-papatuanuku.png` — dashboard view: same landscape as backdrop with te reo labels on the visual metaphor — `matariki` (guiding intelligence above), `moana` (flowing connections), `papatūānuku` (grounded in data). Three bundle cards float above (trust · insights · workflow). Right rail shows a bundle detail with its member agents.

## The system

### Palette
- **Background**: warm paper white — `#FBFAF6` / `#F7F5EE`
- **Particulate art**: silvers, warm greys, cream — `#D8D6CE` / `#B5B0A2` with cool blue undertone `#8DA0B8`
- **Gold flecks**: warm champagne gold `#BFA37A` / soft gold `#D9B87A` — sparse, ornamental
- **Steely navy**: `#4A6B8C` — cool structural accent inside the art
- **Bronze / tan**: `#8A6B4E` — deep warm accent
- **Ink text**: `#1A1918` (kept)
- **Accent gold dot**: warm champagne `#BFA37A` — the tiny period after "advantage." and CTA emphasis. (PALETTE CORRECTION 2026-07-02: bright canary `#FFD42A`/`#F5C64B` is DEPRECATED on the marketing site, all pilot chrome, and all future surfaces — champagne gold `#BFA37A` is the accent everywhere.)

### Typography
- **Display + headings**: Cormorant Garamond, lowercase, tracked slightly loose, weight 400–500
- **Body**: Inter or similar quiet grotesk — small, warm grey `#5A5850`
- **Micro / labels**: uppercase tracked letter-spacing 0.16em (see `ADAPTIVE. CONNECTED. PURPOSE-BUILT.`)
- Rule: **lowercase everything on-brand**. Only the micro-labels are uppercase.

### Imagery
- Silvery-gold particulate mountain-and-wave landscapes as the hero backdrop across every page
- Constellation dot-and-line clusters top corners
- Feathered gold particulate wing forms as motion-suggesting overlay
- No stock photography. No illustrations. No emojis. Only this particulate landscape family.

### Motion
- Particulate landscape drifts slowly (5–10% opacity shift, 60s cycle)
- Constellation dots pulse softly (1.5s ease, 40% opacity range)
- Bundle cards levitate on hover (2–4px translate-y, 400ms ease)
- Prefers-reduced-motion → hold everything still, static particulate landscape as PNG

### Composition rules
- Massive whitespace — 60% of every screen is empty
- Never more than 2 lines of hero copy at once
- Sentences under 8 words
- Bundle card ornament = radial dot cluster (matariki constellation as a small graphic mark)
- Left sidebar rail navigation (marketplace / collections / activity / integrations / knowledge / settings)
- Right rail for context (bundle detail / collection member agents)
- Bottom: KPI trio (marketplace pulse / network activity / curated for you)

### Bundle names (visible on landing)
English, capability-first:
- **Communication** — crafts and delivers clear, on-brand communications across channels
- **Trust** — monitors risk, ensures compliance, builds confidence
- **Workflow** — designs, runs, optimises end-to-end processes
- **Insights** — turns data and signals into actionable insight
- **Operations** — keeps systems, teams and services running seamlessly
- **Knowledge** — organises and activates knowledge at scale

Te reo appears ONLY as **visual-metaphor labels** on the landscape art — never as bundle names, never as UI labels:
- `matariki` — the constellation above the mountains, tagline "guiding intelligence across systems"
- `papatūānuku` — the mountain / earth, tagline "grounded in data, rooted in purpose"
- `moana` — the wave / flow, tagline "flowing connections, endless potential"

These stay as poetic naming of the visual scene, not agent structure. Kate's rule: te reo where it earns its place, English where it's clearer.

## Hard rules

- **Placeholder client logos on `homepage-less-admin-more-mahi.png` (Fisher & Paykel Healthcare / R|C / Bremworth / MAIA / Vendella) are aspirational — do NOT ship real logos unless a signed partnership exists.** Use generic "trusted by teams across Aotearoa" text-only trust bar until real logos are earned.
- **Placeholder user `aroha kai · enterprise` is fictional** — safe to keep as demo persona label
- lowercase `assembl` always
- Kate Hudson (not Harland)
- Never fabricate metrics ("128 agents / 12 active" style — only show real numbers from Supabase)
- Preserve the "adaptive · connected · purpose-built" footer motto

## Priority build order

1. Homepage — `assembl.co.nz/` — hero + 6 bundle cards + trust bar
2. Marketplace — `assembl.co.nz/agents` — floating bundle cards over the landscape
3. Bundle detail — `assembl.co.nz/bundles/[slug]` — right-rail collection detail
4. Customer pilot pages — `demo.assembl.co.nz/[customer]` — customer's OWN brand primary, assembl chrome secondary in this direction

## Who consumes this

- **Live-sites task** (Fable 5, session `local_8ed4b2c2-190d-403e-8170-69133c4550ee`) — every pilot's assembl-chrome shell (footer, cross-brand lockup, loading state) uses this direction. Customer's own brand (Air NZ koru, EDR orange, Happy Tails editorial dog photography, Zoo safari orange) stays primary.
- **Visual direction task** (session `local_325e7b39-edad-4c51-b405-80468810a08f`) — this doc SUPERSEDES the abstract-stars-fauna brief in flight. Kate found the direction. Stop iterating on that; consume this.
- **Bundle audit task** (session `local_a1f90a5e-b257-45c2-8d36-3feded673020`) — the English bundle names above (Communication / Trust / Workflow / Insights / Operations / Knowledge) are Kate's proposed frame. Cross-reference with the audit's capability clusters. Te reo bundle names (Kōrero / Kererū / Tuna / Mycelium / Ruru) are OFF for landing chrome — they stay as internal codename ideas only until Kate confirms.
