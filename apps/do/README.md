# DO Agent OS v0 (PREVIEW)

Working name: **DO**. Behaviour: **See something → ✦ make agent.**

Promise: **DO anything from where you already are.** Surface ≠ agent — the floating ✦ is one launch surface; the agent is the AgentSpec.

Isolated DEMO / PREVIEW inside the assembl monorepo. Does **not** change the live homepage (`/`, CinematicJourneyHome) or One NZ / Evidence / Operator journeys.

## How to try (fast path)

```bash
pnpm install
pnpm --filter @assembl/canvas build   # once, if needed
pnpm dev                              # http://localhost:3000/do
```

### Visual home (`/do`)

First viewport is **widgets**, not brochure copy:

1. Thin **PREVIEW** + **Assembl runtime · DEMO** chips
2. Giant living **✦** — primary make-agent control
3. Template **widget tiles** (bento) — one-line job max; right-click to pin
4. **Mitre 10 · SAP** DEMO tile (geometric mark, logo-free)
5. Scroll for Wallet boards (Needs you / Working / Done), **DO Clear** mini-overlay, WhatsApp phone stub

### Floating ✦ widget on `/do`

1. Click the floating **✦** (bottom-right) or the giant orb
2. Context chips show URL / title / selection
3. Pick a template, or type a brief → compile via Assembl-hosted runtime
4. Review AgentSpec → optional connector stub → **Activate**
5. Lands in Working / Needs you with Evidence

### Mitre 10 · SAP pursuit DEMO

1. Click the **Mitre 10 · SAP** tile
2. Widget opens on `mitre10-sap-rfp-brief` with fictional RFP fixture context
3. Activate → Needs you + Evidence (draft only — nothing sent)

### Chrome extension

1. `chrome://extensions` → Developer mode → **Load unpacked** → `apps/do/extension`
2. Open any http(s) page → floating **✦** opens an on-page compact sheet
3. Side panel remains available as a second surface
4. Set API base to `http://localhost:3000` if needed

## Runtime — Assembl hosts the agent

**Product default:** Assembl supplies inference inside the subscription. Not “bring your own API” as the default.

| Plan posture | Runtime |
|--------------|---------|
| Personal / Pro | **Assembl-hosted** included (`DO_RUNTIME=assembl`, default) |
| Enterprise | BYO later (`DO_RUNTIME=byo` + `OPENAI_API_KEY` / gateway) |

Implementation: `apps/do/shared/runtime.ts`

- Provider id: `assemblHosted` (default)
- Reuses `lib/ai/router.ts` (`generateWithFallback` + model ladder) when keys exist
- Without keys: **hosted DEMO mode** — deterministic compile + Clear heuristics still wired; chip reads **Assembl runtime · DEMO**
- Clear rewrite: `POST /api/do/clear`
- Status chip: `GET /api/do/runtime`
- Compile path: `POST /api/do/agents/compile` → `runtimeCompile`

Env (see `.env.local.example`):

```bash
DO_RUNTIME=assembl   # or byo
# OPENAI_API_KEY=…   # only required for byo live
# AI_GATEWAY_API_KEY=…  # optional byo gateway
```

## Architecture

```
context + intent → AgentSpec → tools → permissions → outcome
         ↑
   Assembl-hosted runtime (or BYO / DEMO)
```

| Surface | Status |
|---------|--------|
| Chrome MV3 ✦ (on-page sheet) | live (MVP) |
| Web `/do` floating ✦ + widget stage | live (MVP) |
| DO Clear overlay demo | live (heuristics + hosted rewrite) |
| WhatsApp / SMS / Messenger | stubs / phone chrome DEMO only |

### Runtime routing (not a chatbot)

| Job class | Lane | Example |
|-----------|------|---------|
| Simple single-source | **local** Watch / primitive | power price change |
| Multi-source / compare / find | **Astra-class** (Assembl-hosted stub) | quote compare, GETS-like find |

## Launch template catalog

Data-driven registry in `apps/do/shared/templates.ts` — served by `GET /api/do/templates`.

## API map

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/do/agents/compile` | NL + page → AgentSpec (via runtime) |
| `POST` | `/api/do/agents/:id/activate` | Activate (`{ connector? }`) |
| `POST` | `/api/do/agents/:id/tick` | Watch tick (`{ simulateChange? }`) |
| `POST` | `/api/do/agents/:id/approve` | Approve / decline |
| `DELETE` | `/api/do/agents/:id` | Delete |
| `GET`  | `/api/do/templates` | Catalog + groups + connector stubs |
| `GET`  | `/api/do/agents?grouped=1` | Boards |
| `GET`  | `/api/do/runtime` | Assembl / BYO / DEMO status |
| `POST` | `/api/do/clear` | Clear rewrite + underline marks |
| `POST` | `/api/do/message` | Common surface ingress |
| `GET`  | `/api/do/surfaces` | Live + stub surfaces |

Primitives: `watch` | `find` | `extract` | `prepare` | `compare`.

## DEMO honesty

- Thin PREVIEW + runtime chips (not banner novels)
- Mitre 10 / SAP pack uses **fictional** fixtures — not a live Mitre 10 or SAP system
- Connector picker is stubs only; **Hook later** is the default
- Approve records your yes; does **not** buy/book/send/post/submit/pay/sign externally
- Without model keys the runtime still works and labels **Assembl runtime · DEMO**
- Homepage `/` untouched

## Brand

Plum `#240B21`, heather `#916A70`, paper `#FFFDFB`. Instrument Sans + IBM Plex Mono. No bot avatars, purple AI gradients, or chat-first DO UI. Respect `prefers-reduced-motion`.
