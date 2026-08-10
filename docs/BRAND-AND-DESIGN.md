# assembl — brand and design

> **Canonical update:** use [`assembl-brand-system.md`](./assembl-brand-system.md) for the current palette, typography, imagery and motion system. It overrides older colour and type directions below wherever they conflict.

_Written 25 July 2026. Covers the cinematic system now live across
www.assembl.co.nz and the concept demos. For product state see
[CONTEXT.md](./CONTEXT.md); `docs/DESIGN-SYSTEM-VNEXT.md` remains the older
calm-OS canon for app surfaces._

---

## The idea

assembl is a **visually built agentic operating system**. The visual system is
not decoration on top of the product — it is how the product explains itself.
Every object on screen means something specific.

Feels like: premium · editorial · calm · tactile · spatial · trustworthy.
Never: cartoonish · neon · cyberpunk · gaming-led · dashboard-heavy · generic SaaS.

The brand is always written **assembl** — lowercase, never Assemble, ASSEMBL or
assembly. "assemble" as a verb is fine.

---

## Colour

### assembl's own palette

| Token | Hex | Use |
|---|---|---|
| paper | `#FDFBF7` / `#FBFAF6` | the ground. The default environment is white and editorial. |
| ink | `#1A1918` | body text |
| ink-2 / ink-3 | `rgba(26,25,24,.72)` / `.5` | secondary, meta |
| **champagne / brass** | **`#B8964F`** | assembl's mark |
| brass bright | `#D4A843` | emissive, highlights |
| navy | `#080D1A` / `#0C1836` | the identity core, boundary panels |
| chrome | `#D6DADF` | metal |

**`#BFA37A`/`#B8964F` champagne is assembl's own and is never swapped for a
client's colour.** It stays as the maker's mark even on a page dressed in
someone else's brand.

Avoid: canary yellow, large dark backgrounds as the default, rainbow or
iridescent chrome.

### A client's palette

Read, never invented — `lib/build-an-agent/brand-colours.ts` counts colour
literals across their page and their own stylesheets and scores by
frequency × saturation, with only a gentle lightness term (plenty of real brands
are deep — Summerset's is `#470A68`).

Two rules learned the hard way:

- **Dark brands must not lose.** An early scorer handed Summerset's CTA red the
  crown over the purple they use 245 times.
- **A second colour is only reported when it's used enough to be real** (≥5% of
  the primary, min 4). Ryman's green appears twice and a pale blue they don't use
  appears three times — so we report *no* secondary and the rings stay assembl's
  chrome. Showing someone the wrong colour under the label "your colours" is
  worse than showing none.

Verified client palettes: **Ryman** `#F06022` orange (+ `#8CC647` / `#668B69`
greens, cream `#FDF5EB`). **Summerset** `#470A68` purple, `#E4002B` red.
**Contact Energy** `#E62A32` red. Never guess these — see the reference memories.

---

## Typography

- **Lato** — the brand font. Body *and* display across the site and every
  prototype. Light weights (300) at large sizes.
- **Cormorant Garamond** — the `assembl` wordmark only.
- **IBM Plex Mono / Space Mono** — micro-labels, kickers, meta. Uppercase,
  wide letter-spacing (`.14em`–`.2em`), very small (0.46–0.55rem).

Headlines are large and light, not bold. Sentence case, not title case.

---

## The 3D system

### Lighting — the recipe that works

Chrome gets its life from **emissive softbox panels baked into the environment
map**, on a near-black env scene. Directional lights alone bake to almost
nothing and every material reads flat or black.

```
env.background = #0A0A0D
softbox('#FFFFFF', 14, 5,   0,  9,  0)   // overhead — the main gloss streak
softbox('#FFF6E8',  8, 12, -10, 2,  4)   // warm key, left
softbox('#E9EEF4',  8, 10,  10, 1, -3)   // cool fill, right
softbox('#FFFFFF',  3, 14,   5, 2,  8)   // narrow strip — sharp highlight
softbox('#D9DEE6', 16,  3,   0, -7, 0)   // floor bounce
scene.environment = pmrem.fromScene(env, 0.02).texture
```

### Materials

| Material | Params | For |
|---|---|---|
| brass | `#B8964F`, metalness 1, roughness .12, env 1.6, clearcoat .6 | accents, rings |
| brass bright | `#D4A843`, roughness .07, env 2.0 | the glowing heart |
| chrome | `#D6DADF`, roughness .02, env 2.4, clearcoat 1 | metal |
| navy | `#0C1836`, metalness .85, roughness .06 | the identity core |
| **matte ceramic** | `#F1EFEA`, **metalness 0**, roughness .38 | **volume** |

**Big flat faces must not be mirror metal.** A large flat metal plane reflects
the dark studio and reads as a black hole — this made the `/concepts` trolley and
the whole builder vitrine look broken. Volumes take matte ceramic; metal is for
edges, rings and small forms.

### What the objects mean

Nothing is abstract art. Central chrome form = agent identity · translucent cube
= knowledge · stacked glass = memory · capsule = an ability · luminous line = a
connector · outer shell = boundaries · ring = evaluation status · small attached
cube = an approval step · orbiting tile = a connected app.

On `/concepts` the industry forms follow the same logic — a trolley basket, a
delta wing, a meter dial, a village roof, a stack of drafts — always in
assembl's palette, never the client's, because the point is that the skeleton
doesn't change.

### Motion

Motion explains: assembling, connecting, testing, requesting approval. Slow
enough to read, physically plausible, interruptible. Scroll drives keyframed
position/scale/rotation with smoothstep easing. No continuous distracting
movement. Respect `prefers-reduced-motion`.

On mobile the assembly stays **full strength** — dimming it washed it out. Type
carries a paper halo instead:

```css
text-shadow: 0 1px 10px rgba(253,251,247,.98), 0 0 22px rgba(253,251,247,.95);
```

---

## Voice

Say plainly what the work is and what it saves. Lead with the person, not the
product. Short sentences, one idea each. NZ English. Macrons always correct
(mahi, Tāmaki Makaurau, Aotearoa, whānau).

**Banned**: "quietly", "quiet intelligence", "seamless", "effortless", "unlock",
"empower", "elevate", "supercharge", "revolutionise", "game-changing",
"cutting-edge", "harness the power", "take your business to the next level", "in
today's fast-paced world", "the work that matters" as a standalone line. No
rule-of-three cadence used as decoration.

**Fixed**: "Mahi that earns its proof." · "See what your AI is made of."

**Te reo** is woven lightly and functionally, never as decoration. assembl never
generates karakia, mihimihi, pepeha or waiata.

The test for any sentence: *could a reader picture the actual work and the time
it saves?* If it could sit on any SaaS site, rewrite it.

### Never claim

Simulated integrations are labelled as demonstrations. No invented prices,
statistics or customer names. Concept demos always carry "independent concept,
not affiliated with X" and the boundary line: *no production access is requested
by this concept*. Drafts-only is a product principle, not just copy.

---

## The concept-demo pattern

Signed URL (`?for=<slug>`) → hero naming the buyer → their real app mirrored in a
phone → the wait, assembled → an ops-console mirror → **the boundary** → **the
pilot ask** (scope · access · scorecard, "fail any line and we change the design
or stop") → **three reply-verbs instead of "book a demo"** → the unfinished pane
that emails Kate the buyer's one constraint → tikanga governance line.

Client palette for the client's own surfaces; assembl champagne for assembl's
mark; never the reverse.
