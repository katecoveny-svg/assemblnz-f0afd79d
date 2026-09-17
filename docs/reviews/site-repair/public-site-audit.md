# Public-site audit: routes, messaging and purposeful 3D

**Worktree:** `/Users/kateharland/assembl-site-repair`  
**Baseline inspected:** `4bda9aaf5`, origin `katecoveny-svg/assemblnz-f0afd79d`. Findings describe the initial baseline; concurrent parent-agent edits appeared during the audit and were not changed or re-audited here.  
**Live origin:** `https://www.assembl.co.nz`  
**Audit date:** 17 September 2026 NZ time. First HTTP pass: `2026-09-16T23:13:32Z`; follow-up route pass: `23:14:29Z`.  
**Authority:** read-only source/HTTP audit. Only this report was written. No application changes, installs, builds, deployments, browser automation, form submissions, account access or paid generation calls.

## Outcome

The current dimensional homepage is **already live**, not merely a draft. `/` renders `assembl the work.`, the atelier poster and the `AssemblWorldHero` front door. Do not replace it with `DoHomeCurrent` or rebuild a second 3D system.

Most core destinations and their visual assets work. The highest-impact defects are narrower:

1. **Task DO Maker links silently serve the homepage at HTTP 200.** `/studio/do-maker`, its query variants and the partner alias chain are broken by the live splash gate, not missing application code.
2. **Global “sign in” links return home.** The shared nav links to bare `/login`, which intentionally redirects to `/`; DO-scoped login works.
3. **Two Chrome downloads advertise the same version/package but contain different executable/UI files.** The API ZIP is not equivalent to the static mirror.
4. **Homepage copy is split between constants and hard-coded markup.** The required commercial line is missing and the existing copy test disagrees with all three key `HERO` values.
5. **The fly-through is an authored architectural walk without a matching product narrative.** Its camera has Find/DO/Show chapter timing; the homepage wrapper discards the corresponding chapters, source/output proof and chapter controls.
6. **Adjacent public surfaces still tell an older company story.** Studio uses an ocean backdrop with little visible work; Contact/About inherit an unrelated watch; About calls assembl an agency; sitemap and root install manifest still prioritise old products.

These are repairable using existing components, asset files and tests. No new artwork, wildlife scene, model-generation service or parallel runtime is needed.

## Evidence method and interpretation

- Read `START_HERE.md`, `AGENTS.md`, context manifest/router/current state, company strategy, brand/copy standards, `DESIGN.md`, primitive registry, relevant component/runtime/test sources and the DO visual baseline.
- Canon precedence: current task and 17 September company/copy/brand canon override historical skill material and the 16 September visual baseline's obsolete **Builderdoo** spelling. Preserve the baseline's approved dimensional experience; use **Builder DO**.
- Anonymous HTTPS GETs inspected response status, redirect chain, `X-Matched-Path`, title, H1 and DOM anchor IDs. No cookies or credentials supplied. HTTP cannot prove hydrated interactions, successful provider operations or authenticated workspace content.
- Static binary checks used bounded Range GETs and verified MIME/signatures. ZIP comparisons downloaded public packages into memory and compared per-entry SHA-256, not archive bytes, so differing ZIP timestamps cannot explain executable-content differences.
- Checked **61 distinct directly emitted assets across 10 core pages** with HEAD: **61 HTTP 200**, no HTML substitutions or asset failures. These included 30 JavaScript, 16 CSS and the emitted image/video/manifest/icon responses.
- Checked **25 in-scope fragment links against server-rendered target IDs**: no missing targets. In particular `/do#your-dos`, `/do#take-do-with-you` and Office board anchors exist.
- Checked every **38 current sitemap entries**: all ultimately return 200; `/insurance` and `/toro` redirect to `/agents`. This does not certify their copy or client-side functionality.

Classification matters:

- **Actual page:** route-specific matched path/title/content, not merely a 200.
- **Auth-gated:** explicit sign-in/basic-auth chain; not reported as missing.
- **Misrouted/soft failure:** requested product URL serves `/` content at 200.
- **Missing:** actual 404, verified with an intentional control route.
- **Client shell:** correct route but only loading/interactive shell present in SSR; hydration needs browser verification.

## Live route matrix

All paths below are on the live origin unless noted. `200 actual` means route content, not verified service execution.

| Route / destination | Observed response | Classification / significance |
|---|---|---|
| `/` | 200, matched `/`, H1 `assembl the work.` | Actual current homepage; atelier hero is shipped |
| `/pursuit` | 200, matched `/pursuit`, `Find the opening. Build the possibility.` | Actual page; illustrative example is labelled |
| `/pursuit/playground` | 200, matched route, `See an agent call a real NZ tool.` | Actual sandbox/DEMO page; no lookup invoked |
| `/do` | 200, matched `/do`, `assembl your DO` | Actual rich `DoHome`, not `DoHomeCurrent` |
| `/do/office` | 200, `give the work. see it move.` | Actual page with spatial preview and honest plan-only boundary |
| `/do/builder` | 200, `tell it what needs to exist.` | Actual planner; save-to-Office is stated not to run an agent |
| `/do/family` | 200, `School admin. In one place.` | Public page; Gmail/account operations remain gated/unexercised |
| `/do/meetings` | 200, `Meeting DO.` | Actual recording/transcription UI; not a provider test |
| `/do/meetings?phone=1` | 200, `Record tonight.` | Correct distinct phone-view content |
| `/do/install` | 200, `Take DO with you.` | Actual Chrome/Mac installation guide |
| `/do/connections` | 200, `give your DOs the tools they need.` | Actual page; connector availability not established by SSR |
| `/do/household` | 200, `Household Floor` | Actual public template; no install/run triggered |
| `/do/bills` | 200, `Could this cost you less?` | Actual page; no bill/provider call invoked |
| `/do/browser` | 200, `Jobs that survive the tab` | Actual explicitly labelled prototype |
| `/do/sponsored` | 200, `Kitchen DO` | Actual explicitly labelled prototype/demo stubs |
| `/do/widget` | 200, matched route, preparation UI in body | Actual embedded workspace shell; no H1 in SSR, not a 404 |
| `/do/tasks` and `?board=portable-widget`, `?board=meeting-do` | 200, matched `/do/tasks`, `Loading tasks…` | Client shell; do not claim board hydration succeeds from HTTP |
| `/do/share` | 307 → `/do?open=1`, then actual 200 | Intentional supported-workspace redirect |
| `/do/live` | 307 → `/do?open=1`, then actual 200 | Intentional hosted fallback, not broken dev voice service |
| `/do/travel` | 307 → `/do?task=plan`, then actual 200 | Intentional supported planner redirect |
| `/creative-studio` | 200, `Give the idea a world of its own.` | Actual marketing page; title repeats `· assembl` |
| `/studio` | 200, **matched `/`**, homepage title/H1 | Misrouted existing koro workbench, not the Creative Studio workspace |
| `/studio/do-maker` | 200, **matched `/`**, homepage title/H1/canonical | **Broken Task DO Maker entry** |
| `/studio/do-maker?opportunity=Service+quote+preparation&task=research-brief&template=research-brief` | 200, **matched `/`** | **Broken literal Pursuit CTA** |
| `/studio/do-maker?mode=partner&partner=bp` | 200, **matched `/`** | **Broken public partner-maker CTA** |
| `/do/maker/partner` | 200, `Partner DO maker` | Actual partner index |
| `/do/maker/partner/bp` | 307 → `/studio/do-maker?mode=partner&partner=bp` → homepage 200 | Redirect exists; final destination is broken |
| `/contact`, `?product=pursuit`, `?product=studio`, `?product=system` | 200, actual Contact | Product form preselection observed for Pursuit/Studio; inherited canonical is `/`, not `/contact` |
| `/login` | **302 → `/`** | Broken promise from public shared “sign in” CTA; intentional gate behaviour |
| `/login?redirect=%2Fdo%2Finstall` | 200, matched `/login`, `sign in` | Correct DO-specific auth entry; no auth submitted |
| `/about` | 200, `An independent NZ agency.` | Actual page with outdated primary company positioning |
| `/tools/nz-who-runs-it` | 200, actual tool documentation | No API invoked |
| `/legal/privacy`, `/legal/terms`, `/legal/disclaimer`, `/legal/meta-data-deletion` | 200, respective page titles/H1s | Actual pages, not missing; secondary canonical metadata needs attention |
| `/workflows` | 200, **matched `/`**, homepage | Broken root-manifest shortcut; do not reopen retired marketplace merely to satisfy link |
| `/customers/happy-tails` | **401**, `WWW-Authenticate: Basic realm="assembl demo"` | **Intentionally gated** |
| `/journeys/one-nz` | **401**, same basic-auth realm | **Intentionally gated private concept** |
| `assembl-pursuit.katecoveny.chatgpt.site/studios` | 307 → `/signin-with-chatgpt?return_to=%2Fstudios` → OpenAI OAuth; final 403 `Just a moment…` | **Auth/challenge-gated**, NOT evidence the hub is missing |
| `assembl-pursuit.katecoveny.chatgpt.site/agency` | Equivalent chain with `return_to=%2Fagency` | **Auth/challenge-gated**, NOT evidence the Studio workspace is missing |
| `/__public-audit-missing-route__` | 200, matched `/` | Control proves unknown paths can soft-fail as homepage |
| `/do/__public-audit-missing-route__` | **404**, matched `/_not-found`, `This page does not exist yet.` | Actual missing-page control |

External workspace links are defined centrally in `lib/product-destinations.ts:12–40`. Keep these top-level external navigations and their access restrictions. A public repair must not fabricate replacement workspaces or remove authentication to make the audit green.

## Assets and portable downloads

Key Range responses all had correct binary signatures and no homepage HTML:

| Asset | HTTP / MIME | Total bytes from Content-Range |
|---|---|---:|
| `/do/world/atelier.glb` | 206 / `model/gltf-binary` | 1,704,728 |
| `/do/world/atelier-poster.png` | 206 / `image/png` | 1,936,918 |
| `/do/office/harbour-studio.glb` | 206 / `model/gltf-binary` | 691,764 |
| `/do/office/office-poster.webp` | 206 / `image/webp` | 72,624 |
| `/do/office/do-harbour-studio.blend` | 206 / `application/octet-stream` | 491,862 |
| `/do/office/draco/draco_decoder.wasm` | 206 / `application/wasm` | 192,420 |
| `/do/office/draco/draco_wasm_wrapper.js` | 206 / JavaScript | 58,456 |
| `/do/office/draco/draco_decoder.js` | 206 / JavaScript | 512,465 |
| `/do/cinema/do-orb-loop.mp4` | 206 / `video/mp4` | 3,011,701 |
| `/do/cinema/do-orb-poster.webp` | 206 / `image/webp` | 226,394 |
| `/do/canvas/dimensional-d.png` | 206 / `image/png` | 684,063 |
| `/do/canvas/pet-do-purple.png` | 206 / `image/png` | 1,800,549 |
| `/cinematic-nature/ocean-assembly.webp` | 206 / `image/webp` | 356,130 |
| `/brand/watch/assembl-watch.glb` | 206 / `model/gltf-binary` | 11,540,616 |
| `/brand/watch/watch-poster.jpg` | 206 / `image/jpeg` | 271,634 |
| `/brand/watch/watch-exploded.jpg` | 206 / `image/jpeg` | 239,709 |
| `/brand/watch/watch-mobile.mp4` | 206 / `video/mp4` | 1,347,734 |
| `/brand/watch/watch-desktop.mp4` | 206 / `video/mp4` | 6,395,209 |
| `/do/downloads/assembl-do-extension-1.5.2.zip` | 206 / `application/zip`, PK signature | 30,026 |
| `/do/downloads/DO-mac-companion.zip` | 206 / `application/zip`, PK signature | 10,363 |

Also passed: DO/root webmanifests, DO icons at 192/512/180 sizes, root icons/favicon, `/do/sw.js` with JavaScript MIME, and the Next image-optimisation route for the atelier poster. Existence is not proof of browser PWA installation/offline behaviour.

`/api/do/download?format=extension`, `format=mac`, `format=embed` returned **200 ZIPs** with appropriate attachment filenames. Source inspection confirmed this GET route only packages existing files/strings; no paid/mutating action endpoint was called.

### Confirmed Chrome mirror drift

Both Chrome archives contain 16 non-directory entries and versioned filename `assembl-do-extension-1.5.2.zip`. Per-entry hashes differ for:

- `background.js`
- `floating.js`
- `popup.css`
- `sidepanel.css`
- `sidepanel.html`
- `sidepanel.js`
- `README.md`

The Mac API/static archives contain the same four source entries; only `README.md` differs. README differences are expected from the two generators; executable/UI differences are not explained by ZIP timestamps.

**Root cause:** `scripts/package-do-downloads.mjs` manually refreshes committed ZIPs; API downloads read current `apps/do/extension` files. The normal `package.json` build command does not refresh/check the static packages. `/do/install:74–77` calls the Chrome mirror the “same package”, which is false for the checked live release.

**Bounded fix:** refresh the static archives from current source, make labels accurate, and add parity verification for every runtime file. Compare entry bytes, excluding generated README or centralise README generation; do not compare whole-archive hash. Reuse the existing packager and download route, not another distribution mechanism. `DoDownloadCtas.tsx:27–33` should say **Download Mac source**, matching the guide, rather than relying on explanatory copy lower down.

## Exact defects, roots and focused fixes

### P1 — Restore the linked maker path without opening private surfaces

- **Root:** `middleware.ts:81–219` exempts `/creative-studio` and `/do` but not `/studio`. Its `splashGate:278–287` rewrites the unexempted URL to `/` and clears the rewrite query. Adding `/studio` to `DEMO_AUTH_EXEMPT_PREFIXES` elsewhere does not exempt the live splash gate.
- **Existing destination:** `app/studio/do-maker/page.tsx:1–18`, `TaskDoMakerClient`, `lib/studio/task-do-maker.ts`. `/studio` itself exists in `app/studio/page.tsx` as a different koro workbench.
- **Affected publishers:** `PursuitLanding.tsx:28–33,48–50,84–87`, public playground, Office maker link, `lib/product-destinations.ts:36–41`, `/do/maker/partner/[partnerSlug]` redirects.
- **Fix:** explicitly allow the intended `/studio/do-maker` tree using the existing segment-aware `matchesPrefix` helper. Decide `/studio` separately as the existing agent-workbench overview; do not alias Creative Studio's `/agency` workspace to it. Avoid broad new prefix exemptions that match unrelated routes. Keep private customer and One NZ gates intact.

### P1 — Repair shared sign-in entry

- **Root:** `components/v2/V2Chrome.tsx:34` emits `/login`; `middleware.ts:247–253` permits only DO-scoped login returns on the live host and redirects the bare login to `/`.
- **Fix:** the customer-facing shared sign-in entry can use `/login?redirect=%2Fdo`. Keep existing owner/operator host routing. Pursuit/Studio workspace launches retain their own external sign-in.
- **Why not delete the gate:** existing `lib/auth/do-entry.test.ts` explicitly protects operator routing and off-site/lookalike returns.

### P1 — Restore canonical copy and wire it to actual markup

- `copy.test.ts:5–9` expects `HERO.headline = 'assembl the work.'`, `HERO.subhead = 'find it. DO it. show it.'`, `HERO.loopLine = 'use one. connect two. run the whole loop.'`.
- The actual constants in `copy.ts:24–33` are respectively `find it. DO it. show it.`, explanatory product prose, and `one context. many models. visible proof.`. A read-only literal comparison confirmed all three differ. **Vitest was not executed**; this is a confirmed source/contract mismatch, not a fabricated test-run result.
- `AssemblWorldHero.tsx:139–146` hard-codes the correct master/product headings instead of consuming those fields. `AssemblTheWorkHome.tsx:18` says `Use one. Connect the whole loop.` and omits the required middle option.
- **Fix:** restore canonical fields, give explanatory prose its own field, render these fields consistently, and show the exact line **use one. connect two. run the whole loop.**. Keep product roles: Pursuit finds evidence-backed work, DO does bounded work with permission/proof, Studio makes tangible proof, Factory underneath. Do not replace honest plan/preparation states with completion claims.

### P1/P2 — Purposeful world journey, not additional decoration

Detailed reuse plan is below. Current home/Office files and assets are a strong base; their existence is not the defect. The missing connection between rooms and useful work is the defect.

### P2 — Remove mixed company stories from the immediate public path

- **Studio:** `ProductLanding.tsx:9–11` uses `/cinematic-nature/ocean-assembly.webp` behind an offer/process page. The asset works, but it does not demonstrate the working experiences, motion/3D, websites or proof that Studio claims. Reuse the existing atelier/Office world, approved DO film or actual existing public demonstrator artefacts with honest example labels. Keep the external Creative Studio login and scope CTA. No new nature imagery.
- **Contact:** `PublicWatchFrame.tsx:10–14` wraps `/contact` and `/about` in `WatchScene`, adding an unrelated watch/film UI. The watch model is an optional 11,540,616-byte asset; do not describe it as an automatic initial download. Remove the wrapper for the repaired company pages or retain it only on a clearly relevant standalone assembly study. A contact enquiry does not benefit from an ornamental watch.
- **About:** `app/about/page.tsx:6–22` still says “independent New Zealand agency”, “We make AI visible”, “AI is not complex”, and broadly “NZ-hosted. NZ Privacy Act compliant.” Those blanket hosting/compliance claims are unverified and inconsistent with the careful Contact wording. Update to current company architecture; preserve only provable facts.
- **Shared cinematic chrome:** `CinematicSubpage.tsx:29–35` uses Agents/Pricing/the agentic journey rather than the current three products. Reuse product destinations in that existing shell, rather than redesign every legacy page.
- **Contact form:** `components/site/contact-form.tsx:107` leads with “The wait…” and “Outcome result”; normal labels/buttons use mono and legacy hard-coded grey/paper styling. Use literal outcome/brief language and current normal-text styling. The form already truthfully says it opens an email draft; retain that behaviour and no-send guarantee. No backend submission is required for this repair.
- **Connections/meetings:** the current live pages contain implementation-facing phrases such as “Four layers: MCP Market Hub …” and “Granola-class agent pass”. Keep technical detail available, but put the literal customer job and current approval/availability state first. This is copy cleanup, not a claim those integrations now work.

### P2 — Bring discovery and install metadata into the same architecture

- `app/sitemap.ts:10–52` omits `/pursuit`, `/do`, `/creative-studio`, and `/do/install`, while ranking the Living Site funnel as the primary story. It includes redirecting `/insurance` and `/toro`. Add indexable product/guide routes; remove redirect sources from the sitemap. Do not index private/preview/generated personal DO pages indiscriminately.
- `public/manifest.webmanifest` describes SPARK/kete/workflows, uses old `#2B6B57`/`#FAF7F2` colours and links its workflow shortcut to misrouted `/workflows`. Update the root manifest to current product entries; preserve the already separately scoped `/do/manifest.webmanifest` and `/do/sw.js`.
- `app/contact/page.tsx` lacks its own canonical; it inherits `/` from `app/layout.tsx:71`. Several legal/tool pages similarly inherit `/`. Correct canonicals for the touched public routes.
- `app/creative-studio/page.tsx:3` uses a title already ending `· assembl` under root `%s · assembl` template; live title is `Studio · show it. · assembl · assembl`. Use an absolute title or remove the suffix. Same pattern is visible on Family/Bills/About and should be fixed opportunistically without pretending their routes are missing.

## 3D implementation: preserve, then connect

### What already exists and should remain

- `app/page.tsx` → `AssemblTheWorkHome` → `AssemblWorldHero` → dynamically imported `app/preview/do-world/WorldScene.tsx`.
- `WorldScene` uses the existing **R3F / Three / Drei** stack, local Draco, `atelier.glb`, an extruded canonical D contour with luminous dot, an eye-level `CatmullRomCurve3` camera/gaze, and `chapterPath()` with three dwell frames (`0.16`, `0.52`, `0.88`).
- GLB metadata confirms atelier has **11 batched nodes/meshes/materials**, **zero authored animation tracks**, no external image URIs. The Office GLB has **15** nodes/meshes/materials, zero authored animation tracks. Current motion is camera/runtime motion, not an input-to-output assembly animation stored in the model.
- The homepage has DOM headings/links/form and a poster fallback; scrolling uses passive listeners, not wheel hijacking. Canvas uses `frameloop="demand"`, DPR `[1,1.5]`, bounded lights/shadows. Preserve these strengths.
- `DoOfficeSpatial.tsx` already demonstrates the right pattern: optional 3D, a still fallback, named viewpoints, actual Office counts passed into the scene, and corresponding accessible 2D board anchors. Keep empty state honest.
- `DoSpatialScene` is CSS/DOM dimensional identity, **not another WebGL scene**. It already has reduced-motion and intersection-aware parallax. `DoFilm` already has pause, visibility/reduced-motion handling, `preload="none"`, silent playback and truthful “motion study” language.
- `DoHome`, `DoReveal`, `DoBuilder`/`DoCanvas`, `GlowDoWidget`, `DoMark`, specialist selection, remembered appearance/layout and portable starters must survive this work.

### What is currently missing

- The preview wrapper `app/preview/do-world/World.tsx:38–63,143–168` already provides Find/DO/Show chapters and chapter navigation. The homepage reuses the scene but not this narrative/control layer.
- Homepage wrapper has only a single static master headline and bottom-of-rail form. Camera movement reveals rooms without a selected signal, reviewed brief, approval boundary or proof artefact. `WorldScene` renders architecture plus identity, not product work.
- `assembl-world-hero.module.css:10,113,188–204` reserves a 220vh desktop rail (180vh mobile) and places the job form at the bottom. The primary CTA targets a real ID, but the layout makes the user traverse the rail to reach the form. This is a source-derived design limitation, not a measured screenshot/viewport failure.
- Reduced-motion currently still imports/loads the full scene and changes camera frames on scroll. The homepage wrapper has no intersection/visibility pause gate. Demand rendering reduces cost, but does not replace an explicit offscreen/loading policy.
- On a later scene failure, the wrapper boundary does not reset the parent `sceneReady` state; a previously dimmed poster may remain hidden. Context-loss/failure-after-ready deserves a real browser regression test. No such failure was simulated during this audit.

### Bounded high-impact implementation plan

**Uses:** approved local GLBs/posters/film, `DoMark`, `DoFilm`, `DoSpatialScene`, `DoIntentInput`, product destinations, current DO handoff contract, `@assembl/canvas` canon tokens.  
**Extends:** existing homepage World wrapper/scene and existing routing/tests.  
**Does not create:** second 3D renderer, new generated media, replacement DO runtime, paid demo backend or new authentication.

1. **Unblock navigation and distributions first.** Repair maker exemptions, shared sign-in href, root manifest shortcuts and ZIP parity. Keep private gates. Add response-identity assertions, not status-only checks.
2. **One illustrative job carried through the existing atelier.** Use the existing service-quote example from `PursuitLanding` or another clearly labelled fictional brief. Reuse the existing three camera dwells. At Find, show source/context and an evidence-labelled opportunity brief; at DO, show prepared work plus “ready for review / nothing sent”; at Show, show a visible deliverable/example with a next action. Factory/context/permission/proof is a quiet shared rail beneath all three, not a fourth disconnected product.
3. **Add HTML chapters and matching navigation, not canvas-only text.** Adapt `World.tsx`'s chapter metadata/anchors into `AssemblWorldHero`. Keep one primary action visible and the job input reachable without finishing the cinematic journey. Keep source/output/approval content in DOM so it survives no-JS/no-WebGL and is readable at 375px.
4. **Make work visibly change between chapters.** Existing physical paper/interface fragments may gather into the prepared brief and then a proof surface near existing tables/apertures. Add only minimal scene groups anchored to the existing room; retain the approved D/dot. These are clearly labelled examples, never fabricated current company/agent activity. The camera should hold long enough to read the output.
5. **Add explicit progressive-enhancement controls.** Still/resolved mode for reduced motion, visible pause/scene-load failure recovery, explicit offscreen/hidden-tab suspension, a retained poster on model/decoder/context failure. Do not reduce the experience to a text-only page to satisfy these conditions.
6. **Carry the same product story to Studio/Contact/About and metadata.** Use existing shells/components, not a site-wide visual rewrite. Preserve product-specific examples and rich DO controls. Add the exact commercial line at a natural product-choice point.

For package reuse, use `canon` from `packages/canvas/src/tokens.ts:57–72`. The same file deliberately retains legacy `palette`/typography, and `AssemblingLoader` still uses legacy gold tokens. Importing every existing canvas primitive unchanged would reintroduce old art direction; do not globally recolour legacy consumers in this bounded repair.

## Tests and proof to require before shipping

### Already exercised in this audit

- Anonymous route/title/H1/redirect checks, asset MIME/signature checks, 61 emitted asset HEAD checks, 25 SSR anchor checks, all sitemap entries, two public ZIP comparisons.
- `node scripts/public-front-door-guard.mjs`: **exit 0**; output: `public-front-door-guard: assembl front door, WorldScene/AssemblWorldHero or DoSpatialScene company, dimensional DO and portable canvas present`.
- Existing copy contract compared with current literals: three mismatches, as documented above. No Vitest suite or build was run by this audit agent.

### Extend existing tests rather than invent parallel assurance

1. **Public route matrix:** model after `lib/auth/do-entry.test.ts`'s mocked session + live-host `NextRequest`. Assert `/studio/do-maker` and query variants have no homepage rewrite; `/do/maker/partner/bp` ultimately reaches the maker; the public nav login target remains DO-scoped. Test both apex and www plus a preview host. Keep `lib/demo-invites/private-journey.test.ts` and operator/off-site redirect cases green. Check segment lookalikes so a new exemption does not broaden accidentally.
2. **HTTP regression:** expected status **and** matched route/title/canonical/H1 for every core destination. Gated routes must remain gated; auth workspace checks must classify the sign-in chain. Unknown paths are negative controls, not a source of invented public pages. Validate each emitted first-party href and anchor against actual target content.
3. **Copy:** keep `components/site/assembl-the-work/copy.test.ts`'s canonical master/product/commercial lines. Add rendered-output coverage so hard-coded hero/strip text cannot bypass it. Check current product names, honest preview/approval labels, Studio title and Contact canonical.
4. **Downloads:** extend `app/api/do/download/route.test.ts` to compare committed static ZIP runtime entries to API/source entries; retain current JS parsing, manifest/icon, origin-boundary and no-arbitrary-path tests. Verify both entrypoints deliver the same executable version after packaging.
5. **Portable surfaces:** run `lib/do/do-pwa.test.ts`, `apps/do/shared/home-handoff.test.ts`, `apps/do/shared/sidepanel.test.ts`, `lib/studio/task-do-maker.test.ts`, Office/Builder state/permission tests. Assert root shortcuts reach real products and no public entry rewrites home. Do not equate a PWA manifest with actual installed runtime proof.
6. **Browser proof (parent-owned):** 375px and desktop, keyboard only, default/reduced motion, JavaScript-disabled readable story, blocked GLB/decoder/video, WebGL context loss after ready, model load failure, hidden/offscreen behaviour and back/forward navigation. Capture initial, Find, DO-review and Show/proof frames; verify the chapter labels match camera position and CTA remains accessible. Verify no duplicated chrome/overflow and retained D/dot identity, specialist taps/drag alternatives, close/focus behaviour and retained DO handoff.
7. **Authority/network proof:** entering an illustrative chapter or scrolling must not call paid APIs, compile agents, send mail or claim a completed action. Contact opens a mail draft only. Homepage intent handoff carries text via existing sessionStorage helper and opens DO for review, not execution. Connected/private operations are separate explicitly approved tests.
8. After implementation, normal package-first typecheck, relevant Vitest suites, appropriate lint, brand/macron/context guards and production build; then repeat live response checks only after authorised deployment. Source-presence front-door guard passing is not sufficient visual/route proof.

## Limits and recommended boundary

This is not a claim that every legacy page, authenticated workspace, local Mac app, extension install, provider connection or hydrated DO action has been exercised. No shared browser was used. The HTTP crawl is deliberately bounded to core public routes, their direct emitted assets/anchors, relevant adjacent routes, and the current sitemap. The external Sites workspace content remains unverified behind sign-in/challenge. Mail addresses were not tested by sending messages.

For this repair, fix actual misroutes/distribution drift, connect the existing world to useful work, and align the immediate public product path plus discovery metadata. Keep wider legacy-page rewrites, native signing/notarisation, new integrations, pricing strategy and broad middleware retirement as separate scoped work. Preserve approved DO richness and all meaningful authority boundaries.
