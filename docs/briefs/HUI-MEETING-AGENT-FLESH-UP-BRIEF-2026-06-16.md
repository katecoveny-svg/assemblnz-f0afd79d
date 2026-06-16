# Hui meeting agent — flesh-up brief

**File:** HUI-MEETING-AGENT-FLESH-UP-BRIEF-2026-06-16.md
**Pack:** SEND-PACK-2026-05-13
**Companion (read first):** COMPETITOR-CONTENTED-DEEP-DIVE-2026-06-16.md
**Companion build brief:** BUILD-BRIEF-HUI-PHASE-A-2026-06-16.md
**Owner:** Kate Hudson
**Date:** 2026-06-17
**Classification:** Internal — product / strategy
**Scope:** Audit + spec only. No code shipped in this task. The build PR is spawned separately once this spec is approved.

---

## 0. Why this exists

Contented (contentedai.com) is the closest NZ rival to assembl, and they are a single-shape product: **audio in, document out.** Record a conversation, get a templated written artefact. That one job — done frictionlessly across phone, desktop, and upload — is what won them ~400 organisations, NZ$1.4m ARR, and an oversubscribed NZ$4.1m seed.

assembl already has a meeting agent. It is called **Hui**. The problem is not that it doesn't exist — it's that it exists in two half-built pieces, neither of which is the genuinely-great, shareable product Contented has shipped. This brief audits what's actually there, maps it against Contented feature-by-feature, and lays out a phased plan to make Hui a tool we can put a public landing page behind and start sharing.

**The headline finding:** Hui's *shell* is good — real calendar OAuth, a clean four-mode workspace, real PDF/Word export, a real LLM summary. But its *core promise* — turn a real meeting into real notes — is faked with hard-coded sample data, and the whole thing lives in the retired legacy-vite app, invisible to production. Meanwhile the only meeting tool that *is* live in production (Hapai Meeting Recorder) has real capture but none of Hui's calendar context, export polish, or evidence backbone. **The flesh-up is mostly a merge-and-finish job, not a greenfield build.** That's good news for speed.

---

## 1. Audit — what's actually there today

### 1.1 Two meeting tools, neither finished

| | **Hui** (legacy-vite) | **Hapai Meeting Recorder** (production) |
|---|---|---|
| Lives in | `legacy-vite/` (retired Vite app) | `app/hapai/meeting-recorder/` (live Next.js) |
| Reachable by users today | ❌ No — not in prod routes, nav, agent registry, or kete registry | ✅ Yes — live at `/hapai/meeting-recorder` |
| Capture | None real (waits on Granola, unimplemented) | Browser Web Speech API (`en-NZ` hard-coded) + paste raw notes + photo of whiteboard/agenda |
| Calendar context | ✅ Real Google Calendar OAuth + 7-day event list | ❌ None |
| Structured notes | ❌ Hard-coded samples ("Sarah — send draft contract") | ✅ Real LLM polish → Summary / Decisions / Actions / Discussion / Next steps |
| Summary | ✅ Real LLM call (via generic `echo` agent) | ✅ Real LLM call (via `public-chat-llm`) |
| Export | ✅ Branded PDF + Word `.doc` (jsPDF) | ⚠️ Copy / `.md` download only |
| Evidence pack | ❌ Local download only, no persistence | ❌ None |
| te reo | ❌ None | ❌ None (`en-NZ` only) |

The honest summary: **Hui is a beautiful front-end with a faked middle, stranded in a dead codebase. Hapai Meeting Recorder is a working middle with no front-end polish and no context.** The flesh-up stitches the real half of each into one production tool and finishes the gaps.

### 1.2 Hui — capability catalogue (precise)

**Input it accepts today:** Nothing real. The "Notes" view shows a collapsed "Full transcript" panel whose only content is the placeholder *"Transcript will populate from Granola once a recording is connected."* Granola is one of four "Connect" pills; three of the four (Granola, Drive, Gmail) are non-functional and fire a "coming soon" toast. Only the Calendar pill works.

**Output it produces today:**
- **Prep** view — attendees + three hard-coded generic talking points. Gmail/Drive context sections are stubs.
- **Notes** view — four fixed sections (Decisions, Action items, Key highlights, Parking lot), every entry hard-coded sample data (`SAMPLE_DECISIONS`, `SAMPLE_ACTIONS`, etc. in `MeetingNotes.tsx:10-22`). Editable free-text box. Two working export buttons (PDF, `.doc`); "Save to Drive" and "Draft follow-up email" are dead buttons.
- **Summary** view — *real.* Builds a prompt ("calm, NZ-business one-paragraph executive summary, max 90 words") and calls the `chat` edge function with `agentId: "echo"`. Returns markdown, renders it, offers Copy / Regenerate / Download PDF.
- **Insights** view — 100% mock dashboard (talk-time bars, sentiment sparkline, recurring topics, open actions — all hard-coded arrays).

**Integrations that actually exist:** Google Calendar only, and it's a genuinely complete OAuth2 implementation — `supabase/functions/google-calendar/index.ts` does `get_auth_url`, `status`, `list_events`, `create_event`, `delete_event` against the real Calendar API, storing refresh tokens in a `user_integrations` table. This is the one piece of real backend plumbing and it's worth keeping.

**Where it lives in the UI:** `/hui` route in legacy-vite, surfaced in the legacy `BrandNav` as "Hui — Meeting Copilot". Not present anywhere in the production Next.js app.

**Has it shipped to production?** No. It is legacy-vite scaffold. The last commit to touch it merely copied it forward during the Next.js migration; it was never wired into the new app, the agent fleet (`lib/agents.ts`), or the kete registry (`lib/kete.ts`).

**Its agent prompt:** There is no Hui-specific persona. Summary generation borrows the generic `echo` platform-expert agent with an ad-hoc inline prompt. There is no meeting-specialist system prompt anywhere for Hui.

**Does it write to an evidence pack?** No. `huiPdf.ts` generates a branded PDF and a Word-compatible `.doc` as **client-side browser downloads**. Nothing is persisted, hashed, chained, or turned into a verifiable record. (The evidence-pack / receipt machinery exists elsewhere in the repo — `assembl-site-unification/supabase/functions/mana/` inserts to an `evidence_packs` table — but Hui is not wired to it.)

### 1.3 Hapai Meeting Recorder — capability catalogue (precise)

- **Route:** `app/hapai/meeting-recorder/` (live).
- **Capture:** live browser speech recognition (`recognition.lang = "en-NZ"`), or paste raw notes, or attach a photo of a whiteboard/agenda (OCR'd by the LLM).
- **Processing:** POSTs to `app/api/hapai/polish-meeting-notes/route.ts`, which calls the `public-chat-llm` edge function with a real system prompt ("You are an assembl meeting-note specialist… return HTML using only `<h2> <p> <ul> <li> <strong>`… Summary / Decisions / Action items / Discussion / Next steps"). This is the closest thing to a real Hui brain that exists today.
- **Output:** structured HTML rendered in-page; copy or `.md` download. No PDF/Word, no calendar stitching, no persistence, no te reo, no audio-file upload (live mic only).

### 1.4 What's genuinely reusable (don't rebuild)

1. **Google Calendar OAuth** (`google-calendar` edge function) — keep wholesale.
2. **Branded PDF + Word export** (`huiPdf.ts` + `pdfBranding`) — port to production; it already draws the assembl header/footer.
3. **The four-mode workspace UI** (Prep / Notes / Summary / Insights) — port the layout, replace the fake data with real.
4. **The Hapai polish prompt** — promote it into a proper, versioned Hui system prompt with template variants.

### 1.5 What's missing (the real gap)

- **No real transcription path of any kind** — neither tool turns an uploaded audio file into text. Hui waits on Granola; Hapai uses browser speech (lossy, English-only, no file upload, no diarisation).
- **No structured extraction from real content** — Hui's notes are samples; only Hapai actually extracts, and only from its own thin capture.
- **No named template/output library** — Hui has four fixed sections; Contented has 50+ browsable named templates.
- **No te reo** anywhere.
- **No evidence pack** — no persisted, verifiable, downloadable bundle.
- **No consent / privacy UX** for recording.
- **Not in production** — the better-looking tool isn't shipped; the shipped tool isn't as good.

---

## 2. Feature gap table — Contented vs Hui (meeting job-to-be-done)

Scoped to the audio-in/document-out job Contented actually competes on. (The full platform comparison is in the Contented deep-dive §3; this is the meeting-tool slice.)

| # | Capability | Contented | Hui / Hapai today | Gap |
|---|---|---|---|---|
| 1 | Record in browser | ✅ Web + desktop, no meeting bot | ⚠️ Hapai: live mic via Web Speech (lossy) | **A** |
| 2 | Mobile capture (iOS/Android) | ✅ Live apps | ❌ None | C |
| 3 | Desktop capture (system audio, no bot) | ✅ Windows | ❌ None | C |
| 4 | Upload audio/video file (MP3/MP4/WAV/M4A) | ✅ Live | ❌ None (Hui waits on Granola) | **A** |
| 5 | Paste-transcript fallback | ⚠️ Implicit | ✅ Hapai paste | At parity |
| 6 | Real transcription engine | ✅ (their own pipeline) | ❌ None real | **A** |
| 7 | Speaker diarisation | ✅ Implied | ❌ None | B |
| 8 | Calendar context on the meeting | ❌ Not advertised | ✅ Hui (real OAuth) | **Hui moat** |
| 9 | Structured notes (decisions/actions/etc.) | ✅ Templated | ⚠️ Hapai real / Hui faked | **A** |
| 10 | Named template library (50+) | ✅ Public, browsable | ❌ 4 fixed sections | **A/B** |
| 11 | Vertical (kete-specific) output templates | ❌ Generic only | ❌ Not built (but kete depth exists) | **B — differentiator** |
| 12 | DIY custom prompts saved per user | ✅ | ❌ None | B |
| 13 | Word / PDF export | ✅ | ✅ Hui PDF + `.doc` | At parity |
| 14 | CSV / PNG export | ✅ | ❌ None | C |
| 15 | Custom-branded export | ✅ Business tier | ⚠️ Founder-gated (Vessel) | C |
| 16 | Multilingual generation | ✅ "any language" | ⚠️ via LLM, not surfaced | B |
| 17 | **te reo Māori transcription + output** | ❌ Not mentioned | ❌ Not built | **B — differentiator** |
| 18 | **NZ Privacy Act 2020 / IPP 3A consent UX** | ❌ Not named | ❌ Not built | **A — differentiator** |
| 19 | **Evidence pack (verifiable bundle)** | ❌ Generic "audit support" | ❌ Local PDF only | **B — differentiator** |
| 20 | NZ data residency | ❌ AWS Sydney | ⚠️ Possible, not surfaced | B — differentiator |
| 21 | Self-serve trial + public price | ✅ NZ$99/mo, 7-day | ⚠️ Not for this tool | Commercial (§5) |
| 22 | Public demo / sample-output page | ✅ `/templates` | ❌ None | **A** |
| 23 | Email follow-up draft | ⚠️ Template | ⚠️ Dead button in Hui | B |
| 24 | Push to Drive / Docs | ⚠️ Roadmap | ⚠️ Dead button in Hui | C |

**Gap legend:** **A** = Phase A parity (must close to be credible). **B** = Phase B differentiate. **C** = later / defer.

**Read of the table:** Contented beats us today on exactly three things that matter for this job — (1) real, reliable capture across surfaces, (2) real transcription, (3) a browsable named-output library with a public demo. Everything else we either match or have a structural advantage on. Close A, lead with the differentiators, and Hui is not a follower — it's a better-positioned product with a worse current finish.

---

## 3. Phased build sequence

### Phase A — parity (ship in ~2 weeks, one production tool)

**Goal: a real person uploads or records a real meeting and gets real, accurate, exportable notes — live in production.** This is the credibility floor. Detail and acceptance criteria are in `BUILD-BRIEF-HUI-PHASE-A-2026-06-16.md`.

1. **Promote Hui to production** at `/hui` (Next.js), retiring the faked legacy-vite version. Port the four-mode workspace, the calendar OAuth, and the PDF/Word export. Wire it into nav + agent registry.
2. **Real capture surface** — three honest inputs in one panel:
   - **Upload audio file** (MP3/M4A/WAV/MP4) — the single biggest missing primitive.
   - **Record in browser** (MediaRecorder → same transcription path, not browser Web Speech).
   - **Paste transcript** (keep the Hapai fallback).
3. **Real transcription** — one provider behind a thin interface (recommend **Deepgram** for NZ-English accuracy, diarisation, and cost; AssemblyAI as fallback). Provider abstracted so a te reo engine can slot in for Phase B.
4. **Real structured extraction** — replace every `SAMPLE_*` constant with output from a proper, versioned **Hui system prompt** (promoted from the Hapai polish prompt): Summary, Decisions, Action items (owner + due), Highlights, Parking lot. Calendar attendees and title feed the prompt as context.
5. **Real export** — branded PDF + Word, populated from real notes, not samples.
6. **Consent + privacy UX (v1)** — a recording-consent gate before capture, a "who was in this meeting / where does the audio live / how long we keep it" panel, and a delete-recording control. Privacy Act 2020 / IPP 3A baked in from day one, not bolted on.

**Phase A non-goals:** mobile apps, desktop system-audio capture, the full 50-template library, te reo, the evidence-pack backbone, the named-output catalogue page. Those are B/C.

### Phase B — differentiate (Q3 2026)

7. **te reo Māori transcription + output** — slot a te reo-capable engine into the provider interface (Te Hiku Media path per existing te reo skill), with the te reo / tikanga advisory skill on the output. Human-verification gate on te reo before send.
8. **Kete-specific output templates** — the named library, but *NZ-vertical*, not generic: Waihanga toolbox-talk minutes + site-walk hazard record, Manaaki shift-handover, Mātauranga ERO-prep meeting notes, Ako whānau-hui summary (IPP 3A), board minutes, advisor SOA-prep notes. Each routes the meeting through the relevant kete so the output is regulated, not just tidy.
9. **Evidence pack** — every Hui output ends in a downloadable, verifiable bundle (PDF + the audit trail of source recording, model lineage, timestamp, consent record). This is the depth move that turns "meeting notes" into "regulator-ready record". (The receipt layer demoted to the depth/architecture story, surfaced to the customer as the evidence pack first.)
10. **DIY saved prompts** + multilingual surfacing + working follow-up-email and push-to-Drive actions (finish the dead buttons).

### Phase C — launch surfaces + reach (Q3/Q4 2026)

11. **Public `/hui` demo + sample-output page** — upload-a-recording → see-a-sample-output, gated trial signup. (Folds into the `/outputs/` catalogue from GAP-FILL-BRIEF-output-catalogue.)
12. **Mobile + desktop capture** — only if the data says the browser surface isn't enough. Contented's apps are real, but a thin PWA capture client may close most of the gap at a fraction of the cost.
13. **CSV/PNG export, custom-branded export, speaker-diarisation surfacing.**

---

## 4. Five GTM differentiators we lead with vs Contented

Each is a fact Kate Hudson can say out loud, plus the one-line lead. (Counter-positioning source: Contented deep-dive §7.)

1. **te reo, by default.** *Fact:* Hui transcribes and writes meeting records in te reo Māori and English; Contented does not mention te reo anywhere on their site. *Line:* "If your hui is in te reo, ours is the only meeting tool that doesn't need an asterisk."

2. **NZ compliance baked into the meeting, not bolted on.** *Fact:* recording consent, IPP 3A, who's-in-the-room, and retention are part of the capture flow under the Privacy Act 2020. Contented's only named posture is SOC 2 Type 1 and a generic AI-policy template. *Line:* "We ask for consent before the mic is on, and we tell you where the audio lives and for how long. That's the Privacy Act doing its job, in the product."

3. **The evidence pack — a meeting record you can prove.** *Fact:* every Hui output ends in a verifiable evidence pack with the source recording, model lineage, timestamp, and consent trail. Contented hands you a Word doc and calls audit "an Enterprise line item". *Line:* "When the board or the auditor asks 'how was this minute produced', we hand over one file they can verify. They hand over a Word doc."

4. **kete-specific output templates — regulated, not generic.** *Fact:* a Waihanga toolbox-talk record, a Manaaki shift-handover, an Ako whānau-hui summary — outputs that cite the actual NZ framework. Contented offers generic "meeting minutes / empathy map". *Line:* "We don't give you a prettier note. We give you the toolbox-talk evidence record WorkSafe actually asks for."

5. **Named founder accountability + draft-only by default.** *Fact:* Hui outputs are draft-until-a-human-signs, and high-stakes outputs gate behind named accountability. The founder is Kate Hudson and she stands behind it. *Line:* "Nothing goes out with your name on it until a person puts their name on it first. Including ours."

---

## 5. Stripe pricing recommendation

**Contented's frame:** per-user, NZ$99/month individual (30 hours upload, 50+ templates, 7-day free trial); team is "let's talk" at 100 hours/month. Their meter is **recording hours.**

**Don't copy the per-hour meter.** It teaches the customer to count minutes and punishes the heavy user we most want. assembl's frame is depth and proof, not airtime.

**Recommendation — three honest doors into Hui:**

1. **Free taster (acquisition):** the public `/hui` demo — one upload, one output, no login, watermark on the export. This is the conversion surface, matching Contented's "see it before you buy" without giving away the meter.
2. **Hui solo — NZ$99/month** (match the market-validated anchor Contented set): unlimited meetings, all standard templates, PDF/Word export, te reo, 7-day free trial, draft-only. Price *at* their individual tier so the comparison is "same price, more product (te reo + evidence pack + NZ compliance)" not a discount war.
3. **Hui in a kete — included in the NZ$5,000/month Industry Pack** (no separate charge): the kete-specific output templates + evidence pack ride inside the pack a customer already buys. This is the move Contented structurally cannot make — they have no industry-pack price point. When the buyer wants vertical-compliant meeting records, Hui is a *feature of the thing they're already buying*, and Contented is a separate per-seat line item.

**Net:** match them at the top of the funnel (NZ$99 anchor + free trial), and starve them at the bottom by folding the differentiated version into the Industry Pack. Keep everything draft-only by default and GST-exclusive, consistent with the rest of the price list. Pilot Sprint (NZ$5,000, money-back) remains the enterprise on-ramp and can be sold as "we'll turn your messiest recurring hui into a verifiable evidence pack in two weeks".

---

## 6. Sharing / launch plan

**Gate: do not put the public page up until Phase A is genuinely real.** The single worst outcome is shipping a demo that produces the faked sample notes — that hands Contented the "all hat, no cattle" line. The landing page goes up the day a stranger can upload a real recording and get a real, accurate output.

**Sequence:**

1. **Internal dogfood (Phase A, week 1–2):** run every assembl internal hui through Hui. The first real customer is us. If our own minutes aren't good enough to send, it's not ready.
2. **Pilot Sprint customers first (week 2–3):** three existing Pilot Sprint customers get Hui as a value-add, in exchange for permission to use a (de-identified) sample output and a one-line quote. This feeds both the demo page and the logo wall (GAP-FILL-BRIEF-customer-logo-wall).
3. **Public `/hui` landing + demo (Phase C, on Phase A completion):** upload → sample-output → gated trial. Lead the page with the five differentiators, not a feature list.
4. **LinkedIn (Kate Hudson, founder voice):** one honest post — *"We had a meeting-notes tool that wasn't good enough, so we rebuilt it. Here's what's different: it works in te reo, it asks for consent before it records, and it hands you an evidence pack you can actually prove — not just a tidy Word doc. Try it free."* No naming Contented; let the differentiators do the contrast. Include the demo link.
5. **NZ media / sector channels:** the te reo + Privacy Act + evidence-pack angle is a genuine story for the same outlets that covered Contented's raise (BusinessDesk, IT Brief, The Post, Reseller News). The hook is not "another AI note-taker" — it's "the NZ meeting tool built tikanga-first and Privacy-Act-first". Pitch it as a counter-narrative, not a me-too.
6. **Email first:** the same professional-services and council buyers Contented is winning (legal, accounting, local government) — but lead with the kete-specific, regulated output, which is the door Contented can't open.

**One thing to hold the line on:** every piece of launch copy runs through the assembl-voice skill, lowercase brand, evidence-pack-first language, and zero mana whenua relationship claims.

---

## 7. Risks / honest cautions

- **Transcription cost + latency** is the real engineering risk, not the UI. Budget for it; pick the provider on NZ-accent accuracy first, price second.
- **te reo transcription quality** must clear a human-verification gate before it's a public claim. Don't market te reo accuracy we haven't measured. (Same discipline as the voice-agents brief: te reo lands with proper review, not on the first sprint.)
- **Consent UX is a feature, not a checkbox** — if we lead on Privacy Act and the consent flow is weak, that's worse than not claiming it.
- **Two-tool confusion:** Hapai Meeting Recorder and Hui must not both live in production doing half the job. Phase A should fold Hapai's real cap/polish into Hui and deprecate the standalone, or explicitly position Hapai as the free no-login taster and Hui as the full tool. Decide this in Phase A planning.

---

## 8. Files in this brief

- **This document** — audit + flesh-up spec.
- **BUILD-BRIEF-HUI-PHASE-A-2026-06-16.md** — Codex-ready Phase A (parity) build brief.
- **Read first:** COMPETITOR-CONTENTED-DEEP-DIVE-2026-06-16.md.
- **Related:** GAP-FILL-BRIEF-output-catalogue-2026-06-16.md (the `/outputs/` catalogue Hui's demo folds into).
