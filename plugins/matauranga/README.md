# matauranga/

Secondary Education (NCEA L1-L3, UE, Achievement Standards) plugin pack.

Pilot customer: Sacred Heart College weekly-report parsing.

> Mātauranga = knowledge, wisdom, the formal body of learning. In assembl's plugin canon, this is the kete that supports parents and tamariki through secondary education — NCEA Level 1 through 3, University Entrance, NZQA achievement standards, Sacred Heart-style weekly reports, study prep, and UE Literacy / Numeracy tracking.

## Status

**v0.0.1** — scaffold only. Build day to be scheduled.

Agents live on prod (`wurwcrgxjjwqdaxqceey.agent_prompts`) under `pack='matauranga'`:

| agent_name | length | source | status |
|---|---|---|---|
| `matauranga` (parent) | TBD | — | to be carved from `ako` Lovable port |
| `matauranga-comply` | TBD | — | to be carved from `ako-comply` |
| `matauranga-whanau` | TBD | — | to be carved from `ako-whanau` |

The data migration that moves the NCEA-heavy `ako` trio to this kete is queued at `supabase/migrations/20260513140600_phase8_matauranga_carveout.sql` but **NOT applied yet** — it ships after Cowork updates `lib/kete.ts` and the `/kete/matauranga` page exists so the runtime can route to it.

## Why separate from ako

The 2026-05-13 Cowork site audit surfaced a canon split: `plugins/README.md` (locked 2026-05-08) had Ako = Education, but `lib/kete.ts` + the live site rendered Ako = Early Childhood. The actual `agent_prompts` content imported from Lovable Cloud on 13 May was unambiguously secondary-education (NCEA-heavy, Sacred Heart weekly-report parsing, NZQA past papers, UE Literacy/Numeracy at 9,680/5,549/5,193 chars).

Rather than discard ~20 KB of canon NCEA work OR force-fit ECE content over it, Kate elected to split:
- `ako` → Early Childhood Education (Te Whāriki, licensing, ratios, NEC) — new prompts to be written
- `matauranga` → Secondary Education (NCEA, UE, Achievement Standards) — receives the imported Lovable trio

## NZ legislation in scope

- Education and Training Act 2020 (Part 4, secondary schools)
- NZQA Act 2024 (Achievement Standards, NCEA framework)
- Privacy Act 2020 (student data, parental consent under age 16)
- Te Tiriti o Waitangi obligations (Te Mātaiaho refresh, tikanga in curriculum delivery)

## Tools (planned)

| Tool | Purpose | Status |
|---|---|---|
| `toro_curriculum_resources` | Y0-13 + NCEA L1-3 resource lookup | Live in `tool_registry` |
| `toro_list_homework_due` | Per-child homework prioritisation | Live |
| `assembl_evidence_pack` | Watermarked PDF output | Live |
| `assembl_cross_agent_handoff` | Handoff to other kete (e.g. `toro` for whānau context) | Live |

## Sub-agents (planned)

- `apex-matauranga` — research/discovery for NCEA tracking (to be carved from `apex-ako`)
- `mana-matauranga` — approval gate for sharing student data (to be carved from `mana-ako`)
- `nova-matauranga` — cross-agent connector (to be carved from `nova-ako`)

## Status

Scaffold only — see `docs/runbooks/2026-05-13-lovable-port-forward/` for the carve-out plan and Reo's editorial brief for new ako (ECE) prompts.
