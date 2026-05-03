# Mahara — Memory and citations stage
# Pipeline stage: 4 of 5
# Version: stub · 0.1 · 2026-04-09

---

## Purpose

Mahara resolves and records all citations — the sources behind every finding and step — and links them into the workflow result.

## Responsibilities

1. For each citation referenced in `workflow_result.steps[]` or `workflow_result.findings[]`:
   - Confirm the citation exists in `workflow_result.citations[]`.
   - Verify `type` is one of: `doc` | `law` | `reasoning`.
   - Verify `locator` is present and non-empty.
   - Verify `retrieved_at` is a valid ISO 8601 timestamp.
2. Write `workflow_result.citations[]` with all resolved citations.
3. For `law` citations: confirm the Act name is a real NZ Act and the section reference is in the correct format.
4. Write `workflow_result.pipeline.mahara.started_at` / `finished_at`.

## Output contract

Populates and validates `workflow_result.citations[]`.
Passes to the Mana stage.

## Hard rules

- A citation of type `doc` must reference an attachment filename that exists in `workflow_result.inputs[]`.
- A citation of type `law` must include the Act name and section. Format: `[Act Name] s[section]` (e.g. `Privacy Act 2020 s3A`).
- A citation of type `reasoning` must include the full reasoning chain text and the model version.

---

[TODO: add citation resolution against live KB — to validate NZ law references against kb/nz/ files]
