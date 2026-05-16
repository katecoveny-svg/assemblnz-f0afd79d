# Claude for Small Business → Assembl Handover

**For:** Codex (Assembl Command Centre build) + Cowork (Kate's own use)
**Author:** Kate Hudson, Assembl Ltd
**Date:** 16 May 2026
**Status:** Research complete, ready to action

---

## Purpose of this doc

Two things:

1. **Cowork setup** — exact steps for Kate to install Claude for Small Business in Cowork desktop, plus what to test and what to learn from the UX.
2. **Codex build spec** — full specification for "Business Pulse" workflow in Assembl Command Centre, modelled on Anthropic's Morning Brief pattern but adapted for NZ SMEs (Xero, not QuickBooks; tikanga + Privacy Act layer; 8-kete vertical context).

This doc is structured so Codex can consume it end-to-end as a build brief, and Cowork can consume the "Part 1: Setup" section as a getting-started task.

---

## Part 1: Cowork setup (Kate, today)

### What it is

Claude for Small Business is a single plugin that bundles 15 workflows + 15 skills + 8 connectors into Cowork. Anthropic launched it 13 May 2026. It is free to anyone with Cowork access — no extra cost beyond the Claude plan.

**Important caveat for NZ:** the workflows are US-centric (QuickBooks, PayPal-as-payment-processor, US tax season). They will not run unmodified on a NZ business. The value for Kate is:
- Studying the workflow shape, prompt patterns, and approval UX
- Using the Canva, Docusign, Slack, and Google Workspace connectors directly
- Getting hands-on with Cowork's plugin system before building Assembl's equivalent

### Install steps

1. **Confirm Cowork desktop app is installed.** Cowork runs only in the desktop app, not the web client. Download: https://claude.com/download
2. **Download the Claude for Small Business plugin.** URL: https://claude.com/plugins/small-business
3. **Open Cowork in the desktop app.**
4. **Navigate to the plugin toggle inside Cowork** and turn the Small Business plugin on.
5. **Type into Cowork:** `get me started` — the plugin's onboarding skill takes over from here and walks through connector setup.
6. **Connect the relevant tools.** Skip QuickBooks and PayPal (not relevant for NZ). Do connect:
   - Canva (already in your stack)
   - Docusign (useful for PIKAU)
   - Google Workspace (Gmail, Calendar, Drive)
   - Slack (if used)
   - HubSpot (only if a pilot customer is on it)
7. **Run one workflow end-to-end** to study the UX. Recommended: "Morning Brief" — even with limited NZ connectors it will surface how the approval flow, multi-step planning, and Slack delivery work.

### What to observe and report back

When Kate runs the first workflow, note:

- **Approval UX** — at what points does Cowork pause for "review and approve"? What does the diff/preview look like?
- **Multi-connector orchestration** — how does Cowork pass context between, e.g., Calendar → Slack → Drive in one workflow?
- **Skill invocation visibility** — can you see which skill is firing at each step? How is it labelled?
- **Failure modes** — what happens when a connector is missing data? Does it ask, fall back, or fail?
- **Output format** — is the brief delivered as Slack message, artifact, doc, or all three?

These observations feed directly into the Codex build spec below.

### What not to do

- Do not connect QuickBooks (US-only data, not your stack — Xero is your equivalent).
- Do not connect PayPal (you don't use it as a primary processor).
- Do not try to run the "Plan payroll" or "Close the month" workflows — they are hard-coded to US tax and QuickBooks logic and will give confusing output.
- Do not pay for any add-on. The plugin is bundled free with Cowork access.

### Sources
- Announcement: https://www.anthropic.com/news/claude-for-small-business
- Solutions page: https://claude.com/solutions/small-business
- Plugin: https://claude.com/plugins/small-business
- Free course (optional, US-flavoured but useful framing): https://anthropic.skilljar.com/ai-fluency-for-small-businesses

---

## Part 2: Strategic read (Codex context — read before building)

### What Anthropic just validated

Claude for Small Business ships exactly the three-element architecture you locked into CANON Plugin on 8 May 2026:

| CANON Plugin (Assembl)           | Claude for Small Business (Anthropic)   |
| -------------------------------- | --------------------------------------- |
| skills/ folder with SKILL.md     | 15 skills built on repeatable tasks     |
| connectors via MCP               | 8 connectors (QB, PayPal, HubSpot, …)   |
| sub-agents per kete              | 15 ready-to-run agentic workflows       |
| loadPlugin(slug) for toggle install | Single plugin toggle inside Cowork    |

This is confirmation that the architecture is correct. The strategic differentiation is **not** the architecture — it's the vertical specialisation and NZ-specific compliance layer (tikanga, Privacy Act 2020 incl. IPP 3A, NZS 3910, Customs Act 2018, etc.).

### What to copy

1. **Toggle-and-go install pattern.** A single Cowork toggle activates everything. No multi-day setup. Assembl's pilot install for Aironaut Customs and TOA Architecture should feel exactly like this from the customer's side. The CANON Plugin `loadPlugin(slug)` function is the underlying mechanism — wrap it in a one-click UX.

2. **15+15 structural discipline.** Anthropic constrained themselves to 15 workflows + 15 skills covering the repeatable tasks owners said slow them down most. Assembl is currently 44 agents across 8 kete — overweight. Per kete, the right target is roughly 5–10 workflows that map to the 5–10 actual bottlenecks of that industry, plus shared cross-kete skills (Privacy Act, tikanga, Consumer Guarantees Act).

3. **Human-in-the-loop framing.** Anthropic's marketing language: *"You stay in the loop. Every task is initiated by you. You approve the plan first or, when you're ready, let it run end-to-end. Your existing permissions hold."* This is the same pattern as PIKAU's "draft-only, never lodge" — just better-named. Adopt this framing across Assembl marketing and inside the product (every workflow surfaces an explicit approval gate, every connector inherits the user's existing permissions).

4. **Workflow prompt structure.** Anthropic's published workflow prompts (see Appendix A below) follow a consistent pattern:
   - Pull data from N connectors
   - Reconcile / analyse / synthesise
   - Generate an output artifact (doc, brief, P&L)
   - Surface what needs human attention
   - Stage (not send) any outbound action

   Codex should treat this as the canonical pattern for every Assembl workflow.

### What not to copy

- The 8 specific connectors. Replace with the NZ equivalents (Xero, not QuickBooks; Stripe, not PayPal; Mailchimp/Campaign Monitor; Workshop Software for automotive; Construction Hub for building consents; etc.).
- The "horizontal SMB" positioning. Assembl is **vertical, NZ-specific, tikanga-compliant**. Anthropic owns horizontal US SMB; Assembl owns vertical NZ SME.
- The US-only training tour and CDFI partnerships.

---

## Part 3: Codex build spec — "Business Pulse" workflow for Assembl Command Centre

### Workflow name

**ARATAKI: Business Pulse** (cross-kete shared workflow; ARATAKI owns ops/business intelligence across all kete)

### Anthropic's equivalent (reference)

Anthropic ships this as "Morning Brief" inside Claude for Small Business. Their published prompt:

> *"Help me build a Monday morning brief every week in Slack. Pull my cash position from QuickBooks, incoming settlements from PayPal, pipeline movement from HubSpot, and what's on my calendar this week. Tell me the three things that need my attention today."*

Connectors used: QuickBooks, Google Calendar, Slack.

### Assembl's NZ-adapted equivalent

A weekly (Monday 7:00 NZT) automated brief delivered as:
1. Markdown doc in `Assembl-Drive/business-pulse/YYYY-MM-DD-pulse.md`
2. Optional Slack message (if customer has Slack connected)
3. Surfaced in the Assembl Command Centre dashboard widget

### Inputs (connectors)

| Source              | Data pulled                                                          | NZ MCP / connector             |
| ------------------- | -------------------------------------------------------------------- | ------------------------------ |
| Xero                | Bank balance, cash position, outstanding invoices, outstanding bills | Xero MCP (already connected)   |
| Stripe              | Last 7 days settlements, refunds, disputes                           | Stripe MCP (already connected) |
| Google Calendar     | Next 7 days events, anyone-blocked-with-Kate, external meetings      | Calendar connector             |
| Gmail               | Unread from VIP senders, anything tagged "urgent" or "to-do"         | Gmail connector                |
| HubSpot *(if used)* | Pipeline movement last 7 days, deals stuck >14 days                  | HubSpot MCP                    |
| Supabase            | Pilot customer health: last-active, error count, billing status      | Direct Supabase query          |

### Outputs

A single brief with these sections, in this order:

1. **Three things that need you today** — the model's top-3 priority synthesis across all sources. Never more than three. Each item names the source, the specific thing, and the recommended next action.
2. **Cash position** — current bank balance, 14-day forecast (using Stripe forward-looking + Xero AR), flag if forecast goes below a configurable threshold.
3. **Pipeline movement** — only if HubSpot connected. New deals, deals moved stages, deals stuck.
4. **This week's commitments** — calendar events that need prep, external meetings, anyone-blocked-with-Kate slots.
5. **Pilot customer health** — for Assembl internal use: Aironaut and TOA last-active timestamps, any errors logged in last 7 days.
6. **Tikanga check** — a single line confirming no flagged content was generated; if any kupu Māori was used, a one-line whakapapa note.

### Required skills (built or to-build)

- `nz-privacy-act-2020` — MANDATORY shared skill. The brief must not surface personally identifiable information from third parties without consent flag.
- `tikanga-compliance` — MANDATORY shared skill. Runs over output before delivery.
- `xero-cash-position` — new. Pulls bank + AR + AP and computes 14-day forecast.
- `stripe-settlement-summary` — new. Last-7-day net settlements + dispute alert.
- `calendar-week-ahead` — new. Filters next 7 days to "needs Kate's attention" events.
- `pulse-synthesis` — new. Takes all upstream data and writes the "three things that need you today" section. This is where the actual judgment lives — needs careful prompt engineering.

### Approval gates

Following the Anthropic pattern, the brief itself is **not** an approval gate — it's read-only synthesis. But any **action** suggested in the "three things" section that involves sending, posting, paying, or changing data **must** stage the action and require explicit approval. Specifically:

- Drafting a follow-up email to an overdue customer → stage in Gmail drafts, do not send.
- Suggesting a Xero invoice reminder → draft only, do not send.
- Suggesting a calendar reschedule → propose, do not move.

### Permission model

The brief runs under Kate's permissions only (for the Assembl-internal version). For the customer-pilot versions (Aironaut, TOA), it runs under the connected customer user's permissions — if the customer's bookkeeper doesn't have access to certain Xero accounts, the brief doesn't see them either. This matches Anthropic's "existing permissions hold" pattern.

### Schedule

- Default: every Monday at 07:00 NZT.
- Configurable per customer.
- Manual trigger via Cowork: "Run my business pulse now" should also work.

### Storage / delivery

- Markdown file saved to Drive at `Assembl-Drive/[customer-slug]/business-pulse/YYYY-MM-DD-pulse.md` via the existing `output-to-drive` skill.
- Optional Slack delivery if customer has Slack connector.
- Surfaced in Command Centre dashboard widget (component: `BusinessPulseWidget.tsx`, to build).
- Stored in `business_pulse_briefs` table (new) for historical search and trend analysis.

### Database schema (Supabase)

```sql
create table business_pulse_briefs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  brief_date date not null,
  drive_path text,
  slack_message_ts text,
  three_things jsonb not null,        -- the top-3 priority array
  cash_position jsonb,                -- snapshot of cash + forecast
  pipeline_movement jsonb,            -- HubSpot summary
  weekly_commitments jsonb,           -- calendar summary
  pilot_health jsonb,                 -- internal use only
  tikanga_check_passed boolean default true,
  privacy_check_passed boolean default true,
  created_at timestamptz default now(),
  unique (org_id, brief_date)
);

create index idx_business_pulse_org_date on business_pulse_briefs (org_id, brief_date desc);

alter table business_pulse_briefs enable row level security;

create policy "Users can view their org's briefs"
  on business_pulse_briefs for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));
```

### Test plan (per Kate's discipline rule: nothing is done until a test call proves it works in production)

1. **Local dry run.** Run the workflow against Kate's own Assembl Xero + Stripe + Calendar. Verify all four sections populate. Verify tikanga and privacy checks pass.
2. **Drive write verification.** Confirm the .md file lands in the correct Drive folder.
3. **Supabase row verification.** Confirm a `business_pulse_briefs` row is written with all fields populated.
4. **Approval gate verification.** Trigger a suggestion that would require approval (e.g., overdue invoice follow-up). Verify it stages and does not send.
5. **Permission verification.** Run with a second account that has restricted Xero access. Verify the brief only shows what that account can see.
6. **Schedule verification.** Verify Monday 07:00 NZT trigger fires and produces a brief.

Only after all six pass does this workflow count as done.

### Acceptance criteria

- [ ] Workflow runs end-to-end in Cowork desktop with all required connectors
- [ ] Brief produced as .md file in correct Drive path
- [ ] Brief surfaces in Command Centre dashboard widget
- [ ] Row written to `business_pulse_briefs` with all sections populated
- [ ] `nz-privacy-act-2020` and `tikanga-compliance` skills both pass
- [ ] All suggested actions stage (do not auto-execute)
- [ ] Customer-restricted permissions are honoured
- [ ] Monday 07:00 NZT scheduled run produces a brief without manual trigger
- [ ] Test call documented with proof (Drive file path + Supabase row ID logged)

---

## Part 4: Roadmap implication — should Assembl re-shape around 15+15?

Open question for Kate to decide, not for Codex to action yet.

Anthropic's 15 workflows + 15 skills approach is structurally tighter than Assembl's current 44 agents across 8 kete. The disciplined version of Assembl might look like:

- **8 kete × 8 workflows per kete = 64 workflows total** (instead of 44 agents)
- **~20 shared cross-kete skills** (Privacy Act, tikanga, Consumer Guarantees, NZBN lookup, te reo, NZ employment, NZ tax, etc.)
- **~10 industry-specific skills per kete = ~80 vertical skills**

This is a bigger surface area than Anthropic's 15+15 but it's the right shape for **vertical depth across 8 industries** rather than horizontal breadth across one customer segment.

**Recommendation:** decide this *after* shipping PIKAU and WAIHANGA pilots. Don't redesign the architecture mid-pilot. But keep the 15+15 discipline in mind for the third kete onward — only ship what corresponds to a real, named bottleneck.

---

## Appendix A: Anthropic's published workflow prompts (verbatim, for reference)

These are the four headline workflows Anthropic published on the solutions page. Useful as prompt-shape reference when Codex writes the equivalent Assembl skills.

### 1. Plan payroll
> *"I'm working on April 15 payroll. Pull my cash position from QuickBooks and reconcile it against my PayPal settlements. Rank any overdue invoices that could close the gap and draft a reminder email for each one."*

### 2. Close the month
> *"Close out March for me. Reconcile my QuickBooks transactions against PayPal settlements, flag anything that doesn't match, and write the P&L narrative as a document I can send straight to my accountant."*

### 3. Morning brief
> *"Help me build a Monday morning brief every week in Slack. Pull my cash position from QuickBooks, incoming settlements from PayPal, pipeline movement from HubSpot, and what's on my calendar this week. Tell me the three things that need my attention today."*

### 4. Run a campaign
> *"Find my weakest revenue month from last year and plan a promo to address it. Draft the strategy, generate the campaign assets in Canva, segment my list in HubSpot, and stage the send. Show me everything before anything goes out."*

---

## Appendix B: Full connector list (Claude for Small Business)

Anthropic ships these eight connectors in the Small Business plugin. NZ relevance noted.

| Connector              | Anthropic use case                        | NZ relevance for Assembl                                |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------- |
| Intuit QuickBooks      | Payroll, monthly close, cash-flow, tax    | None — use Xero instead                                 |
| PayPal                 | Settlements, invoicing, disputes, refunds | Limited — use Stripe (already connected)                |
| HubSpot                | Lead triage, customer pulse, campaigns    | Useful if customer is on HubSpot                        |
| Canva                  | Content generation, publishing            | Direct use — already in your stack                      |
| Docusign               | Contracts out for signature               | Direct use — useful for PIKAU customs engagement letters |
| Google Workspace       | Gmail, Drive, Calendar                    | Direct use                                              |
| Microsoft 365          | Outlook, OneDrive, Teams                  | Direct use if customer is on Microsoft                  |
| Slack                  | Brief delivery, alerts                    | Direct use                                              |

---

## Appendix C: Key links

- Anthropic announcement: https://www.anthropic.com/news/claude-for-small-business
- Solutions page: https://claude.com/solutions/small-business
- Plugin install: https://claude.com/plugins/small-business
- Cowork desktop download: https://claude.com/download
- All connectors directory: https://claude.com/connectors
- All plugins directory: https://claude.com/plugins
- Free AI Fluency course: https://anthropic.skilljar.com/ai-fluency-for-small-businesses
- Trust Center: https://trust.anthropic.com
- Tutorial — install the plugin: https://claude.com/resources/tutorials/how-to-install-the-claude-for-small-business-plugin

---

## Handover checklist

For Kate (today):
- [ ] Install Cowork desktop app (if not already)
- [ ] Download and toggle on the Small Business plugin
- [ ] Connect Canva, Docusign, Google Workspace, Slack
- [ ] Run "Morning Brief" once, observe approval UX
- [ ] Report observations back into Codex session for build spec refinement

For Codex (next session):
- [ ] Build `xero-cash-position` skill
- [ ] Build `stripe-settlement-summary` skill
- [ ] Build `calendar-week-ahead` skill
- [ ] Build `pulse-synthesis` skill (the judgment layer — needs care)
- [ ] Build `ARATAKI/business-pulse` workflow that orchestrates the four skills above
- [ ] Create `business_pulse_briefs` Supabase table + RLS policies
- [ ] Build `BusinessPulseWidget.tsx` for Command Centre
- [ ] Schedule Monday 07:00 NZT trigger
- [ ] Run six-step test plan, log proof of each step
- [ ] Mark workflow done only when all six tests pass

---

*End of handover doc.*
