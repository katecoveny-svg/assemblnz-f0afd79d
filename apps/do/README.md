# DO Agent OS v0 (PREVIEW)

Working name: **DO**. Behaviour: **See something → ✦ make agent.**

Promise: **DO anything from where you already are.** Surface ≠ agent — the floating ✦ is one launch surface; the agent is the portable **AgentSpec**.

Isolated DEMO / PREVIEW inside the assembl monorepo. Does **not** change the live homepage (`/`).

## What DO is (and is not)

| DO is | DO is not |
|-------|-----------|
| See something → ✦ make a **portable agent object** | ChatGPT / OpenAI consumer agent clone |
| **place / template / delete** AgentSpecs | Instinct-style messaging personal assistant |
| Home = **Wallet / Things cards** + Needs you | Chat threads as the home |
| Clear = vertical plain / **anti-slop** (secondary) | Grammarly grammar-first product |

Starter lessons kept: approval-gated consequential actions, ✦ make agent, AgentSpec watches/when/does/asks, plum side panel.

## How to try (fast path)

```bash
pnpm install
pnpm --filter @assembl/canvas build   # once, if needed
pnpm dev                              # http://localhost:3000/do
```

### Visual home (`/do`)

First viewport is **widgets**, not brochure copy:

1. Thin PREVIEW + runtime chips + differentiation lock chip
2. Giant living **✦** — primary make-agent control
3. **place · template · delete** verbs under the wordmark
4. Template pinboard + Mitre 10 · SAP DEMO tile
5. Wallet boards (Needs you / Working / Done)
6. Distribution layers plate (share / WhatsApp / keyboard / home-widget stubs)
7. DO Clear (secondary) + WhatsApp phone stub

### Share sheet / paste into DO

1. Open `/do/share` or use the **Paste / share into DO** plate
2. Paste text/URL → Make agent, or load the share DEMO fixture
3. Installable PWA manifest: `/do/manifest.webmanifest` with `share_target` → `POST /api/do/share`
4. **iOS Share Sheet → DO** when the native app exists (documented; not built in this PREVIEW)

### WhatsApp fixture sim

On `/do`, click **WhatsApp fixture sim** → `POST /api/do/message` with `{ surface: "whatsapp", demo: true }` → compiles a DEMO agent (no live webhook).

### DO Clear (grammar + anti-AI-slop)

1. On `/do`, use **DO Clear** — sample sloppy draft, underline marks, plain rewrite
2. Chrome extension: type in any `textarea` / `contenteditable` → chips under the field (paper/plum ✦, not purple Grammarly)
3. Side panel → **DO Clear · writing DEMO**
4. Honesty: local heuristics + Assembl-hosted runtime when keyed — **not Grammarly parity**

### Keyboard + Home widget (native stubs)

| Platform | Path | README |
|----------|------|--------|
| iOS Keyboard | `apps/do/ios/DoKeyboard/` | open in Xcode, Full Access warning |
| iOS Needs you widget | `apps/do/ios/DoNeedsYouWidget/` | WidgetKit stub, `do://needs-you` |
| Android IME | `apps/do/android/DoIme/` | open in Android Studio |
| Android Needs you | `apps/do/android/DoNeedsYouWidget/` | App Widget stub |

Linux CI cannot App Store / Play–build these — **compiling-ready stubs** only. Web preview plates on `/do` show keyboard chrome + Needs you mini board.

### Chrome extension

1. `chrome://extensions` → Load unpacked → `apps/do/extension`
2. Floating ✦ opens on-page sheet; Clear overlay watches editable fields
3. API base default `http://localhost:3000`

## Agents SDK spine

Hard jobs / compile / Clear prefer **OpenAI Agents SDK** patterns:

- `agent` + `tools` + `guardrails` + **human-in-the-loop** (`needsApproval`) for consequential acts
- Sessions + handoffs (Compile · Clear · Astra specialists)
- Commercial default remains **Assembl-hosted**

| Condition | Spine |
|-----------|--------|
| `OPENAI_API_KEY` or `AI_GATEWAY_API_KEY` set | `@openai/agents` adapter (`apps/do/shared/spine/openai-adapter.ts`) |
| No OpenAI key (Assembl DEMO / Anthropic-only) | Thin TS orchestrator matching the same concepts (`apps/do/shared/spine/orchestrator.ts`) |

Adapter interface: `apps/do/shared/spine/types.ts` (`DoAgentsSpine`).  
Resolver: `resolveDoSpineAsync()` in `apps/do/shared/spine/index.ts`.  
Runtime entry: `apps/do/shared/runtime.ts` → compile / Clear / Astra.

This is **not** a fake SDK. When the package cannot run (no key), the orchestrator is the durable DO contract the SDK adapter implements.

```bash
# dependency (workspace root)
pnpm add -w @openai/agents
```

Env:

```bash
DO_RUNTIME=assembl   # default — Assembl hosts inference
# DO_RUNTIME=byo     # Enterprise BYO later
# OPENAI_API_KEY=…   # enables Agents SDK adapter (also used for byo)
# AI_GATEWAY_API_KEY=…
```

## Runtime — Assembl hosts the agent

| Plan posture | Runtime |
|--------------|---------|
| Personal / Pro | **Assembl-hosted** included (`DO_RUNTIME=assembl`) |
| Enterprise | BYO later (`DO_RUNTIME=byo` + OpenAI key) |

Without keys: chip **Assembl runtime · DEMO** — deterministic compile + Clear + HITL still wired.

| Surface | Status |
|---------|--------|
| Chrome MV3 ✦ + Clear | live |
| Web `/do` Spatial Widget | live |
| Share / keyboard / home-widget | DEMO |
| WhatsApp | DEMO fixture sim (webhook stub) |
| SMS / Messenger | stubs |

## API map

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/do/agents/compile` | NL + page → AgentSpec (via spine) |
| `POST` | `/api/do/clear` | Clear rewrite + underline marks |
| `GET`  | `/api/do/runtime` | Assembl / BYO / DEMO + spine kind |
| `POST` | `/api/do/agents/:id/activate` | Activate |
| `POST` | `/api/do/agents/:id/tick` | Watch tick |
| `POST` | `/api/do/agents/:id/approve` | Approve / decline (HITL) |
| `DELETE` | `/api/do/agents/:id` | Delete |
| `POST` | `/api/do/message` | Common ingress (chrome/web/share/keyboard/whatsapp DEMO) |
| `POST` | `/api/do/share` | Web Share Target / paste intake |
| `GET`  | `/api/do/templates` | Catalog |
| `GET`  | `/api/do/agents?grouped=1` | Boards |
| `GET`  | `/api/do/surfaces` | Surface registry |

## DEMO honesty

- Thin PREVIEW + runtime chips
- Mitre / SAP fixtures are fictional
- Approve does not send/submit/pay externally
- Homepage `/` untouched
- Connectors + WhatsApp webhook stubs; **Hook later** default
- DO Clear is heuristics / runtime rewrite, not Grammarly
- Native keyboard/widgets are stubs — enable Full Access / IME only when you trust the API base
- Approve does not buy/book/send/post/submit/pay/sign externally

## Brand

Plum `#240B21`, heather `#916A70`, paper `#FFFDFB`. Instrument Sans + IBM Plex Mono. No bot avatars, purple AI gradients, or chat-first DO UI.
