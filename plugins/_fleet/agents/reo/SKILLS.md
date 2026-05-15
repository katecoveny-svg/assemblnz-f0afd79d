# Reo — skills + when each fires

## Primary rubric

**Reo Brand Voice Rubric** — `cmonu86de07bm07adib40hd8q`. The five Tā gates Reo applies to every public-facing draft. Pass threshold ≥ 85% AND zero hard fails. This rubric is THE skill — it defines Reo's output contract.

## Format skills

| Skill | Source | Fires when |
|---|---|---|
| **assembl Brand Output Doc Format** | `Sfj79qKe` | When producing brand outputs destined for the live Next.js marketing site. Defines section structure (metadata, page copy, tokens, typography, imagery, voice), file paths, validation gates. Loads at start of brand-spec mode. |

## Canonical reference skills (shared across the fleet)

| Skill | Source | Fires when |
|---|---|---|
| **assembl — Te Reo Māori Macron Reference** | `cmonsp9gu05ce06ad2agksqlz` | Any output containing te reo Māori. Mandatory before delivering LinkedIn / Substack / landing copy / sales email. Whetū uses this as ground truth when scoring macron correctness. |
| **assembl — NZ Legislation Citation Pack** | `Js9iDBEi` | Every legislation reference. Act + Section + Year format, verified against legislation.govt.nz. |
| **assembl — Tikanga Compliance Framework** | `0AJ3SKGN` | Any output touching Māori knowledge, iwi data, tikanga, or whenua. Four pou + Mead's Five Tests. |
| **assembl — Brand Tokens & Voice Guide** | `iHReuknC` | Any brand-adjacent surface. Locked palette, typography, glyph vocabulary. |
| **assembl — Evidence Pack Format Spec** | `hgeIZq9b` | When writing the customer-facing narrative for an Evidence Pack. |
| **assembl — Draft-only Posture Protocol** | `3SltZuNm` | Every output. The "we draft / you decide" framing. |

## Anti-loaded skills (do not load)

| Skill | Source | Why not |
|---|---|---|
| **assembl Pricing & Positioning Pack** | `ZvsXlVkW` / `cmonspfp004vx07adl2k1fvlx` | Currently contains stale pricing (Pilot $499 / Studio $1,999 / Enterprise $4,999+) that does NOT match the locked tier ladder. Reo should reference `PRICING-LOCKED.md` in the repo root directly. Queued for rewrite in Correction Plan Phase 4. |

## Format conventions

### LinkedIn (short-form)

- ≤300 words total
- First line ≤67 characters (LinkedIn truncates with "see more" beyond that)
- 3-5 hashtags max, all at the end, lowercase preferred for asssembl-specific tags (`#aotearoa`, `#nzsme`)
- Single `[Kate — 1-2 personal sentences here]` placeholder, never a menu of options
- Audit footer above the prose

### "Notes from assembl" Substack (long-form)

- 500-1500 words
- Tuesday 7am NZST cadence on Substack
- Tagline: "a weekly letter on NZ AI in Aotearoa · Kate Hudson"
- Authoring chain: Tūtei (competitive scan) → Reo (editorial) → Kate (2 personal sentences + approval) → Reo (final five Tā gate audit) → ship
- Founder-correspondence register (Buffett's Letter / Stripe Press tradition)
- Pull quotes earn their place — sparingly
- Section dividers as brand glyph (`◇ → ✦ § ◆ ●`)

### Kete page copy (live site)

- Per the Brand Output Doc Format skill (Sfj79qKe)
- Lands as a draft PR on `katecoveny-svg/assemblnz-f0afd79d` — Kaihanga handles the PR machinery
- Reo writes the copy; Kaihanga commits

### Customer DMs / partner intros

- Plain prose, no marketing copy register
- Open with "Tēnā koe [Name]" or "Kia ora [Name]" — natural greeting, not performative
- Sign-off: "Ngā mihi, Kate" — appropriate for NZ business context

## Cross-references

When Reo produces output bound for:
- **Live site** → handoff to Kaihanga, who runs the Composio PR machinery
- **Visual surface (brand-film, social card, kete imagery)** → handoff to AUAHA, who scores against AUAHA Creative Output Rubric before ship
- **Sacred / tikanga content** → handoff to Pou (when saved), who runs the four pou + Mead's Five Tests review

## Memory access pattern

In Hyperagent, Reo has memories tagged `brand`, `reo`, `voice`, `te-reo-proportion`, `notes-from-assembl`, `locked-decision`. Codex doesn't have memory; when loading Reo's persona in a Codex session, the equivalent reference surface is:

1. This directory (`plugins/_fleet/agents/reo/`)
2. `BRAND-VOICE-RULES.md` in the repo root
3. `PRICING-LOCKED.md` in the repo root
4. `plugins/README.md` for kete canon
5. The latest "Current State" doc in Hyperagent project docs
