# Rebuild verification · 12 October 2026 NZ

Branch: `codex/assembl-rebuild-20261012`. Base: `1fde189f81847c78021f087f0e15186c8cae8f94`. This is a reconstruction after loss of the earlier local workspace, not recovery of its original commits. Work is committed and pushed in small checkpoints. No merge or deployment is authorised or performed.

## Delivered

- Official Impeccable 4.5.2 Codex skill distribution, reference files, license and project hooks; pinned installer plus REA 6.4.0 bootstrap. `PRODUCT.md` and `docs/design/mockup-workflow.md` establish the repeatable mockup workflow without replacing Assembl's design canon.
- `/do/messages`: separate conversations, literal candidate next steps, editable tasks/owners/dates, private notes, exact-reply review, native sharing/copy/download, calendar-file export, explicit local saves and validated backups. Edits and imported data clear sharing approval.
- `/creative-studio/voices`: original Warm, Clear and Bright voice options, consent, job state, playback, WAV download and deletion. Uses existing Assembl authentication and a separate self-hosted Qwen worker. No ElevenLabs API is used by this flow.
- Private bounded voice API/worker, owner separation, expiry, queue/rate limits and Linux inference egress restriction. Weights are downloaded separately at a pinned revision. No model weights, credentials, private scripts or private user audio are committed.
- Real public demonstration WAVs and their hashes in `public/do/voice/assembl/`. These use a fictional greeting, not a person's recorded voice.
- Navigation links and exact voice-page sign-in return. Existing provider integrations, routes and client functionality are preserved. This branch's Vercel Git deployment is disabled.

## Verification

| Check | Result / scope |
|---|---|
| Frozen lockfile dependency install | Passed with pnpm 9.15.9; no app dependency changes |
| TypeScript | Standalone `tsc --noEmit` passed; production TypeScript phase also passed |
| Focused TypeScript tests | 45 passed across message model, native sharing, meeting follow-through, voice model and voice routes |
| Python tests | 16 passed: malformed input, owner isolation, audio deletion/expiry, admission limits, cancellation and offline guard |
| Targeted ESLint | Passed for rebuilt messages, voice Studio, voice API and model files |
| Macron / brand guards | Passed |
| Real voice inference | Warm 8.72s, Clear 8.24s, Bright 8.16s WAVs generated with the pinned model on CPU; hashes in sample manifest |
| Real HTTP voice lifecycle | Passed: unauthenticated and other-owner access rejected; 3.92s real audio generated/downloaded/hash-checked/deleted; 55.667s elapsed; see `evidence/voice-http-proof.json` |
| Production build | Passed: production compilation, TypeScript, all 206 static pages and final optimisation; exit 0 |
| Browser / responsive / accessibility | Passed on the production build at 375, 768 and 1440px for both routes: no horizontal overflow, zero axe WCAG 2/2.1 A/AA violations; keyboard skip link, reviewed-reply flow and controlled-owner voice playback/deletion passed; no uncaught page errors |

The worker's CPU generation is not realtime: public example generation took about 59–186 seconds each, including resource contention during the slowest run. The HTTP proof used the real model and service over loopback. The browser owner-state proof uses controlled API responses and a real generated WAV; it is not proof of a live signed-in Supabase session or deployed worker.

Screenshots and machine-readable browser results are in `docs/recovery/evidence/`. The signed-out voice request correctly returns HTTP 401; this is expected authentication behaviour. Generated-audio state was also checked with axe. This is scoped automated accessibility evidence, not a complete manual accessibility certification.

## Run the checks again

From the repository root:

```bash
npx --yes pnpm@9.15.9 install --frozen-lockfile
npx --yes pnpm@9.15.9 --filter @assembl/canvas build
NODE_OPTIONS=--max-old-space-size=6144 node_modules/.bin/tsc --noEmit
node_modules/.bin/vitest run apps/do/messages/model.test.ts apps/do/shared/sharing.test.ts apps/do/shared/meeting-followthrough.test.ts lib/voice/assembl/model.test.ts lib/voice/assembl/route.test.ts
node_modules/.bin/eslint app/do/messages app/creative-studio/voices apps/do/messages lib/voice/assembl app/api/creative/voices --max-warnings=0
node --import tsx scripts/lint-macrons.ts
NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=6144 npx --yes pnpm@9.15.9 build
```

Follow `services/assembl-voice/README.md` to create the Python environment and provision the pinned model. Then run `python -m pytest services/assembl-voice -q`, `python services/assembl-voice/verify_runtime.py` for public samples, and `python services/assembl-voice/verify_service.py` for the opt-in real HTTP proof. Set `ASSEMBL_VOICE_MODEL_DIR` for the last two commands.

The browser harness is `scripts/check-assembl-rebuild.cjs`. Start the built app locally, set `ASSEMBL_REVIEW_URL`, and supply Playwright/axe paths through `ASSEMBL_PLAYWRIGHT_MODULE` and `ASSEMBL_AXE_MODULE` when they are outside the project. This run used Playwright 1.51.1 / Chromium 134 and axe-core. Test dependencies are separate from the app lockfile.

## Remaining work and limits

- No approved website mockup has been supplied. No mockup fidelity comparison or full website redesign is claimed. Send the reference image and target page to begin that work.
- NZ English is a voice direction requested by the prompts. Accent authenticity, naturalness and pronunciation still need listening review by appropriate NZ speakers. Voice identity may vary by script.
- Te reo Māori generation, live NZ telephone calling, automatic iMessage inbox access/sending, a new avatar generator and a new animated-video editor are not implemented by this reconstruction.
- Calling requires real telephone transport. iMessage access requires a supported Apple environment and permissions. Assembl can simplify user-facing setup, but a website cannot remove underlying transport/account requirements.
- Configure and host the private worker before enabling live generation on Assembl. Single-process limits are not suitable for horizontal scaling without shared state. No cloud service was deployed.
- REA's complete Photon analysis was blocked by this sandbox's process-ownership inspection capability; direct public-source inspection supplied the documented patterns. See `docs/do-messages/photon-rea.md`.
- Codex must load the installed skill; hook trust/activation belongs to the user's Codex client. Committed hook configuration alone does not prove an active hook in this session.
- Earlier attempts encountered resource pressure and a corrupt local Turbopack development cache. Fresh production proof supersedes those attempts. Known upstream warnings include Next's middleware deprecation and a Starlette/AnyIO test deprecation.
