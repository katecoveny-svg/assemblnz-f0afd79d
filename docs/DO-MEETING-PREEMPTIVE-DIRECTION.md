# Meeting DO: familiar meetings, useful preparation

Product direction, 21 September 2026. Requested by Kate alongside the portable DO companion.

## What to borrow

Google Meet is the reference for obvious capture controls, visible status, source selection and an easy stop. Granola is the reference for a quiet editable notepad alongside the conversation. Keep Assembl's plum, rose and paper visual language, and the same portable DO identity across products.

This is an interaction direction, not a claim that browser Meeting DO has the capture reliability, duration, calendar sync or native system-audio access of either product. The current recorder has a 10-minute local capture limit, explicit participant-permission acknowledgement and separate provider consent. It is not a video-conferencing service. Continue using Meet for the call.

## Baseline already available elsewhere

Granola's current product page describes calendar-driven external-meeting Briefs, enhanced notes, follow-ups, cross-meeting memory and an MCP connector. Google documents summaries during a call, decisions and next steps, configurable recipients and presentation screenshots. Basic preparation, meeting search, summaries and action-item extraction are not defensible novelty claims.

Primary sources checked 21 September 2026:
- https://www.granola.ai/
- https://www.granola.ai/integrations
- https://support.google.com/meet/answer/14754931?hl=en

The opportunities below are hypotheses about a useful Assembl combination. This research does not prove competitors lack every individual feature or integration.

## Features worth building

| Moment | Proposed behaviour | Why it helps | Required foundations |
| --- | --- | --- | --- |
| Before | **Ready to decide:** check whether the evidence, decision-maker, constraints and open commitments needed for the stated outcome are available. Prepare the missing questions and a linked evidence pack. | A briefing becomes a check that the meeting can achieve its purpose. | Opt-in calendar/account context, source permissions, freshness labels, no inferred attendance or invented facts. |
| During | **Before we wrap:** quietly flag an apparent commitment without a clear owner/date, or a decision still unresolved. Ask the user whether to raise it. | Prevents vague promises becoming next week's admin. | Reliable consented transcript, quoted source, uncertainty labels, dismiss/undo, no auto-assignment. |
| During | **Point and connect:** point DO at a slide, proposal or page, review the capture, then connect it to a meeting question. | Brings the work on screen into the conversation without repeated copying. | Shared portable context reader; explicit screen snapshot for pixels; private fields excluded. Text pointing is implemented in this change; meeting-aware speech references are not. |
| During/after | **Have the work ready:** prepare the actual follow-up, proposal skeleton, task change or Studio demonstration while the user continues reviewing the meeting. | Makes Assembl's active wait states useful and connects Pursuit → DO → Studio. | Existing executors, connector-scoped read access, per-output review, separate approval before sending or publishing. |
| Between meetings | **Keep the promise:** compare a confirmed commitment with evidence in the authorised tool. Prepare a reminder or missing deliverable before its due time; show what is blocked. | Completion is evidenced, rather than equated with a checkbox or generated note. | User-enabled schedule, durable per-account commitments, evidence links, revocation and explicit outbound approval. Nothing is monitored or scheduled by this document. |
| Before a repeat meeting | **Could this be resolved first?** prepare a decision note when the agreed agenda can be resolved asynchronously. | Gives people time back rather than creating more summaries. | Known goal, source-backed open items, human review. Never cancel, decline or reschedule automatically. |

## Recommended order

1. Finish the reliable foundation: movable workspace, explicit context review, local notepad, recording/device support, transcript review and honest receipts.
2. Pilot **Before we wrap** and **Have the work ready** with a small number of consenting users. Start with reviewed transcripts and draft-only outputs before attempting live suggestions.
3. Add **Ready to decide** against individually connected calendar/documents.
4. Add **Keep the promise** only after durable commitments and connector evidence are available. Use the existing execution and approval primitives; do not create a second agent engine.

## What this branch actually adds

- One shared movable DO companion for website, embed and extension, with an actual DO editor.
- Explicit point/selection capture, local context review, copy fallback, and existing one-snapshot screen sharing.
- A quiet Meeting DO notepad beside the recorder. Its contents remain local to the mounted page until the user downloads them or chooses them as the source for the existing review/preparation flow.
- Phone home-screen guidance and separate public-link/reviewed-text sharing through native Share or explicit copy fallback.
- Softer imagery, continuous gradients and restrained scroll-linked text/background treatment across the editable repository surfaces.

It does **not** add automatic calendar preparation, live transcript prompting, background monitoring, durable cross-device jobs, autonomous sending, universal desktop overlays or video calls. The separately hosted private Pursuit/Studio app remains unchanged until its editable source is available.

## Pilot proof

Measure whether someone can open DO from the product home, move it without triggering capture, deliberately choose the right source, review it, prepare a draft and keep a receipt. For meetings, prove microphone and meeting-tab audio separately; make stops and device revocation visible. Test consent refusal, missing providers, network failure, iframe blocking and 375px screens. Do not call the release ship-ready on unit tests alone.
