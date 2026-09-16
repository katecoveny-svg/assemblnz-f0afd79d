# Sponsored Agent Journeys (Assembl)

**Status:** Build brief — Assembl provider-neutral product  
**Verdict on OpenAI Ads:** **WATCH** — build Assembl version **now**  
**Claims currency:** Based on **September 2026** announcements — **verify before any public launch claim**  
**Locale:** NZ English

---

## Context (external landscape)

As of Sep 2026 announcements (re-verify before marketing):

- OpenAI is testing **Sponsored Agents** in ChatGPT Ads (US), labelled and separated from the independent answer.
- Ads Manager plugin and HubSpot / Shopify integrations have been described in those announcements.
- There is **no public OpenAI Ads API** to build on today.

**Assembl rule:** MUST NOT build on OpenAI Ads API (none public yet). Treat OpenAI Ads as a **future distribution adapter only**.

---

## Assembl differentiator

Assembl Sponsored Journeys are **provider-neutral** and run on surfaces Assembl already owns or partners with:

> **branded agent → understand intent → assemble useful next step → reward/offer if genuine → approved action → CRM/commerce handoff → receipt**

| Step | Owner | DO involvement |
|------|-------|----------------|
| Branded agent | Assembl / client | Policy + identity |
| Understand intent | Agent + Assembl | No side effects |
| Assemble useful next step | Assembl | Quote / discover |
| Reward / offer if genuine | Loyalty / sponsor | Permit-gated redeem |
| Approved action | **DO** | prepare → permit → execute |
| CRM / commerce handoff | Assembl | Webhook + Account adapters |
| Receipt | **DO Receipt** | Audit + sponsor reporting |

---

## Where journeys run (not ChatGPT-only)

- Client websites / logged-in apps  
- DO MCP / SDK clients  
- Loyalty programmes  
- Partner apps  
- Other agent platforms (future adapters, including possibly OpenAI Ads when/if API exists)

---

## What we build now

1. Journey schema (intent → offer eligibility → action contract → handoff).  
2. Sponsor policy: labelling, separation from unpaid advice, frequency caps (**policy TBD**).  
3. DO integration: only **approved** actions fire under Permit; always Receipt.  
4. CRM/commerce connectors as Assembl orchestration (reuse commodity connectors where appropriate — do not reinvent HubSpot CRUD).  
5. Demo: grocery / loyalty (see `DEMOS.md`).

## What we do not build now

- Dependency on OpenAI Ads API  
- Dark patterns / undisclosed sponsorship  
- Actions without Permit + Receipt  
- Competing as a generic ad network

---

## Risk & compliance (hypothesis)

| Topic | Stance |
|-------|--------|
| Labelling | Always disclose sponsored steps |
| Separation | Unpaid answer/path remains available where applicable |
| Consent | Loyalty / data use under tenant policy + Privacy Act |
| Measurement | Receipt-backed conversions, not chat impressions alone |

Legal review: **TBD** before NZ/AU public launch claims.

---

## Verdict

| Track | Action |
|-------|--------|
| OpenAI Sponsored Agents / Ads | **WATCH** — adapter later |
| Assembl Sponsored Journeys | **BUILD NOW** on Assembl + DO + loyalty/CRM |

---

## Related

- `DO_ACTION_CLOUD.md`  
- `DEMOS.md`  
- `DO_RADAR.md`  
