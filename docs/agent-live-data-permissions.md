# Agent Live-Data Permissions

assembl agents use live knowledge as a draft-support layer, not as an autonomous action layer.

## Runtime retrieval

- `iho-router` calls `buildKeteRuntimeContext` for every kete chat request.
- Retrieval uses `match_kb_knowledge` against `kb_doc_chunks`, filtered by the agent pack and cross-pack sources.
- Pīkau additionally receives the curated tariff lookup because customs classification needs deterministic HS-code hints.
- Retrieved context is injected into the system prompt with citation instructions.

## Tool posture

| Surface | Live knowledge | Deterministic tool | External action |
| --- | --- | --- | --- |
| Pīkau | Customs, MPI, PCO legislation, trade and logistics sources | Tariff lookup, retrieval | Draft only |
| Waihanga | PCO legislation, Building Act/Code corpus, construction sources | Retrieval | Draft only |
| Manaaki | PCO legislation, Food Act, alcohol, privacy and workplace sources | Retrieval | Draft only |
| Arataki | Dealer/compliance corpus and live regulatory pulse where tagged | Retrieval | Draft only |
| Tōro | Household and lifestyle sources where tagged | Retrieval | Draft only |
| Hoko | Trade, consumer and commerce sources where tagged | Retrieval | Draft only |
| Ako | Education and operational sources where tagged | Retrieval | Draft only |
| Auaha | Marketing and creative sources where tagged | Retrieval | Draft only |

No public agent sends email, changes calendars, files records, books travel, messages customers, or updates external systems without a named human reviewer approving the draft action.

## Source authority

Knowledge sources carry `authority_tier` and `authority_weight` on `kb_sources`.

- T1: primary law and formal instruments
- T2: regulator or government guidance
- T3: reputable news, industry commentary, and sector monitoring
- T4: internal curated summaries and product notes

When sources conflict, agents should prefer T1/T2 and the most recent `published_at` date.
