# Arataki — leadership and governance industry pack

> Nothing in this repository constitutes legal, tax, accounting, financial, immigration, customs, biosecurity, or health and safety advice. These agents draft work product — entries, memos, checklists, calculations, draft correspondence — for review by a qualified professional or licensed adviser. They do not file with Inland Revenue, lodge customs entries, submit WorkSafe notifications, make ACC claims, register entities with the Companies Office, send Privacy Commissioner breach notifications, or submit any document to a NZ government agency on the user's behalf; every output is staged for human sign-off. The user is responsible for verifying outputs and for compliance with all applicable New Zealand laws, including but not limited to the Privacy Act 2020, the Consumer Guarantees Act 1993, the Fair Trading Act 1986, the AML/CFT Act 2009, the Customs and Excise Act 2018, the Building Act 2004, the Construction Contracts Act 2002, the Health and Safety at Work Act 2015, and any tikanga Māori obligations relevant to their work.

---

Arataki is the assembl plugin family for directors, board members, trustees, and executives in Aotearoa. The kete drafts board papers and resolutions, strategy and stakeholder communications, and governance decision logs against the Companies Act 1993, the Trusts Act 2019, the Charities Act 2005, and the relevant professional codes (IoD, NZX). Drafts only — every output is staged for the board chair, the company secretary, the trust's professional adviser, or the responsible executive to review and sign before any communication leaves the boardroom.

## Skills

Governance (this PR — scaffold):

- `board-papers` — agenda, paper, and resolution drafts.
- `strategy-comms` — board-to-staff, board-to-shareholder, and stakeholder communication drafts.
- `governance-decision-log` — interests register, decision log, and audit-trail drafts.

Business Pulse (added 16 May 2026 — cross-kete weekly brief, scaffold):

- `xero-cash-position` — bank balance, AR, AP, 14-day cash forecast (read-only).
- `stripe-settlement-summary` — last-7-day payouts, refunds, disputes (read-only).
- `calendar-week-ahead` — next-7-day commitments, external meetings, prep flags (read-only).
- `pulse-synthesis` — the judgment layer that writes the "three things that need you this week" section, runs the tikanga and Privacy Act checks, and stages any recommended actions as drafts.

## Agents

- `business-pulse` — the weekly Monday-morning brief workflow that orchestrates the four Business Pulse skills, runs the assembl-core compliance skills, writes the brief to the operator's Drive, and (optionally) posts a short summary into the operator's Slack channel. Drafts only — never sends, never posts, never pays, never transmits.

## Connectors

This kete uses the following MCP servers when the Business Pulse workflow runs. The kete declares them in `.claude-plugin/plugin.json`; the actual MCP server entries live under the central `plugins/mcp-servers/` directory and are registered per-tenant in `tenant_tool_connections`.

- `xero` — Xero Accounting and Payroll NZ API (read-only scope).
- `stripe` — Stripe payouts, refunds, disputes (read-only scope).
- `google-calendar` and `microsoft-calendar` — calendar read-only.
- `hubspot` — pipeline read-only (optional, only if the operator is on HubSpot).
- `slack` — outbound summary post to the operator's configured channel (consent recorded in `tenant_consent`).
- `assembl-drive` — write the brief markdown into the operator's Drive folder.

## Compliance frame (Business Pulse workflow)

- Every recommended action is staged as a draft. Operator signs and sends.
- The word 'AI' is banned in any text the operator will read.
- Tikanga compliance and Privacy Act 2020 (incl. IPP 3A from 1 May 2026) checks run on every brief before delivery.
- The brief never includes personally identifiable information about third parties beyond what is strictly necessary to identify the matter.
- Audit log every tool call. 7-year retention, aligned with Customs and Excise Act 2018 s.405 and Tax Administration Act 1994.

## Handover spec

The Business Pulse workflow was scaffolded against the Claude-for-Small-Business handover doc dated 16 May 2026. The doc, including the test plan and acceptance criteria, lives at `docs/handover/claude-for-small-business-2026-05-16.md`.

## References

- Canon: `CANON-plugin-architecture-2026-05-08.md` (locked 8 May 2026).
- Architecture spec: repository root `README.md` and `plugins/CLAUDE.md`.
- Handover spec: `docs/handover/claude-for-small-business-2026-05-16.md`.
