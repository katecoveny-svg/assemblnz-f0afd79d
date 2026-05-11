# Voyage — Taglines

Locked picks for marketing surfaces. Anything that isn't on this page is
unsanctioned — please ask before adding new taglines to product copy.

---

## Primary tagline

> **An assembly of agents. One signature.**

This is the line. It sits on the homepage hero, the About page, the
investor deck, the email footer, and the back of any printed evidence
pack. Plays on the literal meaning of *Assembl* — many specialists
gathered into a single trusted output — without ever saying the word
"AI."

**Voice rules.**

- Always two sentences, separated by a full stop. Not a hyphen, not a
  comma, not a line break in body copy. (Line break is fine in display
  type when the cover gives it room.)
- *agents* lower-case. *signature* lower-case.
- No exclamation marks. Ever.
- No emoji surrogate (no Pearl sparkle next to it, no decorative glyph).
  The line earns its silence.
- Never paired with an "AI-powered" sub-line. The whole point is that
  it doesn't need one.

---

## Bilingual hero — the te reo move

> **Whakaminenga.** *The assembly.*
>
> Forty-six specialist agents, eight industry kete, one sealed record.

Used sparingly. Lives on the landing-page hero, the About page, and the
inside cover of premium evidence packs. The English line beneath is a
**definition**, not a translation — which is why it works structurally
rather than decoratively.

**Voice rules.**

- *Whakaminenga* always lower-case in body, capitalised at the start of
  a sentence or as a display heading. Never italicised. Never bracketed.
- Macron on the *ā* in *kete* is not required (the word is loaned and
  unmacroned in everyday NZ English usage), but the surrounding
  paragraph must still read in coherent te reo where it uses te reo at
  all.
- The English sub-line is fixed wording. Do not shorten to *"Forty-six
  agents"* or expand to *"Forty-six specialist AI agents."* The number
  earns weight; the absence of *AI* earns trust.
- Equal weight to en and mi. Same type size for *Whakaminenga* and *The
  assembly* — the Māori word leads, the English word defines.

---

## Where each one goes

| Surface                         | Primary             | Bilingual hero | Notes                                          |
| ------------------------------- | ------------------- | -------------- | ---------------------------------------------- |
| Homepage hero                   | ✓ above the fold    | ✓ below fold   | Primary leads; bilingual lands as About anchor |
| `/platform` (Operator-as-platform) | ✓ hero              | —              | The existing *Bring the practice* sub-line stays |
| `/platform/hybrid-services`     | ✓ closing CTA       | —              |                                                |
| `/about`                        | ✓                   | ✓ hero of page | This is the canonical home for the bilingual |
| `/pricing`                      | —                   | —              | Pricing speaks for itself                      |
| `/pilot-sprint`                 | ✓ footer            | —              |                                                |
| Email footer                    | ✓ small mono        | —              |                                                |
| Evidence pack inside cover      | —                   | ✓              | Premium tier only; never on Family / consumer |
| Investor / partner deck         | ✓ title slide       | ✓ closing slide|                                                |
| Social profile bios             | ✓                   | —              |                                                |
| Print materials (business cards, certificates) | ✓ | —          | Single line, mono, dead-bottom                 |

---

## What we are not using

Held back from marketing copy for now. Some are strong; the question is
whether the brand needs them, not whether they're good.

- *AI you can tender.* — strong, but loud about "AI." Save for the
  Family Court / regulator pitch where the directness earns its keep.
- *Drafts that read like work.* — true, useful as an in-body line, but
  doesn't carry a hero.
- *Some assembly required. Already done.* — t-shirt line, not a
  homepage line.
- *Bring the practice. We bring the platform.* — already deployed
  on `/platform`; keep it there as the Operator-as-platform sub-line
  and don't dilute it elsewhere.

If any of these come back, they re-enter this document with a *Where it
goes* row, not as a free-floating asset.

---

## Process for adding new taglines

1. Open a PR that adds the candidate to this file with a *Where it
   goes* row and a *Voice rules* block.
2. Run it past the brand owner before merging.
3. After merge, the linter pass in `lib/evidence/pack-spec.ts`
   `validatePack` should flag any product copy that uses an unsanctioned
   tagline. (Wiring this is a follow-up.)

The voice is the moat. Defend it.
