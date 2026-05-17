# Copy Deck — 2026-05-17

Canonical site copy for the Assembl marketing surfaces. Source of truth for
hero, page, kete, and social content until wired into the live pages.

## Layout

- `pages/` — global headlines/body for home, pilot-sprint, pricing, about, contact (evidence-pack copy still pending — see build-brief.md §"Required pages")
- `kete/` — per-kete page copy (one file per slug)
- `social/` — LinkedIn post starters and image asset prompts
- `nav.md` — global navigation spec
- `demo-script.md` — spoken demo script
- `build-brief.md` — production build brief for the site

## Brand frame

- Headline: **Mahi that earns its proof.**
- Proposition: Specialist agents. Human review. Evidence packs.
- Eyebrow: BUILT IN AOTEAROA
- Tone: warm paper, museum-quiet, Aotearoa-authentic, premium but not corporate cold.

## How to use

- Treat each file as the canonical copy. Page components should pull from
  these strings (either by hand or via a future content loader) rather than
  hard-coding alternatives.
- Do **not** put Tōro in the main nav — Tōro is whānau-tier, sold standalone.
- Macron-correct kupu Māori (ā, ē, ī, ō, ū) — `scripts/lint-macrons.ts` will
  catch regressions.
