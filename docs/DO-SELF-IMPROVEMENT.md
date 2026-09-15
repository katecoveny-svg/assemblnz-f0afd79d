# DO self-improvement loop

Builderdoo may improve its routing, skills, prompts and tool choices, but it must not silently rewrite production behaviour.

The loop is:

`job → evidence/receipt → evaluation → candidate improvement → baseline comparison → reviewable PR → promote or reject`

Existing primitives already support much of this:
- `os_evidence` records proof of work;
- `model_calls` records provider/model/tokens/latency/cost/outcome;
- `model_workflow_stats` stores measured workflow performance;
- `scripts/run-os-evals.ts` runs the Assembl eval set across configured models;
- `lib/os/routing-live.ts` routes using measured performance and recent failures;
- `docs/factory/LEARNINGS.md`, `PRIMITIVES.md`, and `DECISIONS.md` hold durable factory learning.

`lib/os/improvement.ts` adds the promotion gate for skill/prompt/routing/tool candidates. A candidate is never promoted when it widens authority or regresses security, hallucination rate, or tool success. High-risk workflows require independent review. Promotion means preparing a reviewable repo change; it does not mean autonomous production mutation.

Next implementation step: persist Builderdoo job receipts with the relevant `os_evidence` task, model-call refs, human outcome and improvement candidate ref so real production outcomes can feed the eval set.
