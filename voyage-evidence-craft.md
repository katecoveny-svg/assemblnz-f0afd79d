# Voyage — Evidence Pack Craft

The standard. What "world-class, impeccable, feels valuable" actually means
for an Assembl evidence pack, and how to wire it.

This is the document a reviewer holds up against any new pack — homepage
mock, PDF render, in-product drawer — and says *yes* or *no, do it again*.

---

## 1. The thesis

An evidence pack is not a report. It is an **object** — and the object is
the product. Pre-AI, professional services charged for the cover sheet on
the front of a stack of work; post-AI, the cover sheet *is* the work,
because everything underneath is automated. So it has to feel like
something you'd file. Print. Frame. Tender.

The benchmarks aren't other AI tools. They are:

- A signed limited-edition print certificate.
- A boutique passport stamp.
- The certificate of analysis a luxury wine importer ships with a case.
- The hand-feel of a *Monocle* magazine — paper weight, kerning, restraint.
- A Companies Office certificate of incorporation — bureaucratic, definite,
  authoritative, impossible to fake at a glance.

If the pack does not survive being printed at A4 on 120gsm matte cream
stock and handed across a desk, it is not done.

---

## 2. The seven invariants

Every pack — quarterly Legal Posture, monthly Co-Parenting Posture, weekly
SSSP roll-up, single Customs entry, single FCP verification — obeys all
seven. No exceptions.

### 2.1 The cover does one thing

A single composed page with:

- Wordmark (lower-case `assembl`, Cormorant 600, never tracked, never
  italicised).
- **One** mātāpono line — the kete's Māori name, full English, sub-line.
  e.g. *Pīkau · Freight & Customs · evidence pack*.
- A bilingual title line. *Mahi Tūturu · Genuine Work*. *Pou Whakaaro ·
  Reasoning record*. *Whakatakotoranga · Posture pack*. Both languages
  carry equal weight; te reo is never italicised, never bracketed.
- The subject — *14 King St, Auckland — Variation pack* — set in mono,
  small caps, never larger than the wordmark.
- A single dateline — *Issued 11 May 2026 · 14:32 NZST*. Time in NZST
  always.
- One **seal**. The Soft Gold (#D9BC7A) sparkle as a 12mm device,
  bottom-right. Not centred. Not bordered. The seal sits in the white
  space and the white space carries it.
- Nothing else. No tagline. No QR code on the cover. No "powered by". The
  cover earns its silence.

### 2.2 The voice is unbroken

Every paragraph reads as if written by the same person — calm, restrained,
specific. Three rules:

- **No metaphor.** "Wired through Mana Trust Layer" is product copy, not
  evidence-pack copy. *"Reviewed against the Building Act 2004 s 14B"* is
  evidence-pack copy.
- **No hedge words.** No *might*, *seems to*, *appears*. The pack either
  records something or it does not.
- **No generic AI tells.** No *as an AI*, no *I hope this helps*, no
  *Let's explore*, no *In summary*. If the line reads like a chatbot, kill
  it.

The voice is enforced by a `voice-rewrite` pass in the Mana layer before
the pack is sealed. Below.

### 2.3 Every claim cites

A claim without a citation is a defect. Citations are first-class objects:
short reference (e.g. *Building Act 2004 s 14B(1)(a)*), human-readable
context, and a verifiable URL where the source lives (legislation.govt.nz,
the client's own document store, an IRD assessment id).

Citations render as **footnote marks** in body copy and a citation block on
the closing page. The mark is a thin numeral, never a hyperlink colour.
Hyperlinking is in the digital PDF only; print packs use endnotes.

### 2.4 The hash chain is on the page

Every pack carries a **proof line** in the footer of every spread:

> *Hash · 7f3a9c…d4e2 · prev 1b80c1…0a17 · sealed 2026-05-11 14:32:08 NZST*

This is not decoration. It is the substrate that makes the pack
court-admissible (Evidence Act 2006 s 137) and tenderable in front of a
regulator. The hash is computed from the pack's canonical JSON form
(below) and chained from the tenant's previous pack. A verifier route
(`/evidence/verify/:hash`) reconstructs the chain and confirms the seal.

This is the single most important craft move on the pack. Do not skip it.

### 2.5 The Draft watermark is sacred

While the pack is in Draft Mode — i.e. the agent has produced it but a
named human has not approved every section — the watermark **DRAFT** in
22% opacity Cormorant 700 sits across the page at -22°. It is visible on
every spread including the cover. It cannot be turned off via CSS, query
parameter, or tenant setting. The only way it disappears is the human
approval action that flips the pack to `status = 'sealed'`.

This invariant is also what protects against deepfake. A circulating PDF
without the seal-side hash and without the absent watermark is not an
Assembl pack — it's a working draft someone shouldn't have.

### 2.6 Te reo is structural, not decorative

The bilingual labels are real. Every section header carries the Māori
term, full English, and the original Te Ao Māori meaning where it adds
clarity. *Tūāpapa · Foundation · the underlying basis*.

This is not a marketing affectation. It is a coherent posture from the
Mana Trust Layer outward: data sovereignty, kaitiakitanga, tikanga. If
your kete brief is a Waihanga consent pack but your evidence pack header
says *Section 2 — Background*, you've broken the chain of integrity. It
should read *Tūāpapa · Foundation*.

### 2.7 The pack signs off

The closing page carries three things and only three things:

1. The **named reviewer** — full name, role, email. The actual human who
   approved this pack. Not "the Assembl team". A person.
2. The **agent loadout** — which Assembl agents drafted which sections.
   Listed plainly. *Arai drafted §3, Ata drafted §4, Iho routed and Mana
   sealed.*
3. The **hash-chain proof block** — this pack's hash, the previous pack's
   hash for this tenant, the verifier URL, and a one-line note explaining
   what the verifier checks.

No CTA. No marketing line. No "Built with assembl." The wordmark on the
cover is the brand statement; the closing page is the audit statement.

---

## 3. The materials list

Everything is a token. Nothing is hard-coded.

### 3.1 Palette

| Token                      | Hex      | Role                                       |
| -------------------------- | -------- | ------------------------------------------ |
| `--paper`                  | `#FAF7F2`| Page ground                                |
| `--paper-elevated`         | `#FFFEFB`| Card / pull-quote ground                   |
| `--ink`                    | `#23211F`| Body type. Never pure black.               |
| `--ink-secondary`          | `#5C5852`| Captions, citations, metadata              |
| `--ink-tertiary`           | `#8E8A82`| Footers, mono hash lines                   |
| `--pounamu`                | `#2B6B57`| Seal, accent rules, sealed-stamp           |
| `--soft-gold`              | `#D9BC7A`| The sparkle device. Only on the cover.     |
| `--draft-red`              | `#A33B2C`| Draft watermark + corrective-action rules  |
| `--kete-accent` *(token)*  | varies   | Per-kete spine colour, no other use        |

Pure black is forbidden. Pure white is forbidden in body areas. The eye
needs warmth.

### 3.2 Typography

| Use         | Family    | Weight    | Tracking    |
| ----------- | --------- | --------- | ----------- |
| Wordmark    | Cormorant | 600       | 0 (never tracked) |
| Display     | Cormorant | 300, 400  | -0.01em     |
| Body        | Inter     | 400       | 0           |
| Mono        | IBM Plex Mono | 500   | 0.22em on uppercase labels |
| Drop-cap    | Cormorant | 300       | 0           |

No system fonts. No fallbacks rendered in production — fonts are
self-hosted with `font-display: block` to ensure first-paint matches
final-paint. If the user is offline, we show the placeholder grid, not
Arial.

### 3.3 Grid

A4 (210 × 297mm) is the canonical page; the same pack renders to web at
720 × 1024 with the proportions preserved.

- 16pt base body. Leading 24pt.
- 9-column grid, 18pt gutters, 36pt outer margin.
- Headers hang into the outer margin (left, except the closing page).
- Pull-quotes occupy 5 columns, indented one column.
- Footer fixed at 24pt from bottom — wordmark left, hash centre, page
  count right.

### 3.4 Paper

The digital PDF embeds a subtle Pearl noise overlay (2% opacity, 64px
tile) so the cream paper reads as cream paper, not as a flat fill. The
overlay is not present on the cover above the wordmark — the cover stays
clean.

When printed, the recommendation is **120gsm matte cream stock**. We say
this once in the developer docs and not on the pack itself.

---

## 4. The canonical JSON form

Every pack has a deterministic JSON serialisation. This is what gets
hashed, what gets stored, and what the verifier route reconstructs. It is
the source of truth; the PDF and the in-product drawer are renders of it.

Types live in `lib/evidence/pack-spec.ts` and are enforced at write time.

The shape, in brief:

```ts
EvidencePack {
  id: uuid                                  // also the verifier handle
  tenantId: uuid
  kete: KeteSlug                            // 'waihanga' | 'pikau' | …
  type: 'posture' | 'workflow' | 'single'   // monthly roll-up | sprint | one-shot
  title: { en: string; mi: string }
  subject: { kind: string; ref: string; label: string }
  issuedAt: ISO8601                         // always NZST
  status: 'draft' | 'sealed'
  reviewer: { name: string; role: string; email: string } | null
  agentLoadout: AgentSection[]              // which agent drafted which §
  sections: Section[]                       // ordered, every section cited
  citations: Citation[]                     // collected, numbered
  hashChain: {
    prevHash: string                        // tenant's previous pack hash
    thisHash: string                        // sha256 over canonical JSON
    sealedAt: ISO8601 | null                // null while draft
    verifierUrl: string                     // /evidence/verify/:thisHash
  }
}
```

Section shape:

```ts
Section {
  id: string                                // stable slug, e.g. 'tuapapa'
  title: { en: string; mi: string }
  body: Block[]                             // typed body, not free HTML
  citations: number[]                       // refs into pack.citations
  draftedBy: AgentRef                       // 'arai', 'ata', 'iho-router' …
}

Block =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'pullQuote'; text: string; attributedTo?: string }
  | { kind: 'callout'; tone: 'pounamu' | 'draft' | 'sealed'; text: string }
  | { kind: 'table'; columns: string[]; rows: string[][] }
  | { kind: 'codeBlock'; lang: string; text: string }       // rare
  | { kind: 'signature'; signedBy: string; signedAt: ISO8601 }
```

Body is typed because free HTML is the enemy of voice. Every block kind
has a deterministic rendering — and a deterministic JSON canonical form,
which is what gets hashed.

---

## 5. The pack template library

A pack has a *kind*. The kind picks the section list. The section list is
canonical so two packs of the same kind from different tenants are
recognisable at a glance.

### 5.1 Posture pack — monthly / quarterly roll-up

Sections, in order:

1. **Tūāpapa** · Foundation — what is this pack, what period, who for.
2. **Mahi i mahia** · Work completed — what the operator + agents did this
   period.
3. **Rēhita** · Ledger — the data appendix (expenses, contracts reviewed,
   sessions held, BCAs lodged).
4. **Whakatūpato** · Flags — escalations triggered, risks accepted.
5. **Anga whakamua** · Forward posture — next period's plan and any
   decisions deferred.
6. **Whakapono** · Attestation — the reviewer's named sign-off.
7. **Pou taunaki** · Citations — every citation, numbered.

### 5.2 Workflow pack — single sprint or single output

1. **Tūāpapa** · Foundation.
2. **Te āhua o te mahi** · The work itself — the actual deliverable.
3. **Whakaaro** · Reasoning — agent thinking trace, condensed. Cited.
4. **Whakatūpato** · Flags.
5. **Whakapono** · Attestation.
6. **Pou taunaki** · Citations.

### 5.3 Verifier proof — a one-pager

For when the only purpose of the pack is to prove integrity (after a
dispute, a Family Court request, an audit demand).

1. **Tāhuhu** · Spine — what was sealed, when, by whom.
2. **Mōkihi** · Chain — prev hash, this hash, verifier URL.
3. **Pou taunaki** · Citations — the original pack the proof refers to.

---

## 6. The voice-rewrite pass

Before sealing, the pack runs through a **voice-rewrite** pass that
enforces:

- Removes hedge words (*might*, *appears*, *could potentially*).
- Removes AI tells (*as an AI*, *I hope this helps*, *Let me*, *In
  summary*).
- Replaces generic verbs with specific ones (*reviewed* → *audited
  against*, *helped* → *drafted*, *looked at* → *cross-checked*).
- Verifies every paragraph cites at least one source, unless the section
  is *Whakatūpato* (flags can be operator-observation).
- Verifies every section header has both en and mi.
- Verifies the wordmark is `assembl` lower-case, never *Assembl* or
  *ASSEMBL* in body.

Implementation note: this is a deterministic linter pass first
(regex-driven), then a Claude pass for the rewrites the linter cannot
mechanically resolve. Both write into the trace ledger so we can see how
many edits the AI made post-draft.

---

## 7. The verifier route

`/evidence/verify/:hash` is a public route. No auth. It takes a pack hash
and returns:

- Pack title + subject + issued date.
- Reviewer name.
- Hash + prev hash + chain length.
- A green/red badge: *sealed* if the recomputed hash matches; *tampered*
  if it does not.
- A line: *Recomputed against canonical JSON form 2026-05-11 14:32:08
  NZST*.

The route deliberately does **not** show the pack content. It exists to
let an external party (the BCA, a court clerk, a counter-party's lawyer)
verify that the PDF in their hand is the genuine sealed artefact. The
content lives behind tenant auth.

This is the single move that converts an Assembl PDF from "an AI-written
document" into "an attested record." Ship this and the category opens.

---

## 8. The four scenes the pack must survive

These are the QA stories. If the pack fails any of them, it isn't done.

1. **The boardroom.** A construction company CFO opens the monthly
   Waihanga posture pack on a 4K display in a board meeting. The cover
   reads from across the room. The pull-quotes don't crowd. The hash line
   is small but legible. The CFO scrolls and the board nods.
2. **The Family Court.** A separated parent's lawyer prints the
   Co-Parenting Posture pack on her office laser, three-hole-punches it,
   and tenders it in chambers. The judge reads the cover and immediately
   understands what it is. The hash-chain proof line satisfies the
   integrity question without comment.
3. **The phone.** A solo tradie opens a Waihanga consent pack on a
   Samsung A14 in a ute, in sunlight, after the BCA has emailed him. The
   typography survives the squeeze. He can read every citation without
   pinching.
4. **The print shop.** Someone orders the pack printed at Fastway on
   matte cream stock. It comes back and feels like something Te Wānanga o
   Aotearoa would issue. The seal is in the right place. The watermark is
   absent because the pack is sealed.

These four scenes are the acceptance bar. They go in CI as visual
regression tests against fixture packs.

---

## 9. Anti-patterns — kill these on sight

- Stock photography. No. Pearl noise overlay is the only texture.
- Lucide icons in body copy. Reserved for product chrome, not packs.
- Emoji. Including the Pearl sparkle as an emoji glyph. The sparkle is a
  shape on the cover and nothing else.
- "Powered by" anything. The wordmark is the brand statement.
- "AI-generated" disclaimers in body. The pack discloses *who drafted
  what* in the agent loadout block — that is the disclosure.
- Excited language. *Exciting*, *amazing*, *delighted*, *thrilled*. Out.
- Centre alignment for body copy. Left-aligned, English-first, en-mi
  pairs preserved.
- Ragged margins. The grid is sacred.
- A second column on the cover. The cover is single-column. Always.
- A QR code on the cover. The verifier URL lives on the closing page in
  small mono, plus as a tiny endnote QR if the operator opts in.

---

## 10. The next concrete steps

In this commit:

- `lib/evidence/pack-spec.ts` — the canonical TypeScript types, deterministic
  canonical-JSON helper, and section-template constants.
- `components/EvidencePackCover.tsx` — a reference implementation of §2.1
  the cover. The quality bar. Every future cover renders through this
  component or it doesn't ship.

Not in this commit, but on the line:

- The voice-rewrite linter pass.
- The verifier route + the public verify page.
- The print stylesheet (`@media print`).
- The visual regression test harness for the four scenes in §8.
- Replacing the ad-hoc PDF in `generate-evidence-pack` with the canonical
  spec.

The single move that unlocks the category-defining experience is the
verifier route. Once that ships, the pack stops being a document and
becomes an attested record.
