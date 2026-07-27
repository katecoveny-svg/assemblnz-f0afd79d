# assembling-template — cinematic v2 outreach microsites (2026-07-24)

The reusable pattern behind the five live concept demos. Two page types, one
unified live-agent backend, one deploy command. Copy this folder per client —
don't rebuild.

## The two page patterns

**`concept-page.html`** — the exec pitch page (Woolworths/Air NZ/Contact shape).
Signed note → cinematic hero → brand-coloured 3D assembly → real-app phone
mockup with rewarded wait overlay → "change one thing" scenario chips →
scripted agent harness → metrics → THE BOUNDARY (verbatim) → three reply-verbs
→ unfinished pane → tikanga line → live "ask assembling" widget.

**`minute-one.html`** — the family-guide page (Summerset/Ryman shape).
Calm serif editorial, phone journey, calculators, live "Ask the guide" agent
with grounded scripted fallback, brand-coloured ambient 3D behind content.

## Per-client swaps (concept-page.html)

1. `:root` palette — client primary + dark variant (verify the REAL brand hex
   from the client's app/site; Contact = #E62A32 red, not blue). Keep
   `--champ:#BFA37A` — assembl's mark, never swapped.
2. `.signed-note` + `EXECS` object (bottom `<script>`) — verified name/title
   only; `?for=<slug>` and `#for=<slug>` personalise the signed note.
3. Phone mockup — mirror the client's actual app (dark app → dark
   `.phone-screen`, see the Air NZ dark-phone override block).
4. Wait-overlay steps, scenario chips + `scenarioData`, agent-harness scripts.
5. The 3D scene block — swap material hexes to brand tones (main/bright/deep).
6. Unfinished-pane placeholder + mailto subjects.
7. NEVER touch: the boundary paragraph, the three reply-verbs, the tikanga
   line, "buyer-names-it", the live-widget copy.

## Per-client swaps (minute-one.html)

Palette vars, brand name, the GENOME const (the guide's system prompt — facts
verified only), grounded-agent replies, fee/model maths, 3D material hexes.

## Live agent

`functions/api/agent.js` serves BOTH page contracts (see header comments).
Fill the `KB` per client. Workers AI free tier by default; upgrade any project:
`wrangler pages secret put ANTHROPIC_API_KEY --project-name assembling-<slug>`

## Deploy

```
wrangler pages project create assembling-<client-slug> --production-branch=main
mv concept-page.html index.html   # or minute-one.html
wrangler pages deploy . --project-name assembling-<client-slug> --branch main --commit-dirty=true
```

⚠️ The three ORIGINAL projects' production branch equals the project name
(deploy with `--branch assembling-concept` etc.), not main.

## Live examples (all ungated, noindex)

- https://assembling-concept.pages.dev (Woolworths · ?for=oliver-lynch)
- https://assembling-airnz.pages.dev (?for=jeremy-obrien)
- https://assembling-contact.pages.dev (?for=carolyn-luey · ?for=mike-fuge)
- https://assembling-summerset.pages.dev · https://assembling-ryman.pages.dev

## v1plus update (late 2026-07-24) — the current bar for exec concepts

Kate's quality bar is the RICH v1 pattern (see `assembling-woolworths-v1plus/`
and `assembling-airnz-v1plus/`): full real-app phone recreation with a
click-through 7-slide deck (arrows · dots · play), real in-app kaimahi agent
with name-your-agent, on-page concept agent bar, provenance tooltips, ops
console mirror — PLUS the dramatic keyframed brand-coloured 3D assembly and
the pilot-ask section (06 · the pilot ask / 07 · the reply). Prefer copying a
v1plus dir for a new exec concept; `concept-page.html` here is the lighter
cinematic variant. No scripted "fake" agent chat panels — agents are live or
they're not on the page. ⚠️ v1 pages style BOTH html and body backgrounds:
keep `body{background:transparent!important}` or the 3D canvas is invisible.
