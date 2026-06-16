# Privacy Act 2020 (NZ) — IPP Mapping (Voice Agent)

How the Manaaki Phase 1 voice agent (`aria.manaaki@demo`, customer **Whetū**)
satisfies each engaged Information Privacy Principle. This document **mirrors
`lib/voice/privacy-act.ts`** — if the code changes, update this table.

> This is a mapping of *how* the build satisfies each principle, not legal
> advice. **This is the artifact the Day-10 `nz-privacy-act-2020` audit checks.**

---

## IPP coverage

| IPP | Title | How the build satisfies it |
|---|---|---|
| **IPP 1** | Purpose of collection | Aria collects only **name, mobile, party size, and booking notes** — the minimum to make and confirm a reservation. Purpose is stated in the opening line. |
| **IPP 2** | Source of information | Collected **directly from the caller** during the call. No third-party enrichment or lookup. |
| **IPP 3** | Collection from subject — notification | Recording notice + purpose are spoken **before any recording**. `consent_log` stores the **verbatim** exchange. Decline → **no recording**, warm transfer. |
| **IPP 4** | Manner of collection | No deceptive or unfair means. The agent **identifies itself as an AI booking assistant for Whetū up front**. |
| **IPP 5** | Storage and security | Transcript/recording URIs and PII live in **Supabase under RLS, service-role only**. The caller's number is **masked to the last 3 digits** in the receipt payload (`maskNumber`). |
| **IPP 6** | Access to personal information | A caller can request their booking record. The **evidence pack (Mana Receipt)** for their call is the **portable copy** of what was held and decided. |
| **IPP 9** | Retention | Three **retention classes** (below) bound how long recordings/transcripts are kept. Message-only and consent-declined calls hold **no recording**. |
| **IPP 10** | Limits on use | Data is used **only to fulfil and confirm the booking** (calendar event + SMS). No marketing, no secondary use. |
| **IPP 11** | Limits on disclosure | Disclosed only to the **restaurant (calendar)** and the **caller (SMS)**. No onward sharing. |
| **IPP 12** | Disclosure outside NZ | **Twilio Media Streams terminate in AU1** and **ElevenLabs processes audio offshore** — disclosed here and bounded to call handling. **Phase 2** to assess data-residency options. |
| **IPP 13** | Unique identifiers | **No** government or unique identifiers collected. `call_sid` is a **Twilio-internal id, not a personal identifier**. |

---

## Retention classes

Set by `retentionClass()` in `lib/voice/privacy-act.ts`:

| Class | When it applies | What it stores |
|---|---|---|
| **`call-with-recording`** | Consent granted, call completed | Full call audio + transcript + booking data + consent record. |
| **`call-no-recording`** | Consent **declined** | **No audio.** Consent record (proving we asked and honoured the answer) + minimal transcript/outcome; call warm-transferred. |
| **`message-only`** | Voicemail fallback (`status = voicemail`) | The captured message + minimal metadata. No recorded booking conversation. |

All engaged IPPs are stamped on every receipt regardless of class — the
recording-specific principles (3, 5, 9) are still satisfied when consent is
declined, because we prove we asked and honoured the answer (`ippsSatisfied`).

---

## Consent flow

1. Opening line gives the **recording notice + purpose** before any recording.
2. **Yes** → `capture_consent(granted: true, verbatim_response)` → proceed with the booking.
3. **No** → apologise, **no recording**, `capture_consent(granted: false, verbatim_response)` → `warm_transfer` to a human.
4. **Ambiguous** → re-ask **once**; if still unclear, treat as decline (never assume consent).

The **verbatim** caller response is logged to `consent_log` either way, so the
record shows exactly what was asked and answered.

---

## Data-flow & offshore-disclosure note (IPP 12)

```
Caller (NZ) → Twilio NZ DID → Twilio Media Streams (AU1, offshore)
            → ElevenLabs Agents (offshore audio processing)
            → Tōro / Claude Haiku 4.5 (LLM)
            → Next.js API routes (Vercel) → Supabase (data at rest)
```

- **Offshore processing is disclosed**: audio transits Twilio AU1 and is
  processed by ElevenLabs offshore; the LLM (Claude Haiku 4.5 via Tōro) and
  hosting are likewise outside NZ.
- Disclosure is **bounded to call handling** — fulfilling and confirming the
  booking — and not used for any secondary purpose (IPP 10/11).
- **Te Tiriti commitments shape how data is handled**, and the prompt is **built
  with tikanga values**. te reo voice is deferred to **Phase 2** with a
  **kaitiakitanga-licensed provider** (data sovereignty). No iwi/hapū/mana
  whenua endorsement or partnership is claimed.
- **Phase 2 action**: assess NZ/closer data-residency options for audio and
  storage.

---

*Founder / accountable contact: **Kate Hudson**.*
