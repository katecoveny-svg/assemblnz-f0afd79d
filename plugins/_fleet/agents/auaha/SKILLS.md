# AUAHA — skills + when each fires

## Primary rubric

**AUAHA Creative Output Rubric** — `cmopdaasx0gdp07adg5hagxtx`. The five criteria AUAHA applies to every creative output (production OR audit). Pass threshold ≥ 85% AND zero hard fails. This rubric is THE skill — it defines AUAHA's output contract.

## Brand canon skills

| Skill | Source | Fires when |
|---|---|---|
| **assembl — Brand Tokens & Voice Guide** | `iHReuknC` | Every visual production or audit. Locked palette v3, typography (Cormorant + Inter + IBM Plex Mono), glyph vocabulary, layout principles. |
| **assembl — Branding & Design Maker** | `iw4HwsBn` | When generating brand assets — moodboards, hero imagery, social cards, kete-page visuals. Includes the Evidence Vessel canonical asset URLs. |
| **assembl Brand Output Doc Format** | `Sfj79qKe` | When AUAHA's output is destined for the live Next.js marketing site (rare; usually Reo handles those). |

## Cultural safety skills

| Skill | Source | Fires when |
|---|---|---|
| **assembl — Te Reo Māori Macron Reference** | `cmonsp9gu05ce06ad2agksqlz` | Any asset containing te reo Māori (kete names in captions, alt text). |
| **assembl — Tikanga Compliance Framework** | `0AJ3SKGN` | Any visual that touches Māori knowledge, iwi imagery, taonga, kōwhaiwhai, whenua. Auto-refuse generation of sacred content; route to Pou for review of borderline cases. |

## Production tools (via Composio + edge functions)

| Tool | Provider | Use case |
|---|---|---|
| `vessel-generate` Supabase Edge Function | Fal.ai Flux 1.1 Pro ($0.04/variant) | Standard image generation, Aesop register |
| `vessel-generate` (Ultra Redux mode) | Fal.ai Flux 1.1 Pro Ultra Redux ($0.06/variant) | Image generation referencing locked Evidence Vessel canonical URLs as inputImages |
| `vessel-generate` (OpenAI mode) | gpt-image-1 ($0.19/variant high quality) | Crisp text rendering, dense compositions, multi-image edits |
| `GenerateVideo` | Veo 3.1 | 8-second video clips with native audio, brand-film scenes, hero motion |
| `ElevenLabs` (via Composio) | ElevenLabs API | NZ-accented voiceovers — RNZ Concert presenter register, mix at -6dB voice / -12dB background, no music |
| `SearchImages` | Web search via Exa | Reference / inspiration imagery, real-property photography for design consultation workflows |

## Asset library curation

AUAHA maintains the canonical asset library in the Brand Spec — Live doc § Asset Library Index. Locked URLs (do not regenerate from text alone):

| Asset | URL pattern | Use |
|---|---|---|
| Evidence Vessel reference (master) | `pub.hyperagent.com/api/published/pbf01KQZNEMM5_*` | Hero studies, brand spec illustration |
| 16:9 hero variant | `pub.hyperagent.com/api/published/pbf01KQZNN17F_*` | Homepage hero, kete page hero |
| 1:1 square variant | `pub.hyperagent.com/api/published/pbf01KQZNN69D_*` | OG cards, social, LinkedIn |
| 4:5 portrait variant | `pub.hyperagent.com/api/published/pbf01KQZNNA9Y_*` | Magazine layouts, /about |
| Brand mark / favicon source | `pub.hyperagent.com/api/published/pbf01KQZNXVE1_*` | Favicon pipeline, brand-mark img in footer |

When generating derivative work, pass these URLs as `inputImages` rather than regenerating the vessel from a text prompt.

## Sub-brand: AUAHA Creative Dashboard

AUAHA has its OWN sub-brand for internal creative tooling: Cabinet Grotesk + Satoshi (Fontshare), distinct from the main system (Cormorant + Inter + IBM Plex Mono). This sub-brand is for the AUAHA-internal creative dashboard / mood boards / pitch deck templates. It is NOT used on the public marketing site.

When briefing Codex / Cowork on AUAHA-internal surfaces, specify Cabinet Grotesk + Satoshi explicitly. For public surfaces, use the main system.

## Audit workflow (memory pattern)

In Hyperagent, AUAHA scoring data and audit history is meant to land in the eval pipeline (Whetū's surface). Currently the pipeline is not bootstrapped (audit_log = 0 rows). Until it is, AUAHA's audit footers are the canonical record — they live with each asset reference in the relevant project doc or PR description.

## Memory access pattern

In Hyperagent, AUAHA has memories tagged `brand`, `auaha`, `visual`, `evidence-vessel`, `palette`, `asset-library`. Codex doesn't have memory; when loading AUAHA's persona in a Codex session, the equivalent reference surface is:

1. This directory (`plugins/_fleet/agents/auaha/`)
2. The Brand Spec — Live doc (canonical brand canon)
3. The Brand Output Doc — Live Site PR Brief (per-route imagery direction)
4. `plugins/README.md` for kete canon and pilot customer references
5. Project file registry (filter by tag `brand` or `pr-ready`)
