# Iho — Orientation stage
# Pipeline stage: 2 of 5
# Version: stub · 0.1 · 2026-04-09

---

## Purpose

Iho orients the workflow — it identifies the agent, the kete, and the pipeline plan, and writes that context into the workflow result before the work begins.

## Responsibilities

1. Confirm the agent name, version, and kete from the runtime context.
2. Write `workflow_result.agent` (name, version, kete).
3. Plan the pipeline stages that will run for this workflow and document any stages being skipped with a reason.
4. Write `workflow_result.pipeline.iho.started_at` / `finished_at`.
5. Load the relevant KB files for the kete (referenced by path from `kb/nz/`).

## Output contract

Populates `workflow_result.agent` and `workflow_result.pipeline.iho`.
Passes the updated `workflow_result` to the Tā stage.

## Hard rules

- Agent version must be a semantic version string (e.g. `1.0.0`). A missing version is a hard error.
- Kete must be one of: `MANAAKI`, `WAIWAIHANGA`, `AUAHA`, `ARATAKI`, `PIKAU`. Unknown kete is a hard error.

---

[TODO: wire KB loading — specify how the agent runtime resolves kb/nz/ paths]
