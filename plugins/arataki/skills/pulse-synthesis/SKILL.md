---
name: pulse-synthesis
description: |
  The judgment layer for the Business Pulse weekly brief. Takes the
  outputs of `xero-cash-position`, `stripe-settlement-summary`,
  `calendar-week-ahead`, and (optionally) HubSpot pipeline movement,
  and writes the "three things that need your attention today"
  section. Picks at most three items, names each one specifically,
  cites its source, and recommends a next action. Where the next
  action requires sending, posting, paying, or changing data, the
  action is staged (draft only) — never auto-executed.

  Trigger phrases / contexts: "business pulse", "weekly brief",
  "Monday brief", "what needs my attention", "three things",
  "top of mind this week".
mandatory: false
applies_to: ["arataki"]
---

# pulse-synthesis — Business Pulse skill (Arataki)

[Kaihanga: scaffold — written 16 May 2026 against the Business Pulse
spec. This is the skill where the actual judgment lives. Full body
needs careful prompt engineering against real pilot data. Do NOT
ship this to a paying operator without a human-reviewed sample of
at least four weeks of briefs first.]

## When to use

Fires as the final step of the `arataki/business-pulse` workflow
after each of the four upstream skills has produced its JSON block.
Also fires on a manual `Run my business pulse now` trigger from the
operator.

## What this skill will NOT do

- Will NOT send any communication, post any message, or transmit
  any draft to a third party. Every action it recommends is staged
  as a draft for the operator's review and sign-off.
- Will NOT pay any invoice, release any payment, or move any money.
- Will NOT change Xero, Stripe, calendar, or HubSpot data.
- Will NOT include more than three items in the "three things"
  section. Discipline is structural — the schema rejects four.
- Will NOT give legal, tax, accounting, financial, or HR advice.
  Where a recommendation crosses into that territory, the
  recommendation is reframed as "raise with your <profession>"
  rather than a directive.
- Will NOT include personally identifiable information about
  third parties beyond what is strictly necessary to identify the
  matter (debtor business name, not personal contact details, in
  the brief body).

## Tikanga check

The synthesis layer is the most sensitive to tikanga because the
"three things that need your attention" framing carries an implicit
hierarchy. Defer to the `assembl-core/tikanga-compliance` skill on
every brief. Specific rules:

- The word 'AI' is banned. Use "automation", "workflow",
  "business pulse" — never "AI brief", never "AI-generated".
- Macron-correct kupu Māori where used. If a kupu is used, include
  a one-line whakapapa note at the foot of the brief
  (`tikanga_check.whakapapa_note`).
- Manaakitanga in language describing overdue customers — no
  "chasing", no "hunting", no "going after". Prefer "follow-up",
  "outstanding", "due".
- Where the operator runs a kaupapa Māori business, defer to the
  operator's own tikanga first. The synthesis layer is the floor,
  not the ceiling.

## Privacy Act check

- IPP 1: collection is purpose-limited to the operator's weekly
  brief. No secondary use without explicit consent recorded in
  `tenant_consent`.
- IPP 5: storage of the brief is encrypted at rest in Supabase
  and access-restricted by RLS to `tenant_members`.
- IPP 9: retention of the brief is 7 years, aligned with the
  retention shape of `assembl_audit_log` (Customs and Excise
  Act 2018 s.405, Tax Administration Act 1994). Operator may
  request earlier deletion under IPP 7.
- IPP 11: disclosure of the brief outside `tenant_members`
  requires explicit consent. The "Pilot customer health" section
  is for assembl-internal-use briefs only and never appears in
  customer-facing briefs.
- IPP 3A (1 May 2026): the operator's connected tools (Xero,
  Stripe, Google, HubSpot) collect personal information about
  the operator's customers indirectly via the operator's prior
  collection. The operator's customer-facing privacy notice
  must disclose use of automated tooling like this skill — the
  brief's footer will remind the operator of that obligation
  on first run.

## Workflow steps

1. Read the four upstream JSON blocks for the current run.
2. Score each candidate item against three axes:
   - Urgency (deadline in next 7 days vs. later).
   - Reversibility (irreversible action required vs. nudge).
   - Operator-only (only the operator can decide vs. delegable).
3. Pick the top three. Ties broken by urgency, then by
   operator-only.
4. For each of the three:
   - Name the source (Xero / Stripe / calendar / HubSpot / pilot).
   - Name the specific thing (debtor name, dispute id, meeting
     title, deal id).
   - Recommend a next action. If the action requires sending,
     posting, paying, or changing data: stage a draft, surface
     the draft's location, and mark `action_staged: true` in
     the JSON output.
5. Run the `assembl-core/tikanga-compliance` skill over the
   final text. If a check fails, regenerate.
6. Run the `assembl-core/nz-privacy-act-2020` skill over the
   final text. If a check fails, regenerate.
7. Output the final brief as markdown to the operator's Drive at
   `Assembl-Drive/<tenant-slug>/business-pulse/<YYYY-MM-DD>-pulse.md`
   via the `output-to-drive` skill.
8. Write a row to `business_pulse_briefs` with all sections and
   both compliance flags.
9. If the operator has Slack connected, post a short summary
   (the three things + a link to the full brief) to the
   configured Slack channel.

## Approval gates

The brief itself is read-only synthesis — no approval gate.

Any **action** suggested inside the "three things" section that
involves sending, posting, paying, or changing data **must** stage
the action and require explicit operator approval. Specifically:

- Drafting a follow-up email to an overdue customer → staged in
  Gmail Drafts. Operator sends.
- Suggesting a Xero invoice reminder → staged as a Xero draft
  message via the Xero send-statement endpoint with `Save`,
  never `Send`. Operator sends.
- Suggesting a calendar reschedule → drafted as a proposal in
  the operator's calendar tool's draft surface. Operator
  applies.
- Suggesting a HubSpot deal stage change → staged as a HubSpot
  task assigned to the operator, never an automated stage
  transition.

## References

- assembl Business Pulse spec:
  `docs/handover/claude-for-small-business-2026-05-16.md`
- assembl canon, plugin architecture (8 May 2026):
  `CANON-plugin-architecture-2026-05-08.md`
- Privacy Act 2020:
  `https://www.legislation.govt.nz/act/public/2020/0031`
- Customs and Excise Act 2018 s.405:
  `https://www.legislation.govt.nz/act/public/2018/0004/whole.html#DLM7039642`
- Tax Administration Act 1994 (record-keeping):
  `https://www.legislation.govt.nz/act/public/1994/0166/whole.html`
