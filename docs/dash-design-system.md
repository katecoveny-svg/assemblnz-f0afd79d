# Dash — Design System (LOCKED source of truth)

Canonical spec for the `/dash` surface, from the design handoff. **Do not drift.**
Tokens live in `app/dash/dash-kit.css`, `app/dash/dash.css`, `styles/dash-tokens.css`.

## Colour (exact)
| Token | Hex | Use |
|---|---|---|
| canary | `#FFD42A` | primary accent (`--gold` / `--pop`) |
| canary-2 | `#FFE27A` | light canary / gradients / loader glow (`--hivis`) |
| ink | `#3A3832` | charcoal text + dark surfaces (`--fg` / `--accent`) |
| body | `#56544B` | body text (`--muted`) |
| paper | `#FFFFFF` | canvas (`--bg` / `--surface`) |
| cream | `#FFF7EC` | soft fill / nested tiles (`--surface-2`) |
| hairline | `#EFEADC` | borders (`--line`) |
| gold-text | `#C79B1F` | eyebrow / accent text (`--gold-text`) |
| mono-muted | `#8A8678` | mono labels (`--mono-muted`) |

**No black, no green.** Charcoal (`#3A3832`) replaces black. Success = canary, never green
(the handoff's `#1AA06E` is intentionally not used in marketing). Yellow never as text on white —
use a canary **highlight underline** on charcoal text instead.

## Type
- **Lato** — display + UI. `900` headlines (tracking −.03 to −.05em), `700` buttons/labels, `400` body.
- **Space Mono** — technical voice: eyebrows (tracked caps .14–.18em), counters, code, "Sponsored".
- Loaded via `next/font` in `app/dash/fonts.ts` → `--font-dash-sans`, `--font-dash-mono`.

## Logo
- Wordmark **`dash`** (Lato 900, lowercase) **always closes with a canary dash-bar** — a pill
  (`.dashbar`, ≈0.5em × 0.16em, full radius, canary). The bar doubles as the loading bar.
- Motif: a **row of dashes** (`repeating-linear-gradient(90deg,#FFD42A 0 20px,transparent 20px 32px)`)
  — replaces hazard stripes everywhere.

## Signature loader — fill-the-dog
The dog **is** the loader; it fills bottom→top with progress. Component: `components/dash/FillDogLoader.tsx`
(ghost image + bottom-anchored clipped colour fill + glowing waterline). Asset: `public/dash/mascot-dog.png`.
Drive `progress` 0–100 from real agent progress; demo loops via `@keyframes dashFillRise`.

## Radius / shadow / motion
`--r-pill: 99px · --r-card/-lg: 26px · --r-tile/-md: 16px · --r-xl: 40px`.
`--shadow-md: 0 24px 60px rgba(180,150,40,.10)`. Easing `cubic-bezier(.22,.61,.36,1)`.

## Embed API (target shape)
```js
import Dash from '@assembl/dash';
Dash.init({ publishableKey: 'pk_…' });
const session = Dash.show({ context: 'agent', status: 'Reconciling invoices', steps: { current: 4, total: 6 } });
session.update({ current: 5 });
session.complete(); // "you earned $X"
```

## Voice
Dry, warm, fast, Kiwi. Mascot is charming, not gimmicky. See `docs/dash-messaging-brief.md`
for locked copy/vocabulary. Lead = **Dashhound Loader SDK**, never "ad network".

## Surfaces (design reference: the .dc.html files in the handoff package)
Marketing site (Birdie Direction) · Brand Guidelines · Logo System · App Wireframes · Social Ads ·
Interactive (scratch + mini-game) · Short Video · Investor One-Pager · SDK Reference · Email Kit.
