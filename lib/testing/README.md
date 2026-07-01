# Agent testing protocol — V2 (Phase 1C)

Restores and generalises the lost V1 testing/simulator protocol
(BUNDLES-V4-SPEC-2026-06-29.pdf §7). The V1 pieces existed but were never
composed into one CI gate; the WAIHANGA world simulator was construction-only.
V2 composes all five pieces and generalises the simulator to every bundle.

## The pipeline

```
tests/agents/{bundle}.json      scenario packs (5 each: routing, red-flag,
        │                        ambiguous, te-reo, hostile)
        ▼
bundle-simulator.ts             deterministic "day-in-the-life" world per bundle
        │                        (generalised WAIHANGA site simulator)
        ▼
reference-agent.ts / live       the agent under test produces a response + route
        │
        ▼
rubric.ts                       five-axis rubric + always-on tikanga gate
        │
        ▼
run-suite.ts → agent-suite.test.ts   the CI gate (vitest) — merge blocked on fail
```

## The five axes (spec §7.2.2)

| axis | score | pass | measured by |
|---|---|---|---|
| factuality | 0–10 | ≥ 8 | behaviours evidenced + Mana Receipt sources cited |
| nz-accuracy | 0–10 | ≥ 9 | deterministic NZ-fact checker (Acts, $ amounts, regulators) |
| tone | 0–10 | ≥ 7 | assembl-voice lint (lowercase `assembl`, no slop, no emoji) |
| hard-rule | pass/fail | pass | every `hard_stop_check` (one fail = scenario fails) |
| route | pass/fail | pass | chosen route === `expected_route` (or a correct clarify/refuse) |

On top runs the **tikanga gate** (Mead's five tests — Tika · Pono · Aroha ·
Tikanga · Mana). A tikanga fail is a hard fail regardless of the other axes, and
a manual override can never bypass it.

## The seven bundles

`assembler` (site-day) · `forge` (workshop-day) · `practice` (clinic-day) ·
`counsel` (matter-day) · `hearth` (family-week) · `ensemble` (studio-day) ·
`visa` (caseload-day).

## Running

```bash
pnpm test:agents            # five-axis report for every bundle (deterministic)
pnpm test:agents practice   # one bundle
pnpm test:agents:ci         # the gate (vitest) — what CI runs
```

The suite is **deterministic and needs no secrets** — it grades the reference
agent and runs negative controls that prove the gate rejects broken agents. To
grade a live agent, pass an `AgentUnderTest` to `runBundleSuite`, or POST a
response to the `agent-test-run` edge function (which persists a five-axis row
and supports an admin-only, logged manual override).

## CI gate

The gate runs `pnpm test:agents:ci` on every PR that touches an agent prompt
(`lib/marketplace/agent-prompts.ts`), the seeded `agents.system_prompt`
migrations, or the protocol itself. Red = merge blocked.

The workflow ships staged at `docs/ci/agent-test-gate.yml` (the Claude Code
token lacks GitHub's `workflow` scope, same as the existing
`simulator-gate.yml`). Install it once:

```bash
cp docs/ci/agent-test-gate.yml .github/workflows/agent-test-gate.yml
git add .github/workflows/agent-test-gate.yml && git commit -m "ci: install agent-test-gate" && git push
```

## Persistence

- `agent_test_results` — five-axis result rows + `tikanga_gate` + override audit
  (migration `20260701120000_agent_test_protocol_v2.sql`).
- `agent_test_scenarios` — seeded mirror of the on-disk packs
  (`pnpm seed:agent-scenarios`; the JSON packs remain the source of truth).
