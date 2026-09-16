# DO Radar — Monitoring & Watchlist

**Purpose:** Classify external signals so Assembl / DO / Pursuit build the right adapters — not parallel standards.  
**Locale:** NZ English  
**Update cadence:** Hypothesis — weekly scan; re-score Agentability when portals change.

---

## Classification legend

| Class | Meaning | Typical response |
|-------|---------|------------------|
| **INFO** | Awareness only | Note in changelog |
| **EXPERIMENT** | Spike / prototype allowed | Time-boxed lab |
| **ADAPTER** | Wrap as DO adapter | Implement behind Action Contract |
| **PROTOCOL SUPPORT** | Interop, don't invent | Implement client/server conformance |
| **STRATEGIC BUILD** | Core DO/Assembl investment | Roadmap epic |

---

## Global watchlist

| Signal | Class | Why it matters to DO |
|--------|-------|----------------------|
| MCP registry / MCP ecosystem | PROTOCOL SUPPORT | `mcp.do.assembl.ai` surface |
| A2A (agent-to-agent) | PROTOCOL SUPPORT | Transport independence |
| IETF agent delegation work | PROTOCOL SUPPORT | Authority / permit alignment |
| AuthZEN / OIDC evolution | PROTOCOL SUPPORT | AuthZ decisions for permits |
| AP2 / UCP / ACP (agent payment / commerce protocols — names as announced) | PROTOCOL SUPPORT / EXPERIMENT | Permit above payments; do not fork |
| Visa TAP | ADAPTER / EXPERIMENT | Card / agent payment rail |
| Stripe agent / payment APIs | ADAPTER | Execute + Receipt for pay |
| Twilio | ADAPTER | DO Call |
| Browser agents (Browserbase, vendor sidebars) | INFO / EXPERIMENT | Agentize adapter only; not core |
| Cloud AI changelogs (OpenAI, Anthropic, Google, Mistral, etc.) | INFO | Capability shifts; Sponsored Agents WATCH |
| Firefox Smart Window / Mistral Small 4 | INFO → EXPERIMENT | See `DO_BROWSER_RUNTIME.md` |
| OpenAI Ads / Sponsored Agents | INFO / WATCH | Future distribution adapter only |

Re-verify protocol names and maturity before external claims — landscape moves quickly.

---

## NZ watchlist

| Signal | Class | Why it matters |
|--------|-------|----------------|
| MBIE API portal | INFO / ADAPTER | Catalogue of gov APIs |
| NZBN | ADAPTER | Business identity |
| Companies Office | INFO / ADAPTER | Entity data where API exists |
| CDR / open banking (NZ path) | STRATEGIC BUILD / EXPERIMENT | Bank abstraction + Permit |
| Electricity Authority (EA) | ADAPTER / STRATEGIC BUILD | ICP / switch |
| LINZ | ADAPTER | Property base |
| GETS | STRATEGIC BUILD (via Pursuit) | Tender find/submit |
| Digital.govt.nz | INFO | Standards & guidance |
| RealMe | EXPERIMENT / ADAPTER | Identity (**verify integration model**) |
| NZ Post | ADAPTER | DO Delivery |
| Councils (Auckland first) | ADAPTER | Property / consents |
| NZTA | INFO / ADAPTER | Vehicle / licensing where APIs exist |
| Stats NZ | INFO | Reference data |

**Always verify live endpoints, ToS, and auth before implementation.**

---

## Agentability Score (0–100)

Score a rail or API for agent-readiness:

| Dimension | Points (max) | Scoring guide |
|-----------|--------------|---------------|
| Documented public API | 25 | 0 none · 12 partial · 25 full OpenAPI |
| Stable auth (OAuth/OIDC/keys) | 20 | 0 scrape-login · 10 API key · 20 OAuth + refresh |
| Write / action support | 20 | 0 read-only · 10 limited write · 20 full consequential actions |
| Idempotency / webhooks / async | 15 | 0 none · 8 either · 15 both |
| ToS allows automation / agents | 10 | 0 forbid · 5 grey · 10 explicit allow |
| Completeness for NZ use-case | 10 | Gaps vs human task |

**Bands:** 0–29 scrape/Human-heavy · 30–59 Agentize candidate · 60–79 ADAPTER backlog · 80–100 STRATEGIC BUILD ready.

Store scores with date + source URL in engineering notes (**TBD** location in repo).

---

## Operating rhythm (hypothesis)

1. Scan global + NZ lists weekly.  
2. Reclassify on material API launch.  
3. Any **PROTOCOL SUPPORT** item: prefer conformance over invention (`CODEX.md`).  
4. Feed STRATEGIC BUILD into `IMPLEMENTATION_ROADMAP.md`.

---

## Related

- `NZ_ACTION_CLOUD.md`  
- `SPONSORED_AGENT_JOURNEYS.md`  
- `DO_BROWSER_RUNTIME.md`  
- `CODEX.md`  
