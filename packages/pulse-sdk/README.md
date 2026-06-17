# @assembl/pulse-sdk

The client for **assembl Pulse** — the NZ in-product ad network. Fills the
"thinking…" wait state inside NZ software with one quiet, brand-safe line of
sponsored text. Publishers earn 55% of ad revenue.

## The trust contract

This SDK sends assembl **only** `{ publisherId, surface, context }`. It never
reads — and has no way to read — prompts, content, code, files, or user data.
`context` is a coarse, caller-supplied bag (e.g. `{ tool: 'manaaki' }`). Pass
nothing sensitive. That promise is the whole pitch; the code keeps it.

## Install (two lines)

```ts
import { pulse } from '@assembl/pulse-sdk';

pulse.init({ publisherId: 'xero-app' });
const ad = await pulse.show({ surface: 'spinner' });
```

## API

| Call | Returns | Notes |
|---|---|---|
| `pulse.init({ publisherId, endpoint? })` | `void` | Call once at startup. `endpoint` defaults to the live assembl Pulse server. |
| `pulse.show({ surface, context? })` | `Promise<PulseAd \| null>` | `null` when the auction is empty — show your own fallback line (fail-open). Never throws. |
| `pulse.click(impressionId)` | `void` | Records the click and navigates the browser to the ad's destination via the tracking redirect. |
| `pulse.dismiss(impressionId)` | `void` | Fire-and-forget dismissal beacon. |

`PulseAd` = `{ id, text, ctaUrl, impressionId }`. Render `text` in the wait
state; pass `impressionId` to `click()` / `dismiss()`.

## Build

```sh
node build.mjs              # ESM + CJS to dist/, asserts ≤5KB minified
tsc -p tsconfig.build.json  # emits dist/index.d.ts
```

## Test

```sh
vitest run                  # or `pnpm test` from the repo root
```

Built and run from Aotearoa. Accountable owner: Kate Hudson.
