# Mockup to working website · Codex

## Setup
Run `bash scripts/setup-design-tools.sh` from a checkout. Official Impeccable 4.5.2 installs into `.agents/skills/impeccable` and writes `.codex/hooks.json`; the bundled engine version file is 0.1.14 (the executable reports 4.0.0). REA 6.4.0 is available through the pinned npm CLI. Neither needs a speech-provider account. Reload Codex and invoke `$impeccable`. Project hook trust may need approval in the user's Codex /hooks UI; files alone do not establish an active hook.

The official installer was exercised again after the workspace reset. The complete text skill distribution, reference files, license and Codex hook configuration are now committed. The platform-specific binary remains ignored; the launcher provisions it when needed. The pinned bootstrap also restores the installation after a fresh checkout. No assertion is made that this ChatGPT session has activated the Codex hooks.

Official sources checked 12 October 2026 NZ:
- https://impeccable.style/tutorials/getting-started/
- https://github.com/pbakaus/impeccable
- https://github.com/morluto/rea

## Repeatable workflow
1. Read START_HERE.md, AGENTS.md and the context router. Audit current routes, auth, data and integrations; isolate a task branch.
2. Run `$impeccable init` using the confirmed product context. Keep docs/assembl-brand-system.md, DESIGN.md and docs/assembl-copy-standard.md authoritative; do not overwrite them with generic styling.
3. Request the approved mockup image, target route and required interactions before redesigning the website. Tool screenshots are research references, not approved Assembl page designs.
4. Map the mockup's regions, font, spacing, image treatment and interaction states. Reuse existing Canvas, glass identity assets and components. Preserve integration contracts.
5. Implement semantic responsive components with working controls and honest empty, loading, error and completion states. Use motion to explain change, stop offscreen and honour reduced motion.
6. Capture the reference viewport plus 375, 768 and 1440px. Compare side-by-side with the immutable original; fix meaningful mismatches in a batch and confirm.
7. Exercise keyboard/focus, primary interactions and failures. Run axe, relevant tests, typecheck, lint, macron/brand guards and production build. Use scoped `$impeccable audit` and `$impeccable polish`.
8. Commit and push each coherent checkpoint, verify the remote SHA and save public-safe evidence in the branch. Do not merge or deploy without approval.

## Reference investigation
REA can inspect authorised local JavaScript or public web bundles. Use its command help to define a bounded target. Evidence is observation, not access to proprietary Claude, ElevenLabs or Higgsfield source/models. Record observed behaviour separately from assumptions. Existing Remotion, Canvas, GSAP and Framer Motion supply Assembl's motion foundations; avoid adding unrelated repositories.

## Open work
No approved website mockup is attached to this recovery task. Pixel fidelity, a new video editor, avatar generation, automatic iMessage sending and real telephone calling are not established by this setup.
