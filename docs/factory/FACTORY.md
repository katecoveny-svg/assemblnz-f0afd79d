# assembl software factory

## Purpose

assembl should increasingly behave as a software factory: intelligence finds valuable work, reusable systems assemble it, proof verifies it, and every completed build makes the next one easier.

This does **not** mean mass-generating apps. It means increasing trusted throughput.

## Connected system

### Pursuit — find the work
Find evidence-backed friction, opportunities, tenders, signals, changes and buyer needs.

Output: a bounded opportunity with evidence, value hypothesis, buyer/user, urgency and next action.

### Studio — show the possibility
Turn valuable opportunities into understandable proof: working demos, customer journeys, interfaces, simulations, video, imagery, pitches and tender artefacts.

Studio is a proof surface, not decoration.

### DO — execute the work
Perform bounded tasks in the browser and connected tools with transparent progress, approval at meaningful risk boundaries, and receipts after action.

### Factory — make all three compound
Own reusable context, primitives, agents, skills, connectors, tests, evals, proof capture and learning.

## Factory loop

`SELECT → ISOLATE → BUILD → PROVE → REVIEW → SHIP-READY → COMPOUND`

### SELECT
Before coding, state:
- who has the problem
- evidence it exists
- valuable outcome
- smallest proof
- reuse potential

If unclear, do discovery rather than a large build.

### ISOLATE
Feature work should use a dedicated branch/worktree where supported. Keep parallel agents out of shared mutable working state.

### BUILD
Build the smallest coherent implementation that proves the hypothesis. Prefer existing primitives before adding one-off mechanics.

### PROVE
No-error is not proof. Use tests plus runtime/visual evidence appropriate to the claim.

### REVIEW
Run relevant code, architecture, security/privacy and UX checks. Fix and retest rather than accepting first-pass generation.

### SHIP-READY
Prepare a reviewable PR with change, reason, evidence, checks, risks and rollback notes where relevant. Do not merge/deploy unless authorised.

### COMPOUND
Before closing a task ask: **what should assembl never need to build or rediscover from scratch again?**

Record that as a primitive, decision, test/eval, skill, learning or canonical context update.

## Factory economics

Track improvement through:
- lower lead time
- lower model/tool cost
- less repeated context loading
- less rework
- stronger runtime proof
- fewer escaped defects
- more stable primitive reuse
- more of Kate's time spent on product judgment, customers and taste rather than repetitive production

Optimise for **trusted throughput**, not autonomy for its own sake.

## Authority

### Tier 0 — read/analyse
Read code/docs, research public information, run read-only checks, create plans and local artefacts.

### Tier 1 — reversible repo work
On an explicitly requested build/fix: branch, edit, test, commit and prepare PRs. Do not merge automatically.

### Tier 2 — external/reputational/paid
Require explicit approval at the action boundary: messages, publishing, submissions, spending, billing changes, production data changes, production deploys not already requested, permissions/secrets.

### Tier 3 — high consequence
Never infer authority for irreversible production actions, destructive deletion, live financial transactions or binding commitments.

## First factory cleanup

The current repository contains shipping code alongside old experiments, research and generated evidence. Do not mass-move it.

First produce a classified repo inventory and identify:
1. duplicated context/instructions
2. duplicated implementation mechanics
3. archive candidates
4. missing eval/proof infrastructure
5. three highest-leverage factory improvements

Then clean incrementally through small PRs.
