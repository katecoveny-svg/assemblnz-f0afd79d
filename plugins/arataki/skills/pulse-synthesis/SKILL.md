---
name: pulse-synthesis
description: |
  The judgment layer of `business-pulse`. Takes the outputs of
  `xero-cash-position`, `stripe-settlement-summary`,
  `calendar-week-ahead`, and (if present) HubSpot pipeline + Gmail
  VIP unread, and writes the "three things that need you today"
  section. Never more than three items. Each item names the source,
  the specific thing, and a recommended next action. If a
  recommended action would send / post / pay / change data, the
  action is described but not executed — the calling workflow stages
  it for explicit approval.

  This is the skill that requires the most careful prompt engineering
  in the Business Pulse stack. Triage discipline > completeness.

  Trigger phrases / contexts: "three things", "what needs my
  attention", "synthesise", "prioritise this week".
mandatory: false
applies_to: ["arataki"]
---

# Pulse Synthesis — top-3 priority judgment (Arataki)

**STATUS**: scaffold — full skill body deferred until Codex picks up
the build. See `docs/handover/claude-for-small-business-2026-05-16.md`
Part 3 for the spec and Appendix A for the Anthropic "Morning Brief"
prompt-shape reference.

## When to use

Always inside `business-pulse`. Never standalone (no upstream data
makes it meaningless).

## Inputs

Aggregated JSON object from the four upstream skills plus any
optional connectors. Schema:

```json
{
  "cash": { ... },              // xero-cash-position output
  "settlements": { ... },       // stripe-settlement-summary output
  "calendar": { ... },          // calendar-week-ahead output
  "pipeline": { ... } | null,   // HubSpot if connected
  "vip_inbox": [ ... ] | null,  // Gmail VIP unread if connected
  "pilot_health": { ... } | null // Assembl-internal use only
}
```

## Selection rules

Maximum three items. Each item names:
- `source` — one of `cash`, `settlements`, `calendar`, `pipeline`, `inbox`, `pilot_health`
- `headline` — one sentence
- `recommended_action` — one sentence; verb-first
- `staged_action` — `null` if no outbound action; otherwise an
  object describing what would be staged (Gmail draft, Xero reminder
  draft, calendar proposal) so the workflow can pre-stage it

Tie-breakers when there are more than three candidates, in order:
1. Cash threshold breach
2. Open Stripe dispute
3. External meeting in next 48h without prep
4. Overdue invoice > NZD 5,000
5. Pipeline deal stuck > 14 days
6. Pilot customer error in last 24h
7. VIP inbox unread > 24h

## Output contract

```json
{
  "three_things": [
    {
      "source": "cash",
      "headline": "...",
      "recommended_action": "...",
      "staged_action": null
    }
  ]
}
```

## Tikanga + Privacy Act gates

The output is run through `assembl-core/tikanga-compliance` and
`assembl-core/nz-privacy-act-2020` before being returned to the
calling workflow. If either gate fails, this skill rewrites and
re-runs once; if it still fails, the brief row is marked
`tikanga_check_passed = false` or `privacy_check_passed = false` and
the brief is delivered with a redacted "three things" section.

## Out of scope

- Executing the staged actions (the workflow does that, after
  explicit approval)
- Multi-day synthesis (this skill is one-day-of-context only —
  longer-window trend analysis is a separate skill, deferred)
