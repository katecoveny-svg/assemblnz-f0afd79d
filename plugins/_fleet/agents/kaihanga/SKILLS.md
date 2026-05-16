# Kaihanga — skills + when each fires

Kaihanga has 18 skills attached at runtime in Hyperagent. The ones below are the canonical platform skills — Codex and any other execution lane should be aware of when these would fire and load the equivalent reference doc.

## NZ-canonical skills (shared across the fleet)

| Skill | Source | Fires when |
|---|---|---|
| **assembl — Te Reo Māori Macron Reference** | `cmonsp9gu05ce06ad2agksqlz` | Any output containing te reo Māori (kete names, agent names, place names). Mandatory before delivering LinkedIn / Substack / landing copy / sales email / code commits / evidence packs. |
| **assembl — NZ Legislation Citation Pack** | `Js9iDBEi` | Any agent output that cites NZ legislation. Must produce Act + Section + Year format, verified against legislation.govt.nz. |
| **assembl — Tikanga Compliance Framework** | `0AJ3SKGN` | Any output that touches Māori knowledge, iwi data, tikanga concepts, or whenua. Applies the four pou framework (Rangatiratanga, Kaitiakitanga, Manaakitanga, Whanaungatanga) plus Mead's Five Tests. |
| **assembl — Cross-agent Routing Map** | `8ArJ1sWt` | Whenever Kaihanga or Kate decides which agent handles a task. Defines the briefing chains (Tūtei → Reo for newsletters; Kawa → Reo for outbound copy; Āwhi → Kawa for unit economics). |
| **assembl — Brand Tokens & Voice Guide** | `iHReuknC` | Any UI work, marketing surface, or brand-adjacent code. Locked palette (Paper / Ink / Pounamu / Clay / Mist / Shadow / Soft Gold hairlines). Cormorant Garamond + Inter + IBM Plex Mono. Brand-glyph navigation ◇ → ✦ § ◆ ●. |
| **assembl — Evidence Pack Format Spec** | `hgeIZq9b` | Whenever an agent produces an Evidence Pack PDF. Mandatory sign-off block. SHA-256 hash chain. Watermark draft vs approved. |
| **assembl — Draft-only Posture Protocol** | `3SltZuNm` | Every agent output. The "we draft / you decide" framing. Mana stays with the human. |

## Build / infrastructure skills (Kaihanga-specific)

| Skill | Source | Fires when |
|---|---|---|
| **HyperAgent GitHub Patch & Draft PR Workflow** | `8aeQeLaM` | Any PR open via Composio. Handles `GITHUB_COMMIT_MULTIPLE_FILES` parameter quirks (`message` not `commit_message`, `upserts` not `files`), branch naming (`kaihanga/<scope>-YYYY-MM-DD`), author identity (`Kaihanga <kaihanga@assembl.local>`), draft-PR default, two-click merge guidance for Kate. |
| **assembl — Live Data & API Discovery** | `hQw0feWI` | When verifying live state — Vercel deployments, Supabase project health, edge function probes, DNS lookups via DoH. Default before claiming "X is live" or "Y is broken". |

## Brand-output skills (loaded when working on marketing site)

| Skill | Source | Fires when |
|---|---|---|
| **assembl Brand Output Doc Format** | `Sfj79qKe` | When producing brand outputs that translate into live-site updates on assembl.co.nz. Defines section structure (metadata, page copy, tokens, typography, imagery, voice), file paths, validation gates. Used by Reo primarily; Kaihanga reads when preparing the resulting PR. |
| **assembl — Branding & Design Maker** | `iw4HwsBn` | When generating brand assets, hero imagery, social cards, kete-page visuals. Includes the Evidence Vessel canonical asset URLs. |

## Pricing & positioning

| Skill | Source | Fires when |
|---|---|---|
| **assembl Pricing & Positioning Pack** | `ZvsXlVkW` / `cmonspfp004vx07adl2k1fvlx` | Any pricing question or copy update. **WARNING:** this skill currently contains stale pricing (Pilot $499 / Studio $1,999 / Enterprise $4,999+) that does NOT match the locked 5-tier ladder. Cross-check against `PRICING-LOCKED.md` in the repo root or against the locked tier ladder in BRAND-VOICE-RULES.md before quoting. Queued for rewrite in Phase 4 of the Correction Plan. |

## Memory access pattern

Kaihanga has 1,270 memories at runtime. Codex doesn't have memory; when loading Kaihanga's persona in a Codex session, the equivalent surface is:

1. This directory (`plugins/_fleet/agents/kaihanga/`) for identity + rules
2. `docs/runbooks/` for recent state docs (e.g. `2026-05-13-lovable-port-forward/`)
3. The latest "Current State" doc in Hyperagent (see project doc IDs in the repo's `AGENTS.md` once it exists)
4. The `plugins/<kete>/` directories for kete-specific canon

For "what did we decide about X" questions, the canonical answers live in:
- `plugins/README.md` — kete count, plugin canon
- `plugins/CLAUDE.md` — repo-wide guardrails
- `plugins/_fleet/HARD-RULES.md` — fleet rules
- Each agent's `HARD-RULES.md` — agent-specific constraints
- `PRICING-LOCKED.md` (repo root) — locked tier ladder + Pilot Sprint terms
- `BRAND-VOICE-RULES.md` (repo root or canonical location) — forbidden strings + voice register

## Sync pattern

When a Hyperagent skill is updated (via `UpdateSkillAndScripts`), the equivalent file here should be mirrored in a follow-up PR. The repo is the audit trail; the Hyperagent runtime is the live cache.
