# Assembl visual craft — 21 September 2026

Status: review build, not production or visually accepted.
Dependency: DO Bills foundation PR #1406. This visual branch preserves its fictional example and local CSV workflows.

## Accepted brief

Kate finds the current cards, type and DO UI too plain. She explicitly requests glow, scroll parallax and motion, with https://weekend-mm-2026-pasticcino-bag-master.monogrid.io/en/ and https://kononenkogroup.com/ as the quality bar. Preserve the walkthroughs she likes, brand canon, clear task navigation and exact approved positioning.

Reference inspection was limited: Pasticcino displayed its loading composition but graphics initialization failed in the available browser; Kononenko returned an internal server error. No claim to have verified either complete motion sequence.

## Changes

- Homepage: replace three repeated product cards with distinct Pursuit, DO and Studio compositions, large typography, layered artwork, scroll-linked depth and pointer light. Keep approved positioning, working destinations and honest illustration captions in HTML.
- DO home: an asymmetric task launcher, large glowing DO identity and immediate links into Everyday, Meeting, School/family and Bills tasks. The established atelier walkthrough remains below it.
- Working DO: stronger typography, sculpted identity, rose light, a grouped mode selector and paper-like drafting/review surfaces. Meeting receives the same materials and a stronger recorder object. Existing state, media permissions and approvals remain the source of truth.
- Bills: larger financial figures, simpler payment rows and a shared DO identity. Values are not animated; the fictional-data and no-bank-connection labels remain explicit.
- Reuse: extend DoGlowCard and create DoPresence around the canonical DoMark; no second agent runtime or new dependencies.

## Motion and access

Native vertical scrolling. Only decorative artwork and short product headings have parallax; long copy, inputs and financial figures stay still. Reduced-motion CSS disables new transforms/transitions and scroll animation. Working pulses correspond to an actual busy prop, never a claim of bank connectivity. No new autoplay audio or ambient animation loops. Links, focus indicators, native form controls and touch layouts remain available without hover.

## Verification

Automated checks and runtime route checks are recorded in the PR. The parent Bills build already has unrelated repository-wide lint debt; changed-file lint must remain clean. Existing focused tests cover approved product destinations and wording, Bills calculations/tenant isolation and Meeting follow-through boundaries.

The required desktop interaction screenshots and 375px mobile check remain outstanding. The available browser cannot reach this local workspace; the earlier Vercel preview requires sign-in. Kate specifically requested her Chrome for Vercel, but only the cloud browser is exposed in this session. Do not disable deployment protection, log into Vercel in that cloud browser, or substitute generated mockups as visual proof. Keep this PR draft until authenticated preview inspection and Kate's visual review.

Acceptance: verify /, /do, /do/widget, /do/meetings and /do/bills at desktop and 375px; confirm no clipping, legible artwork/captions, visible keyboard focus, reduced-motion fallback, working task links, local Bills draft/edit/review/download, and preserved Meeting capture/consent behavior. Then record actual screenshots before marking ship-ready.

Rollback: revert only the visual commit; leave the Bills foundation and approved homepage wording intact.
