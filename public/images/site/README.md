# Assembl site imagery — `/public/images/site/`

Locked brand image set for the assembl marketing site. **Kate's 5 canonical
references are the single source of truth for visual style** (cream
backgrounds, sage / forest green accents, antique gold, translucent stacked
glass-disc vessel, photoreal editorial). Every supporting image must read
as part of that same family.

---

## Palette tokens (must match)

| Token | Hex | Where it appears |
|---|---|---|
| Cream paper | `#FAF7F2` | Default background of every cream surface |
| Cream warm | `#F7F3EE` | Subtle gradient toward warm shadow |
| Sage | `#A6B49A` (approx) | Glass-disc transitional tone in vessel |
| Forest green | `#2B6B57` | Deepest sage in vessel, used SPARINGLY as dark accent only |
| Antique gold | `#D9A85A` | Vessel wire frame, proof markers, hairline threads |
| Brass | `#B8964F` | Body-of-gold accents, hairline rules |
| Ink | `#3D4250` | Body type on cream |

**Cream is the base. Forest green is now a supporting accent only.**

---

## Canonical files (Kate's references — DO NOT regenerate)

### `hero-evidence-vessel.png` — primary hero
The signature image. Translucent stacked glass discs (cream / sage / forest
green tones) held in a delicate antique gold wire frame, photographed on
warm cream studio paper with soft natural daylight from upper-left. Gold
thread connects subtle proof-points on the disc surfaces.

**Slot:** `/` homepage hero — `<Hero variant="primary">`. Headline sits on
the left over the negative space.

### `vessel-cta-motif.png` — CTA / footer motif
Smaller version of the vessel in lower-right with a single gold thread of
light flowing OUT of it across the frame toward the left. Lots of negative
space.

**Slot:** "Let's build what's next." CTA card · pre-footer panel ·
"Want a pack tuned to your work?" cards.

### `vessel-macro-proof-detail.png` — macro detail
Extreme close-up of the glass discs with antique gold nodes connected by
gold thread — a constellation / data-graph laid onto the vessel.

**Slot:** `/toro` evidence pages · "How proof flows" detail card ·
hover-state imagery for kete-pack cards.

### `landscape-coast-aotearoa.png` — Aotearoa landscape band
Soft golden-hour NZ coast. Painterly editorial photography, sea fog,
dune-grass foreground, mountain headlands fading into mist.

**Slot:** full-bleed mid-page band on `/` · `/about` hero · the warm
"grounded in Aotearoa" moment on any page.

### `signal-threads-background.png` — section background texture
Cream background with flowing antique gold + pale sage signal threads and
scattered gold proof points. Calm, subtle data-flow texture.

**Slot:** large section background behind body copy (e.g. the "Pick the
pack for your work" section) · stats panel background ·
`/process` page header.

---

## Supporting files (generated this session)

### `signal-threads-band-horizontal.png` — 2400×400 thin band ✓
Horizontal band derived from `signal-threads-background.png` by cropping
the centre band where thread density is highest, resized to 2400×400.
**This is Kate's texture, just shaped as a thin divider.**

**Slot:** thin full-bleed divider between two sections — e.g. between the
kete-pack grid and the founder photo · top edge of the footer band.

### `founder-placeholder.png` — 800×800 ✓
Placeholder card matching the cream + forest-green + gold palette. Neutral
silhouette + "FOUNDER PHOTO — TODO" label.

**Slot:** wherever a founder portrait will eventually live.

**This is a placeholder.** Do not ship the live site with this in place.
Kate to provide a real portrait — direction will be:
*warm natural-light portrait, soft cream interior, subtle forest green
clothing or accent, antique gold pen on the desk, calm intelligent
expression, editorial photography.*

---

## Deferred to next session (Higgsfield quota exhausted today)

Both have locked prompts + reference media UUIDs saved in the
`assembl-brand-imagery` skill. Retry when the quota refreshes.

- **`hero-vessel-secondary.png`** — 1920×1080, cream bg, same glass-disc
  vessel from `hero-evidence-vessel.png` rotated ~30° clockwise with light
  source moved upper-right. **Slot:** `/kete` hero · `/pricing` hero · the
  alternate hero so the same image doesn't appear on every page.
- **`landscape-beach-westcoast.png`** — 2400×800, west-coast NZ black-sand
  beach in the same painterly editorial treatment as
  `landscape-coast-aotearoa.png`, but moodier overcast light. **Slot:**
  alternate landscape band on secondary pages.

---

## DEPRECATED files — removed

Five off-brand files from an earlier (superseded) generation pass were deleted
in the homepage-visuals PR (2026-06-17). They must not return:

- `hero-vessel-primary.png` — old translucent shell hero (off-brand vessel form)
- `hero-vessel-secondary.png` — old jade-spiral on dark pounamu (wrong palette)
- `hero-vessel-dark-v1.png` — old koru/feather form (wrong vessel concept)
- `vessel-divider-sparkles.png` — dark-pounamu sparkle band (replaced by `signal-threads-band-horizontal.png`)
- `landscape-coastal-kaipara.jpg` — earlier Kaipara take (replaced by `landscape-coast-aotearoa.png`)

Note: `hero-vessel-secondary.png` is also a **deferred** slot above — the name
will be reused for a new, on-brand render in a follow-up PR.

---

## Rules for any future image added here

Use:
- warm cream backgrounds
- sage / muted olive transitional tones in glass
- forest green only as a supporting accent (not dominant)
- antique gold for wire frames, proof markers, hairline thread lines
- soft natural daylight
- translucent stacked-glass-disc vessel form (with gold wire frame)
- delicate gold THREAD as the data-flow metaphor (NOT floating sparkle dots)
- subtle film grain
- photoreal editorial / documentary feel — like a real handcrafted object

Avoid:
- dark forest-green hero panels (we shifted off that direction)
- blue / neon "AI" imagery
- robots, chips, brains, circuit boards, dashboards
- generic SaaS / stock-photo corporate meetings
- floating magical sparkle dots (the thread is the metaphor, not glitter)
- illustrated / cartoony vessel forms
- random AI objects that don't relate back to the vessel + thread system
- text or place names burned into the image
- people in vessel or landscape slots

---

*Updated 2026-06-17. Direction locked by Kate (her 5 references are the
canonical set). Re-render the deferred two via the `assembl-brand-imagery`
skill once Higgsfield quota refreshes — never freeform prompt these.*
