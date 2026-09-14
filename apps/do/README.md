# DO Agent OS v0 (PREVIEW)

Working name: **DO**. Behaviour: **See something → ✦ make agent.**

This is an isolated DEMO / PREVIEW surface inside the assembl monorepo. It does **not** change the live homepage (`/`, CinematicJourneyHome) or the One NZ / Evidence / Operator journeys.

## What ships

1. **Chrome MV3 extension** — `apps/do/extension/`
   - Floating ✦ on any http(s) page
   - Side panel / popup UI
   - Captures URL, title, selected text, truncated page text
2. **Compile API** — `POST /api/do/agents/compile`
   - NL brief + page context → **AgentSpec** JSON
   - Persists agents locally under `apps/do/data/agents.json` (gitignored) when writable; in-memory fallback otherwise
3. **Approval policy (hard)** — server-side only
   - `buy` / `book` / `send` / `post` / `submit` / `pay` / `sign` always need a human yes
   - The model never decides risk tier (v0 compile is deterministic and still runs policy after)
4. **DO home UI** — `/do`
   - Three boards only: **Needs you** / **Working** / **Done**
   - Primary CTA: ✦ make agent
   - Agent cards (not chatbot threads)
5. **Five NZ-flavoured DEMO templates** — fixtures honest, no scraping of locked sites

## How to run locally

### 1. App + API

From the repo root (same as assembl):

```bash
pnpm install
pnpm --filter @assembl/canvas build   # once, if needed
pnpm dev                              # http://localhost:3000
```

Open **http://localhost:3000/do**

### 2. Load the unpacked extension

1. Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select `apps/do/extension`
4. Pin DO · make agent

Optional: in the side panel, expand **API base** if your app is not on `http://localhost:3000`.

### 3. One ✦ make agent flow

1. Visit any public page (e.g. a product listing)
2. Click the floating **✦** (or the extension icon)
3. Keep / type: `tell me if this changes`
4. **✦ compile** → readable AgentSpec card
5. **Activate** → appears under **Working** (or **Needs you** if a consequential step is queued)
6. Confirm on **http://localhost:3000/do**

You can also compile from the `/do` page itself, or click a DEMO template.

## API map

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/do/agents/compile` | NL + page → AgentSpec (persisted) |
| `GET`  | `/api/do/agents` | List agents (`?grouped=1` for boards) |
| `GET`  | `/api/do/agents/:id` | One agent |
| `POST` | `/api/do/agents/:id/activate` | Activate |
| `POST` | `/api/do/agents/:id/approve` | Approve / decline a pending item |
| `GET`  | `/api/do/templates` | Five DEMO templates + fixtures |

### AgentSpec shape

```json
{
  "name": "Watch · Weekend deal",
  "watches": ["https://…"],
  "looks_for": ["price changes", "…"],
  "can_do_without_asking": ["snapshot the page text", "…"],
  "must_ask_before": ["send me a notification off this device"],
  "never": ["buy, book, send, post, submit, pay, or sign without a human yes", "…"],
  "primitive": "watch"
}
```

Primitives: `watch` | `find` | `extract` | `prepare` | `compare`.

## DEMO honesty

- Marked **PREVIEW / DEMO** on `/do` and in the extension.
- Persistence is local JSON / memory — fine for trying the spine, not multi-device sync.
- Approving a consequential action in DEMO records your yes; it does **not** buy, book, send, post, submit, pay, or sign externally.
- GETS / kids / quote templates use **fixtures**, not live locked-site scrapes.
- Gmail / Xero OAuth are out of scope (stubs only if added later).
- No agent store, payments, agent-social, or health vertical in v0.

## Brand

- Plum `#240B21`, heather `#916A70`, paper `#FFFDFB`
- Instrument Sans + IBM Plex Mono on `/do` (inherits assembl root fonts)
- No bot avatars, purple AI gradients, or chatbot-first chrome

## Layout in the monorepo

```
apps/do/
  README.md          ← you are here
  shared/            ← types, policy, compile, templates, store, fixtures
  extension/         ← Chrome MV3
  data/              ← local agents.json (gitignored)
app/do/              ← Next.js UI mount
app/api/do/          ← Next.js route handlers
```

`/do` is splash-exempt so it serves on assembl.co.nz without rewriting to the homepage. It is **not** linked from the marketing homepage nav.
