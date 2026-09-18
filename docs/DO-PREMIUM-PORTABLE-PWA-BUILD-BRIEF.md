# DO premium portable agent — build brief

Date: 18 September 2026 NZ time  
Status: source-of-truth handoff for the next DO build session  
Product owner: Kate  
Primary public entry: `/do`  
Primary install entry: `/do/install`

## 01 · Product decision

DO is not a chat page.

DO is the portable action layer of Assembl.

It should feel like a premium, always-available personal agent that can:

- understand the work in front of the user;
- gather selected context with explicit consent;
- research with real tools and sources;
- prepare useful work;
- ask for approval at the point of risk;
- use connected tools only within the user's permissions;
- move the same job between web, installed PWA, browser companion and desktop companion;
- keep the work, evidence, receipts and approvals together;
- hand results into Pursuit or Studio where appropriate.

The durable product is DO. The model is interchangeable infrastructure.

Do not rebuild DO as another generic chat UI.

## 02 · Existing product to preserve

The repo already contains useful primitives. Extend them rather than starting over.

### Distribution

- PWA is the primary live install path.
- DO PWA is scoped to `/do`, not the whole Assembl origin.
- Existing manifest path: `/do/manifest.webmanifest`.
- Existing service-worker design is intentionally DO-scoped. Never reintroduce a site-wide caching worker at `/`.
- Chrome companion exists as a downloadable extension / side panel.
- Mac companion source exists as a development companion.
- iOS / Android keyboard and widget stubs exist but are not public store releases.

### Runtime / intelligence

Preserve and build around:

- model routing in Assembl rather than vendor lock-in;
- AgentSpec / policy / connector declarations;
- explicit approval policy;
- evidence hashes and review invalidation;
- existing DO preparation workflow;
- existing MCP / NZ live tool primitives;
- voice primitives;
- existing owner/session helpers;
- existing receipts / job-event concepts;
- Builder DO primitives;
- current canonical DO mark and plum / rose / paper identity.

### Existing product routes

At minimum preserve:

- `/do`
- `/do/install`
- `/do/meetings`
- `/do/office`
- `/do/builder`
- `/do/connections`

Do not silently retire a working route to simplify the implementation.

## 03 · Premium product experience

### The core interaction

The default DO surface should have three layers:

1. **Context**
   - what DO currently knows about this job;
   - selected page text, file, meeting, brief, company or workspace context;
   - sources and provenance visible;
   - easy remove / edit / replace controls.

2. **Work**
   - the job being prepared;
   - editable task instructions;
   - live plan / progress;
   - evidence and sources;
   - outputs shown as real artefacts, not long chat paragraphs.

3. **Action**
   - what DO proposes to do next;
   - which tool or account is required;
   - exact payload / consequence;
   - clear approval button;
   - receipt after execution.

Chat can exist, but the product should be a task/canvas system first.

### Premium feel

The product should feel closer to the quality bar of:

- Granola for calm meeting capture;
- Raycast for speed / command affordances;
- Linear for clarity and state;
- Arc / Dia style browser-native context;
- modern native Mac utility craft;
- premium Assembl spatial / material design.

Do not copy any of those products.

Use them as interaction-quality references only.

## 04 · Portable surfaces

### A. PWA — primary

Make the PWA the best complete DO experience.

Requirements:

- install prompt on supported Chromium;
- clear iOS Add to Home Screen instructions;
- standalone display;
- fast cold start;
- app-shell loading state using current DO identity;
- push / background notifications only where permission is explicit;
- offline access to recent local drafts / shell where safe;
- no offline pretending for live research or actions;
- scoped service worker at `/do/` only;
- no root-origin caching;
- same authenticated owner and durable job IDs as other DO surfaces;
- deep links back into specific jobs.

The PWA must not become a separate data silo.

### B. Browser companion / extension

Purpose: bring DO to the user's current browser context.

Requirements:

- explicit capture of selected text / current page / user-chosen screenshot;
- never silently scrape every tab;
- visible context preview before sending;
- open or attach to an existing DO job;
- owner-bound authentication;
- no claim that context was stored unless storage actually succeeded;
- same job / receipt IDs as the PWA;
- side panel and small launcher;
- one-click “Ask DO about this” and “Send to Pursuit / Studio” where appropriate.

Do not grant privileged execution to any arbitrary Chrome extension origin.

### C. Mac companion

Purpose: floating system-level DO.

Requirements:

- user-selected text capture;
- ScreenCaptureKit picker for explicit window / region capture if added;
- no silent always-on recording;
- safe paste / insert only into user-reviewed fields;
- never auto-press Send / Return;
- share the same hosted authenticated DO job;
- clear connected / disconnected / permission state;
- notarised public distribution is a separate release gate.

### D. Mobile

PWA first.

Native wrappers / App Store / Play can follow after:

- privacy review;
- auth handoff;
- signing;
- notifications;
- keyboard / share extension;
- store QA.

Do not claim App Store / Play availability before it exists.

## 05 · One portable job model

This is the key architecture work.

Create one owner-scoped durable job model used by:

- PWA;
- browser extension;
- Mac companion;
- Meeting DO;
- Builder DO;
- future mobile surfaces.

A job should include:

- job ID;
- owner ID;
- workspace / client;
- title;
- goal;
- instructions;
- selected context;
- source refs;
- evidence;
- current state;
- model/provider calls;
- tool calls;
- approval requests;
- receipts;
- outputs / artefacts;
- created / updated timestamps;
- originating surface;
- handoffs.

State vocabulary should be simple and human:

- Ready
- Working
- Needs you
- Done
- Blocked

Do not create a different persistence model for every surface.

## 06 · Fix the known runtime gaps before “autonomy”

The current audit identified release blockers. Address them as part of the premium build.

### Ownership

Anonymous callers must never be able to enumerate or mutate another user's Browser Runtime state.

Every durable job / capture / receipt must be owner scoped.

### Durability truth

Never return `durable:true` when the write fell back to process memory.

Return explicit storage provenance:

- durable
- device-local
- process-memory
- unavailable

If the user asked for durable save and the durable store is unavailable, fail clearly rather than silently downgrade.

### Browser-seat capture

Do not say “stored” when nothing attached to an owner/job.

Return explicit states such as:

- attached
- pending-review
- detached
- not-stored

### Public preparation readiness

Availability must reflect the dependencies actually required for the requested action.

Do not show “ready” if quota / storage / provider dependencies will immediately reject the task.

### Connectors

Do not equate:

- configured
- authenticated
- implemented
- tested
- available

These are separate states.

### Action receipts

Tool execution success requires:

- successful transport;
- valid provider success response;
- persisted receipt;
- owner/job linkage.

HTTP 200 alone is not success.

## 07 · Agent intelligence

DO should be model agnostic.

Use existing routing primitives.

Route based on:

- task type;
- model quality;
- tool ability;
- latency;
- privacy ceiling;
- task value / risk;
- user budget;
- recent evaluation performance.

### TypeSafe

Use TypeSafe as a bounded decision / routing / structured-output capability where it proves useful.

Do not make TypeSafe the source of evidence.

Research facts still require real sources / live tools.

Do not block the whole DO product on TypeSafe availability.

## 08 · Research and knowledge

A useful DO must be able to search.

Prioritise:

- Assembl public knowledge;
- user-authorised workspace knowledge;
- NZ live tools;
- public web research;
- connected files / email / calendar only with permission;
- Pursuit source/evidence infrastructure.

Every research result should show:

- source;
- retrieval time;
- claim supported;
- confidence / limitations where relevant.

DO should be able to turn research into:

- brief;
- next-step plan;
- email draft;
- meeting prep;
- Pursuit;
- Studio brief;
- branded pitch/deck input.

## 09 · Connections and actions

Start with a small set of genuinely useful actions rather than a giant connector catalogue.

First production slice:

- read authorised calendar;
- read selected email thread;
- create draft email;
- create calendar draft / proposed event;
- save a DO job;
- append evidence;
- send a prepared Pursuit into Pursuit;
- send an approved brief into Studio.

External sends / publishing / payments / destructive actions require explicit approval.

Build the permit around the exact payload and expire it.

## 10 · Voice

Voice should feel like speaking to DO, not a separate product.

Requirements:

- same job context as text;
- live transcription;
- user can interrupt;
- tool proposals appear visibly;
- voice cannot silently approve actions;
- handoff between voice and visual canvas;
- transcript / notes can become artefacts;
- usage limits shown honestly.

Use the current live voice primitives where viable.

Do not expose provider names in the premium public interaction unless useful to the user.

## 11 · Meeting DO

Meeting DO should be one of the strongest examples of DO.

Quality bar:

- record / import;
- accurate transcript;
- speaker separation where supported;
- concise notes;
- decisions;
- unanswered questions;
- tasks;
- owners / due dates;
- evidence links;
- one-click conversion into actual DO jobs;
- follow-up drafts;
- optional connection to calendar / email after approval.

Do not stop at “meeting summary”.

The value is converting the meeting into prepared work.

## 12 · Visual system

DO is deep plum, dusty rose, paper / ivory and restrained material depth.

No purple.

No neon AI aesthetic.

No generic chatbot bubble wall.

Use:

- dimensional D + dot;
- glass used where it has a real material backdrop;
- soft depth / shadow;
- large editorial typography;
- canvas / artefact views;
- restrained motion;
- rich empty space;
- tool / evidence details that feel engineered, not decorative.

The app should be premium on mobile, not merely responsive desktop.

## 13 · Copy rules

Run all public-facing copy through the existing anti-AI-slop / clear-writing checks.

Avoid:

- “quiet”
- “seamless”
- “effortless”
- “revolutionary”
- “game-changing”
- “AI-powered”
- “intelligent ecosystem”
- “unlock”
- generic transformation language.

Prefer concrete language:

- Bring the page.
- Give DO the job.
- Review the draft.
- Connect Gmail.
- DO needs your approval.
- Ready to send.
- Saved to Pursuit.
- Open in Studio.

Keep the tone short, useful and human.

## 14 · Security / privacy rules

Non-negotiable:

- no secrets in model prompt context unless technically required and scoped;
- prefer OAuth / scoped handles;
- no silent screen recording;
- no silent mailbox ingestion;
- no cross-owner job access;
- no arbitrary extension-origin trust;
- no external send without policy + approval;
- no fake “stored”, “connected”, “durable” or “completed” states;
- no background spend without user budget / authority.

## 15 · PWA technical acceptance

The build is not complete until all of these are proved.

### Install

- manifest validates;
- icons render;
- Chromium install flow works;
- iOS instructions are correct;
- launch opens standalone DO route;
- deep links reopen the correct job.

### Service worker

- scope is `/do/` only;
- no caching of auth/API routes;
- no stale root-site shell;
- update strategy is tested;
- old DO shell refreshes safely.

### Auth

- PWA, extension and Mac companion resolve the same owner;
- owner A cannot see owner B jobs;
- signed-out capture cannot silently attach to private work.

### Jobs

- create on web;
- reopen in PWA;
- attach context from extension;
- continue in Mac companion;
- persist across process restart;
- receipts survive restart.

### Actions

- payload-bound approval;
- expired approval rejected;
- idempotent retry;
- provider failure recorded as failure;
- no success receipt for provider error.

### Mobile

Test on an actual iPhone, not only emulation:

- install/add to home screen;
- safe area;
- keyboard;
- scroll;
- file/photo share;
- voice permission;
- offline shell;
- reconnect;
- deep link.

## 16 · Build sequence

Do this in order.

### Phase 1 — truth + durability

1. One durable owner-scoped job repository.
2. Fix false durability claims.
3. Fix detached browser capture language/state.
4. Owner isolation tests.
5. Persistence/restart proof.

### Phase 2 — premium PWA

1. Validate scoped manifest + service worker.
2. Premium mobile shell.
3. Install UX.
4. Job canvas.
5. local/offline-safe recent drafts.
6. deep links.
7. notification framework, permission gated.

### Phase 3 — portable context

1. Extension owner auth.
2. selected page/text capture.
3. attach to an existing job.
4. Mac same-job handoff.
5. receipts.

### Phase 4 — useful tools

1. bounded research;
2. calendar read;
3. email read;
4. email draft;
5. calendar draft;
6. Pursuit handoff;
7. Studio handoff.

### Phase 5 — voice + meetings

1. same-job voice;
2. transcript + task extraction;
3. conversion into actual jobs;
4. approved follow-up drafts.

### Phase 6 — native distribution

Only after the PWA and portable job model are proven:

- Mac notarisation;
- TestFlight;
- internal Play;
- store release.

## 17 · Definition of premium

DO is premium when a user can:

1. install DO on their phone;
2. open a real task;
3. capture context from where they are;
4. ask DO to research / prepare something useful;
5. see evidence;
6. approve the next action;
7. leave the device;
8. reopen the same task elsewhere;
9. continue with context intact;
10. receive a real artefact or completed approved action.

Without that continuity, it is not yet a portable agent.

## 18 · Release gates

Before merge:

- typecheck;
- DO focused tests;
- owner isolation tests;
- durable restart test;
- action permit / idempotency tests;
- PWA manifest / service-worker tests;
- browser extension auth + capture test;
- mobile screenshots;
- actual iPhone test;
- no public purple DO assets;
- no anti-slop copy violations;
- no claims unsupported by runtime evidence.

Do not merge a large “premium DO” branch just because it builds.

Ship in small vertical slices with proof.
