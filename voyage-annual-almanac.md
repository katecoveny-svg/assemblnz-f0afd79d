# Voyage — The Annual Almanac

The end-of-year physical artefact mailed to every Assembl tenant. A
cream-stock, perfect-bound book — their year of work, beautifully
typeset, in their hands. The single highest-loyalty object the platform
ever ships.

Spec: voyage-evidence-craft.md is the design canon; this doc covers the
*book* specifically — page architecture, materials, fulfilment, and the
relationship between the digital Almanac (PDF in the dashboard) and the
physical Almanac (mailed in a cream cardboard tube each year on the
tenant's anniversary).

---

## 1. Why this exists

People keep books. They throw away PDFs. The Almanac is the moment the
work the operator did over twelve months becomes a thing on a shelf —
the proof that the year happened, that they shipped, that they signed
their name to forty-eight evidence packs and the BCA accepted them all.

The Almanac is also the *only* thing the tenant receives from Assembl
that isn't a transaction. It is a gift. It is mailed in March, not
December, because March is when the new financial year hits and
operators feel most under the gun. The Almanac arrives and reminds them
of the year they survived.

---

## 2. Bibliography

| Property        | Value                                                      |
| --------------- | ---------------------------------------------------------- |
| Format          | A5 portrait — 148 × 210mm (folds open small enough to hold)|
| Extent          | 80–120 pages, depending on tenant volume                   |
| Binding         | Smyth-sewn, square spine, perfect bound                    |
| Cover           | Cream uncoated 320gsm, soft-touch laminate, debossed       |
| Endpapers       | Soft-gold 120gsm                                           |
| Interior stock  | Cream 100gsm uncoated (Munken or Arena)                    |
| Cover finishes  | Wordmark debossed; soft-gold sparkle foil-stamped, dead-right |
| Spine           | Wordmark + year + tenant name, all in IBM Plex Mono        |
| Ribbon marker   | Single pounamu-green satin                                 |
| Print partner   | NZ-based — recommend Webstar Auckland for short runs       |
| Mailer          | Cream cardboard tube, 60mm × 220mm, gold-foil end-caps     |

Hand-feel target: the closest brand reference is *Cereal* magazine. The
furthest is *Wallpaper*. We are *Cereal* — quiet, considered,
NZ-restrained.

---

## 3. Page architecture

Section ids are stable. Two tenants with very different practices
recognise the structure when they swap copies.

| § | Section (mi) | Section (en) | Source |
|---|---|---|---|
| 01 | **Kupu Whakataki** | Introduction | One-page essay; the year's posture |
| 02 | **Te Tau i Mua** | The year in numbers | Aggregates from `outcome_events` + `evidence_packs` |
| 03 | **Mahi Whakaihiihi** | Notable work | 6–10 evidence packs reprinted as plates |
| 04 | **Mōkihi** | The chain | Visual ribbon of every sealed pack — printable wallpaper inside the spine |
| 05 | **Pou Taunaki** | Citations | Every Act, every clause, every section the tenant cited this year |
| 06 | **Aroaro o ngā Ture** | New regulations | Plain-language summaries of legislative changes that affect this tenant |
| 07 | **Whakaaro Whaiaro** | Agent reflections | Brief, restrained notes from the eval harness — where this tenant's house style differs from Assembl's default |
| 08 | **Tāmata** | Milestones | Every milestone certificate issued this year |
| 09 | **Hononga** | Connections | The reviewers, the clients, the iwi consulted (with consent) |
| 10 | **Whakamutunga** | Audit statement | The Almanac itself is hash-chained; verifier URL on the inside back cover |

Every page foot carries: tenant code, year, page number, soft-gold rule.

---

## 4. The spread that defines the book

A single spread that, when shown to anyone, conveys what the Almanac
*is*:

> **Left page:** A reprinted evidence-pack cover — the Waihanga s14B
> precheck from 27 King Street. Soft-gold seal. Hash on the foot.
>
> **Right page:** A short prose recollection of that work, in restrained
> third person — *On 11 May the BCA accepted this precheck without
> further query. The pack is verifiable at the URL on the foot.* — then
> three lines from the agent's reasoning trace, scrubbed of any
> identifying client data.

That spread is the brand. A reader who sees only that page understands
the whole thesis.

---

## 5. Fulfilment

- **Anniversary trigger.** When `tenants.created_at` rolls over a year,
  a `tick` job enqueues a job in the new `almanac_jobs` table.
- **Compile.** A worker pulls 12 months of `outcome_events`,
  `evidence_packs`, `reasoning_traces`, and `escalation_events`,
  composes the Almanac via the canonical pack renderer (extended with
  the Almanac-specific section ids), and writes a PDF to storage.
- **Review.** The named primary reviewer for the tenant gets a 7-day
  approval queue. They can edit the Kupu Whakataki essay, swap in
  alternative evidence packs for §03, and approve or defer.
- **Print.** On approval, the PDF is submitted to the print partner via
  their API. NZ print turnarounds: 7–10 working days.
- **Mail.** Cream tube ships from Webstar direct to the operator's
  registered address. Plain wrap, no marketing.
- **Verifier.** The Almanac's own hash lives at
  `/evidence/verify/:hash` like any other pack. The inside back cover
  carries the QR. A reader can independently verify the printed
  Almanac is genuine.

---

## 6. Cost envelope

Per Almanac at 200-unit run, mailed within NZ:

| Item                              | NZD     |
| --------------------------------- | ------- |
| Print + bind (100gsm, 96pp, sewn) | $22.40  |
| Cover stock + foil + deboss       | $4.10   |
| Endpapers + ribbon                | $1.80   |
| Tube mailer + foil end-caps       | $3.20   |
| Postage (NZ Post tracked)         | $7.50   |
| Fulfilment handling               | $2.00   |
| **Total per Almanac**             | **$41.00** |

For the Operator-as-platform tier at $1,490/month, an Almanac at $41
is a 0.23% spend on retention. The bound book delivers 100% of the
hand-feel. Trivial unit economics. Maybe the highest-ROI marketing
spend in the whole company.

Print partner candidates to vet in priority order:
1. **Webstar Auckland** — short runs, good NZ tikanga story
2. **Soar Print** — Tāmaki, sustainable stock options
3. **Caxton** — Christchurch, long heritage, ribbon binding in-house

---

## 7. The digital almanac

Lives in the dashboard at `/almanac/:year` per tenant. Same content,
rendered with the canonical pack components, downloadable as PDF, and
the *only* permanent record if the operator declines the physical
mailing (default opt-in; one-click opt-out per tenant preference).

The digital version is what's hashed and verifiable. The physical book
is a faithful render of the digital — the hash on the inside back cover
matches.

---

## 8. Sample plate

A reference for the print partner brief and the page renderer:

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   assembl                                                    │
│   WAIHANGA · CONSTRUCTION · EVIDENCE PACK                    │
│                                                              │
│                                                              │
│                                                              │
│                                                              │
│   Tirohanga ā-Wāhi 14B                                       │
│   Section 14B precheck                                       │
│                                                              │
│   27 King Street, Auckland · BCA precheck                    │
│                                                              │
│                                                              │
│                                                              │
│                                                              │
│   ISSUED · 11 MAY 2026, 14:32 NZST                           │
│   Aroha Witana · Licensed building practitioner              │
│                                                              ★│
│                                                              │
│   hash · 7f3a9c…0d4e2 · sealed 11 May 2026, 14:32:08 NZST    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                       ← LEFT PAGE (PLATE) →
                                                                 
┌──────────────────────────────────────────────────────────────┐
│   §03.04 — Mahi Whakaihiihi · Notable work                   │
│                                                              │
│                                                              │
│   On 11 May the BCA accepted this precheck without           │
│   further query. The pack is verifiable at the URL on the   │
│   foot.                                                      │
│                                                              │
│   From the reasoning trace —                                 │
│                                                              │
│   "The proposed deck on the eastern elevation reduces        │
│   the existing weathertight detail at the upper window       │
│   jamb. Flagged for re-engineering before lodgement."        │
│                                                              │
│   The detail was re-engineered the next morning; a           │
│   revised sheet A4-12 was issued by the architect and the    │
│   precheck proceeded.                                        │
│                                                              │
│   ─────                                                      │
│                                                              │
│   §03.04 · Tenant: tūāpapa-build · Page 22                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                       ← RIGHT PAGE (PROSE) →
```

That spread, reproduced in 100gsm cream and bound in 320gsm cream,
is the Annual Almanac.

---

## 9. Build order

1. **`almanac_jobs` table** + scheduled compile worker.
2. Extend the canonical pack spec (`lib/evidence/pack-spec.ts`) with
   `AlmanacPack` — same shape, new section ids, longer extent.
3. Extend `generate-evidence-pack` to render the Almanac at A5 with the
   spine + endpaper hints in PDF metadata.
4. Operator approval queue at `/almanac/review`.
5. Print partner integration — likely Webstar API, fall back to manual
   PDF email for the first 10 tenants.
6. Cream tube mailer brief + sample run.
7. Public verifier route already exists at `/evidence/verify/:hash` —
   no change needed.

The first Almanac is the moment the company crosses from product into
institution.
