# Validation checkpoint — Oct1 2026

- Frozen isolated dependency install: passed. Parent dependency tree is no longer shared; no parent checkout was changed.
- Canvas package build: passed.
- Full main TypeScript check: passed (`pnpm typecheck`).
- Relevant Vitest: 6 passed. Original hub schema roundtrip, stale-write rejection, memory isolation, no native network fallback, original interactive HTML renderer with private sentinels excluded, grant identity/scope/status/expiry checks, unavailable recipient endpoint and production/host gating.
- Scoped lint on new adapter/policy/tests/routes: passed. This does not assert that all copied historical components meet today's full-repo lint rules.
- Brand guard: passed. Public-front-door guard: passed. Macron guard: passed with local IPC enabled. Diff whitespace check: passed.
- Local Next webpack development route: `/review/client-hub` HTTP200; compiled actual ConceptStudio dependency closure. Recipient API: HTTP404 with private/no-store. Local server stopped after proof; no browser tab touched.
- Original five dirty-file SHA256 checks: all unchanged.
- Source dependency inventory:58 files, no unresolved local imports.
- Summerset/Ryman-family legacy room API code exercised without provider credentials and synthetic request data only: both503, no external provider call. This is failure-path proof, not live vision output.

## Checks not green

- Normal production Turbopack build failed in existing Google font generation: cannot resolve `@vercel/turbopack-next/internal/font/google/font` and import-map query errors, including existing Cormorant Garamond modules. No production build acceptance claimed.
- Webpack production alternative failed at unchanged `components/brand/SplineScene.tsx` importing `@splinetool/react-spline` root export. That component and package version are unchanged by this migration. No unrelated runtime/dependency workaround added.
- No screenshot/mobile/keyboard/reduced-motion browser interaction proof: supported local browser controller is not exposed in this worker. HTTP and pure renderer tests are narrower evidence.
- No authenticated production storage, reconciled deployed source, production records/media, working paid image output or live recipient grant/media isolation proof. None implied by passing fixture tests.

## Release status

Local code checkpoint only. Publication authority is recorded, but this branch is **not ship-ready**. Keep original Site working. Coordinate browser proof and build recovery with root; reconcile source/data and implement authoritative storage/access boundaries before any real-content cutover. Audit confidential presets in client bundles before any deployment—even a gated page is not permission to ship private material in JavaScript.
