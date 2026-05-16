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
  Pulls the operator's current cash position from Xero — bank balance,
  outstanding accounts receivable, outstanding accounts payable — and
  computes a 14-day forward cash forecast by combining AR due dates,
  AP due dates, and recent Stripe settlement run-rate. Stages a cash
  summary block for the Business Pulse weekly brief. Drafts only —
  never reconciles, never posts a journal, never sends a payment.

  Trigger phrases / contexts: "cash position", "bank balance",
  "cash flow forecast", "AR aging", "AP aging", "Xero cash",
  "two-week cash", "fortnight cash", "what's in the bank",
  "outstanding invoices", "outstanding bills".
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
# xero-cash-position — Business Pulse skill (Arataki)

[Kaihanga: scaffold — written 16 May 2026 against the Business Pulse
spec in `docs/handover/claude-for-small-business-2026-05-16.md`.
Full body to be tuned against Aironaut and TOA pilot data once the
Xero connector OAuth flow is wired through `tenant_tool_connections`
and a real refresh token sits in `xero_tokens`.]

## When to use

Fires when the operator (or the Business Pulse workflow) asks for any
of the following:

- Current bank balance across all Xero-connected bank accounts.
- Outstanding invoice total (accounts receivable) by aging bucket
  (0–30, 31–60, 61–90, 90+).
- Outstanding bill total (accounts payable) by aging bucket.
- A 14-day forward cash forecast — current cash, plus AR expected
  in the next 14 days at historical collection rates, less AP due
  in the next 14 days, less an estimate of the next two weeks of
  payroll if a Pay Run is scheduled.
- A flag when the 14-day forecast drops below the operator's
  configured cash floor (default: two weeks of payroll).

## What this skill will NOT do

- Will NOT post a journal, reconcile a transaction, mark an invoice
  paid, or change any Xero record. Read-only.
- Will NOT initiate a payment, schedule a payment, or release an
  ABA / bank batch file. Payment runs remain with the operator's
  bookkeeper or the operator themselves.
- Will NOT give tax or accounting advice. The cash forecast is a
  draft for the operator's review. Engage a Chartered Accountants
  ANZ member for tax and reporting advice.
- Will NOT provide a P&L, balance sheet, or any other statutory
  financial statement. Use the operator's accountant and Xero's
  own reporting for that.
- Will NOT send a reminder to a customer or supplier. Reminder
  drafts are staged separately, under the `pulse-synthesis` skill,
  and remain in Gmail drafts until the operator sends.

## Tikanga check

[Kaihanga: write the tikanga frame — manaakitanga in how overdue
customers are described in the brief (no shaming language, no
"chasing" framing), recognition that some operators run a kaupapa
Māori business where koha, exchange, and whanaungatanga shape cash
flow differently to a pakihi tauiwi. Defer to `tikanga-compliance`
for any line that will appear in the brief.]

## Privacy Act check

[Kaihanga: write the IPP coverage — bank balances, debtor names,
and creditor names are personal information when the debtor or
creditor is a natural person (sole trader, partnership). IPP 5
storage and security at the highest level for any cached cash
snapshot. IPP 11 limits use to the operator and their authorised
finance team — the brief is not distributed beyond the operator
without explicit consent recorded in `tenant_consent`. IPP 3A
(1 May 2026) for any debtor data we hold indirectly via Xero —
the operator's notice to debtors must cover indirect collection
by their connected tooling.]

## Workflow steps

1. Resolve the operator's Xero connection through
   `tenant_tool_connections` and refresh the access token via
   `xero_tokens` if needed.
2. Pull bank balances via `Accounting:Bank/Statements` (current
   day, all bank accounts marked as cash).
3. Pull outstanding invoices via `Accounting:Invoices` with
   `Status=AUTHORISED,SUBMITTED` and `AmountDue>0`. Aging by due
   date.
4. Pull outstanding bills via `Accounting:Invoices` with
   `Type=ACCPAY` and the same status / amount filter.
5. Pull the next scheduled Pay Run via `Payroll:PayRuns` and
   estimate the payroll outflow.
6. Compute a 14-day forecast: opening cash + AR due in 14 days
   × historical collection rate − AP due in 14 days − next
   scheduled Pay Run (if within 14 days).
7. Output a `cash_position` JSON block matching the schema in
   `business_pulse_briefs.cash_position`.
8. If the forecast drops below the cash floor, add a flag for
   the `pulse-synthesis` skill to surface in the top three.

## Approval gates

This skill is read-only. The approval gate sits on any action the
brief recommends (e.g., a draft reminder email to an overdue
customer), not on the cash summary itself.

## References

- Xero Accounting API: `https://developer.xero.com/documentation/api/accounting/overview`
- Xero Payroll API (NZ):
  `https://developer.xero.com/documentation/api/payrollnz/overview`
- Chartered Accountants ANZ — Code of Ethics:
  `https://www.charteredaccountantsanz.com/member-services/professional-standards-and-ethics`
- assembl Business Pulse spec:
  `docs/handover/claude-for-small-business-2026-05-16.md`
