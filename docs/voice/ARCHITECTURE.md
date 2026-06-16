# Voice Agent — Architecture (Manaaki Phase 1)

One agent (`aria.manaaki@demo`) on a real NZ +64 number, taking dinner-booking
calls for one demo customer, **Whetū**. This doc describes the end-to-end call
flow, components, data model, the Mana Receipt hash chain, and the deliberate
deviations from a default Supabase-edge build.

---

## Components

| Component | Role |
|---|---|
| **Twilio** | NZ DID (inbound number). Bridges PSTN audio into ElevenLabs via native number import. Media Streams terminate in **AU1**. Also sends SMS and executes warm-transfer `Dial`. |
| **ElevenLabs Agents** | Voice runtime: STT + TTS (NZ-English voice), turn-taking, native Twilio import, server-tool invocation, and post-call webhooks. |
| **Tōro Custom LLM** | The agent's brain — **Claude Haiku 4.5** behind an OpenAI-compatible `/v1/chat/completions` shim (SSE streaming + tool use). Plugged in as ElevenLabs' Custom LLM. |
| **Next.js API routes** (`app/api/voice/*`) | The six server tools + the post-call webhook. HTTPS endpoints on Vercel. |
| **Supabase** | Data store: `kete_session`, `consent_log`, `mana_receipt`. RLS, service-role only. Also Storage for receipt PDFs. |
| **Kahu** (`app/internal/kahu`) | Internal dashboard. Reads `mana_receipt` and renders the evidence pack per call. |

---

## Call flow (sequence)

```
Caller (NZ mobile/landline)
   │  dials NZ DID
   ▼
Twilio  ──(native import, Media Streams → AU1)──▶  ElevenLabs Agents
                                                      │  audio in/out (NZ-English TTS)
                                                      │
                                                      ▼
                                              Tōro Custom LLM
                                          (Claude Haiku 4.5, OpenAI-compatible
                                           shim, SSE streaming + tool use)
                                                      │
                          decides to call a tool ─────┤  HTTPS
                                                      ▼
                              Next.js API routes  (app/api/voice/*)
   ┌──────────────────────────────────────────────────────────────────────┐
   │ capture_consent   → writes consent_log (verbatim + granted)            │
   │ check_availability→ reads Google Calendar, applies hours/slot rules    │
   │ book_reservation  → creates Google Calendar event → returns booking_id │
   │ send_sms          → Twilio SMS (confirmation) to caller                │
   │ warm_transfer     → returns TwiML <Dial> to TWILIO_TRANSFER_TO         │
   │ capture_message   → voicemail fallback → writes kete_session note      │
   └──────────────────────────────────────────────────────────────────────┘
                                                      │
                                              (each tool reads/writes Supabase
                                               via service-role)
                                                      │
                            caller hangs up ──────────┤
                                                      ▼
                              ElevenLabs post-call webhook
                       (post_call_transcription + post_call_audio)
                                                      │  HTTPS
                                                      ▼
                          app/api/voice/post-call
                            • finalise kete_session
                            • build Mana Receipt (hash chain)
                            • render PDF → Supabase Storage
                            • write mana_receipt row
                                                      │
                                                      ▼
                                  Kahu dashboard (app/internal/kahu)
                                  reads mana_receipt → shows evidence pack
```

---

## Data tables (Supabase)

- **`kete_session`** — one row per call: status, party/booking outcome, transcript reference, audio reference, timestamps. Finalised by the post-call webhook.
- **`consent_log`** — recording-consent events: `granted`, verbatim response, timestamp. Written live by `capture_consent`.
- **`mana_receipt`** — the immutable receipt per call: canonical payload, `sha256`, `chain_hash`, `prev_hash`, PDF storage path, IPP stamps.

All access is service-role under RLS. The caller's number is **masked to the last 3 digits** in the receipt payload (`maskNumber` in `lib/voice/privacy-act.ts`).

---

## The evidence pack (Mana Receipt) hash chain

Each call produces an **evidence pack** — a downloadable bundle of PDFs of what
happened on the call. (We call this a Mana Receipt — cryptographically
tamper-evident.) Receipts form an append-only hash chain so any later edit is
detectable:

```
sha256     = sha256( canonical(payload) )
chain_hash = sha256( prev_hash || sha256 )
```

- Receipt **#1** uses `prev_hash` = 64 zero characters (`MANA_RECEIPT_PREV_HASH`).
- Each subsequent receipt's `prev_hash` is the previous receipt's `chain_hash`.
- `canonical(payload)` is the deterministic serialisation in `lib/voice/hashing.ts`, so the same payload always hashes the same way.

Tampering with any receipt breaks the chain from that point forward, which Kahu
can detect on verification.

---

## Deviation note — Next.js API routes, not Supabase edge functions

The reference voice architecture often uses Supabase edge functions for the
tool endpoints. **This repo is a Next.js / Vercel app**, so the tools and the
post-call webhook are implemented as **Next.js API routes under
`app/api/voice/*`** instead. Rationale:

- One deploy target and one runtime (Vercel) — no separate edge-function deploy.
- Shared TypeScript types/clients with the rest of the app (`lib/voice/*`).
- Co-located with the Kahu dashboard, which is already a Next.js route.

Supabase remains the **data store** (Postgres + Storage + RLS); it is just not
hosting the function logic.

---

## te reo Māori deferral

Phase 1 ships in **NZ-English** with occasional embedded kupu Māori (kia ora, ka
pai, ngā mihi, haere mai) inside the English voice. **te reo Māori is not
supported by ElevenLabs** for TTS or its Agents platform. A true te reo voice is
a **Phase 2** item, routed to a **kaitiakitanga-licensed provider** (e.g. Te
Hiku Media / Papa Reo) — not ElevenLabs — because te reo data sovereignty is the
right governance choice. (Te Hiku is a *candidate* provider, not a partner; no
endorsement is implied.)

---

## Cost per minute (indicative)

Per-minute components of a live call:

| Component | Approx. rate |
|---|---|
| ElevenLabs Agents | ~$0.10 / min (Pro tier; ~1,100 included min, ~10 concurrent) |
| Twilio inbound voice | ~$0.0100 / min |
| Twilio Media Streams (AU1) | ~$0.004 / min |
| LLM (Claude Haiku 4.5 via Tōro) | token-based, billed through Tōro |

Plus non-per-minute line items: NZ DID ~USD $3.15/mo, SMS ~$0.105/segment to NZ
mobile, and ElevenLabs Pro plan ~$99/mo. Twilio may add 15% GST unless a B2B GST
number is on file. Figures are indicative (verified 2026-06-17) — confirm
against current provider pricing before quoting a customer.
