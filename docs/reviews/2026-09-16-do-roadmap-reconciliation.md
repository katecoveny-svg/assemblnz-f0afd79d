# DO roadmap reconciliation — 16 September 2026

## Recommendation

Keep assembl as the company front door, with Pursuit / DO / Studio. Keep the portable purple DO companion and its specialist identities. Build reliable signed-in work and receipts before expanding the number of surfaces or commercial promises. Models remain interchangeable workers; identity, permissions and outcomes belong to DO.

This audit compares the supplied issue list with main `febec7371` and the current source. “Implemented” means code exists; it is not proof of production use. Earlier production verification is identified separately. This change extends existing catalogue, evaluator and visual primitives; it does not add a parallel runtime.

## Built in this change

- Remove the inherited Georgia/italic typography from homepage product verbs and emphasis. Instrument Sans remains the company typeface.
- Change the specialist heading to “Meet your To DO’s.” with the canonical purple D-and-dot mark and accessible full text.
- Record the explicit logo decision in the brand guide and personal memory update requested by Kate.
- Replace the family-pilot sign-in link on Connections with the universal account route and a return to Connections.
- Report connector configuration per app. Gmail requires its dedicated OAuth app configuration as well as Pipedream configuration; missing setup cannot start an OAuth flow.
- Distinguish a provider lookup failure from an empty list of connected accounts, with retry rather than a false disconnected state.
- Stop presenting the unconnected video pipeline as available/included.
- Require complete finite improvement metrics and reject accuracy regression even if cost improves. Promotion continues to mean a reviewable change, never an automatic production rewrite.
- Add connector authority, catalogue and misleading-evidence regression tests; include connector/auth dependencies in DO validation triggers.

## Full issue disposition

| Issue area | What exists | What should change / remaining acceptance evidence |
|---|---|---|
| DO core validation | Workflow already runs typecheck, shared/API/improvement/routing tests and a production build. | Extended connector/auth triggers and catalogue/connection tests here. Required branch protection is a separate repository setting; workflow existence alone does not enforce merge policy. |
| Deployment noise | Scoped Edge deployment selection and same-commit Vercel rebuild correction merged. | Continue one coherent feature commit; do not batch unrelated security and visual changes merely to reduce comments. |
| Tracked `.env` | Issue #1250 is OPEN; the file remains tracked. No values inspected. | Follow its dedicated inventory, environment verification and rotation sequence. Removing a file does not rotate a leaked secret. Keep this separate from the UI change. |
| Adversarial evaluation | Policy, owner isolation and private-memory tests exist; new owner-injection/origin and evidence-tampering cases added here. | Still need actual model prompt-injection and memory-poisoning corpora, tool traces and scored provider runs. Unit tests are not model resistance proof. |
| Universal account doorway | `/login` and safe return routing exist; production sign-in request accepted in earlier checks. | Connections now points there. Email delivery remains unresolved pending Brevo access; authenticated end-to-end voice/connection proof is blocked by it. |
| Surface Connections from DO / Office / Builder | DO and Office links exist; Connections links back to Office and Builder. | Builder navigation now links directly to Connections; preserve one capability-first directory. |
| Capability-first connectors | Communication/work/creative/spatial catalogue and Pipedream abstraction exist. | Per-app setup truth and video preview fixed here. Calendar, browser and finance require real adapters, not more enabled-looking cards. |
| Disconnect / reconnect / account selection | Gmail owner-scoped disconnect exists in service code. Generic lifecycle UI is missing. | Implement server-derived opaque account selection and owner verification; show granted scopes from provider metadata. Do not infer a grant from catalogue text. |
| Step-up OAuth | Dedicated Gmail app path exists. | Verify that deployed provider configuration requests the intended minimum scopes; add task-triggered incremental consent. Do not silently widen grants. |
| Durable Builder jobs | Job contract/planning endpoint/local runner exist; Builder workspace still uses localStorage. | Next foundation: owner-scoped job repository, idempotent events/receipts, refresh and cross-account tests, then wire the UI. Reuse Office schema rather than another job database. |
| Outcome / evidence / model-call links | Existing OS evidence and model infrastructure are reusable; Builder does not close this loop. | Record actual execution IDs, model call IDs, human outcome and candidate refs. Never manufacture a successful receipt on plan creation. |
| Self-improvement | `lib/os/improvement.ts` and tests exist. | Invalid/missing measurements and accuracy trade-off fixed here. Still connect measured workflow stats and require comparable evaluation sets. PR-only promotion remains correct. |
| Cost / latency / hallucination / tool / security evals | Numeric improvement gate and some focused security tests exist. | Need real baseline/candidate datasets and measured executions across all dimensions; do not label new unit tests a complete frontier benchmark. |
| `do` CLI | `apps/do/builder-runner/runner.mjs` exists, dry-run first. | Package init/run/connect/inspect/eval/office with documented exit codes and integration tests. Keep it opt-in and preserve isolated worktrees. |
| Open AgentSpec / Job / Receipt | Shared types, builder contracts and runtime spine exist. | Publish versioned schemas with compatibility rules, examples and conformance tests before claiming a stable protocol. |
| MCP / per-user OAuth | `plugins/mcp-servers/mcp-assembl-os` exists with request context and tools. | Verify deployed membership schema, consent routing, scopes and customer isolation; complete hosted ChatGPT UI and real OAuth proof separately. |
| Runner/model adapters | Local runner supports Codex / Claude Code / Grok Build; shared runtime and OpenAI adapter exist. | Gemini/open/local adapters and interchangeable local/cloud execution still need conformance and cancellation/receipt tests. |
| Portable skills | Repo SKILL.md/prompts and governed context exist. | Define versioned inputs/outputs/tools/authority/eval packaging; do not claim all installed assistant plugins are available to DO customers. |
| Usage rail / budgets | Model routing and `model_calls` infrastructure exist; live voice has bounded starts/duration. | Build private DO/job/day/month views from actual rows, actual cost vs estimate labels, spend reservations and caps. Do not invent subscription credit balances. |
| Creative Director | Specialist and Studio foundations exist. | Wire actual child jobs, shared brand context, provider results and human review. Avoid a facade of specialists claiming completed media work. |
| Three / R3F | Production scene runtime exists. | Retain it. Performance-test assets on mobile and reduced motion before richer scenes. |
| Spark / SuperSplat | Candidate entries and earlier research exist; no shipped adapter. | Evaluate an optional rights-cleared capture against mesh baseline, download size and memory/frame budget. These are asset tools, not the agent runtime. |
| SpatialGen | Research-only catalogue entry. | Keep research-only pending commercial licence, data and GPU path verification. |
| Visual brand regression | Brand/front-door source guards exist. | Typeface and logo decision fixed here; add reviewed screenshot baselines per route/viewport. Source guards alone cannot detect visual drift. |
| Office / rooms / handoffs | Harbour scene and accessible Needs You / Working / Done projection exist with demo state. | Bind to durable authenticated jobs and structured handoffs before representing live collaboration. Room labels do not create connected capabilities. |
| Secrets Vault | Server-side credentials and connector-held OAuth patterns exist. | Audit each raw-secret boundary; customer-facing Vault and Mac Keychain flow need implementation and proof. No secret should enter prompts or receipts. |
| Personal Finance Vault | Bills reading foundations exist; not a complete encrypted financial vault. | Separate consent, encryption/key lifecycle, retention, export/delete and owner isolation. Begin with reviewed bill explanations; keep payment authority separate. |
| Payment/transaction authority | Approval policy foundations exist. | Preserve explicit approval and reconcile outcome; a finance connection never authorises payment. |
| Free / Personal / Pro / Team / Enterprise | Proposed packaging, not verified shipped entitlements. | Start one bounded paid design-partner offer with usage limits and measured outcomes; only advertise tiers after billing/entitlements/support are implemented. |
| Strategic acquisition value | Commercial hypothesis. | Measure retention, cross-device use, open protocol adoption, workflow outcomes, routing economics and revenue. No buyer or acquisition outcome is guaranteed. |

## Build order after this correction

1. Resolve delivery and prove one authenticated DO journey: choose context → prepare → review → receipt → reopen on another device.
2. Wire durable Builder/Office jobs to the existing schema and owner rules; then real handoffs and Office motion become useful.
3. Add connector lifecycle and real task adapters, starting with one mailbox and one reviewed Bills outcome.
4. Add metered usage and budgets before paid/background/media execution.
5. Ship a versioned CLI/protocol/MCP SDK against those same contracts; then extend runner providers.
6. Add evaluated Creative Director and optional captured 3D scenes after the workflow works.
7. Package the proven product into paid plans and design-partner pilots.

These are sequenced remaining builds, not features shipped by this PR. Live database/provider configuration, secret rotation, OAuth scopes, billing and background execution require their own concrete implementation and release verification. Preserve existing authorisation boundaries and never turn this roadmap into silent production self-modification.

## Verification for this correction

- Production build passed (Next 16.2.6), including brand and public-front-door guards.
- Typecheck and changed-source ESLint passed. Existing Builder localStorage hydration now has a narrowly documented lint exception for SSR/client agreement; behaviour is unchanged.
- DO focused suite: 167 passed, two opt-in provider tests skipped. Tests cover configuration gating, authenticated ownership, hostile origin/body owner, provider failure, catalogue promotion boundaries, and incomplete/regressing improvement evidence.
- Production build served locally on port 3098. Browser screenshots inspected: corrected upright “find it.” at 375px; To DO mark/heading at 375px and 319px. DOM check at 319px: document width equals viewport, no horizontal overflow.
- Connections rendered setup-needed disabled buttons and the universal `/login?redirect=%2Fdo%2Fconnections` link; video and splats visibly marked Preview. No OAuth flow, customer email, provider job or external transaction was run.
- This is local runtime proof, not a claim that these changes are deployed. Sign-in delivery and real authenticated provider use still require verification.

Confidence: source-state classification 0.95; correction behaviour 0.93 based on tests/build/browser checks; live connected-product completion remains unproven. The missing runtime evidence is explicitly retained as remaining work above.
