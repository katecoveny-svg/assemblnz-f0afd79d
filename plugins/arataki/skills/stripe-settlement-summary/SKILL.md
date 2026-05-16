---
name: stripe-settlement-summary
description: |
  Pulls last 7 days of Stripe activity: net settlements (gross less
  fees and refunds), refunds, and disputes. Flags any open dispute
  or any refund over a configurable threshold. Reads only.

  Trigger phrases / contexts: "settlements", "Stripe summary",
  "chargebacks", "disputes", "refunds this week", "last 7 days
  Stripe".
mandatory: false
applies_to: ["arataki"]
---

# Stripe Settlement Summary — read-only 7-day window (Arataki)

**STATUS**: scaffold — full skill body deferred until Codex picks up
the build per `docs/handover/claude-for-small-business-2026-05-16.md`
Part 3.

## When to use

Inside `business-pulse` for the Monday brief, and standalone when the
named reviewer asks "what came in via Stripe this week".

## Inputs

Stripe MCP connector (already wired). Reads:
- `balance_transactions` for the last 7 days
- `disputes` with status in (`needs_response`, `under_review`, `won`, `lost`)
- `refunds` over the configurable threshold

## Output contract

```json
{
  "captured_at": "2026-05-16T07:00:00+12:00",
  "window_days": 7,
  "net_settlements_nzd": 0,
  "refund_count": 0,
  "refund_total_nzd": 0,
  "disputes_open_count": 0,
  "disputes_open": [],
  "currency": "NZD"
}
```

## Out of scope

- Posting to Stripe (read-only)
- Multi-currency (NZD only for v1)
- Risk scoring (Stripe Radar surface is separate)
