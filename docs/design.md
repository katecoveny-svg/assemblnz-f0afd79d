# assembl design system

> **Canonical update:** palette, typography, imagery and motion now live in [`assembl-brand-system.md`](./assembl-brand-system.md). That document overrides older colour and type directions below wherever they conflict.

This document preserves the earlier detailed system for migration reference. Hex values, font loading, and kete slugs are sourced from code (`tailwind.config.ts`, `app/layout.tsx`, `lib/kete.ts`). When current code and the canonical brand system disagree, fix the drift deliberately.

## wordmark

Always lowercase: `assembl`. Capitalised forms are wrong even at sentence start, in headlines, in legal copy, and in image captions. The wordmark never takes a trailing punctuation flourish (no `assembl.`, no `assembl™` in body copy).

## palette — Mārama Whenua (locked 2026-04-24)

The Mārama Whenua palette is warm light on cream paper. It is restrained on purpose — most surfaces are paper and ink, with pounamu and gold used sparingly and the kete accents reserved for kete-scoped contexts.

Core roles:

- **paper** — primary background. Warm cream, the default page surface.
- **ink** — primary text and high-contrast UI. Near-black, never pure `#000`.
- **pounamu** — primary brand accent. Used for emphasis, primary CTAs in brand contexts, and the Waihanga kete.
- **gold** — used only as small embedded light points and rare typographic accents. Never as long lines, route paths, threads, or wires.
- **mist** — soft surface for cards, inputs, and dividers on paper.
- **clay**, **shadow** — supporting earth tones for borders and secondary surfaces.

Reference: see `tailwind.config.ts` (`theme.extend.colors.assembl`) for hex values.

### Kete accent palette

Eight accent colours, one per kete. Each kete owns its accent inside its own scope; accents do not appear globally on the marketing site. Reference: `tailwind.config.ts` (`theme.extend.colors.kete`) and `lib/kete.ts`.

| Kete | Industry | Accent name |
| --- | --- | --- |
| Waihanga | Construction | Pounamu |
| Pīkau | Freight & Customs | Kikorangi |
| Manaaki | Hospitality | Kōkōwai |
| Auaha | Creative | Kahurangi |
| Arataki | Automotive | Karaka |
| Hoko | Retail | Waiporoporo |
| Ako | Early Childhood | Parauri |
| Tōro | Whānau | Mangū |

## typography

- **Display** — Cormorant Garamond, weight 300. Italic emphasis sparingly, never as decoration. Used for hero headlines and large editorial moments.
- **Body** — Inter, regular and medium. Default for paragraph copy, navigation, buttons.
- **Mono / labels / prompt output** — IBM Plex Mono. Used for code, evidence-pack metadata, machine output, and small labels.

Loaded via `next/font/google` in `app/layout.tsx` and exposed as the CSS variables `--font-display`, `--font-body`, `--font-mono`. Tailwind aliases: `font-display`, `font-body` (and `font-sans`), `font-mono`.

## voice — core messaging (LOCKED 2026-04-07)

> assembl runs specialist operational workflows for real NZ businesses. We reduce admin, surface risk earlier, and keep people in control. Every workflow ends in an evidence pack you can file, forward, or footnote.

This paragraph is locked. Use it verbatim on the home page, in pitch decks, in the press kit, and as the canonical "what is assembl" answer. Adaptations need owner sign-off.

## headlines + te reo

- Headlines lead with business value in plain English.
- Te reo and tikanga show up as quiet texture, never as the H1.
- Macrons must be correct: Pīkau, Manaaki, Waihanga, Auaha, Aotearoa, Tā, Mahara, Mana, Kaupapa, Tōro, Ngā, Whānau.
- Never invent Māori words or phrases. If a phrase isn't already in use by te reo Māori speakers, don't reach for one.

## tagline

Governed Intelligence for Aotearoa — specialist kete for real NZ operations

## evidence packs

"Evidence pack" is the locked public term for any workflow output. Every workflow ends in a pack you can file, forward, or footnote. Do not substitute "report", "deliverable", "summary", or "output" in marketing surfaces.

## forbidden phrases + AI clichés

Banned in all public copy:

- "harnessing the power of AI"
- "in today's fast-paced world"
- "leverage"
- "seamless"
- "revolutionise"
- "empower"
- "supercharge"
- "unleash"
- "next-generation"
- "cutting-edge"
- "robust"
- "synergy"
- "trained on 50+ Acts"
- "enterprise-grade"
- "AI-powered" — just say what it does

No em-dashes used as drama beats. No tricolons-of-three when one good clause will do. No "In a world where..." opens.

## visual language — sculptural evidence vessels

Signature motif: soft feathery silk-organza translucent forms with embedded gold light points, on cream paper, in editorial product photography. References: Aesop product photography, Joby Aviation cinematic scroll storytelling, Linear's interface clarity.

Vessels are self-supporting organic forms. Brass armatures, cages, rails, spines, and metal frames are RETIRED.

Linear gold elements (route lines, trajectories, threads, wires) are RETIRED. The only acceptable gold is embedded gold light points — small bead-like accents inside the silk.

Banned: kōwhaiwhai, sacred Māori carving patterns, decorative indigenous patterning, neon, hologram clichés, generic SaaS gradients, sci-fi dashboards, dark/forest backgrounds.

## material grammar per kete (UPDATED 2026-05-07 — soft feathery direction)

- **Waihanga (Construction)** — translucent jade pounamu silk-organza folded into a soft layered blooming form, feathery overlapping petals with luminous green and cream marbled translucence, six embedded soft gold light points.
- **Pīkau (Freight & Customs)** — translucent cobalt and ice blue silk-organza folded into a softly drifting layered form, feathery flowing petals with luminous wave-like translucence and refractive depths, eight embedded soft gold light points suggesting quiet movement.
- **Manaaki (Hospitality)** — translucent terracotta and warm rose silk-organza petals layered into a soft self-supporting blooming form, feathery overlapping silk, embedded warm amber and soft gold light points like welcoming candle glow.
- **Auaha (Creative)** — translucent deep violet and dusty plum silk-organza folded into a softly layered blooming form, feathery overlapping silk leaves with luminous folds and gathered seams, ten embedded soft gold flecks.
- **Arataki, Hoko, Ako, Tōro** — follow the same silk-organza grammar in their accent palette; bespoke renders TBD.

## locked canonical renders (2026-05-07)

- Waihanga → `public/img/hero/waihanga-vessel-cream.jpg`
- Manaaki → `public/img/kete/manaaki-vessel.png`
- Pīkau → `public/img/kete/pikau-vessel.jpg`
- Tōro → `public/img/kete/toro-vessel.png`
- Auaha, Arataki, Hoko, Ako: pending — show "vessel forthcoming" placeholder cards in the meantime.

## image generation conventions

For Midjourney v7 prompts, always include:

- Lowercase brand language.
- Cream paper backdrop.
- The negative anchor: `--no dark background, forest, gemstone, organic shell, pebble, brass, armature, cage, rails, spine, metal, frame, linear gold, gold lines, route lines, trajectories, threads, wires, hard edges, geometric`
- Generate the hero first, then lock the four kete to that hero's `--sref` so the set reads as a single shoot.

For Fal flux-pro v1.1 ultra/redux (image-to-image), the negative anchor is inlined parenthetically at the end of the positive prompt because Fal does not understand `--no`.

The standalone `vessel-studio.html` artefact (kept locally by Kate) implements all of this and provides a Founder Portrait preset for portrait imagery.

## multi-size social media export

Canonical export sizes the studios produce:

- Instagram Post 1080×1080 · Portrait 1080×1350 · Story/Reel 1080×1920
- TikTok 1080×1920
- LinkedIn Post 1200×627 · Banner 1584×396 · Square 1080×1080
- X / Twitter Post 1600×900
- YouTube Thumbnail 1280×720 · Channel Banner 2560×1440
- Facebook Post 1200×630 · Cover 820×312
- Pinterest Pin 1000×1500
- Web Hero 1920×1080 · Email Banner 600×200

## AI Blueprint for Aotearoa (May 2026) alignment

- Anchor positioning to the Blueprint's "high-use, low-trust" tension — high AI adoption, trust hasn't kept pace. Evidence packs are the operating answer.
- Waihanga maps to the Blueprint's AEC workstream (Maria Mingallon, Te Waihanga is a stakeholder).
- Auaha maps to Creative Industries (Paula Browning).
- Manaaki and Pīkau are NOT Blueprint workstreams — do not claim alignment.
- Never quote or paraphrase the Blueprint directly. Never claim assembl is "part of" the AI Forum.

## tikanga compliance — non-negotiable

- No kōwhaiwhai, sacred Māori patterns, or decorative indigenous patterning anywhere visual.
- No invented te reo phrases — never make up Māori words.
- Never claim te reo capability without proper consultation (Te Hiku Media, Taiuru framework as references).
- Macrons matter — Pīkau not Pikau, Tā not Ta, Tōro not Toro.

## component naming

Public-site components live under `components/site/`:

- `HeroAssembl`
- `ScrollEvidenceStory`
- `FounderSection`
- plus the existing `DestinationCards`, `KeteIllustration`, etc.

Motion helpers under `components/motion/` if needed.

## copyright + claim register

- Original visual designs only; never copy existing artists' work.
- Original prompts only; do not reference specific named artists in MJ prompts.
- Every public claim needs a five-column claim register row before going public: claim text, evidence, audience, owner, review date.

## changelog

- 2026-04-07: core messaging locked.
- 2026-04-24: Mārama Whenua palette locked.
- 2026-05-03: Lovable retired; on Vercel + Hyperagent + own Supabase.
- 2026-05-07: brass / cage / rails / spine RETIRED; soft feathery silk-organza language adopted; canonical renders locked for Waihanga, Manaaki, Pīkau, Tōro.
