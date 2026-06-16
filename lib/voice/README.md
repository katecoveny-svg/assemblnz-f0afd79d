# Voice Agent — Run & Deploy (Manaaki Phase 1)

How to run, deploy, and redeploy the NZ voice-booking agent **Aroha**
(`aroha.manaaki@demo`) for the demo customer **Whetū**.

> Built by Assembl. Founder: **Kate Hudson**.

---

## Overview

One agent on a real NZ +64 number takes dinner-booking calls for Whetū. It
answers the call, captures recording consent, checks availability and books
against Google Calendar, sends a confirmation SMS, can warm-transfer to a human,
and produces an **evidence pack** per call — a downloadable bundle of PDFs of
exactly what happened on the call — shown on the **Kahu** dashboard. (We call
this a Mana Receipt — cryptographically tamper-evident.)

The agent is **built with tikanga values in the prompt design**, and **Te Tiriti
commitments shape how data is handled**. (No iwi/hapū/mana whenua endorsement or
partnership is implied.)

**Phase 1 = NZ-English**, with occasional embedded kupu Māori. **te reo Māori is
deferred to Phase 2** via a **kaitiakitanga-licensed provider** (e.g. Te Hiku
Media / Papa Reo — a candidate, not a partner) — not ElevenLabs, which does not
support te reo. Routing te reo to a licensed provider is the right te reo
data-sovereignty choice.

---

## Prerequisites

- **Twilio**: account with an approved **NZ Regulatory Bundle** (Business Name +
  NZBN + authorised-rep ID + local NZ address — PO box not accepted; ~3 business
  days approval) and a provisioned NZ DID.
- **ElevenLabs**: Agents **Pro** plan (~$99/mo), with the Twilio number imported
  natively.
- **Google**: a service account with access to the Whetū booking calendar.
- **Supabase**: project with the voice migrations applied (tables + Storage +
  RLS).

---

## Environment variables

Grouped by system:

**Twilio**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_NZ_DID`
- `TWILIO_TRANSFER_TO`

**ElevenLabs**
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`
- `ELEVENLABS_VOICE_ID`

**Tōro (LLM brain)**
- `CLAUDE_API_KEY`
- `TORO_ENDPOINT`

**Google**
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_SERVICE_ACCOUNT_JSON`

**Supabase**
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`

**Receipt / app**
- `MANA_RECEIPT_PREV_HASH` (genesis prev-hash = 64 zeros)
- `VOICE_PUBLIC_BASE_URL` (public base for tool + webhook URLs)

---

## File map

| Path | What's there |
|---|---|
| `lib/voice/*` | Config (`config.ts`), types, hashing (`hashing.ts`), privacy mapping (`privacy-act.ts`), clients (`clients/`), and the receipt builder. |
| `lib/voice/manaaki/` | Agent assets: `system-prompt.md`, `agent.config.yaml`, and `knowledge/` (`whetu-menu.md`, `whetu-policies.md`). |
| `app/api/voice/*` | The six server tools + `post-call` webhook (Next.js API routes). |
| `supabase/migrations/` | Schema for `kete_session`, `consent_log`, `mana_receipt` + RLS. |
| `components/kahu` + `app/internal/kahu` | The Kahu dashboard that reads receipts. |
| `docs/voice/` | `ARCHITECTURE.md`, `PRIVACY-ACT-2020-MAPPING.md`, `RUNBOOK-VOICE-DOWN.md`. |

---

## Run migrations

Apply the Supabase migrations so the data tables, Storage bucket, and RLS exist:

```bash
supabase db push
```

(Or apply the files in `supabase/migrations/` via your usual Supabase workflow.)

---

## Deploy / redeploy the agent

The planned deploy step POSTs the canonical declarative config and uploads the
knowledge base:

```bash
pnpm voice:deploy:manaaki
```

This:
1. Resolves `${VARS}` and POSTs `lib/voice/manaaki/agent.config.yaml` to the
   ElevenLabs Agents API (creating/updating `ELEVENLABS_AGENT_ID`).
2. Uploads the knowledge files (`whetu-menu.md`, `whetu-policies.md`).
3. Wires the Custom LLM (Tōro), the imported Twilio DID (region **AU1**), and the
   post-call webhook (`${VOICE_PUBLIC_BASE_URL}/api/voice/post-call`).

`agent.config.yaml` is the **source of truth** — don't hand-edit the agent in the
ElevenLabs dashboard; change the YAML and redeploy.

---

## Run tests

```bash
pnpm test
```

Unit tests assert against the product rules in `lib/voice/config.ts` (hours, slot
length, party-size bounds) and the privacy/hashing helpers — keep the knowledge
docs consistent with those constants.

---

## Phase note

**Phase 1 = NZ-English; te reo deferred to Phase 2** (kaitiakitanga-licensed
provider, for te reo data sovereignty). See `docs/voice/ARCHITECTURE.md` for the
full flow and `docs/voice/PRIVACY-ACT-2020-MAPPING.md` for how caller data is
handled.
