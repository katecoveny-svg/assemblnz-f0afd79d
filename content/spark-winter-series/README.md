# SPARK "Build One Thing" — Winter Mini-Series

Six episodes, one every **Tuesday** (Assembl's product-feature day), **7 Jul → 11 Aug 2026**.
Hero agent: **SPARK (ASM-042)** — App Builder & Digital Transformation.

Big idea: *everyone has a "we should build a tool for that" list. Each week we pull one real,
relatable NZ business tool off the list and show SPARK building it — plain English in, working tool out.*

| Ep | Date (Tue) | Tool | Capability proved |
|----|-----------|------|-------------------|
| 1  | 2026-07-07 | (umbrella) The list you never built | The whole promise |
| 2  | 2026-07-14 | Tradie quote calculator | Business calculator tools |
| 3  | 2026-07-21 | Client intake form | Intake forms + Privacy Act 2020 (IPP 3A) |
| 4  | 2026-07-28 | Healthy Homes compliance checklist | Compliance checklist apps |
| 5  | 2026-08-04 | GST + cashflow calculator | Calculators + Xero/IRD integration |
| 6  | 2026-08-11 | Booking + deposit form | Intake + Stripe NZ payments |

> Ep 1 was already produced in the daily-content dir as `2026-07-07.md`. Eps 2–6 live here.

## Series rules (held every episode)
- One concrete, named tool for a recognisable NZ operator. No abstractions.
- Same spine: the pain you know → why it never got built → SPARK builds it → it's yours, you control it → pull one off the list.
- **Empower, not replace** — SPARK builds what you describe; you decide what it does, check it's right, and run it.
- Accuracy: only claim what SPARK actually does per the agent registry (`lib/agents.ts`).
- NZ English throughout. Warm, plain, confident. Tikanga lens light-touch. Vary the opener each week.
- CTA always → assembl.co.nz.
- **Avoid-list:** no LEDGER true-cost angle, no founder origin story.
- **Engagement engine:** each Facebook post ends with "what's on your list?" — replies feed future episodes.

## How the dispatch-loop reads these
The daily Echo scheduled task (`~/.claude/scheduled-tasks/echo-daily-content`) reads its steering from
`…/marketing/daily-content/ECHO-INSTRUCTIONS.md`. On a Tuesday in the window it loads the matching
dated file from `…/marketing/daily-content/spark-winter-series/YYYY-MM-DD.md` (mirrored from this repo
folder) and uses it **verbatim** as the day's pack. Non-Tuesdays keep the normal rotation.

**Draft only.** Every episode drops into `/admin/approvals` as a pending draft for Kate's yes.
Nothing auto-posts. `[GENERATE_IMAGE: …]` blocks are left intact for the imagegen pass at post time.
