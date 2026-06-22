# Dash — Components Build Brief (for the design skill)

**For:** the `frontend-design` skill (or any agent building React/Tailwind components).
**Context:** the `/dash` marketing site + loader already exist in this repo and were just
reworked to the **yellow + black, agentic-first, rewards-not-cash** direction. This brief
covers the **richer visual components** still to build — the ones that need real design
craft beyond copy/token edits.

Build these as reusable components under `components/dash/` (client components where they
animate), styled with the existing Dash tokens. Wire them into `app/dash/page.tsx`,
`/dash/rewards`, and a new `/dash/for-ai-builders` page.

---

## Brand tokens (locked — use these, don't invent)

| Token | Value | Use |
|---|---|---|
| Premium Yellow | `#FFC400` | primary canvas / backgrounds (`--bg`, `--gold`) |
| Hi-Vis Yellow | `#FFE600` | loader fill, highlights, accents on dark (`--hivis`) |
| Near Black | `#0A0A0A` | text, dog body, ink surfaces (`--fg`, `--accent`) |
| Ink card | `#141414` | cards on black |
| Reward Mint | `#00E6A8` | **success / "you earned" ONLY** (`--mint`) |
| Surface | `#FFFDF5` / `#FFFFFF` | cards on yellow |

- **Dominance rule:** each section is ~70% yellow OR black, never 50/50. Mint only for reward moments.
- **Motif:** the **dash-rule** — a dashed `– – –` divider (`<hr className="dash-rule">`, already in `dash-kit.css`). This REPLACES the old hazard-stripe motif. **No 45° hazard stripes anywhere** (explicit owner decision). Echo the literal dash (`dash–`) where natural.
- **Type:** display = the kit serif/grotesk already wired; **sponsored line + stat numbers must be monospace** ("honest terminal" signature) — add a `--ff-mono` (Space Mono / system mono) and apply it to those only.
- **Mascot:** glossy clay dachshund renders live in `public/dash/`: `dash-mascot-hero.png` (hero), `-side`, `-3q`, and per-brand `-airnz / -bp / -seek / -woolworths`. The dog **is** the loading bar; **no groove/hazard seams** on it.
- **A11y:** WCAG AA. Yellow text on white FAILS — only black-on-yellow or yellow-on-black. Respect `prefers-reduced-motion`. Mobile-first; Lighthouse ≥90.

---

## Components to build

### 1. `AgentWorkingHero` ⭐ (the flagship)
The hero visual: an "your AI agent is working" panel — the strategic centrepiece.
- A mock agent card: title ("Researching suppliers…"), a **step tracker "step 4 of 6"**, an **ETA "~4 min"**, and a thin progress bar.
- Beneath it, the **Dash slot**: one mono sponsored line + a reward chip ("+$0.04 → your KiwiSaver"), with the dachshund loader.
- Motion: progress ticks; the dog's body fills hi-vis; on "complete" it resolves to a **mint** tick + "you earned" chip (~the pay moment). ~1.5s loop. Gate on `prefers-reduced-motion`.
- Props: `task`, `step`, `totalSteps`, `etaMinutes`, `sponsoredLine`, `rewardText`.

### 2. `PhoneMock` + slottable `DashLoaderSlot`
A phone frame showing Dash inside a real-looking NZ app wait. Reused on Home / How-it-works / For-AI-builders.
- Props: `hostName`, `brandColour`, `adLine`, `rewardText`, `fillPct`.
- Use the per-brand recoloured mascots for host examples.

### 3. `GlossyMascotHero`
Swap the geometric SVG dog in the home hero for the **glossy `dash-mascot-hero.png`** render with a gold halo, soft float, and pointer-parallax tilt (reuse the existing `DashHero` motion pattern). Keep the SVG `Dog` for the functional loader; the render is for marketing hero only. Provide a reduced-motion static pose.

### 4. `BrandColourwayStrip` ("Dash in your brand's colours")
A horizontal strip on `/for-ai-builders` (and the white-label section) showing the 4 per-brand recolours (`dash-mascot-airnz/bp/seek/woolworths.png`) — proves white-label. Cards: brand name + the recoloured dog. Pull-quote: "your agents, your branding, our reward layer."

### 5. `CodeSnippet` (dash.show)
Mono code block with copy button for the two-line install:
```ts
import { dash } from '@assembl/dash-sdk';
dash.init({ publisherId: 'your-app' });
const ad = await dash.show({ surface: 'agent_working' });
```
Black surface, hi-vis keywords, mono.

### 6. `StatCallout`
Big mono number + label (e.g. "55% — publishers keep", "2 — lines of code", "step 4 of 6"). Yellow-on-black or black-on-yellow per section.

---

## New page to assemble: `/dash/for-ai-builders`
Lead audience per strategy. Sections: `AgentWorkingHero` → "add a reward layer to your agent in one line" (`CodeSnippet`) → white-label (`BrandColourwayStrip`) → enabler pitch (Assembl's own agents → Ambit → Xero JAX) → CTA to waitlist. Mono for the sponsored-line examples.

---

## Acceptance criteria
- Agentic story is unmistakable in the hero: a first-time visitor sees "reward the time AI spends working for you" within 10s.
- Yellow/black dominance respected; **mint only** on reward/success; **no hazard stripes**; dash-rule used as divider.
- Sponsored line + stats are monospace.
- Per-brand recolours shown (white-label proof).
- `prefers-reduced-motion` honoured; mobile Lighthouse Perf ≥90 / A11y ≥95; mascot PNGs served optimised (WebP/AVIF, lazy).
- No cash-per-wait promise anywhere; rewards lead, cash "coming soon".

---

## Already done (don't redo)
- Yellow+black token system, dash-rule motif, hi-vis loader + mint success tokens.
- `/dash/rewards` ladder page; `/dash/wallet` (demo) + atomic redeem migration.
- Agentic copy reframe on the home hero + audience doors (incl. "For AI builders").
- The functional SVG loader dog (no seams) and the rewards-not-cash payout picker.
