# assembl site and DO runtime repair implementation plan

> **For Hermes:** Use subagent-driven-development to implement isolated tasks, followed by spec and code-quality review.

**Goal:** Repair the public front door and useful DO paths without claiming previews or configured credentials are verified integrations.

**Architecture:** Preserve the current Next.js root app, the shared WorldScene/atelier asset, DoMark, AgentSpec/policy/evidence spine and existing connector/services. Work on `hermes/site-runtime-repair` in an isolated worktree. Preserve the older dirty checkout. No parallel runtime or new visual stack.

**Tech stack:** Next.js 16, React 19, TypeScript, pnpm 9.15.9, Vitest, Three/R3F, Vercel, existing Supabase and connector adapters.

## Scope and authority

User authorises implementation and a verified live-site release. This does not authorise agents to send, book, publish, submit or spend for arbitrary users. Do not alter production database permissions, add paid services or enable new external-action rails without a specific approved scope. Provider/model calls for proof must be bounded and use synthetic, non-sensitive inputs; request cost authority before paid generation.

Loaded canon: START_HERE.md, AGENTS.md, config/context-manifest.json, docs/context/CURRENT.md, docs/context/README.md, docs/assembl-context.md, docs/assembl-brand-system.md, DESIGN.md, docs/assembl-copy-standard.md, docs/factory/PRIMITIVES.md, docs/ENVIRONMENT.md and release/router docs.

## Task 1: Restore the canonical homepage copy contract

Files: `components/site/assembl-the-work/copy.ts`, `copy.test.ts`, `AssemblWorldHero.tsx`, `AssemblTheWorkHome.tsx`.

1. Baseline command: `pnpm test`. Already RED: `copy.test.ts` expects `HERO.headline = assembl the work.`, `subhead = find it. DO it. show it.`, `loopLine = use one. connect two. run the whole loop.` Current source contradicts all three.
2. Update the canonical constants; retain the concrete product explanation as `body`.
3. Bind hero and product strip to the constants rather than parallel hard-coded text.
4. Run `pnpm exec vitest run components/site/assembl-the-work/copy.test.ts`.
5. Verify actual rendered hero contains master line, shorthand, concrete explanation and full commercial line.

## Task 2: Repair the fly-through as a product experience

Files: `AssemblWorldHero.tsx`, `assembl-world-hero.module.css`, existing `app/preview/do-world/WorldScene.tsx` if a scene defect is reproduced; regression test at the shared motion seam where needed.

1. Capture baseline desktop and 375px mobile; log console and layout bounds.
2. Reproduce any layout/motion/resilience issue with Playwright; write focused red assertion.
3. Retain the Blender atelier and one shared scene. Use readable DOM chapters for Pursuit, DO and Studio, useful CTAs and visible illustration boundary. Product entry must remain available without completing a long fly-through.
4. Preserve pause, full reduced-motion state, keyboard/focus, static poster/WebGL failure and no horizontal scrolling. Stop expensive rendering when not needed.
5. Verify with screenshots and actual user interactions. Do not call a screenshot of a loading poster proof of WebGL rendering.

## Task 3: Repair verified route, DO and portability defects

Pending findings from read-only audits in `docs/reviews/site-repair/`. Add exact files, regression and implementation steps only after reproducing each defect. Prioritise public-route correctness, agent task dispatch, connector capability truth, safe context handoff and approved task execution. Report external setup separately; do not hide it behind a mock or label change.

## Task 4: Proof and release

1. Run focused tests, full `pnpm test`, `pnpm typecheck`, relevant eslint, `pnpm context:check`, brand/macron/front-door guards and `pnpm build`.
2. Exercise public links, job entry, DO task results with synthetic input, install/download paths, read-only connector states, auth failure and approval denial paths.
3. Preserve authenticated-provider blockers explicitly. Never test by reading private mail or sending a real message.
4. Record evidence and review diff for privacy/security and correct claims. Create a reviewable PR and preview through the existing Vercel route.
5. Only promote passing verified work under the user's explicit deployment authority. Record deployment URL/commit, production smoke checks and rollback.
6. Update reusable tests/runbook/primitive documentation for what was genuinely improved.
