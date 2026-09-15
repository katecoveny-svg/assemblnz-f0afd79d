# DO personal builder platform

**Status:** proposed architecture · 16 September 2026  
**Purpose:** make DO a persistent, model-agnostic operating layer that can build, research, create and execute work without tying the user to one model vendor or coding-agent subscription.

## 1. the durable product

The durable product is **DO**, not the model running the current turn.

A DO should keep the same:
- identity
- role
- user/business context
- task history
- permissions
- tools
- approvals
- receipts/evidence
- workspace membership
- evaluation history

while the underlying intelligence can change between:
- Anthropic / Claude
- OpenAI models
- xAI / Grok
- Google / Gemini
- Groq/open models
- local Ollama models
- future providers

Model choice belongs behind `lib/os/routing.ts` + `lib/ai/router.ts`.

## 2. Builder DO — the personal software factory

Builder DO is the persistent role that replaces the need to mentally restart a new Codex/Claude/Grok coding session from scratch.

It is not a newly trained foundation model. Its capability comes from the **harness around the model**.

### Context
- `START_HERE.md`
- `AGENTS.md`
- `config/context-manifest.json`
- `docs/context/CURRENT.md`
- task-specific canonical docs
- relevant source/tests/runtime evidence

### Tools
- filesystem/repository read + write
- shell/command execution
- git branches/worktrees
- package manager/build tools
- tests/lint/typecheck/evals
- browser/preview inspection
- screenshots/evidence capture
- GitHub PR/review actions
- approved connectors/plugins

### Loop

`UNDERSTAND → INSPECT → ISOLATE → BUILD → TEST → PROVE → REVIEW → PR → COMPOUND`

### Authority
Builder DO may prepare substantial work, but merge/deploy/external commitments/destructive operations/secrets/spending remain bounded by the Assembl authority model.

### Model routing

The role declares capabilities such as:
- coding
- vision
- browser use
- tool use
- long context
- structured output

Assembl selects the model ladder based on:
- measured workflow quality
- tool success
- recent failures
- privacy ceiling
- latency
- task value/risk
- cost/budget

A model earns Builder DO traffic through evaluations. Vendor identity is not the product architecture.

## 3. DO surfaces

### Companion — do this here, now

Persistent cross-app launcher.

Mac native companion is the strongest desktop host because it can remain available across applications and Spaces. Browser extension acts as a browser-aware bridge/sensor.

Future explicit capture:
- select text
- selected browser context
- chosen screenshot/window/region via system ScreenCaptureKit picker
- reviewed clipboard material

No silent always-on screen recording.

### DO Office — show me my team

Persistent visual operating view for:
- Personal
- Work
- Clients

Each DO has:
- identity
- role/outcome
- current job
- Needs you / Working / Done state
- connected capabilities
- mailbox state
- model currently running
- usage/cost
- approvals
- evidence/receipts
- structured handoffs

Agent-to-agent communication should be structured work envelopes, not invisible free-form bot chatter:
- handoff
- update
- question
- approval request
- evidence

Every handoff can reference a task and evidence.

## 4. 3D DO Office

The 3D office is a **projection of real state**, not the database or only way to use DO.

The same Office data must have a semantic, accessible DOM/list/board representation.

### Visual concept

A premium contemporary Auckland workspace overlooking the harbour/sea:
- strong natural daylight
- plum/rose/paper Assembl material language
- restrained glass/chrome/sculptural details
- warm architectural timber/stone where appropriate
- no robot characters
- DOs represented by refined objects/light/state rather than humanoid avatars

### Spatial zones

**Reception / Needs you**  
Items waiting for a human decision appear closest to the entry.

**Work floor**  
DOs actively preparing/researching/building. Movement/light communicates real execution state.

**Builder lab**  
Repos, PRs, builds, tests and deployment readiness for Builder DO.

**Creative studio**  
Image, video, web, deck and 3D production surfaces.

**Pursuit room**  
Signals, companies, tenders, opportunities and next-best commercial work.

**Proof library**  
Receipts, screenshots, sources, completed outcomes and reusable primitives.

**Vault**  
Visualises permissioned connections/secrets state without ever rendering secret values into model context.

**Usage rail**  
Always-visible, calm visual meter for provider/model use, spend and budgets.

### Web stack

Prefer existing web primitives:
- React / Next.js
- Three.js + React Three Fiber for 3D projection
- DOM overlay for accessible controls/details
- current Assembl tokens
- progressive fallback to normal 2D Office board

Do not make core work depend on a high-end GPU or WebGL availability.

## 5. usage + cost console

Existing `model_calls` is the foundation.

Display:
- active model/provider per DO
- input/output tokens
- model calls
- latency
- fallbacks/errors
- cost NZD when actual cost is known
- clearly labelled estimated cost when calculated from token pricing
- today / week / month totals
- budget remaining for Assembl-controlled API budgets
- cost by Personal / Work / Client workspace
- cost by outcome/task

### Important distinction

Provider API usage and consumer subscription balances are different systems.

For provider/API traffic that Assembl controls, record usage directly in the ledger.

For a consumer plan such as ChatGPT/Codex subscription credits where there is no authorised balance API, show:
- connection/status
- last known/manual value if the user chooses to enter it
- a direct “open provider usage” action

Never scrape private billing dashboards or pretend the balance is live when it is not.

### Budget policy

Users should be able to set:
- per-task ceiling
- per-day ceiling
- per-workspace ceiling
- economy/balanced/maximum quality preference
- prefer local models when possible
- require approval above a cost threshold

Cost becomes a routing input rather than an after-the-fact surprise.

## 6. secrets vault vs personal finance vault

These are separate products/capabilities.

### Secrets Vault

Purpose: API keys, OAuth credentials and service connections.

DO should **never receive raw secret values as normal prompt context**.

Use:
- macOS Keychain for device-local personal credentials where appropriate
- Supabase Vault / server-side secret stores for hosted service credentials
- OAuth delegated tokens where possible
- scoped capability handles such as `can_send_email` / `can_read_calendar`, not password text

UI may show:
- provider
- connected/not connected
- scope
- expiry/health
- last used
- rotate/reconnect action

It must not reveal secret material to agents unnecessarily.

Do not build custom password-encryption cryptography when established OS/password-manager primitives exist.

### Personal Finance Vault DO

A separate user-owned encrypted data space for useful financial information such as:
- bills
- statements/exports
- receipts
- subscriptions
- budgets
- provider/plan metadata
- savings goals

The Finance DO receives explicit read/prepare permissions. Payments/transfers/account changes remain approval-gated and should use proper financial connectors rather than stored passwords.

## 7. Creative Director DO

Creative Director DO should be a persistent orchestrator over specialist creative capabilities rather than one giant prompt.

### Creative Director
- receives the business goal/brief
- reads Assembl/client brand canon
- selects visual direction
- creates creative brief/storyboard
- assigns specialist work
- critiques/refines outputs
- signs off on coherence before user review

### Brand Guardian
- checks current brand canon
- screenshot/visual regression review
- colour/type/copy drift
- macrons/accessibility
- can run `pnpm context:check` and brand guards

### Image Director
- local/API image generation routes
- art direction + reference management
- crop/aspect/export variants

### Motion Director
- Remotion/FFmpeg templates
- storyboard → scenes → render
- API/local generative-video providers only when justified

### 3D Director
- Blender/Python automation
- Three.js/R3F web assets
- optimisation/compression for web delivery

### Web Experience DO
- Next.js UI
- motion/interaction
- responsive/accessibility
- browser proof

### Deck/Proposal DO
- pitch/tender structure
- reusable presentation templates
- evidence/provenance
- editable export where required

### Asset Librarian
- source/provenance
- prompts/settings
- approved assets
- reusable client/Assembl visual language

Each specialist should hand back structured output + evidence to Creative Director DO.

## 8. cheaper build-your-own visual tooling

The objective is not to clone every feature of Figma/Canva/Runway. Build the 20% of workflows used repeatedly inside Assembl and keep paid frontier providers as optional routed capabilities.

### Visual canvas / campaign builder

Build with a canvas library such as Konva/Fabric/tldraw-style primitives:
- text/image/video layers
- drag/resize/rotate
- brand tokens
- reusable compositions
- export image/PDF
- DO-generated layout suggestions

High leverage because it can power Studio/demo/social/OG/pitch assets from one system.

### Local generative studio

Use ComfyUI as a local workflow engine where practical:
- image generation/editing
- reusable graph recipes
- local/open video models
- 3D/audio nodes where suitable

DO treats workflows as tools; users do not have to operate the node graph directly.

Keep paid provider fallbacks for jobs where local quality/time is not competitive.

### Motion studio

Extend the existing `remotion/` runtime:
- brand scene library
- automated cuts/titles/subtitles
- footage/image ingest
- audio/voice layers
- standard social/web ratios
- reproducible renders

Use FFmpeg for media transforms/transcodes.

### 3D studio

Automate Blender through Python + structured scene recipes:
- product/object assembly
- camera/light presets
- exploded views
- spatial brand scenes
- glTF export to R3F

### Brand QA tool

Build internally with:
- Playwright screenshot capture
- brand token checks
- vision-model/local-model critique
- diff/regression history
- human approval

### Presentation/pitch builder

Structured content → reusable HTML/PPTX-style layouts rather than paying for repeated manual layout work.

Focus on the specific Assembl artefacts repeatedly produced: pursuits, demo pitches, customer journeys, tenders, case/proof packs.

## 9. what not to build first

Do not start by:
- training a foundation model
- writing a password manager/cryptography stack
- making autonomous agent swarms chat continuously
- making the 3D office the only interface
- recreating every Figma/Adobe feature
- tying Builder DO to one provider subscription

The moat is **context + tools + orchestration + taste + proof + reusable work**, not a proprietary base model.

## 10. build sequence

### Phase A — portable intelligence
1. universal cross-model bootstrap
2. refresh provider/model registry
3. eval Builder DO workflows across providers
4. improve model-call cost/usage ledger

### Phase B — usable personal builder
1. persistent Builder DO identity/state
2. isolated repo work + test/proof loop
3. GitHub PR handoff
4. model switching/routing visible in UI
5. cost budget controls

### Phase C — Office
1. durable DO Office data wiring
2. Personal / Work / Clients
3. structured handoffs
4. usage rail
5. vault connection health
6. agent email/identity only when actually provisioned

### Phase D — creative operating room
1. Creative Director DO
2. brand guardian
3. local visual canvas
4. Remotion motion studio
5. Blender/R3F 3D pipeline
6. local ComfyUI routes + paid fallbacks

### Phase E — architectural 3D projection
Render the Office state as the premium Auckland harbour workspace while retaining the accessible 2D operating interface.
