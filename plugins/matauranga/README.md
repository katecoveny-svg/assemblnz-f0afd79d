# matauranga/

Secondary Education (NCEA L1-L3, UE, Achievement Standards) plugin pack — **secondary-school-operator audience**.

> Mātauranga = knowledge, wisdom, the formal body of learning. In assembl's plugin canon, this is the kete that supports secondary schools (operators, principals, deputy-principals, NCEA coordinators) running NCEA L1-L3 programmes — NZQA Achievement Standards tracking, ERO secondary review cycles, weekly-report generation for whānau, UE Literacy/Numeracy compliance.

Pilot customer (placeholder): Sacred Heart College.

## Status

**v0.0.0 — greenfield, awaiting pilot.** No content yet. No agent_prompts seeded. The Lovable port-forward (2026-05-13) brought zero source content for this kete.

The Lovable AKO trio that was originally proposed as the seed for this kete (in an earlier brief addendum) turned out to be **Early Childhood Education content**, not NCEA. That content stays in `pack='ako'`. See `docs/runbooks/2026-05-13-lovable-port-forward/POST-MORTEM-AKO-NCEA-MISCLASSIFICATION.md` for the chain of evidence.

The whānau-facing NCEA layer (parents tracking their kids' NCEA) is **already live on prod under `pack='toro'`** (toro-education, toro-email, toro-family, toro-homework). That's the family-facing use case.

This kete (Mātauranga) is the **school-operator-facing** use case — a school tracking its own students from the institution side. Different user, different lens.

## NZ legislation in scope (for fresh writes, when pilot starts)

- Education and Training Act 2020 (Part 4, secondary schools)
- NZQA Act 2024 (Achievement Standards, NCEA framework)
- Privacy Act 2020 (student data, parental consent under age 16)
- Te Tiriti o Waitangi Article 3 obligations in secondary curriculum delivery
- Te Mātaiaho refresh expectations
- Health and Safety at Work Act 2015 (school grounds duties)

## Planned agents (greenfield, written from pilot signal)

- `matauranga` (parent kete master) — secondary-school operations
- `matauranga-comply` — privacy + NCEA compliance gate
- `matauranga-whanau` — parent-engagement communications at NCEA level

All three to be written from scratch once a pilot customer (Sacred Heart or similar) commits, fitted to the actual school's reporting cadence and student-data architecture. Do not seed with template content — empty kete is better than mis-shaped kete.

## Tools (planned, mostly already on prod from Phase 4a)

| Tool | Purpose | Status in tool_registry |
|---|---|---|
| `toro_curriculum_resources` | Y0-13 + NCEA L1-3 resource lookup | Live (shared with Tōro whānau side) |
| `toro_list_homework_due` | Per-student homework prioritisation | Live |
| `assembl_evidence_pack` | Watermarked PDF for parent communications | Live |
| `assembl_cross_agent_handoff` | Handoff to Tōro for whānau-side context | Live |
| `nova_qualmark_prep` | NZQA Quality Mark prep (school-level audit) | Live (currently wired to NOVA, may rewire) |

## Status

Greenfield. No PRs to push for Mātauranga content until a school pilot is signed. The runtime placeholder (`lib/kete.ts` entry + `/kete/matauranga` "coming soon" page) is queued for Cowork in `COWORK-PHASE7-BRIEF.md`.
