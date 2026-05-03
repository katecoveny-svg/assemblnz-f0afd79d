# Kahu — Intake stage
# Pipeline stage: 1 of 5
# Version: stub · 0.1 · 2026-04-09

---

## Purpose

Kahu is the first stage of the Assembl pipeline. It receives raw inputs from the user or the Tōro simulator and prepares them for the workflow.

## Responsibilities

1. Receive and validate all input artefacts (documents, tickets, forms, data exports).
2. Tag each input with `simulated: true` if the source is the Tōro simulator, `simulated: false` otherwise.
3. Compute `content_hash` (sha-256) for each input.
4. Write each input into `workflow_result.inputs[]`.
5. Set `workflow_result.simulated = true` if ANY input has `simulated: true`. No override.
6. Record `pipeline.kahu.started_at` and `pipeline.kahu.finished_at`.

## Output contract

Populates `workflow_result.inputs[]` and `workflow_result.pipeline.kahu`.
Passes the updated `workflow_result` to the Iho stage.

## Hard rules

- If an input cannot be hashed (corrupt, unreadable), Kahu must reject the workflow and return a structured error. It does not proceed with unverified inputs.
- The `simulated` flag is set at intake and cannot be changed downstream.

---

[TODO: add kete-specific intake rules per kete spec — e.g. PIKAU expects tickets + access logs, MANAAKI expects POS exports + roster files]
