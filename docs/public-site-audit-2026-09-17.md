# assembl public site audit — 17 September 2026

## decision

The public company architecture is:

1. **Pursuit — find it.**
2. **DO — DO it.**
3. **Studio — show it.**

Working company line:

> **assembl the work.**
>
> **find it. DO it. show it.**

Everything else is a capability, specialist workflow, agent, industry implementation, demonstrator or supporting trust/proof surface beneath that structure.

## what is already right

The current production homepage is already substantially aligned:

- three-product primary navigation;
- `assembl the work.` hero;
- `find it. DO it. show it.` product line;
- shared atelier / spatial world;
- deep plum, muted plum, dusty rose, chalk and paper palette;
- current Instrument Sans-led brand system;
- one shared operating layer under the three products.

This audit therefore does **not** call for replacing the current homepage concept. It calls for removing drift around it.

## problems found

### 1. old positioning remains in supporting public surfaces

FAQ, legacy product pages, old agent catalogue copy and older journey pages still teach versions of assembl centred on agentic customer journeys, rewarded waits, industry agents, Business Genome or evidence packs.

Those remain useful capabilities, but none should replace Pursuit / DO / Studio as the company description.

### 2. public copy sometimes exposes internal build language

Examples included phrases such as:

- `canvas first, radar behind the scenes`;
- `surface is not the agent`;
- implementation notes about reusing the Auckland atelier poster.

These are useful internal constraints, not customer-facing copy.

### 3. product hierarchy was inconsistent across links

Some Studio/public product navigation linked Pursuit directly to the external/private hub rather than the public Pursuit story page.

The public site should always explain the product before sending a visitor into a private workspace.

### 4. homepage CTA balance made DO feel secondary

The visible hero treated Pursuit as the default product action while the bottom note suggested starting with Pursuit or Studio and only talking to assembl about DO.

That conflicts with the three-product architecture and with DO's role as the action layer.

### 5. machine-readable architecture had drifted

The sitemap omitted `/pursuit` while prioritising old DO subroutes. `/llms.txt` described old public Meeting/Household DO surfaces and sent machines directly to the external Pursuit hub.

Search engines and AI assistants need the same product hierarchy humans see.

## current public architecture

### Pursuit

**find it.**

Purpose: turn relevant change into a bounded opportunity.

Includes:

- market and company signals;
- tenders, awards and procurement;
- buyer and relationship signals;
- client/customer friction;
- source evidence and provenance;
- opportunity qualification;
- next-action preparation;
- private Pursuit workspaces.

### DO

**DO it.**

Purpose: move bounded work forward.

Includes:

- specialist agents;
- model routing;
- browser/desktop/hosted surfaces;
- tools and connectors;
- context and task state;
- permissions and approval boundaries;
- meeting, research, drafting and workflow preparation;
- agentic customer journeys;
- productive/rewarded/sponsored waits where useful;
- action receipts and evidence.

### Studio

**show it.**

Purpose: make proposed or completed work tangible.

Includes:

- interactive demonstrators;
- websites and microsites;
- customer journey prototypes;
- campaign concepts and advertising;
- image, film, motion and 3D;
- pitches, tenders and business-development artefacts;
- simulations and before/after experiences.

## brand guardrails

Current canonical brand remains `docs/assembl-brand-system.md`:

- Deep plum `#240B21`;
- Muted plum `#654A4E`;
- Dusty rose `#916A70`;
- Chalk `#F5F1F2`;
- Paper `#FFFDFB`;
- Instrument Sans;
- IBM Plex Mono for evidence/proof metadata;
- lowercase `assembl`.

Visual grammar:

> things gather, organise and move with purpose until a useful whole is visible.

Do not revive older brass/gold/pounamu/canary/grape-purple or Cormorant-led directions as company precedent.

## work completed in this audit branch

- kept the existing spatial homepage concept;
- rebalanced hero language so Pursuit, DO and Studio are peer entry points;
- replaced internal/prototype language in public product copy;
- changed public Pursuit links to explain the product before opening a private hub;
- removed the public implementation note about the atelier poster;
- added `/pursuit` to the product sitemap and removed old public DO subroutes from product priority;
- rewrote AI-readable `/llms.txt` architecture around Pursuit / DO / Studio;
- rewrote FAQ around the current company architecture;
- preserved explicit truth/approval boundaries without turning the homepage into an internal disclaimer.

## next public-estate pass

After this branch is visually approved, audit these routes in order:

1. `/about`
2. `/pricing`
3. `/how-it-works`
4. `/agents` and per-agent pages
5. `/genome`
6. `/journeys` / assembling family
7. `/concept-studio`, `/pattern-studio`, `/ad-studio`, `/motion-studio`
8. Trust, data and legal cross-links
9. OpenGraph/social imagery and structured data
10. redirects/noindex strategy for legacy public routes

Do not delete working legacy routes solely for brand tidiness. De-emphasise, redirect or noindex only after checking inbound links, product dependencies and current user access.
