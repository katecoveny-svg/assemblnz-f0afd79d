---
name: business-pulse
description: |
  Cross-kete weekly synthesis. Pulls Xero cash + Stripe settlements +
  Google Calendar + Gmail (and optionally HubSpot) and writes a Monday
  07:00 NZT brief: the three things that need your attention today,
  the 14-day cash forecast, pipeline movement, the week's commitments,
  and (for Assembl-internal use) pilot customer health. Modelled on
  Anthropic's "Morning Brief" pattern but NZ-localised — Xero not
  QuickBooks, Stripe not PayPal, Privacy Act 2020 + tikanga checks
  layered over every output.

  Reads only. Any suggested action that would send, post, pay, or
  change data is staged as a draft and surfaced for explicit approval
  by the named reviewer. Runs under the connected user's existing
  permissions — if their Xero role can't see a bank account, the
  brief can't either.

  Trigger phrases / contexts: "business pulse", "morning brief",
  "monday brief", "weekly brief", "what needs my attention",
  "cash position this week", "three things today".
mandatory: false
applies_to: ["arataki"]
---

# Business Pulse — Monday 07:00 NZT cross-kete brief (Arataki)

**STATUS**: scaffold — full skill body deferred until Kate's Cowork
observations from "Morning Brief" land. See
`docs/handover/claude-for-small-business-2026-05-16.md` Part 3 for the
full spec.

## When to use

Fires on the Monday 07:00 NZT schedule, or when the named reviewer
asks for a fresh business pulse out-of-band ("run my business pulse
now"). One brief per tenant per day — the unique constraint on
`business_pulse_briefs (tenant_id, brief_date)` enforces this. Tenancy
follows the canon `tenants` / `tenant_members` shape (not `organizations`);
RLS uses the `is_tenant_member(uuid)` helper.

## Inputs

Calls four child skills in parallel:

- `xero-cash-position` — bank balance, AR, AP, 14-day forecast
- `stripe-settlement-summary` — last 7 days net settlements + disputes
- `calendar-week-ahead` — next 7 days needing prep
- `pulse-synthesis` — judgment layer; writes the "three things" header

Optional inputs if connectors are wired:
- HubSpot pipeline movement
- Gmail VIP unread + "urgent" / "to-do" labels
- Direct Supabase query for pilot customer health (Aironaut, TOA)

## Output contract

A single Markdown doc in section order:

1. Three things that need you today (max 3, source-tagged, action-tagged)
2. Cash position (balance + 14-day forecast + threshold flag)
3. Pipeline movement (HubSpot only; omit if not connected)
4. This week's commitments (calendar)
5. Pilot customer health (Assembl-internal only)
6. Tikanga check (single line; whakapapa note if kupu Māori used)

## Storage / delivery

- Drive: `Assembl-Drive/[customer-slug]/business-pulse/YYYY-MM-DD-pulse.md`
- Supabase: row in `business_pulse_briefs` with all sections as jsonb,
  the full rendered Markdown in `markdown`, and per-source health in
  `source_status` (one of `ok`, `skipped`, `failed` per connector)
- Slack: optional, only if the org has a Slack connector
- UI: rendered in `BusinessPulseWidget.tsx` on the Command Centre

## Approval gates

The brief itself is read-only synthesis — no approval needed to
produce it. Any *action* suggested in the "three things" section must
stage and require explicit approval before execution:

- Overdue-invoice follow-up → Gmail draft only, do not send
- Xero invoice reminder → draft only
- Calendar reschedule → propose, do not move

## Permission model

Runs under the connected user's existing tokens. No elevation. If the
user's Xero role excludes a bank account, the brief excludes it. This
matches the Anthropic "your existing permissions hold" pattern.

## Mandatory companion skills

- `assembl-core/nz-privacy-act-2020` — runs over every brief before
  delivery; if any third-party PII is present without a consent flag,
  the brief is rewritten or the row is marked `privacy_check_passed = false`.
- `assembl-core/tikanga-compliance` — runs over every brief before
  delivery; if any kupu Māori is used incorrectly, the brief is
  rewritten or the row is marked `tikanga_check_passed = false`.

## Test plan

Six tests must pass before this skill is considered done. See
`docs/handover/claude-for-small-business-2026-05-16.md` Part 3 for the
full plan. Summary: local dry run, Drive write, Supabase row, approval
gate stages (does not send), restricted-permission account is honoured,
Monday 07:00 NZT schedule fires.
