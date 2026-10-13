# Direction 4c verification — 13 October 2026

## Completed local checks

- Fresh isolated clone of remote main: `7a8c40305062fa102a46ff0b47fbedf05dd8623c`.
- Original supplied HTML/support.js preserved byte-for-byte; original reference and dirty primary checkout untouched.
- Locked pnpm install and canvas package build passed. No package/lockfile changes.
- `pnpm typecheck` passed.
- Scoped ESLint passed with zero warnings. `pnpm lint:all` completed successfully (Babel informational note about pre-existing large model-viewer vendor source).
- `node scripts/brand-guard.mjs` and `node scripts/public-front-door-guard.mjs` passed.
- `node --import tsx scripts/lint-macrons.ts` passed. The pnpm/tsx wrapper initially hit sandbox IPC restrictions; direct Node loader ran the same script successfully.
- `pnpm exec vitest run lib/do/navigation.test.ts`: 3/3 passed.
- Chrome desktop 1440×900, tablet 768×1024, phone 375×812. Phone/tablet document width equals viewport: no horizontal overflow.
- Pause/Play button changes its pressed state and pauses the engine on a fresh load.
- Reduced-motion initial load shows readable static wordmark/useful-work composition, disabled “Motion reduced” control and no running tide canvas.
- Actual Write link opens `/do?tool=write` with existing DO editor/menu; Studio opens `/creative-studio`; Pursuit opens `/pursuit` and shows its existing public entry. Existing sign-in boundaries remain present; no sign-in, microphone, provider or external action performed.
- Hero → useful-work scroll transition and in-page DO anchor exercised. Original standalone reference rendered separately for comparison.

## Visual evidence

Screenshots under `evidence/` document desktop hero, hero transition, phone hero/reduced motion, tablet and phone DO cards, and the original desktop reference. Motion frames are naturally different; reference and implementation both use the supplied typography, geometry, coastal footage, glass brand images and tide forms. The review notes enumerate intentional UI/copy differences. Dev screenshots include the Next development badge and existing Ask DO launcher.

## Build/release boundary

Production build is assigned to `.github/workflows/direction-4c-review.yml` to avoid a heavy build on a Mac with about 8 GiB free. CI outcome will be recorded on the draft PR. Local dev renders are not production-build proof. No merge or manual deployment is authorized or performed.

## Remaining review gates

- Product/copy approval of the explicitly documented provisional replacements, especially the unverified sealed-receipt claim.
- Visual approval of the DO entry-card substitution and mobile/reduced-motion adaptations.
- Hosted CI production build and any repository-managed preview result.
- Safari/iOS device and low-end GPU testing are not established by this Chrome check.
