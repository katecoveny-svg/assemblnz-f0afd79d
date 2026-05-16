---
name: xero-cash-position
description: |
  Pulls current bank balance, outstanding AR, outstanding AP, and
  builds a 14-day forward cash forecast from Xero. Flags when the
  forecast crosses a configurable threshold. Reads only — never
  posts, never changes data. Used by `business-pulse` and standalone
  when the named reviewer asks "where is cash this week".

  Trigger phrases / contexts: "cash position", "bank balance",
  "14-day forecast", "AR", "AP", "outstanding invoices",
  "outstanding bills", "Xero balance".
mandatory: false
applies_to: ["arataki"]
---

# Xero Cash Position — read-only cash snapshot (Arataki)

**STATUS**: scaffold — full skill body deferred until Codex picks up
the build per `docs/handover/claude-for-small-business-2026-05-16.md`
Part 3.

## When to use

Inside `business-pulse` for the Monday brief, and standalone when the
named reviewer asks for cash now. One read per call. No caching beyond
the calling skill's lifetime.

## Inputs

Xero MCP connector (already wired in the Assembl stack). Reads:
- Bank account balances (only those the user's Xero role can see)
- Sales invoices status = AUTHORISED (AR)
- Bills status = AUTHORISED (AP)
- Configurable threshold from `org_settings.cash_forecast_threshold_nzd`

## Output contract

```json
{
  "captured_at": "2026-05-16T07:00:00+12:00",
  "balance_nzd": 0,
  "ar_outstanding_nzd": 0,
  "ap_outstanding_nzd": 0,
  "forecast_14d_nzd": 0,
  "threshold_nzd": 0,
  "threshold_breach": false,
  "accounts_visible": ["..."],
  "accounts_hidden_by_permission": ["..."]
}
```

## Permission model

Runs under the connected user's existing Xero OAuth tokens. No
elevation. Hidden accounts are listed in `accounts_hidden_by_permission`
so the brief can be honest about what it couldn't see.

## Out of scope

- Posting to Xero (this skill is read-only)
- Multi-currency conversion (NZD only for v1)
- Forecasting beyond 14 days (separate skill, deferred)
