# Mana — Sign-off stage
# Pipeline stage: 5 of 5
# Version: stub · 0.1 · 2026-04-09

---

## Purpose

Mana is the final stage. It runs the trace check, records the reviewer, and calls the evidence bundle generator to produce the output zip.

## Responsibilities

1. **Trace check (hard gate):** Confirm that every finding in `workflow_result.findings[]` has a non-empty `source_pointer` that resolves to a citation in `workflow_result.citations[]`. If any finding fails this check, Mana returns a structured error and **no zip is written**.
2. **Simulated flag check:** Confirm `workflow_result.simulated` correctly reflects whether any input was simulated. If `workflow_result.inputs` contains any `simulated: true` entry, `workflow_result.simulated` must be `true`.
3. Record reviewer details in `workflow_result.reviewer` if provided. Leave as `null` if not — the bundle cover will show "Unsigned" status.
4. Write `workflow_result.pipeline.mana.started_at` / `finished_at`.
5. Call `build_bundle(workflow_result, options)` from the evidence bundle generator.
6. Return the `BundleArtifact` to the host for storage and delivery.

## Output contract

Calls `build_bundle()`. Returns `BundleArtifact` or a structured error.

## Hard rules

- Never call `build_bundle()` if the trace check fails.
- Never override the `simulated` flag, even if a reviewer asks.
- If `workflow_result.reviewer` is provided, `signed_at` must be present and valid.

---

[TODO: wire the actual build_bundle import from evidence-bundles/generator.ts]
