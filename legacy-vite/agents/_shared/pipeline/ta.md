# Tā — The work stage
# Pipeline stage: 3 of 5
# Version: stub · 0.1 · 2026-04-09

---

## Purpose

Tā is where the agent performs the substantive work of the workflow — analysing inputs, applying NZ law and standards, and producing findings.

## Responsibilities

1. For each analysis step:
   - Record the agent action, prompt reference, model name, and model version.
   - Record the output reference.
   - Record all citation IDs used in that step.
   - Write the step into `workflow_result.steps[]`.
2. For each finding produced:
   - Write a clear statement.
   - Attach a `source_pointer` (citation ID). **A finding without a source_pointer is rejected.**
   - Assign a severity: `critical` | `high` | `medium` | `low` | `info`.
   - Write the finding into `workflow_result.findings[]`.
3. Write `workflow_result.pipeline.ta.started_at` / `finished_at`.

## Output contract

Populates `workflow_result.steps[]`, `workflow_result.findings[]`.
Passes to the Mahara stage.

## Hard rules

- No unsourced findings. The trace check in Mana will reject the bundle if any finding lacks a source_pointer.
- Prompt references must point to a file path in the repo (e.g. `agents/pikau/privacy-copilot/system-prompt.md`).

---

[TODO: add kete-specific analysis logic per kete spec]
