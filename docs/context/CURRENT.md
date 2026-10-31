# assembl — current operating state

**Last verified:** 13 October 2026, 11:53 NZDT / 12 October 22:53 UTC (scoped release/coordination refresh below; older sections retain their original dated scope)
**Status:** current working context  
**Update rule:** refresh from merged work and accepted decisions; do not rewrite stable canon casually.

This file answers: **where is assembl at right now?**

It is intentionally shorter and more changeable than the long-term strategy documents.

## 30 October: homepage scroll story from the lab's worlds (branch `claude/home-scroll-story`, preview only)

Kate chose to bring the lab's moving 3D worlds onto the homepage as a scroll story. `app/page.tsx` now renders `components/site/home-scroll-story/HomeScrollStory.tsx` on paper with plum ink: hero "Small worlds. Useful work." beside the lab home with pastel cubes that gather as you scroll, then three sticky chapters whose worlds scrub frame by frame (Pursuit: the home, roof lifting; DO: the café then the supermarket; Studio: the dealer showroom turntable), study machines that assemble into a grid, the evidence rules as a receipt, the Ask DO card and the contact CTA. Frames are captured from assembl-lab.vercel.app with SwiftShader (24 per world, 1280 × 800 WebP) plus the showroom's 72 Blender turntable frames; they load only near their chapter, coarse pass first. Every world carries a real-text label (Simulated, Illustrative, Rendered); the work steps are illustrative. Reduced motion and no-JS get posters and the complete state. **Brand conflict recorded:** the brand canon says no serif on company surfaces; Kate's 30 October brief explicitly allows a serif italic accent like the lab's, so Instrument Serif italic carries one word per heading. Direction4cHome stays in-tree for rollback. Not merged or deployed to production.

## 21 October: homepage hero without the mask; the flock spells the wordmark

Kate's capture showed the knockout mask still reading badly at the fly-through (plum letter-edges sweeping across the footage), and she asked for the mask to go completely. The hero is now the coastal footage full bleed, with no plum field or knockout. On landing the flock (2,600 terns on wide screens, about 1,600 on narrow ones) streams in from above and assembles "assembl" over 2.6 s. It holds through the hero's first part, lifts out of frame before "useful work." arrives, and streams back in as Pursuit's signal formation. The kicker and the "Agentic AI solutions for your business." line are placed from the flock word's projected bounds (the engine's `onLayout` now reports the first formation when there is no mask). The type wordmark remains only for the reduced-motion and static (no WebGL) hero. Evidence: `docs/design/direction-4c/flock-wordmark/`.

## 19 October assembl / living — TURN parts library v0.3, review candidate

Branch `feat/assembl-living-turn-v0.3` replaces the AL-02 peg pack with Kate's parts library v0.3 on the **assembl TURN standard** (42 mm grid, quarter-turn key): source at `tools/living-cad/`, 104 print files rebuilt here with reports matching the shipped ones, digital fit tests, the test-print kit, costing and a Shopify draft import kept as launch files (not imported). `lib/living` and the Space Studio are rebuilt on the 42 mm grid with the launch catalogue's products, kits and proposed prices. Canon: [assembl / living](../living/ASSEMBL-LIVING.md), ADR-008. **Nothing printed, no load limits, no products, no purchasing, no photo understanding.**

## 17 October assembl / living — merged (PR #1616); interface superseded by 19 October entry

Branch `feat/assembl-living-space-studio` adds the modular interiors line as one typed system (`lib/living/`), a public storefront and Space Studio (`/living`, `/living/studio`) and engineering pack AL-02: nine parts on interface IF-01 generated from `tools/living-cad/build.py`, exported as STEP + STL and checked as valid, single, watertight solids. Canon: [assembl / living](../living/ASSEMBL-LIVING.md), decision ADR-007. **Prototype parts only, no load ratings, no Shopify products, no purchasing, no photo understanding;** fit is decided by customer-confirmed measurements. Physical sample testing and manufacturer quotation are the next steps and have not happened.

## 13 October entry integration — merged

The [one DO entry integration](../reviews/DO-ENTRY-INTEGRATION-20261013.md) (shared secondary navigation, working Write/Talk/Add entry, prompt shortcuts and compact launcher) was merged to main as [PR #1525](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1525) at 15:13 NZDT on 13 October; the review doc's "draft, no merge authorised" label is historical. Deployment of that merge was not separately verified here, and no durable shared memory is claimed by it.

## 13 October cross-device core — review candidate, not deployed

Branch `feat/do-cross-device-core` installs the reviewed memory schema, the continuity (cross-device task) schema with owner self-enrolment, and a new kept-conversations schema as migrations, adds `/do/memory`, a per-scope sync switch on `/do/continue` and opt-in kept conversations in the chat. Evidence and activation steps are in [DO cross-device core](../reviews/DO-CROSS-DEVICE-CORE-20261013.md). **No migration has been applied to any hosted database and all three feature flags remain off**; applying them needs an isolated staging database and explicit approval. The [user-reviewed master roadmap](../do/MASTER-ROADMAP-20261013.md) is the dated proposed sequence. Reliability/voice and public discovery retain separate ownership. Older release evidence below is preserved, not promoted by this draft.

## 13 October delivery and coordination baseline

This section is the current, scoped delivery record. Durable direction is in [assembl context](../assembl-context.md#accepted-do-interaction-and-continuity-direction--13-october-2026); visual authority remains [the brand system](../assembl-brand-system.md) and [DESIGN.md](../../DESIGN.md). The [Claude handoff snapshot](handoffs/2026-10-13-claude-handoff.md) ends at **10:18 NZDT**. Its earlier open-release/failed-deployment labels are superseded only where the fresh evidence below establishes a newer result. It does not grant new approval or make other historical checks current.

### Verified release versus local and reported work

| Area | State/version and evidence | What is not established |
|---|---|---|
| Shop / Travel | [PR #1513](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1513) merged at `b66c203cbe2d7764f83c893a511e8692f0aa197b`. Release deployment `dpl_5vw6hWfnYRi4tgZGLS6KjV5fPXVE` was READY. Actual Chrome previously verified desktop and 375px preparation, reviewed receipts, repeated clicks and material-edit invalidation. | Planning/review only: fictional/session-only Shop offers and manually entered Travel estimates. No verified live retailer catalogue/stock/cart/order/reward issuance or flight/hotel search/booking. Receipts say **prepared**, not ordered/booked. |
| Glass DO release baseline | Fresh Git fetch and [PR #1514](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1514) confirm merged **21:31:54 UTC / 10:31:54 NZDT**. Reviewed head `15163d2686c6bf8ded81475c9c5634de47f351b3`; main merge `6b06933464a4137a5e117ee9140b1069ed2f574d`. Vercel `dpl_9pntuWpdC4n31K1M3s5aeehXZoER` is **READY, production**, on that exact SHA. Exact-head Vercel status and DO core workflow [38310114073](https://github.com/katecoveny-svg/assemblnz-f0afd79d/actions/runs/38310114073) passed; coordinator records 1,527 core tests/build/full browser proof, live HTTP 200 and canonical asset hash/bundle verification. Scope: exact canonical glass D and flatter 48px sign-in controls, seven files. | No auth, memory or voice change. Preview pixels and CI screenshots were checked; final production pixels were not recaptured after browser disconnect. READY/HTTP/asset evidence is not complete installed-interface or sign-in proof. |
| Repository product context | [PR #1515](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1515) verified merged at `5a126db27b853f8d81f8cec04acd5e5b2e711534` (21:41:48 UTC / 10:41:48 NZDT). Existing strategy/current-state canon and agent pointers contain the agreed direction; dated handoff preserved. | Public nonsecret product context, not private assistant memory or activation of app memory. Later delivery evidence needs this small successor refresh. |
| Latest main / Write and Talk | [PR #1516](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1516) verified merged at **22:48:49 UTC / 11:48:49 NZDT**, main `06a78acbf5b8536f2a0153396b4ab905b2ce811b`. Fresh remote refs and Vercel confirm **READY production** `dpl_4TnbVEw579QwJG33gDnEmLCuqfvm` on that SHA. Coordinator reports 11 release checks passed, both Mac architecture builds and live anonymous 375px proof; Write focus and same-draft behavior verified. | Web Write/Talk entrypoints are deployed, but Talk remains readiness/sign-in/consent gated. Real conversational voice and durable account/conversation/preferences continuity are **not verified**. A Talk control is not a working voice or phone service. |
| Auth reliability | [PR #1519](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1519) and [PR #1520](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1520) (`codex/do-auth-reliability-isolated`: session reuse/deletion fixes, private auth outcomes, remembered sign-in choice, gated Google/Apple) are **merged on main** as of the 13 October branch audit; the earlier "local, not merged" label is historical. | Repeated sign-in root cause, native WKWebView/browser-cookie continuity and cross-device session recovery remain unverified on real devices. |
| Combined account/preparation | Local-only `codex/do-auth-preparation-staging`, `51bc22da1b5b3b840670931169e41240c4774363` (**not on origin** as of the 13 October branch audit, so it cannot be built on until pushed). Recorded local proof: 35 embedded SQL checks, 100 focused tests, typecheck/scoped lint/build. Licensed-feed and Duffel adapters are **unwired**; browser defaults are explicit account-scoped local storage. | Not hosted Auth/PostgREST proof or durable cloud recall. Preview shares production Supabase; isolated staging is required. Personal/provider cloud-memory flags remain OFF and reviewed memory schema/RPC/cleanup proposals remain unapplied. No silent browser fallback. |
| Sign-in email | **One authorised test delivered at 10:09:50 NZDT on 13 October** and user confirmed receipt, as recorded in the handoff/coordinator evidence. | Link was not clicked; callback/authentication untested. Earlier failures are not explained. No SMTP change or complete sign-in fix is established. Coordinator now verifies the magic-link template replacement was saved and reloaded: exact glass D with plum/rose/chalk; subject and link expression unchanged. Public image is HTTP 200 PNG, 1254×1254. Supabase sandbox preview image fails for an unknown reason; no newly branded inbox-render test yet. |
| Native / installed identity | Earlier inspected running native DO.app v0.4.0 has canonical glass PNG and Review selected text / Review clipboard / Open workspace actions. PR #1516 adds Write/Talk development builds for both Mac architectures; [native CI run 38318013863](https://github.com/katecoveny-svg/assemblnz-f0afd79d/actions/runs/38318013863) artifacts are available. Versioned PWA icon URL is live. | The new native builds are **not installed or notarised**; earlier widget screenshot is not proof of their controls. Chrome PWA still needs the user's **Review app update** step. Prior app-management policy block must not be bypassed; do not equate live icon URL with installed refresh. |
| Voice | Coordinator verifies the full **4.52 GB** pinned model and official CPU image are installed. First local test produced **no audio**, with a RuntimeError near 240 seconds; no OOM observed, peak about **4.73 GiB**. A qwen 0.1.1 dropped-stopping-criteria defect is a candidate; fix prepared, exact original traceback unrecoverable. Latest reported free disk is **21.65 GiB**, with cleanup sources preserved. | Root cause and fix are not proven. One short **Hello / 32-frame retry awaits approval**. No new generated reply, Māori pronunciation, latency or conversational/phone success verified. No automatic retry, further cleanup, paid infrastructure or new access implied. Existing recordings remain previews. |
| Woolworths concept | Separate hosted [Everyday Rewards concept](https://assembl-concept-studio.katecoveny.chatgpt.site/everyday-rewards): handoff identifies published v13; independently tested model chat and consented sample-fridge photo path. Saved v14 quieter chapter is not recorded deployed. | Main Shop has not inherited those APIs. Products/prices/rewards/checkout remain simulated; no retailer endorsement/access or durable model-spend cap. Anthropic prepared/inactive; no silent provider switch. |
| Other programmes | Handoff records PowerPass v5 public; Contact v3 private with deterministic checks but visual QA blocked by its authorised sign-in boundary; Z private destination unchanged and consolidation outstanding. | Neither publication nor thumbnails prove complete live supplier/device integration. Contact private interaction and 375px checks remain open; do not expand sharing for QA. |

**Known baseline test issue:** the combined local branch's broader run recorded 1,686 passing tests, two skipped and one pre-existing literal `/do/enquiries` source assertion failure in `lib/do/public-do-specialists.test.ts`, reproduced on the released branch. Relevant release checks passed; never call the full suite clean. The earlier Bills voice-menu browser expectation was separately reviewed against unchanged main and positively scoped; it is not a blanket waiver for tests.

### Owner coordination and next proof

| Slice | Current owner boundary | Next evidence before a stronger claim |
|---|---|---|
| Product context / this document | PR #1515 merged; this docs-only successor refresh preserves agent pointers and canon. Coordinator reviews before any successor merge. | Fresh main/PR/deployment references, coordinator evidence above, source provenance, nonsecret/link checks and context-health. No app-memory activation or auth-code edits. |
| Shop / Travel / account staging | Preparation owner works in the isolated local staging branch; do not reset/import its unreviewed code into brand or voice worktrees. | Approved isolated database and exact config/SQL, real two-account/anonymous/session/callback/expiry/delete proof, monitored cleanup and restore boundaries. Then authorised grocery feed/cart, followed by one travel search/review/provider handoff and servicing proof. |
| Web glass identity / installed interfaces | PR #1514/#1516 merged; web Write/Talk and versioned icon URL are live. Native CI artifacts remain development builds; installed/PWA owner handles the user update boundary. | User Review app update completion and actual installed icon; new native install/notarisation only through approved owner flow. Verify actual Write/Talk behavior and voice gates; preserve policy restrictions. |
| Sign-in email | Separate email-branding owner has saved/reloaded the exact template; preserve subject/link expression, security and delivery settings. | New authorised inbox render of the branded template; diagnose sandbox preview-image failure separately. Successful callback only after explicit link use. Never put sign-in links, tokens or recipient-private material in repo evidence. |
| Voice | Voice owner and its existing worktree; preserve the authorised CPU/model bounds (3 CPUs, 6 GiB, 8 GiB host-disk reserve, offline inference). No disk cleanup or runtime installation in the context slice. | Review the prepared candidate fix and existing retry approval; then one Hello/32-frame test and actual clip/cancellation/latency/intelligibility/resource proof. Durable continuity and business phone calls remain separate gates. |

### Evidence checklist for the next agent

- Read AGENTS, this matrix and the task-specific canon before editing; current explicit user instructions outrank the dated handoff.
- Record target repo/site/native surface, exact branch/commit or Site version, UTC plus NZDT check time, access classification and owner. Recheck live state; do not reuse this table as a timeless deployment certificate.
- Label **agreed direction**, **local implemented/tested**, **preview deployed**, **production deployed**, **runtime verified**, **simulated**, **prepared**, and **externally completed** separately. State the specific outcome that was tested.
- Confirm existing uncommitted work and overlapping owners before changing shared shell, auth, voice, identity or icons. No resets, force pushes, copying unreviewed changes or unrequested merge/deploy.
- For UI work, prove the complete journey, including failure/decline/retry/edit/review/receipt, actual desktop and 375px interaction, keyboard/focus/reduced motion where relevant. A screenshot/build alone is insufficient.
- For cloud memory, prove consent/purpose/account scope/retention/edit/delete and real storage isolation; test sign-out, unavailable storage and restoration. Keep collection/provider flags off until the reviewed gates pass.
- Keep this public company/product context free of private user memories, health/family information, credentials, session tokens, auth links and raw captures. Do not copy secrets into code, docs, screenshots or exports.
- Update this current-state section from new evidence; update durable direction in `docs/assembl-context.md`, not a competing Claude memory file.

### Handoff provenance

[Assembl Claude handoff, 13 October 2026](handoffs/2026-10-13-claude-handoff.md) was materialized through the supported Library transfer onto the consumer Mac, not assumed from a cloud filesystem path. Local bytes verified: **29,227**; SHA-256 **`2f11c8999f0477ab0324a2ca7ddecbfed02c8b8c4e09c8b391b0996d9556cda0`**. The repository copy retains the exact snapshot bytes. It is a supporting dated reference; this matrix records newer verified release evidence, and the compact Write/Talk direction comes from the user's later explicit brief. See [reference rules](handoffs/README.md).

## Earlier dated operating context

## 16 October: "assembl the work." homepage exploration (preview only)

Kate shared a homepage concept and asked to explore it. It is built at `/preview/the-work` (noindex; the live homepage at `/` is unchanged). Hero: the existing Franklin office render graded warm with plum shadows, "assembl the work." with find it. DO it. show it., etched glass words, a chapter bar that follows the reader, and a glass agent panel whose question opens the real Pursuit canvas in a dialog with the question filled in (new optional `initialGoal` prop; research still needs the visitor's brief and consent). The panel's badge reads Live only when `/api/pursuit/research` reports ready; otherwise Checking or Paused. Below: three tilted product plates (Pursuit over the coastal poster with glass cubes, DO as four cycling glass steps, Studio with a chrome sphere), "Start with a question. Leave with a plan." with a canvas illustration labelled as not a live result, a sector band in words, and the footer. Deliberate departures from the concept: no client logos (the concept's "trusted across New Zealand" row would claim relationships that are not established), no silver fern, a generic supermarket suggestion instead of a named retailer, and DO's line reads "Agentic work, with your say at each step." The hero art is the low-detail render, not the concept's photoreal scene. Captures in `docs/design/the-work-homepage/`.

## 16 October: DO Today as a visual to-do board (review candidate, waits for Kate's eye)

Kate asked for DO to read as a visual to-do list rather than explanations. Today on `/do` is now a paper to-do sheet resting on a lilac tile: actual local checklist titles as ticked rows with step dashes, an empty state of one real "Start with a note" row and drawn placeholder rows, and a three-lane ring (needs you, today, done) that only counts checklists open on this page. The six jobs are a bento of animated scenes (`app/do/personal/TaskArt.tsx`): each has one quiet loop at rest and acts out its job on hover, focus or when opened (letter out of the envelope, plane on its route, glasses clinking, clock and date, hanger and gift lid, steam and spoon). Everything holds still for reduced motion. Status words are unchanged, now shown as short chips with a state mark; the longer limits stay in each opened tile. "No inbox or calendar has been read" is now the mono chip "Inbox and calendar not read" (proof updated). The review board shares the lane colours, ticks and step dashes. Not yet: the checklist detail panel and the "Keep going" section keep their current text-led layout. Before and after captures in `docs/design/do-today-board/`.

## 14 October: generative assembly studio

One studio at `/creative-studio/generate`, reached from the Studio door. The playground and the older static studio redirect to it (query strings kept). The homepage tide engine is mounted as the first family, Assembly: twelve species (tara, kererū, pīwakawaka, tūī, kōtuku, tākapu, tāmure, kahawai, aihe, starling, corvid, plankton) assembling any of the twelve assembl shapes or a typed word, on plum, paper or chalk. Stills and MP4, WebM and GIF loops are rendered in the browser with a fixed step and stamped once with the wordmark and a receipt line (family, species, formation, seed). Every family now draws only canon colours (329 values regraded, attractor hues replaced, 87 preset names changed, ids kept). No third-party service by default: the static studio and its external image service are unreachable, and Chrome and Waves light from a local HDR. The engine changes leave the homepage pixel-identical. Not yet: the static studio's other engines, real-hardware export timing. Details in `docs/design/generative-assembly.md`.

## 14 October: hero footage upscaled

Kate authorised a Topaz 2x upscale of `coast-gen-c` at fal.ai (2560 × 1440 HEVC, 43.3 MB, request `01a139a8-5a31-7a00-ad91-e2bcd65be09c`). A blocked session parked it in 42 checksummed pieces in `public.hero_tmp_chunks`; the next session pulled them through SQL, verified every piece and the total size, and re-encoded two tiers with the old keyframe spacing (every 8 frames, no audio): `coast-gen-c-1440.mp4/.webm` (8.1 / 6.1 MB) for screens drawing the hero wider than 1600 device pixels, and `coast-gen-c.mp4/.webm` (3.5 / 2.9 MB, 720p from the upscale) for everything else or Save-Data. Poster is the upscale's first frame at 1280 × 720. Darkest frame luma is still 121. The temporary `hero_tmp_*` tables and the `hero-clip-upscale` edge function are cleanup for Kate to approve. Details in `docs/design/direction-4c/README.md`.

## 14 October: hero edge and pre-ready composition

After the second pass went live, Kate's capture showed a soft, stepped wordmark edge during the fly-through, the footage landing full-frame before the plum field, and soft footage. Fixed in code: the knockout mask is now a signed distance field (up to 4096 px wide) with a one-screen-pixel edge at any zoom, and the pre-ready layer is the plum field with the poster's horizon inside the HTML wordmark, so the handoff is plum to plum. Not fixable in code: the clip is a 1280 × 720 generation drawn at up to 2880 × 1800; a higher-resolution source (AI upscale, needing credits, or a fresh generation at 1080p or above) is Kate's call. Details in `docs/design/direction-4c/README.md`.

## 14 October: homepage hero, second pass from Claude Design

Kate ran the hero brief through Claude Design (canvas "Homepage Hero · Second Pass", https://claude.ai/artifact/UX3oPAksD2zRt371NatU8t) and handed back a zip (SHA-256 `5189f5997c37253782915c3c495b5b1be0e68d74abba7eacb117a4411155a106`). Ported to the site: generated coastal footage `coast-gen-c` (10 s, darkest frame luma 121 of 255, never captioned as a real place) with its own first frame as poster, replacing the Bay of Islands clip; plum field `#240B21` in the engine; the flock half gathered at rest (`a0 = 0.5`, scroll window unchanged); wing chord 1.25 so a head-on tern is a shape, not a hairline; pixel ratio 2 on desktops with 8 or more logical cores (1.5 otherwise, 1.25 under 900 px); `waitScale`/`setWait` and `opts.field`, `opts.dprCap`, `opts.wingChord` overrides. The PR #1590 grade and time-based decode stay. Not ported, by the design's own note: the review-only `filmv1` tone. Not applicable here: the design's scroll-scrub start, because the site plays the clip rather than scrubbing it. Still to check on real hardware before calling it done: frame time at pixel ratio 2 on a mid-range retina laptop; the cloud build only has software GL. Design files preserved under `docs/design/direction-4c/second-pass/`.

## 14 October, round two: bills from email, energy, solar, fuel, always looking

`/do/bills` reads a pasted bill email in the page (provider, total, due date, period, kWh; account numbers and links stripped; prefills the checked-bill form, nothing marked checked or paid) and flags unusually high energy use from three periods with the heating season named. Electricity cards gain a versioned solar outlook with cost-effective paths and public sources. `/do/fuel` answers fill, top up or wait from MBIE's weekly price (via the existing `nz-fuel-prices` edge function), recorded pump prices and the person's tank, and hands a daily watch to Personal DO; it never buys. The wake-up worker compares a watched bill against the dated price book on every run, no model. Mail-arriving bills wait on the mail workstream's grant verification; station-level fuel prices wait on an adapter. Details: `docs/do-bills/PREEMPTIVE-BILLS.md`.

## 14 October: preemptive Bills, know → hunt → prepare → ask

`/do/bills` gains a **What you pay** layer: recurring candidates become service cards (provider matched from public NZ statement wording, monthly equivalent, rhythm, rise), a yearly total, **Hunt for a better deal** against the dated public price book through the read-only `/api/do/bills/offers` (source host, verified date, stale flag over 45 days, the person's own threshold, own provider excluded), **Research with sources** prefilled with only category and a rounded monthly figure, and **Ask DO to watch this** through the reviewed Ask DO entry. Nothing switches, cancels, pays or contacts a provider; possible savings are worded before fees and never promised. The bank-connection path (Redbark first, Akahu-shaped alternative) is written down with a custody schema proposal in `docs/do-bills/PREEMPTIVE-BILLS.md` and `bank-connection-proposal.sql`; it needs Kate's Redbark account and provider confirmation before any build. The master handover's browser-shopping priority is untouched by this slice. A Claude Design brief for the DO task pages is at `docs/do-design/claude-design-brief-do-task-pages-20261014.md`.

## 14 October: Ask DO from the phone

`/do/ask?q=…` is a GET entry for Siri Shortcuts, Spotlight and Android long-press (manifest shortcut "Ask DO"). The words are untrusted intake: the same nonce-bound review page as the share target shows them, and they reach Personal DO only when the person taps Open, through the existing 30-minute session handoff. Without a question it just opens Personal DO. The install page gains an "Ask DO from Spotlight and Siri" recipe because a website cannot register itself in Spotlight; the one-minute Shortcut does. No account write, provider call, link retrieval or schema change.

## 13 October production state: DO slices merged, database applied, flags pending

All three DO slices (#1548 cross-device core, #1549 NZ shop to basket, #1550 always-on wake-ups), the homepage fidelity fix (#1553), the cron retention maintenance (#1554) and the Bugbot follow-ups (#1555) are merged to `main` and deployed by Vercel. The production database `wurwcrgxjjwqdaxqceey` carries migrations `20261013090000` memory, `20261013091000` continuity, `20261013092000` conversations, `20261013093000` wake-ups and `20261013094000` storage-only; the storage-only apply also enrolled the single pilot seat (`assembl@assembl.co.nz`, consent to 20 October 2026 21:33 UTC) and recorded a first completed cleanup, so `do_personal_storage_ready` returned true at apply time. Readiness lapses unless the hourly cron records a completed cleanup within 90 minutes, which needs `DO_PERSONAL_RESPONSIBILITY_PURGE_ENABLED`. **Not yet live:** every DO flag is still unset in Vercel production (`DO_PERSONAL_MEMORY_ENABLED`, `DO_PERSONAL_MEMORY_PURGE_ENABLED`, `DO_CONTINUITY_DURABLE_ENABLED`, `DO_PERSONAL_CONVERSATIONS_ENABLED`, `DO_PERSONAL_RESPONSIBILITY_STORAGE_ENABLED`, `DO_PERSONAL_RESPONSIBILITY_PURGE_ENABLED`, `DO_PERSONAL_WAKEUPS_ENABLED` all `true`; `DO_PERSONAL_WORKER_MODE=worksheet`); the session's Vercel connector is refused (403) for environment variables, so Kate sets them in the dashboard and redeploys. `CRON_SECRET` on the hourly cron remains unverified. Open follow-ups from review: the 40-turn kept-conversation cap overwrites the oldest turns, and the memory page does not re-check the signed-in owner after a session switch.

### 13 October 21:40 UTC rollout metadata addendum

The parent rollout review reports the five `20261013090000`–`20261013094000` migrations applied with reviewed RLS, but the listed DO production flags/worker mode still absent at **2026-10-13 21:40 UTC**. These are dated observations, not evergreen availability. The requested audience is **all signed-in users**. The responsibility enrollment table's `UNIQUE(singleton)` and `CHECK(singleton)` still prevent that wider enrollment; flags alone cannot complete the rollout. Keep per-owner consent, retention and readiness guards. The earlier single-seat apply does not establish all-user availability.

[Account rollout hardening](../do-personal/ACCOUNT-ROLLOUT-HARDENING.md) records the bounded code fixes, synthetic evidence and separate activation/schema/access blockers. [The permanent release checklist](../deployment-and-release-checklist.md#shared-release-completion-gate--code-database-configuration-and-persistence) now requires migration state, configuration/secret presence, exact deployed commit/CI, rollback/retention consequences and authorized owner-isolated save → reload → new-session proof. A merge alone is not completion. No production activation or persistence verification was performed by this hardening task.

## 13 October homepage: design fidelity restored after mobile recovery

`fix/home-design-fidelity` keeps the iPhone video-readiness, pause and SVG-arrow fixes from PRs #1547/#1552 and restores what the Claude Design and the owner decided: the tide flock on phones, the open interactive Try DO card as `#try` with the design's copy and statuses, verbatim homepage copy, and footage as an optional backdrop (a failed video no longer sends the page static). See `docs/reviews/DIRECTION-4C-FIDELITY-20261013.md`.

## 13 October DO always-on wake-ups (review candidate, not released)

Branch `feat/do-always-on`: Personal DO responsibilities gain owner-chosen wake-ups (daily / weekdays / weekly / once / only when asked, plus "wake DO now" and "wake DO with a note"). Saving notes never turns wake-ups on; scheduling is a separate seven-day consent, bounded by body retention, and editing or pausing turns it off. The only executor is a provider-free worksheet from the saved notes; model preparation still needs renewed OpenAI and TypeSafe grants. Everything is behind `DO_PERSONAL_WAKEUPS_ENABLED` and `DO_PERSONAL_WORKER_MODE=worksheet`, both unset; migration `20261013093000_do_personal_wakeups.sql` was applied to production later the same day (see the production-state section above). Proof: 41 PGlite checks, 254 unit tests, 32 fixture browser checks. See `docs/reviews/DO-ALWAYS-ON-20261013.md`. Not established: a hosted signed-in wake-up, the cron on a schedule, production build.

The sections below are retained for provenance and unaffected product detail. Their dates and original scope matter; the 13 October matrix supersedes overlapping delivery claims, without upgrading unrelated capabilities.

## current shape

**30 Sep continuity audit and refinement:** main `ca4ef4afb6d31c3af7b6bf7680de8588a74cab23` contains merged Personal DO PRs #1418–#1421. Profiles exist in production. The cron heartbeat remains unverified and runtime logs show 401 responses; do not market this as proven always-on. The current delivery simplifies the homepage/DO entry and adds explicit private, revision-checked checklist snapshots. Native iOS #1417 remains draft. See `docs/ASSEMBL-DELIVERY-AUDIT-20260930.md` for the built/missing matrix and proof; deployment of this refinement is recorded in its PR.

**30 Sep Personal DO implementation:** `feat/do-personal-20260930` adds private ongoing responsibilities, explicit saved context, seven-day background preparation permission and daily cloud draft checks. The additive database migration is applied with empty tables; no user was enrolled. Code deployment and live owner/provider proof remain separate. See `docs/DO-PERSONAL-20260930.md`.

**30 Sep 2026 mobile pass:** PR #1415 is verified merged at `d26657410cee4ba3f1c3b913cbb6358933acd876`; its older review label below is historical. The new `feat/do-mobile-rollup-20260930` branch adds DO editorial imagery and phone viewport handling to the shared companion. Kate authorised push/merge after checks. The iOS keyboard remains offline development source, not an installable cloud agent. See `docs/DO-MOBILE-20260930.md`.

**28 Sep 2026 review branch, not a production claim:** `feat/do-meeting-studio-muse-20260928` extends Meeting DO with a local closing check and reviewed work pack, adds shared image-framing controls to the Assembl maker, and refines public Studio with generated art and an opt-in tour through the existing 3D atelier. Base main was verified at `82070f3825728ae7a88affc54062ce34b42cca8b`; older review labels below are historical and not a fresh merge audit. Separate hosted private `/studios` and `/agency` source was unavailable. Muse findings support testing a paid, one-task integration pilot; pricing and strategy remain recommendations, and no connector acceptance or partnership is established. See `docs/DO-STUDIO-MUSE-20260928.md`.

**Historical visual direction (21 Sep 2026; personal DO superseded by selected assembled plum glass on 2 Oct):** Kate asked for much stronger typography, glow, scroll parallax and motion across the homepage product sections and working DO UI, referencing Pasticcino/Monogrid and Kononenko Group. Preserve the existing walkthroughs she likes and exact approved platform wording. Use the plum/rose canon and canonical DO identity. The review implementation layers product compositions, a task launcher and shared DO surfaces onto the Bills foundation; it does not establish live bank connectivity or production deployment. See `docs/ASSEMBL-VISUAL-CRAFT-20260921.md`.

**Public positioning (21 Sep 2026):** Kate supplied the homepage/outreach explanation: “assembl is a platform that turns live business signals into governed agentic work.” Pursuit finds meaningful changes and opportunities; DO assembles context, agents, tools and permissions with human approval for consequential steps and evidence; Studio creates demonstrations, proposals and customer experiences. Exact approved wording is in `docs/assembl-copy-standard.md`. This updates the public explanation, not the runtime status of every capability below.

assembl is becoming an **intelligence-powered software factory for finding, doing and showing valuable work**.

Working company shorthand:

> **Assemble useful work.**
>
> **Business intelligence. Strategy. Software.**

Commercially, Pursuit, DO and Studio can stand alone or connect:

> **Start with one product. Bring them together when the work calls for it.**

### PURSUIT — find the work

Pursuit gathers live and accumulated signals and turns them into evidence-backed opportunities.

It should understand:

- companies and markets;
- customer/business friction;
- tenders, awards and procurement;
- buyer and relationship signals;
- product/market changes;
- useful model/tool capability changes;
- client-specific opportunities;
- what assembl has already built that can be reused.

Output: a bounded opportunity with evidence, provenance, buyer/user, value hypothesis, urgency, smallest useful proof and next action.

#### Pursuit state — 17 Sep

A flexible Pursuit journey builder and public NZBN playground were merged as **PREVIEW** work. Current preview capabilities include freeform clients, uploadable brand imagery, editable journey steps, a Sponsored Agent module and draft-only outreach gating.

Do not describe these preview surfaces as live client integrations or live advertising/commerce infrastructure.

Pursuit remains broader than tenders, although tender/procurement work is a high-value vertical and commercial wedge.

### DO — do the work

**Accepted Bills task (21 Sep 2026):** Kate requested the job-specific DO / Redbark proposal be built into the existing product. The first review build extends /do/bills with a clearly fictional demonstration, local NZD CSV analysis, checked invoice dates, editable enquiries and local evidence/review records. /do/bills/compare retains the existing bill reader and sourced research. Bills may now be linked from DO home and shared navigation; this supersedes the earlier Bills promotion restriction only. Live Redbark OAuth, durable banking records, financial writes, full Money/Business/Tradie/LockedIn products and production deployment are not established by this change. Details: docs/do-bills/FINANCIAL-FOUNDATION.md.


DO is the portable execution and safe-action layer.

It should work where the user already is — browser, hosted workspace, native desktop, PWA/mobile/share surfaces and connected tools — rather than forcing every job into a new standalone application.

Shared spine:

`context + intent → AgentSpec → tools → permissions → outcome + evidence`

Safe-action lifecycle:

`know → prepare → permit → do → verify → receipt`

Risky actions are previewed and approved at meaningful boundaries. Completed actions should leave receipts.

#### DO Action Cloud — Phase 1 merged

Phase 1 source work is now present for the shared safe-action layer, including:

- Action Contract schema;
- Permit / Wait / Receipt data structures;
- `/api/do/action` stage routes;
- action-run and receipt persistence schema;
- a bounded `demo.echo` lifecycle;
- verification/VAR scaffolding;
- OpenAPI draft and acceptance tests.

This is meaningful implementation progress, but it does **not** make the entire Action Cloud a live production platform. Treat wider provider rails, commercial integrations and autonomous action as staged until specifically verified.

Canonical build package: `docs/do-action-cloud/`.

#### DO Browser + Sponsored Journeys

A Sponsored Journeys and DO Browser Runtime prototype is merged.

Current prototype direction includes:

- `/do/sponsored` grocery/loyalty demonstration;
- `/do/browser` persistent-job concepts;
- browser widget/side-panel hooks;
- permit/receipt UX moving toward the shared Action Cloud contract.

These surfaces are explicitly prototypes/previews. They are not evidence of a live OpenAI Ads, Meta, CRM, commerce or partner integration.

Sponsored Journeys should stay provider-neutral and utility-led.

#### DO surfaces

Treat DO as **one portable runtime with multiple surfaces**, not a collection of unrelated apps.

**Public `/do` access correction (merged in #1404; live entry verified 21 Sep 2026):** Kate asked for a visible DO entry point and working core actions. This supersedes the 17 Sep explanation-only / hidden-tool direction. The homepage should say Open DO; `/do` should offer the hosted writing workspace, Meeting DO with its sign-in requirement, and school/family notice preparation before the preserved atelier story. The browser companion is a setup guide. Do not imply a full family Today feed, automatic meeting join, live bus tracking, cross-tab execution or autonomous work exists. Private operator and fictional household surfaces remain outside public promotion. Authentication, source consent and external-action approvals remain intact.

Current/active surfaces include:

- hosted DO workspace/widget;
- Chrome/browser extension and side-panel companion;
- native Mac floating companion;
- scoped PWA and install flow;
- DO Office;
- Household DO;
- Meeting DO;
- Builder DO;
- Task DO Maker;
- voice as an interaction channel;
- partner/client-specific DO skins where clearly labelled.

The native Mac companion is the persistent cross-app surface for **“do this here, now.”** Context access does not imply authority to act.

**DO Office** is the coordination surface for **“show me my DO team and what is happening.”** It should expose workspaces, needs-you approvals/questions, active work, completed work/receipts and structured handoffs without becoming a hidden group chat of bots.

**Task DO Maker** supports white-label task-specific DO creation from Pursuit/Studio and partner-facing modes. Preview/export state must remain distinct from durable Office provisioning.

#### Meeting DO / DO Meet

Meeting DO currently includes recording/transcription-oriented product work and Granola-style smart-note preparation with explicit truth boundaries around model/transcription availability.

The wider **DO Meet** direction is:

> **Talk. Decide. DO.**

`conversation → transcript/notes → decisions → work graph → agents/tools → approvals → completed work + receipts`

The DO Meet package under `docs/do-meet/` is a **build brief**, not a claim that all hosted video, bot-provider or production meeting integrations are live.

#### agent-ready tools

Sandbox-first agent tools have expanded, including trade-finder, meeting-enhance and compliance-ping patterns alongside NZ business/operator lookup work.

The product principle is small, bounded tools with clear source/privacy limits, keys/caps where relevant and receipts. Do not turn this into a random API marketplace.

### SHOW / STUDIO — show the possibility

Studio is the visual, experiential and commercial proof layer.

It turns opportunities and software capability into:

- interactive demonstrators;
- product/customer journeys;
- websites and microsites;
- image, video, film, motion and 3D;
- advertising and campaign concepts;
- pitches and business-development artefacts;
- tender/award concepts and submissions;
- before/after simulations;
- proof that a proposed change is understandable and valuable.

SHOW is not just presentation. It is how assembl makes invisible future work tangible enough to sell, test and improve.

Studio must remain genuinely visual and experiential. Do not reduce it to a text-only file library.

### FACTORY — build once, reuse repeatedly

The Factory sits beneath Pursuit, DO and Studio.

It owns:

- canonical context;
- agent definitions;
- skills/runbooks;
- reusable primitives;
- connectors/tools;
- model routing;
- permissions/approvals;
- design/motion primitives;
- tests and evals;
- proof/evidence capture;
- deployment patterns;
- durable decisions and learnings.

Factory loop:

`SELECT → ISOLATE → BUILD → PROVE → REVIEW → SHIP-READY → COMPOUND`

### PROOF + LEARNING — close the loop

Every useful build should produce evidence and learning.

Flywheel:

`signals → Pursuit → opportunity → Factory → DO/Studio → proof → learning → stronger Pursuit + Factory`

## Business Genome

The **Business Genome remains important, but it is not the top-level description of assembl**.

Use “Business Genome” for structured, reusable understanding of a specific business/client/tenant: products, customers, policies, terminology, brand, workflows, permissions, systems, knowledge, goals and success metrics.

Do not confuse:

- **assembl company memory** — canonical repository context describing assembl itself;
- **Business Genome** — context for a customer/business being served.

## customer journeys and wait states

Agentic customer journeys remain a major product primitive.

The reusable journey system can support intent, context gathering, recommendation, approval, action, productive waits, fulfilment/resolution, continuation/loyalty and proof.

Wait states, rewards and sponsorship are **capabilities inside appropriate journeys**, not the top-level definition of assembl.

Principle:

> **utility first. reward second. interruption never.**

## brand state — do not drift

Canonical company brand: `docs/assembl-brand-system.md`.
Operational design guide: `DESIGN.md`. Kate’s exact glass lowercase company a and uppercase DO D-dot are locked as primary across company and DO; originals/Library IDs/hashes are in `public/brand/canonical/glass-v1/manifest.json`, shared via `GlassIdentity`. Visible light-field text is #492B3E; #240B21 remains a dark/action accent. Do not restore the earlier reconstructed meshes, opaque vector primaries or dark scrim. DO07 and the earlier wider rollout are released; the new daylight correction is held locally for review, not published. Native package application/installed proof remain separate.

Company surfaces use:

- Visible light-field ink `#492B3E`;
- Deep plum `#240B21` for dark fields/action fills;
- Muted plum `#654A4E`;
- Dusty rose `#916A70`;
- Chalk `#F5F1F2`;
- Paper `#FFFDFB`;
- Instrument Sans for normal company UI/type;
- IBM Plex Mono for evidence/proof/permission metadata;
- lowercase `assembl`.

Visual grammar:

> **things gather, organise and move with purpose until a useful whole is visible.**

Two approved visual modes:

1. brand/narrative assembly — premium aerial/top-down fine-art collective motion, often with an Aotearoa sensibility;
2. product/proof assembly — recognisable inputs becoming a reviewable output, permission boundary and receipt.

Do not use old Cormorant/champagne/gold/brass/pounamu/canary/grape-purple company directions as precedent because they remain in legacy code.

## persistent memory model

All agents should share the same context layers:

1. `config/context-manifest.json`;
2. this current state file;
3. `docs/assembl-context.md`;
4. brand/copy/design canon;
5. factory decisions/primitives/learnings;
6. task-specific product docs;
7. current code/schema/tests as runtime truth.

Chat history is useful working memory, not company canon.

## truth labels

Agents must distinguish:

- **canonical** — durable intended truth;
- **current state** — today's operating state;
- **runtime truth** — what current code/schema/tests actually do;
- **preview** — implemented for demonstration/evaluation, not production proof;
- **build brief** — defined work that may not be implemented;
- **proposal** — not yet accepted;
- **simulated** — no real external effect;
- **legacy/historical** — retained reference, not current instruction.

Never promote a preview, credential, generated output or merged document into a stronger capability claim without runtime evidence.

## end-of-day update rule

At the end of a meaningful workday:

1. inspect merged PRs and accepted decisions;
2. identify real changes to product direction, brand, architecture, primitives or operating rules;
3. update this file only when the current operating state genuinely changed;
4. update stable canon only when a durable decision changed;
5. register reusable capabilities, decisions and learnings in the Factory docs;
6. never let an automated process silently rewrite brand or product canon.

**2 October glass identity:** DO07 merged in PR1463 (`d568e6c4`) and was verified live with the 69 KB artwork and 256 production-built fictional browser checks. The earlier wider PR1471 rollout was merged externally; root verified production on main `9c3544f5`. Kate subsequently rejected its dark/mobile composition and reconstructed marks, locking the exact supplied glass originals as primary. DO08 daylight correction is local, unpushed review work: compact phone header, #492B3E ink, exact artwork planes inside the real moving room and a fictional notice using the existing local checklist handler. This does not claim exact modular glass geometry, authorised signed-in preview, real-device Safari or installed-native parity. Useful Pursuit demo, copy strategy and portable-native owners retain their boundaries.

## 14 October 2026 — native development-source reconciliation (#1417)

The 30 September SwiftUI app, Share Sheet, local reviewed-draft keyboard handoff and WidgetKit source are being reconciled with current main. This is local development source, not a signed or installed release. One App Group stores local drafts without a native account namespace or logout clearing; review limits are code-enforced rather than per-record OS isolation. One-hour availability expiry blocks insertion, not secure deletion or automatic preview clearing. RequestsOpenAccess remains false. Unsigned simulator checks do not prove signed-device App Group behavior. No signing, device installation, TestFlight or App Store publication is authorized by this integration. See [native evidence](../DO-IOS-20260930.md).

## 14 October 2026 — release and preserved-work reconciliation

[The dated release reconciliation](../reviews/DO-RELEASE-RECONCILIATION-20261014.md) records verified main/production, matching migration audit, operational configuration and retention blockers, remaining PRs and local-work inventory limits. Read its timestamp before using its exact deployment as current. Merged source is not all-user activation; cleanup consent, secure configuration, owner enrollment and native proof remain separate gates. No blanket push, merge or cleanup of historical work is authorized by this record.

## 18 October 2026 — clay DO visual release approved

Kate approved the reviewed clay entry at `daf336cf6b44dd2b199240ffce896d6d91bb73dd`. PR #1613 is being updated in place: its earlier Today work is an ancestor, not a second release. The final input-first Write/Talk/Add bubble and seven editable clay starters supersede that PR's earlier paper/SVG concept. Release/deployment evidence is recorded in [the clay entry review](../reviews/DO-CLAY-ENTRY-20261017.md); approval alone is not deployment proof. No migration, environment/flag/secret change, dependency, auth or provider activation is required. Physical iPhone/Safari and installed Mac verification remain outstanding.

## 18 October 2026 — clay DO merged and production verified

[PR #1613](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1613) is merged as `ac6c3368b7f026a9b926fba915eb98bca09c23da`. Exact-head CI and independent review passed; Vercel production `dpl_GYhewqBg9iBTdDUrjBJKLjqgzWGu` is READY on that SHA. Public `/do`, `/do/personal` and Write widget renders passed at 1440/375px, including seven starters, editable append, asset responses and no overflow/page errors. See [dated release receipt](DO-CLAY-RELEASE-20261018.md) for timestamps, skipped checks, sources and proof limits. No migration, environment/flag/secret change, new grant or native installation was needed. Physical iPhone/Safari and installed Mac verification remain outstanding; synthetic persistence checks do not claim live owner rollout. Earlier approval/pending-deployment wording above is historical.

## 19 October 2026 — inbox/travel reliability audit, review candidate

Main `7ab6a4353c5b90bc885ebb7a7f221fe7958e15dd` was audited in a separate clone/branch, leaving the PR1615 repair checkout untouched. [Evidence and acceptance matrix](../reviews/DO-TRAVEL-MAIL-RELIABILITY-20261019.md) separates implemented mail review/manual travel from mocked proof and blocked sensitive retrieval, paid search/booking, transport and peer coordination. The [existing master roadmap](../do/MASTER-ROADMAP-20261013.md) has the dated update. Candidate changes bind mail results to exact requests, avoid copying correspondence into task drafts, reject stale itinerary application and preserve exact offer snapshots. No live private mailbox/provider proof, activation, merge or deployment is claimed. Studio account access remains separate.

### 19 October: typed mail review follow-up

Following merged PR1620, typed Personal DO requests now offer the same owner-bound mail review used by reviewed Gemini calls. Typed handoff closes active voice and requires fresh mailbox/account/search consent. Retrieval stays in `/api/do/mail`; source text is reviewed in the existing workspace, and generated task drafts carry only an opaque source reference. This is reviewed entry parity, not private model tools, verified itinerary storage or booking. Sensitive-code retrieval still requires a separately proved step-up design. See the existing [audit evidence](../reviews/DO-TRAVEL-MAIL-RELIABILITY-20261019.md).

### 21 October: shopping call investigation (local candidate)

[Shopping call evidence and capability matrix](../reviews/DO-SHOPPING-CALL-20261021.md) records connected Mac Chrome reproduction of the live browser-access refusal, current Gemini streaming/tool boundaries, and the disabled Woolworths gate. A local ring/Answer candidate extends the existing call entry; no live retailer execution, deployment or provider-quality claim. Existing browser/native and voice owners retain the unresolved acceptance gates.

DO local follow-up (2026-10-21): owner-bound reviewed voice-to-browser handoff keeps same-tab call open; broker invalidates old authority before refresh and rejects stale/future evidence. Synthetic actual-component journey passed; native extension and Woolworths remain unverified/disabled. See `docs/reviews/DO-SHOPPING-CALL-20261021.md`. Nothing deployed.
