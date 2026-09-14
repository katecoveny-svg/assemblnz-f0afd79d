# DO Agent OS v0 (PREVIEW)

Working name: **DO**. Behaviour: **See something → ✦ make agent.**

Promise: **DO anything from where you already are.** Surface ≠ agent.

Isolated DEMO / PREVIEW. Does **not** change the live homepage (`/`).

## How to try (fast path)

```bash
pnpm install
pnpm --filter @assembl/canvas build   # once, if needed
pnpm dev                              # http://localhost:3000/do
```

### Floating ✦ + Mitre DEMO

1. Open `/do` → floating **✦** (bottom-right)
2. Pick a launch template or type a brief → AgentSpec → Activate
3. **Mitre 10 · SAP pursuit DEMO** → fixture RFP → Activate → Needs you + Evidence

### Share sheet / paste into DO

1. Open `/do/share` or use the **Paste / share into DO** plate
2. Paste text/URL → Make agent, or load the share DEMO fixture
3. Installable PWA manifest: `/do/manifest.webmanifest` with `share_target` → `POST /api/do/share`
4. **iOS Share Sheet → DO** when the native app exists (documented; not built in this PREVIEW)

### WhatsApp fixture sim

On `/do`, click **WhatsApp fixture sim** → `POST /api/do/message` with `{ surface: "whatsapp", demo: true }` → compiles a DEMO agent (no live webhook).

### DO Clear (grammar + anti-AI-slop)

1. On `/do`, use the **DO Clear** plate — sample sloppy draft, chips, plain rewrite, “Make agent: keep clear”
2. Chrome extension: type in any `textarea` / `contenteditable` → chips under the field (paper/plum ✦, not purple Grammarly)
3. Side panel → **DO Clear · writing DEMO**
4. Honesty: local heuristics + stub rewrite — **not Grammarly parity**

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

## Architecture

```
context + intent → AgentSpec → tools → permissions → outcome
```

| Surface | Status |
|---------|--------|
| Chrome MV3 ✦ + Clear | live |
| Web `/do` + floating ✦ | live |
| Share / keyboard / home-widget | DEMO |
| WhatsApp | DEMO fixture sim (webhook stub) |
| SMS / Messenger | stubs |

## API map

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/do/agents/compile` | NL + page → AgentSpec |
| `POST` | `/api/do/agents/:id/activate` | Activate (`{ connector? }`) |
| `POST` | `/api/do/message` | Common ingress (chrome/web/share/keyboard/whatsapp DEMO) |
| `POST` | `/api/do/share` | Web Share Target / paste intake |
| `POST` | `/api/do/clear` | DO Clear scan + optional stub rewrite |
| `GET`  | `/api/do/templates` | Catalog + groups + connectors |
| `GET`  | `/api/do/agents?grouped=1` | Boards |
| `GET`  | `/api/do/surfaces` | Surface registry |

## DEMO honesty

- Homepage `/` untouched
- Mitre/SAP fixtures fictional
- Connectors + WhatsApp webhook stubs; **Hook later** default
- DO Clear is heuristics, not Grammarly
- Native keyboard/widgets are stubs — enable Full Access / IME only when you trust the API base
- Approve does not buy/book/send/post/submit/pay/sign externally

## Brand

Plum `#240B21`, heather `#916A70`, paper `#FFFDFB`. Instrument Sans + IBM Plex Mono. No bot avatars, purple AI gradients, or chat-first DO UI.
