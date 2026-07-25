# assembl — context and state of play

_Written 25 July 2026. The single place to catch up on what exists, what's
decided, and what will bite you. Design and voice rules live in
[BRAND-AND-DESIGN.md](./BRAND-AND-DESIGN.md)._

---

## What assembl is

A New Zealand studio building **agentic customer journeys**. The shape is the
same everywhere: a moment a customer already spends waiting, work prepared
inside it, and a named person who approves before anything happens.

Founder: **Kate Hudson**. Entity: **assembl NZ Limited, NZBN 9429053514950**.
Contact: **assembl@assembl.co.nz**.

The proposition in one line: AI drafts the work, a person approves it, and every
output carries a record of how it was made.

---

## The surfaces

### www.assembl.co.nz (Vercel, this repo)

| Route | What it is |
|---|---|
| `/` | Cinematic homepage. Hero, then the **Blueprint invitation** — the first thing a visitor does. |
| `/build-an-agent` | The full **assembl Blueprint** tool: read a website → agent in their colours → ask it → keep and share → PDF. |
| `/blueprint/[slug]` | A kept Blueprint, in the business's own colours. `noindex`. |
| `/concepts` | Five industries, one architecture. Client names redacted. Answers "does this only work for groceries?" |
| `/agents`, `/pricing`, `/about`, `/pilots`, `/field-notes` | Cinematic marketing pages. |
| `/legal/{privacy,terms,disclaimer}`, `/trust` | NZ legals — Privacy Act 2020 incl. IPP 3A, entity + NZBN. |
| `/creative-playground` | Generative art studio, browser-only. |

Sign-in is **not** on www — `/login` hard-302s home by design. Supabase auth
lives on **demo.assembl.co.nz/admin/login**.

### The concept demos (Cloudflare Pages, in `research/`)

All ungated, `noindex`, with live agents. Deploy with `wrangler pages deploy .`

| Demo | Project | Note |
|---|---|---|
| Woolworths / Everyday Rewards | `assembling-concept` | signed `?for=oliver-lynch` |
| Air New Zealand | `assembling-airnz` | `?for=jeremy-obrien`; dark phone app |
| Contact Energy | `assembling-contact` | `?for=carolyn-luey` / `?for=mike-fuge` |
| Summerset | `assembling-summerset` | verified facts, purple |
| Ryman Healthcare | `assembling-ryman` | verified facts, orange |

⚠️ **The three original projects' production branch is the project's own name**,
not `main` — deploy with `--branch assembling-concept` or the apex 404s.
Summerset and Ryman use `--branch main`.

---

## The assembl Blueprint (the flagship tool)

Paste a website → in about ten seconds you get an agent that knows that
business, wearing its colours.

1. **`POST /api/agent-brief`** fetches ONE public page plus that site's own
   stylesheets. **Claude Opus 5** extracts: what they do, what they sell, their
   voice, the five questions their customers most want answered (with each
   marked answerable or not), the checkable facts, and — the field that does the
   work — **`blindSpots`: what their website doesn't answer**.
2. **Brand colours are counted, not guessed** (`lib/build-an-agent/brand-colours.ts`).
   Frequency × saturation across their stylesheets. A model asked to guess a
   brand hex invents plausible-but-wrong ones.
3. The **3D agent** takes their primary as its glowing core and their secondary
   as its rings, with assembl's chrome kept throughout.
4. The **live agent** answers as that business, grounded only in its published
   facts, and refuses to invent a price.
5. **`POST /api/blueprint`** keeps it — only when the visitor asks. The email is
   the consent moment for storage. 90-day retention, enforced on read.
6. A four-page **PDF** and an **OG card** in their brand colour.

### The honesty rules this tool lives by

- **A count, never a score.** "Answers 4 of the 5 questions its customers ask" is
  derived and checkable. A score out of 100 implies a rubric and a benchmark
  population that does not exist.
- The question list is chosen **from the customer's point of view before**
  answerability is judged. Otherwise the model picks easy questions and reports a
  flattering, hollow number — this happened, and was caught in production.
- **Nothing is stored** unless the visitor keeps it. The page says so.
- Never invent a fact, price, service or colour.

---

## Infrastructure

| Thing | Where | Watch out |
|---|---|---|
| Repo | `~/assembl-web` | ⚠️ **`~/Desktop/assembl-web/.git` is iCloud-wedged** — reads hang. Never run git there. |
| Site | Vercel, auto-deploys `main` | Verify against the deployed bundle, not the build log. |
| Database | Supabase `wurwcrgxjjwqdaxqceey` (assembl-prod, ap-southeast-2) | ⚠️ It **auto-paused** once. A paused DB makes kept Blueprints unreachable. |
| Demos | Cloudflare Pages | Production branch quirk above. |
| Models | `MODEL_TIER_TO_ANTHROPIC` in `lib/marketplace/agents.ts` | premium = **claude-opus-5** (global — also the ~30 premium marketplace agents). |

Tables added here are **deny-all RLS, service-role only** via
`lib/supabase/service.ts` — house convention.

---

## Decisions locked

- **Name**: the tool is **assembl Blueprint**; the artefact is a Business
  Blueprint. Confirmed by Kate.
- **Opus 5** stays on the whole premium tier, not scoped to the Blueprint.
- **Sharing requires an email** — that's the consent step for storage.
- **Typography**: all prototypes use the assembl brand font.
- **Hero copy is Kate's** — "See what your AI is made of." Not to be replaced.
  The Blueprint sits beneath it.

---

## Traps that have already cost time

1. **Verify the deployed bundle, not the build.** Several fixes looked shipped
   and weren't. Grep a distinctive new string out of the served JS/CSS.
2. **The Preview pane's compositor goes stale** on WebGL pages. Use headless
   `chrome-headless-shell` with `--enable-unsafe-swiftshader --use-angle=swiftshader
   --timeout=12000` for a true frame.
3. **`next/og` runs in satori** — no `text-transform`, and pulling a
   `server-only` Supabase client in throws. Read over REST and fall back rather
   than throw.
4. **Flat metal faces read as black holes** in a dark studio env. Volumes take
   matte ceramic; metal is for accents.
5. **A migration reporting `success: true` does not mean the table exists.**
   Verify with a query.
6. **Assert your edits.** Every scripted edit prints a per-label "ok" or fails —
   silent no-ops have wasted whole rounds.

---

## Open, awaiting Kate

- Word-check on copy that is live but unread: the six homepage section
  paragraphs, `/concepts`, the Ryman and Summerset concept framing.
- The social kit (bios + launch post) is drafted on her Desktop. Nothing posted.
- Whether the Supabase auto-pause needs a plan change.

## Next on the build

From the viral research, in order: show the work during the ten seconds → the
agent portrait as a downloadable image → the refusal demo → re-run and diff.
Explicitly **not** building: a score out of 100, percentiles, a public gallery of
blueprints, or a "verified by assembl" badge.
