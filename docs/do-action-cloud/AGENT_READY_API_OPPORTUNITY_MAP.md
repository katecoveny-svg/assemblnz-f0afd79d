# Agent-Ready API Opportunity Map

**Principle:** The opportunity is **APIs for things humans can do but agents still cannot reliably DO**.  
**Non-compete:** Composio / Pipedream cover commodity SaaS connectors; Browserbase covers generic browse. **DO must not compete there.**  
**Status:** Prioritisation map — pay signals are hypotheses unless marked otherwise.

Brand reminder: **Assembl** orchestrates · **DO** is safe hands · **Pursuit** is the tender vertical.

---

## Opportunity table

| DO tool / domain | Why agents need it | Pay signal (hypothesis) | Notes |
|------------------|--------------------|-------------------------|-------|
| **Permit** | Authority separate from reasoning | Core meter / platform fee | First six |
| **Call** | Voice/SMS under policy | Per-minute / per-call + permit | First six; Twilio adapter |
| **Forms** | Reliable structured submit | Per successful submit | First six |
| **Book** | Appointments without flake | Per booking / cancel | Car-service demo |
| **Quote** | Price/eligibility without commit | Per quote or bundled | Feeds Book/Switch |
| **Account** | Scoped account read/update | Per gated update | Medium/high risk |
| **Switch** | Provider change (energy etc.) | High willingness-to-pay | NZ EA path |
| **Claims** | Insurance/warranty packs | Per claim filed | Needs Evidence |
| **Wait** | Durable async / human waits | Included or per waiter | First six |
| **Receipt** | Proof for audit/CRM | Included or premium retention | First six |
| **Inbox** | Actionable inbound triage → DO | Per resolved thread | Not generic email sync |
| **Agentize** | Wrap human sites into contracts | Setup + usage | First six |
| **Return** | RMA / reverse logistics | Per return | Commerce |
| **Deliver** | Ship/track/redirect | Per label / track event | NZ Post |
| **Rewards** | Loyalty earn/redeem under permit | Sponsored + usage | Sponsored Journeys |
| **Negotiate** | Bounded offer/counter | Per closed negotiation | Policy-heavy |
| **Subscription** | Start/stop/change plans | Per change | Account + Permit |
| **Warranty** | Register / claim warranty | Per registration/claim | Evidence |
| **Evidence** | Hashable packs for verify | Per pack / storage | Feeds Claims/Tender |
| **Identity** | Entity / person resolve | Per verify | NZBN / RealMe adapters TBD |
| **Verify** | Post-condition checks | Bundled with Receipt | VAR metric |
| **Travel Rescue** | Rebook/compensate under stress | High urgency WTP | Human-heavy |
| **Home** | Home services book/claim | Local services vertical | Book + Call |
| **Auto** | Vehicle service / insurance | Flagship car demo | Book + Claims |
| **Property** | Titles/consents/rates assist | Professional WTP | LINZ + councils |
| **Government** | Agency form/submit rails | B2B / compliance | Verify endpoints |
| **Tender** | Find/assemble/submit | Pursuit revenue | GETS |
| **Business** | NZBN / onboarding / KYC assist | Onboarding fees | NZ Business |
| **Energy** | ICP / usage / switch | Switch bounty / SaaS | EA |
| **Bank** | Open-banking abstraction | Critical risk; premium | Permit above pay |
| **Contract** | Commit under gates | Legal/ops WTP | Human required often |
| **Procurement** | PO / supplier actions | Enterprise Assembl | Policy |
| **Compliance** | Attestations + evidence | Audit budgets | Receipt + Evidence |
| **Human** | Escalation with context | Per escalation / SLA | Escape hatch |

---

## What we deliberately skip

| Category | Why skip |
|----------|----------|
| Slack / Notion / HubSpot commodity CRUD | Composio / Pipedream |
| Raw headless browse as product | Browserbase et al. |
| Chat UI frameworks | Clients, not DO |
| Unscoped “do anything” agents | Unsafe; no Permit model |

---

## Prioritisation heuristic

1. Human can do it today in <15 minutes on a site or phone.  
2. Agent fails >30% without a governed action layer (**hypothesis** — measure later).  
3. Clear receipt / undo / risk class.  
4. Not already a solved SaaS connector.  
5. NZ rail available or demoable with a partner adapter.

**Score candidates** with the Agentability Score in `DO_RADAR.md`, then map to DO services in the table above.

---

## Related

- `DO_ACTION_CLOUD.md` — service definitions  
- `NZ_ACTION_CLOUD.md` — NZ rails  
- `SPONSORED_AGENT_JOURNEYS.md` — monetisation via approved next steps  
