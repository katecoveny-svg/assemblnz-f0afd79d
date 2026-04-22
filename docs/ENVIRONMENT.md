# Environment Variables — Assembl Chat Pipeline

This document lists every environment variable / secret used by the Assembl
chat pipeline, where it is consumed, and what happens if it is missing.

All secrets live in **Lovable Cloud** (Supabase project secrets) and are
injected into edge functions at runtime via `Deno.env.get(...)`. Frontend
build-time variables are exposed to the Vite client via the `VITE_` prefix
in `.env`.

> **Never** hard-code these values. **Never** call third-party model APIs
> directly from the browser — always proxy through an edge function so the
> key stays server-side.

---

## 1. Frontend build-time (`.env`, prefixed with `VITE_`)

These are **publishable** values safe to ship to the browser.

| Name | Used by | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | `src/integrations/supabase/client.ts`, `src/lib/mcpChat.ts` | Base URL for Supabase REST + edge functions (e.g. `${VITE_SUPABASE_URL}/functions/v1/mcp-chat`). |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `src/integrations/supabase/client.ts` | Anon/publishable key used by the browser SDK. |
| `VITE_SUPABASE_PROJECT_ID` | Misc client helpers | Project ref for constructing function URLs when needed. |
| `VITE_MAPBOX_TOKEN` | Map components (Voyage, Command Mode) | Public Mapbox token. Not used by chat pipeline directly. |

---

## 2. AI model providers (chat-critical)

These power the streaming chat endpoints. The browser hits one of two edge
functions, which then call the upstream provider with the appropriate key.

### `LOVABLE_API_KEY`
- **Auto-provisioned by Lovable Cloud** — never ask the user for this.
- Used by: `supabase/functions/mcp-chat/index.ts`, `supabase/functions/compress-context/index.ts`, every other function that calls `https://ai.gateway.lovable.dev/v1/chat/completions`.
- Provides access to Google Gemini (2.5/3.x) and OpenAI GPT-5 family models through the Lovable AI Gateway.
- **Missing →** all gateway-routed chats (Manaaki, Waihanga, Auaha, Arataki, Pakihi, Tōro, Pīkau, etc.) fail with `LOVABLE_API_KEY not configured`.

### `ANTHROPIC_API_KEY`
- **User-provided** Anthropic console key.
- Used by: `supabase/functions/claude-chat/index.ts` (the dedicated Claude streaming endpoint that `streamMcpChat` routes to whenever the caller selects a `claude-*` model — see `isClaudeModel()` in `src/lib/mcpChat.ts`).
- Powers Claude 3.5 Sonnet / Haiku selections from the in-chat ⚙️ model picker.
- **Missing →** Claude model selections fail; gateway models (Gemini/GPT-5) keep working.

### `OPENROUTER_API_KEY`
- Optional fallback router used by some specialist agents that explicitly opt out of the Lovable AI Gateway.
- Not required for the default chat flow.

### `GEMINI_API_KEY`
- Direct Google AI Studio key, used only by a handful of legacy specialist functions that pre-date the gateway. New code should use `LOVABLE_API_KEY` via the gateway instead.

---

## 3. Mana Trust Layer pipeline

The trust layer wraps every chat turn (PII mask → tier gate → audit → post-rewrite). It uses the same model keys above; no extra secrets are required for the governance steps themselves. Decisions are persisted to `audit_log`, `aaaip_audit_exports`, and `agent_test_results`, all of which are governed by Supabase RLS — no secrets needed beyond the standard service role.

| Secret | Where |
|---|---|
| `SUPABASE_URL` | Auto-set in every edge function — used to build internal REST calls. |
| `SUPABASE_ANON_KEY` | Auto-set — used when an edge function needs to invoke another function with the caller's identity. |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set — used by audit + governance writes that must bypass RLS. **Never expose to the client.** |
| `SUPABASE_PUBLISHABLE_KEY` | Same as `VITE_SUPABASE_PUBLISHABLE_KEY`, available server-side. |
| `SUPABASE_DB_URL` | Auto-set — direct Postgres connection string for migration tooling. |

---

## 4. Messaging channels (used when chat replies are delivered via SMS/WhatsApp)

| Secret | Used by | Purpose |
|---|---|---|
| `TNZ_AUTH_TOKEN` | `tnz-inbound`, `tnz-send`, Tōro family flows | TNZ Group SMS auth. |
| `TNZ_API_BASE` | TNZ functions | TNZ API base URL. |
| `TNZ_FROM_NUMBER` | TNZ functions | Sender ID / shortcode. |
| `TWILIO_ACCOUNT_SID` | Twilio voice + WhatsApp functions | Account identifier. |
| `TWILIO_AUTH_TOKEN` | Twilio functions | Account auth token. |
| `TWILIO_API_KEY` | Twilio functions (managed via Lovable Connector) | Scoped API key. |
| `TWILIO_PHONE_NUMBER` | Twilio SMS | Default sender. |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp | WhatsApp sender (`whatsapp:+...`). |
| `BREVO_API_KEY` | Transactional email (signup confirmations, evidence packs) | Brevo SMTP/API. |
| `ADMIN_EMAIL` | Notification fan-out | Where admin alerts are sent. |

---

## 5. Live data + creative tooling (called from chat as tools)

| Secret | Used by | Purpose |
|---|---|---|
| `OPENWEATHERMAP_API_KEY` | `iot-weather` | Weather lookups for Manaaki / Waihanga / Arataki. |
| `AGROMONITORING_API_KEY` | Agronomic IoT | Soil + crop telemetry. |
| `AISSTREAM_API_KEY` | `iot-ais-tracking` | Maritime AIS feeds. |
| `AT_API_KEY` | `iot-at` | Auckland Transport real-time feeds. |
| `FIRECRAWL_API_KEY` | Web scraping (managed via Connector) | Compliance scanner + brand scan. |
| `FAL_API_KEY` | `stitch-generate` (image router) | Fal.ai (Flux) image generation. |
| `RUNWAY_API_KEY` | Video generation | Runway Gen-3. |
| `MESHY_API_KEY` | 3D asset generation | Meshy text-to-3D. |
| `STITCH_API_KEY` | `stitch-generate` orchestrator | Internal stitching service. |
| `ELEVENLABS_API_KEY` | Voice synthesis | ElevenLabs TTS for the Brain widget. |
| `FLINT_API_KEY` | Proposal templating | Flint ABM template integration. |

---

## 6. Payments + integrations

| Secret | Used by | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | `stripe-*` functions, `/start` onboarding | Subscription + invoice creation. |
| `XERO_CLIENT_ID` / `XERO_CLIENT_SECRET` | Xero sync functions | OAuth client credentials for accounting sync. |

---

## Chat pipeline call graph (where keys land)

```
Browser
  └─ src/lib/mcpChat.ts  (streamMcpChat)
        │
        ├─ isClaudeModel(model) ─ true ──► /functions/v1/claude-chat
        │                                     └─ ANTHROPIC_API_KEY
        │
        └─ false ──────────────────────────► /functions/v1/mcp-chat
                                              └─ LOVABLE_API_KEY
                                                  └─ ai.gateway.lovable.dev
                                                       ├─ google/gemini-*
                                                       └─ openai/gpt-5*

Both endpoints write governance + analytics rows using the
auto-provisioned SUPABASE_SERVICE_ROLE_KEY, and the compression /
summarisation step (compress-context) reuses LOVABLE_API_KEY.
```

---

## Verifying secrets at runtime

Use the diagnostic edge function `toroa-secret-check` to confirm the most
critical secrets are present without ever exposing their values:

```bash
curl -s "$VITE_SUPABASE_URL/functions/v1/toroa-secret-check" \
  -H "Authorization: Bearer $VITE_SUPABASE_PUBLISHABLE_KEY" | jq
```

Returns `{ ok: boolean, secrets: [{ name, set }] }`. To extend the check
list, edit `REQUIRED_SECRETS` in `supabase/functions/toroa-secret-check/index.ts`.

---

## Adding a new secret

1. In Lovable Cloud → **Add secret** (or use the `add_secret` flow in chat).
2. Reference it in your edge function via `Deno.env.get("MY_NEW_SECRET")`.
3. Add a row to this document under the appropriate section.
4. If it is required for the chat pipeline to boot, append it to
   `REQUIRED_SECRETS` in `toroa-secret-check`.
