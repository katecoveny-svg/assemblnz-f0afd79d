# Tōro

> Nothing in this repository constitutes legal, tax, accounting, financial, immigration, customs, biosecurity, or health and safety advice. These agents draft work product — entries, memos, checklists, calculations, draft correspondence — for review by a qualified professional or licensed adviser. They do not file with Inland Revenue, lodge customs entries, submit WorkSafe notifications, make ACC claims, register entities with the Companies Office, send Privacy Commissioner breach notifications, or submit any document to a NZ government agency on the user's behalf; every output is staged for human sign-off. The user is responsible for verifying outputs and for compliance with all applicable New Zealand laws, including but not limited to the Privacy Act 2020, the Consumer Guarantees Act 1993, the Fair Trading Act 1986, the AML/CFT Act 2009, the Customs and Excise Act 2018, the Building Act 2004, the Construction Contracts Act 2002, the Health and Safety at Work Act 2015, and any tikanga Māori obligations relevant to their work.

---

Tōro is the assembl kete for whānau and household life-admin: chore rosters, school runs and lunches, after-school logistics, packing lists, kid-friendly itineraries, draft messages to schools and service providers, and the broader paperwork of running a home in Aotearoa New Zealand. Every reply is human-approved — Tōro drafts, a whānau member reviews and sends. The pilot tenant is the Hudson household. Architecture lives in [`outputs/TORO-MULTI-TENANT-CHATWOOT-ARCHITECTURE-2026-05-09.md`](../../outputs/TORO-MULTI-TENANT-CHATWOOT-ARCHITECTURE-2026-05-09.md) (multi-tenant + Chatwoot inbox layer).

## Skills

- [`skills/household-coordination/SKILL.md`](skills/household-coordination/SKILL.md) — chore rosters, reminders, shared calendars, divvying tasks across whānau members. Internal-comms only — never replies to external parties on the parent's behalf.
- [`skills/child-routines/SKILL.md`](skills/child-routines/SKILL.md) — school runs, lunches, after-school activities, NCEA prep, pediatric appointments. Drafts go to the parent; Tōro never messages children or schools directly.
- [`skills/holiday-and-travel/SKILL.md`](skills/holiday-and-travel/SKILL.md) — packing lists, kid-friendly itineraries, gear hire, draft bookings. Tōro drafts and shortlists; the whānau member confirms and pays.
- [`skills/toro-domain/SKILL.md`](skills/toro-domain/SKILL.md) — broader whānau / consumer life-admin: budgets, ACC, KiwiSaver, tenancy, consumer rights drafts.

Mandatory skills (loaded by reference from `assembl-core`, not duplicated):

- `assembl-core/skills/tikanga-compliance` — four-pou check, macron enforcement, banned-words list (including "AI").
- `assembl-core/skills/nz-privacy-act-2020` — 13 Information Privacy Principles + IPP 3A.

## Agent

The Tōro main-agent definition lives at [`../managed-agent-cookbooks/toro/agent.yaml`](../managed-agent-cookbooks/toro/agent.yaml) with system prompt at [`../managed-agent-cookbooks/toro/system-prompt.md`](../managed-agent-cookbooks/toro/system-prompt.md). The `draft-reviewer` sub-agent ([`../managed-agent-cookbooks/toro/subagents/draft-reviewer.yaml`](../managed-agent-cookbooks/toro/subagents/draft-reviewer.yaml)) reviews proposed drafts against the four pou and Privacy Act IPP 3A before they surface in `/app/toro/inbox`.

## Pilot status

- **Tenant:** Hudson household (single-tenant pilot per [`outputs/TORO-MULTI-TENANT-CHATWOOT-ARCHITECTURE-2026-05-09.md`](../../outputs/TORO-MULTI-TENANT-CHATWOOT-ARCHITECTURE-2026-05-09.md)).
- **Inbox layer:** Chatwoot. Inbound webhook at `chatwoot-webhook` edge function inserts drafts into `toro_drafts`.
- **Approval UI:** `/app/toro/inbox`.
- **Plugin status:** scaffold v0.0.1 — manifest, three skill stubs, agent + sub-agent YAML in place. Kaihanga drafts the full skill bodies in the next sprint.
