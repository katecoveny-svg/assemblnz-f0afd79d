**This file is referenced by every Lovable change. Lovable is instructed to read it before generating, editing, or approving any user-facing copy in the Assembl codebase. CI also greps against it via `scripts/check-brand-voice.ts`. Keep it short, keep it current, edit it in one place.**

---

## The compass

1. **Anthropic skills are input scaffolding. NZ governance is the output. Customers buy the output.**

2. **Work alongside, not over.**

3. **Be specific. Cite sources. Never guess.**

Every editing decision derives from those three lines.

---

## The three gates

Every change to user-facing copy must pass all three before merge.

### Gate 1 — Voice and vocabulary

**Required:**

- NZ English (organisation, colour, licence, centre, behaviour, optimise, etc.). No US spellings in user-facing copy.

- Specific over generic. Name regulations, paragraphs, prices, dates.

- Human-in-control framing on any AI output description ("draft for review", "for your licensed broker / LBP").

- Tier copy shows full price (monthly + setup), not the monthly half.

- Pilot Sprint copy reads NZ$5,000 + GST.

**Forbidden — auto-reject if any of these strings appear in user-facing files (`src/pages/`, `src/components/`, `public/`, `index.html`):**

```
100% accurate
always right
never wrong
Replaces human judgment
no oversight required
Trained on 50+ NZ Acts
44 specialist agents
42 specialist agents
78 agents
9 kete
7 industry kete
16 industries
$199
$399
$799
$2,500
$15k
$15,000
enterprise-grade
synergy
leverage (verb)
world-class
cutting-edge
game-changing
revolutionary
unleash
supercharge
disrupt
AI-powered (without specifying workflow)
Hanga (standalone, not WAIHANGA / whakahanga / ŌHANGA)
Pakihi
Waka
Hangarau
Hauora
Te Kāhui Reo
Tikanga-led (without naming partnership)
```

### Gate 2 — Tikanga and governance (the four pou)

- **Rangatiratanga.** No claims over te ao Māori, sacred content, or iwi-specific matters without earned partnership. Te reo features paused until Te Hiku Media partnership (Kaitiakitanga Licence) is in place. Do not perform te reo we have not earned.

- **Kaitiakitanga.** NZ data residency assumed. Privacy Act 2020 including IPP 3A from 1 May 2026. AAAIP audit trail recorded.

- **Manaakitanga.** No customer traps. Money-back guarantees, split setup fees, plain-language disclaimers.

- **Whanaungatanga.** Name partners (Te Hiku Media, CBAFF, councils, iwi). Add value, do not extract.

**Mead's Five Tests** for any artifact touching Māori content: tikanga, aroha, te reo, mana, tapu. Any failure = hard block. No publish.

### Gate 3 — Truth and citation

- Every factual claim names a source with a locator (Act + section, Acceptable Solution + paragraph, AC1011 line, Working Tariff page).

- Source date or edition shown.

- Unverifiable claims removed or qualified.

- Domain disclaimer present:

  - **Customs:** "This is an AI-assisted classification for review by a licensed broker. Final responsibility rests with the broker and importer per the Customs and Excise Act 2018."

  - **Construction:** "This is an AI-assisted pre-check. Final compliance determination rests with the Building Consent Authority."

- Customer deliverables produce or reference an evidence pack conforming to `evidence-bundles/schema.ts`.

---

## Locked governance — do not edit

Lovable must NOT edit these files without explicit human approval:

- `src/data/pricing.ts` (Stripe lookup keys are sacred)
- `PRICING-LOCKED.md`
- `BRAND-VOICE-RULES.md` (this file)
- `assembl-page-manifest.json`
- `evidence-bundles/schema.ts`
- `agents/_shared/`
- Any AAAIP policy files
- Any te reo or sacred content files

---

## Locked tier ladder (canonical, NZD ex GST)

| Tier | Monthly | Setup |
| :---- | :---- | :---- |
| Family | $29 | $0 |
| Operator | $1,490 | $590 |
| Leader | $1,990 | $1,290 |
| Enterprise | $2,990 | $2,890 |
| Outcome | from $5,000 | per engagement |

**Pilot Sprint** = NZ$5,000 + GST. Two weeks. One workflow. One evidence pack. Money-back if no time saved by week two.

---

## Locked kete list

Industry kete: Manaaki (Hospitality), Waihanga (Construction), Auaha (Creative), Arataki (Automotive), Pikau (Freight & Customs), plus Hoko (Retail) and Ako (Early Childhood) per pricing.ts. Family agent: Tōro.

Retired (never appear in user-facing copy): Hanga, Pakihi, Waka, Hangarau, Hauora, Te Kāhui Reo.

---

## How to use this file

**For Lovable:** read this file before any change to user-facing copy. If a proposed edit violates any rule, do not apply it; instead flag the violation and ask for human review.

**For CI:** `scripts/check-brand-voice.ts` greps against the forbidden list above. Fails the build on any match. Add to `predeploy:agents` in `package.json`.

**For humans:** when editing, use the three gates as a self-check before committing. The full enforcement playbook lives at `docs/assembl-brand-voice-enforcement.md` (or its equivalent in the project knowledge folder).
