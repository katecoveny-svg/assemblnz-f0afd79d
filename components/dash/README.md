# Dash Loader

`dash by assembl` — a production, accessible **three-mode** loading component.
One segmented dachshund, three very different revenue flows. Phase 0: all three
modes work against stubbed backends.

```tsx
import { DashLoader } from '@/components/dash';

<DashLoader
  mode={{ kind: 'consumer', userSettings }}
  status="processing"
  displayMessages={['loading.', 'loading..', 'loading...']}
  onSettingsChange={setUserSettings}
/>
```

> **Privacy posture (non-negotiable):** the loader never reads page content,
> prompts, files, code, or any user data. It renders wait-state UI and, in ad
> modes, a sponsor line resolved by mode + NZ geo only. See the header comment in
> `DashLoader.tsx`.

---

## The three modes

| Mode | Who opts in | Revenue | Ads? | Sponsored label | Destination chip |
| --- | --- | --- | --- | --- | --- |
| `consumer` | The end user (opt-in, OFF by default) | Micro-revenue → keep or donate | Yes (NZ fill) | **Yes** | Yes |
| `whitelabel` | The SaaS, by contract | Monthly SaaS subscription | No | No | No |
| `publisher` | The publisher, by contract | Rev-share 55% (60% anchor) | Yes (assembl-fill) | **Yes** | No |

```ts
type DashLoaderMode =
  | { kind: 'consumer'; userSettings: ConsumerSettings }
  | { kind: 'whitelabel'; brandConfig: WhitelabelConfig }
  | { kind: 'publisher'; publisherId: string; revShareTier: 'standard' | 'anchor' };
```

All three share the dog SVG, the segment-fill animation, the gold shine sweep,
the cycling messages, and (ad modes only) the ASA "Sponsored" pill.

### `consumer` — opt-in, "Mahi for Good"

- Renders the **opt-in surface** when `userSettings.optedIn === false` (unless
  `hideOptInSurface`): headline, body, an accessible switch (OFF by default),
  the destination picker, the IPP 3A disclosure, a **required** consent
  checkbox, and "Save settings" / "How it works →".
- **Keep it** → Prezzy / Airpoints / Bank (Stripe Connect). **Donate it** →
  🐾 SPCA NZ (default) / 🌳 Trees That Count / 🍎 Foodbank NZ.
- Settings persist to `localStorage` (`dash_loader_settings_v1`) and flow up via
  `onSettingsChange` (wire that to the signed-in profile sync). Use
  `<DashLoaderProvider>` to share one opt-in decision across a session.
- During processing: dog + sponsor line + cycling messages + a destination chip
  (`→ SPCA NZ`, click to change). Success: tail wags, micro-toast. Error: ears
  droop, body resets to sage, `errorMessage` shows.

### `whitelabel` — B2B custom-branded

- No opt-in, no ads, no payout, **no Sponsored label**.
- Pass `brandConfig.customSvg` to replace the dog, or `brandConfig.brandColour`
  to tint the dachshund. `brandConfig.customerLogo` renders above the mascot.
- `brandConfig.internalMessages` cycle inside the mascot body (micro-learning /
  feature highlights). Telemetry → `/api/dash/whitelabel/impression`.

### `publisher` — embedded ad SDK (assembl-fill)

- No opt-in surface (contractual). Sponsor line + Sponsored label always on.
- `revShareTier`: `standard` (55%) or `anchor` (60%, first three publishers).
  Telemetry → `/api/dash/impression`; settles via `/api/dash/payout/settle`.

---

## Props

See `types.ts` for the full surface. Key props:

| Prop | Notes |
| --- | --- |
| `mode` | The discriminated union above. |
| `status` | `'idle' \| 'processing' \| 'success' \| 'error'`. |
| `displayMessages?` | Cycled below the dog (consumer + publisher). Whitelabel uses `brandConfig.internalMessages`. |
| `onSettingsChange?` | Consumer only — fires on save with the new `ConsumerSettings`. |
| `sponsorLine?` | Override the fill; otherwise fetched from `/api/dash/sponsor`. |
| `errorMessage?` | Shown during `error`. |
| `hideOptInSurface?` | Force-hide the consumer opt-in card. |

---

## Design tokens

Lifted verbatim from the locked kit (`dash-kit.css`) into
[`styles/dash-tokens.css`](../../styles/dash-tokens.css), **scoped to a
`[data-dash]` wrapper** so the Dash palette (cream · forest · sage, gold accent)
never bleeds into the rest of assembl.co.nz (Mārama Whenua). Gold `#E0B16E` is
reserved for the wordmark full-stop, the focus ring and the sparkle only.

Type: **Cormorant Garamond** 500 (display, never italic on the wordmark) +
**Mulish** 400–800 (UI), loaded via `next/font/google` in
[`app/dash/fonts.ts`](../../app/dash/fonts.ts) and exposed as
`--font-dash-display` / `--font-dash-body`. Motion uses the locked easing
`cubic-bezier(.22,.61,.36,1)` — no bounce / spring.

**To embed elsewhere:** render inside an element carrying `data-dash`, apply the
font variables from `dashFontVars`, and import `styles/dash-tokens.css` once.

The dog geometry (viewBox 1040×470) is ported verbatim from the handoff and is
tintable via the `--dog-body` / `--dog-groove` / `--dog-ink` custom properties;
it is never redrawn.

---

## ASA + Privacy Act compliance posture

- **Opt-in is real** — consumer default is OFF; saving an opt-IN is blocked until
  the IPP 3A disclosure checkbox is ticked (`canSaveOptIn`). No dark patterns.
- **"Sponsored" label** is always visible in ad modes during processing — never
  below 12px, never `opacity < 0.7`, never obscured (`.sponsoredPill`).
- **Privacy Act 2020 IPP 3A** — the disclosure is shown verbatim and must be
  acknowledged: _"…No content, prompts, files or code are read. IP used only for
  NZ geo-confirmation."_
- **`prefers-reduced-motion`** — the dog renders static (segments filled, no
  shine, no message rotation); sponsor + destination still show.
- **No content reading** — documented at the top of `DashLoader.tsx`.

## Accessibility

- `role="status"` + `aria-live="polite"` on the loader; an SR-only line narrates
  state changes. Roles/`aria-checked`/`aria-current` on switch, radios, charity
  cards. Gold focus-visible ring on every interactive element. 44×44px touch
  targets. WCAG 2.1 AA contrast (forest on cream, ink on surface, gold on forest).

---

## Charity partnership flow (Phase 0 → real)

Donations route by `CharityId` (`spca-nz` · `trees-that-count` · `foodbank-nz`).
Phase 0 logs the impression and returns mocked revenue; the real payout wires to
Stripe Connect (`acct_1TCqv7PXAX9ohARR`) for "keep it" + publisher rev-share, and
to each charity's payout API for "donate it". Search the routes for
`TODO(stripe-connect)`, `TODO(spca-api)`, `TODO(trees-that-count-api)`,
`TODO(foodbank-nz-api)`.

---

## Stub API routes

| Route | Purpose |
| --- | --- |
| `GET /api/dash/sponsor` | Rotating mocked NZ-brand fill (`Westpac Small Biz`, `Air NZ`, `Comvita`). |
| `POST /api/dash/impression` | Consumer + publisher impression → mocked `{ revenueGenerated }`. |
| `POST /api/dash/whitelabel/impression` | Whitelabel usage → `{ ok: true }` (subscription metering). |
| `POST /api/dash/payout/settle` | Mocked `{ totalRevenue, splitByDestination }` for a period. |

## Demos

- **`/dash/demo`** — all three modes side-by-side, cycling idle → processing →
  success → error.
- **`/dash/loader`** — a live, persisted consumer-mode demo (opt in, pick a
  cause, run a wait).

> **Note on the landing.** The brief asked for the consumer demo to live on the
> `/dash` landing (`app/dash/page.tsx`). That path is owned by the in-flight
> Beat→Dash rename (PR #424), so to avoid clobbering that landing the live demo
> ships at `/dash/loader`. To drop it into the real landing post-merge:
>
> ```tsx
> import { DashLoaderProvider } from '@/components/dash';
> import { ConsumerDemo } from '@/app/dash/loader/ConsumerDemo';
> // …inside the landing, within a `data-dash` + dashFontVars wrapper:
> <ConsumerDemo />
> ```

## Tests

`pnpm test` (Vitest, node env): `components/dash/logic.test.ts` covers the pure
logic (sponsor rotation, payout splits, settings (de)serialization, the IPP 3A
gate, mode helpers); each `app/api/dash/**/route.test.ts` covers a stub route.

**Deferred:** jsdom component + `vitest-axe` render tests. The repo's Vitest is
node-only and adding the jsdom/RTL/axe toolchain means a lockfile change against
a pnpm workspace whose `pnpm-workspace.yaml` is untracked — not worth risking the
live Vercel build mid-#424. The component implements every a11y requirement
above; the render/axe layer is a fast follow once #424 settles.
