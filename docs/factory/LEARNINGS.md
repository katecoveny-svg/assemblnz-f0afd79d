# assembl factory learnings

Record only durable lessons that should change future work.

## Template

### YYYY-MM-DD — short lesson

**Context**  
What were we trying to do?

**Observed**  
What actually happened?

**Cause**  
Best-supported explanation. Separate evidence from guesswork.

**Factory change**  
What primitive, test, eval, skill, guardrail or canonical doc changed because of this?

**Applies to**  
Products/repos/surfaces affected.

---

## 2026-09-16 — too many entry points create agent drift

**Context**  
Different coding agents were starting from different combinations of `AGENTS.md`, `CLAUDE.md`, stale README material, current strategy docs and historical research.

**Observed**  
Instructions and product direction began diverging between agents, while large context loads consumed unnecessary credits.

**Cause**  
The repo had detailed knowledge but no universally enforced context-routing layer or precedence hierarchy.

**Factory change**  
Added `START_HERE.md`, `docs/context/README.md`, a tighter root `AGENTS.md`, and factory decision/primitive registries.

**Applies to**  
All Assembl coding agents and future repo cleanup work.

### 2026-09-16 — Public DO account and voice continuity

Public route exemptions must be tested against earlier redirects: the legacy splash gate redirected `/login` and `/auth/*` before reaching its exemption list, blocking DO account entry. Keep personal DO confirmation on the workspace host and preserve operator-host isolation. Normalise return paths before checking scope.

Direct browser voice needs a server-locked, short-lived token, a persistent account allowance, setup acknowledgement before microphone frames, and cancellation that also handles a late permission result. An audio transcript or compiled brief is a draft; adding it to a task must remain a separate reviewed action. See `docs/reviews/2026-09-16-do-voice/README.md` for boundaries and proof.

### 2026-09-16 — Mac companion packaging in synced folders

A generated app bundle in a synced Documents folder acquired FinderInfo after ad-hoc signing, causing strict signature verification to fail. Build and stage the installer in a temporary local folder; verify the staged app, create the disk image, and verify its checksum. Verify the app again from a read-only mounted image before calling packaging complete. Preserve quarantine and other security metadata; do not use blanket xattr removal or disable Gatekeeper. This is development packaging, not Developer ID signing or notarisation.

Reuse the shared D resources for the app, menu bar and floating companion. A separately redrawn Swift shape and a legacy artwork file both caused visual drift during native inspection.
### 2026-09-17 — Preview data still needs ownership and review identity

Preview labels do not make captured user context public. Scope stores and every read/mutation to a server-established owner. Enforce exclusive ownership in the repository write itself, not an asynchronous check before save. Test concurrent same-ID writes by different owners.

Approval must identify the exact permit and review generation the person saw. Replacing context invalidates prior proposals, approvals, artifacts and receipts; preparation/execution idempotency must include the current review, not only the job ID. Test stale tabs as well as happy-path clicks.

Database configuration, a successful save call and durable storage are distinct. Propagate storage provenance and fail clearly when a requested durable write cannot be confirmed. Browser downloads need per-entry source/API/static parity tests, not only ZIP availability.

Visual regressions need a stable production-mode browser as well as unit tests. Validate CTA contrast after shared CSS, SSR/client identity, a full static product story, and WebGL failure after readiness. A loading poster is not proof that the 3D scene rendered.

## 2026-09-17 — Public Pursuit landing vs working hub

Public `/pursuit` is the story + canvas proof page. The working hub stays on the external ChatGPT Pursuit site. Do not promote `/pursuit/playground` or partner/Task DO Maker as public CTAs. Radar/API plumbing stays behind the scenes; the public proof is NZ signals → canvas rearrange → brand/client demonstrator. Hero media drop-in path: `public/pursuit/media/pursuit-canvas-loop.mp4` (+ webm/poster).

### 2026-09-30 — Pursuit formatting must preserve source strings

A formatting-only model pass can introduce URL drift even when instructed to copy sources exactly. Constrain URL fields to original output strings during generation, and still validate the result against the original output and independently collected search trail. An original untraced URL remains invalid. A passing mocked repair path does not prove the cause or resolution of a specific live failure. Log only safe validation stages/field names to distinguish URL drift from missing original provenance. See `docs/tools/pursuit-source-preserving-repair-20260930.md`.

### 2026-09-30 — A bounded shortlist can safely omit ungrounded candidates

Pursuit's schema allows zero accounts. Validate the seller and draft evidence first; omit unsupported, duplicate or seller-as-prospect candidates with explicit gaps, then revalidate every retained account and the complete set. Never substitute guessed company URLs or let formatting reassign source URLs between accounts. Zero results must say no verified shortlist and expose no outreach export. Keep shape/length, seller, draft-evidence and formatter-drift failures fatal. Regression proof belongs in the research/repair tests and zero-result browser path; live model quality still requires an authorised capped smoke test.

## 3 October 2026 — DO handwritten-photo intake (local review)

A multi-select input does not make a single-image vision API a multi-page document flow. Keep ordered local images and editable per-page transcription; charge each explicitly consented page through the existing budget boundary, clear restored provider/review approval, and escape user-reviewed document exports. Separate automatic-save status from transcription error status so successful background saving cannot hide a failed provider call. Local proof: `docs/reviews/2026-10-03-do-photo-notes/REVIEW.md`; synthetic mobile harness only, no paid-call or deployment proof.

### Photo-notes correction after independent review

The initial candidate was rejected for an empty imported page ID colliding with both cleared consent and idle busy state, origin-wide autosave overwriting an empty draft, and conditional tool unmount losing corrected notes. The corrected candidate uses canonical UUID IDs, nullable consent, a synchronous discriminated dispatch lock, mounted/hidden capture state, explicit downloaded backup/import and no browser persistence. Provider finish metadata must survive routing; raw incomplete can normalize to stop, and successful HTTP is not completeness proof. Transcription-only no-fallback/maxRetries0 prevents unconsented retry churn; cleanup may be unconfirmed. See `docs/reviews/2026-10-03-do-photo-notes-v1/REVIEW.md` for local synthetic proof and remaining live gates.

### 13 October 2026 — bound the whole voice startup, then release independently

A socket setup timeout starts too late if microphone capture is acquired before audio initialization or a token request stalls. The DO call candidate starts its budget when capture is acquired, invalidates the session before cleanup, releases tracks before fallible socket/audio operations, and tests late completions against the actual React component with fictional media. Reconnect only refreshes availability; restarting requires a fresh user start. Existing SQL tables and prior local tests are not evidence that a gated persistence path is deployed. See `docs/DO-RELIABILITY-REVIEW-20261013.md` and the existing `scripts/review-do-personal-call.cjs` regression harness.

### 2026-10-13 — unowned browser drafts cannot be migrated by sign-in

A device-wide localStorage key has no owner proof. Keying a component by account alone still leaks if it restores that global list. Require verified UUID-scoped storage; quarantine legacy records unchanged. Serialize tab writes and compare the opened revision, not the refreshed sidebar copy. Read/parse errors must block writes rather than turn a damaged store into an empty list. Fictional populated-draft switch/recovery proof: `scripts/review-do-draft-isolation.cjs`.

### Loyalty DO partner concept (13 October 2026, draft)

Partner scenes can reuse Shop preparation without reusing seeded journey persistence or timed reward theatre. A pantry image is evidence to review, not structured quantity or food-safety truth. Keep provider observations as editable notes until the person explicitly sets quantities. Bind basket approval to the full current plan, invalidate it on edits, and distinguish a local simulated handoff receipt from merchant execution. Optional useful activity during human review needs no fabricated processing timer or numeric point credit. See `docs/design/woolworths-loyalty-do/README.md` for this draft's verification gates.


## 13 October 2026 — mobile coastal homepage recovery (review branch)

Renderer initialization is not decoded-video proof. Keep a real coastal poster visible until a video frame callback (or current pixel data on older browsers) confirms content, bound startup with a timeout, and handle denied playback/stalls. Muted inline video must be mounted and explicitly started. Mobile reading must not inherit scroll-driven parent opacity: this recovery uses normal-flow, opaque content and native video without the flock renderer at widths up to 900px. SVG action arrows avoid iOS emoji substitution. The existing homepage primitive is extended; this is not a new rendering framework.

Regression proof lives in `components/site/direction-4c/video-readiness.test.ts` and `scripts/direction-4c-mobile-proof.cjs`: 375/390/430px, desktop, blocked media, autoplay denial, no decoded frame, reduced motion, pause while scrolling and stall fallback. Hosted WebKit proof is required; Chromium emulation alone is not an actual iPhone claim.

The review caught two lifecycle traps: applying pause before an unconditional `play()` does not preserve intent across asynchronous initialization, and `stalled` describes network fetching rather than exhausted playback buffers. Gate every startup/recovery attempt on current pause/visibility, suspend its frame deadline while disallowed, preserve buffered frames on `stalled`, and recover `waiting` directly from decoded frames without requiring another `playing` event. Browser evidence must use instant verified scroll positions and record media state; a smooth-scroll screenshot can mislabel mid-scroll as the top.

### Addendum (13 October 2026, later): keep the design on phones

The phone recovery above over-corrected: hiding the tide canvas and restacking the hero removed the design's flock on the device the owner uses, and treating video readiness as a hard dependency sent the whole page static whenever iOS declined autoplay. The engine already scales for narrow screens; footage must stay an optional backdrop (drop the source, keep the scene) and only a lost renderer may go static. Keep the real fixes (poster, decoded-frame readiness, pause across breakpoints, SVG arrows) and keep the owner's copy decisions in the proof, not just the code.
