# `/kete/toro` Page Copy — architecture-led, organisational diagram

Brief: docs/runbooks/2026-05-13-lovable-port-forward/briefs/REO-EDITORIAL-MERGE-BRIEF.md (addendum Q3).
Written by Reo · 2026-05-13 · for Cowork to wire into the `/kete/toro` page.

---

## Hero

**Eyebrow:** the family AI team

**H1:**
> Tōro is one coordinating intelligence and nine specialists for the parts of family life that exhaust parents.

**Subhead:**
> A family is a small business with no morning meeting. Tōro is the chief of staff your household never hired — reading the inbox, mapping the term, watching the pocket money, finding the next holiday — and routing the rest to specialists who know exactly which corner of family life they own.

**Hero CTA (primary):** Try Tōro for your whānau →  
**Hero CTA (secondary):** See the team →  *(anchors to the org diagram below)*

---

## Org diagram — the family AI team

Layout note for Cowork: org chart shape, not a brochure grid. Tōro sits at the top as the parent / coordinator. The nine specialists branch below, named members of a team. Each card carries a name, a one-line role, and a status badge.

```
                       ┌──────────────────────────┐
                       │           Tōro           │
                       │   the family AI team     │
                       │       coordinator        │
                       └────────────┬─────────────┘
                                    │
   ┌─────────────┬──────────────┬───┴─────────┬──────────────┬─────────────┐
   │             │              │             │              │             │
 Email        Term            Kid          Holiday        Education       Family
 Watch       Planner         Money          Ideas         (coming        (coming
  LIVE        LIVE            LIVE           LIVE          soon)          soon)
   │             │              │             │              │             │
   │           Health           │            Home            │          Homework
   │          (coming           │           (coming          │          (coming
   │           soon)            │            soon)           │           soon)
   │             │              │             │              │             │
```

### The nine specialists

| Card name | One-line role | Status |
|---|---|---|
| **Tōro Email Watch** | Reads the family inbox so you don't, drafts the week ahead, flags what actually needs you. | **Live** |
| **Tōro Term Planner** | Maps school terms, holidays, sports seasons, and birthdays into one view the whole household can read. | **Live** |
| **Tōro Kid Money** | Three-jar pocket money, purchase approvals, allowance tracking — without the parent becoming the accounting department. | **Live** |
| **Tōro Holiday Ideas** | New Zealand family adventures by region, budget, and the patience your youngest actually has on a long drive. | **Live** |
| **Tōro Education** | NCEA tracking, homework support, curriculum resources, parent-teacher meeting prep — the whānau side of secondary school. | **Coming soon** |
| **Tōro Family** | The household dashboard — children, schedules, dietary needs, allergies, emergency contacts — in one calm place. | **Coming soon** |
| **Tōro Health** | NZ immunisation schedule, GP visits, dentist appointments, mental-health checkpoints for tamariki and rangatahi. | **Coming soon** |
| **Tōro Home** | Shopping list, household admin, the bin-night memory, the rates and rego renewals you forgot were due. | **Coming soon** |
| **Tōro Homework** | Per-child after-school sessions — reading practice, maths drill, the question your child won't ask the teacher. | **Coming soon** |

---

## Why a team, not one agent

The first version of Tōro tried to be one agent doing everything. It was warm. It was helpful. It also had to know NCEA Level 2 standards, immunisation schedules, three-jar pocket money mathematics, *and* what to do when the school invoice arrives the same week as the dentist. One agent stretched across all of those is mediocre at each.

A team is honest about what it doesn't know. Tōro Email Watch knows your inbox; it does not know NCEA. Tōro Education knows NCEA; it does not know that the rates are due. The parent — Tōro — knows when to pass a question across, when to surface it to you, and when to leave it alone.

---

## How they work together

A parent forwards an email from their teenager's school: *"reminder, NCEA Internal Assessment due Friday week."*

- **Tōro Email Watch** reads it, recognises an NCEA assessment date, and tags it.
- **Tōro Term Planner** drops the assessment date onto the household calendar, two days before Friday week, so the homework block lands in advance.
- **Tōro Education** flags the assessment as worth a parent-teacher check-in, drafts a short message to the teacher, and offers a homework session brief for Tōro Homework.
- **Tōro Homework** schedules a thirty-minute Sunday session on the right curriculum standard.

The parent sees one digest in the morning. Four specialists did the work behind it. Nothing was sent to the school, nothing was added to the calendar, nothing was scheduled with the kid — until the parent said yes.

That last sentence is the architecture. Every Tōro draft sits in front of the parent before it goes anywhere.

---

## Coming soon vs live

The four live specialists are running in the Hudson household pilot today. The five coming-soon specialists are queued for fresh editorial work — they will not ship until each one has been audited, branded, and tested under real family load. Names and roles are locked; depth is being written.

If you would like your whānau on the pilot list for one of the coming-soon specialists, tell Tōro at signup and you will land in the right cohort when it opens.

---

## Body footer (under the diagram, above standard kete-page CTAs)

> Tōro is the parent intelligence — the chief of staff, not the parent. Every draft, every reminder, every action is yours to sign off, edit, or send. The family stays in charge. Tōro keeps the days from running away.

---

## Voice and brand canon for Cowork to enforce

- Wordmark is always **lowercase `assembl`** and **`Tōro`** (with macron). Never `Assembl`, never `Tōroa`.
- Framing is **email-first** — Tōro reads the family inbox. Not SMS-first.
- The phrasing is **"the family AI team"** or **"the parent intelligence"** — not **"the AI parent"**. The AI is not the parent; it is the chief of staff.
- Specialists are **named team members**, not feature bullets. Each card has a name and a role, like a real team page.
- The pilot phrase is the **Hudson household** — that is the live pilot, not "our internal team", not "a friendly family".

---

## Acceptance flags

- [ ] Cowork builds the org-diagram layout as the visual centrepiece — not a 9-up grid, not a horizontal scroll. The shape of a team.
- [ ] All nine specialists render with status badges (**Live** or **Coming soon**). Live cards link out to the relevant Tōro sub-agent or product surface; coming-soon cards open a short waitlist form.
- [ ] `toro-logistics` and `toro-money` are NOT surfaced as separate cards. Their content has been folded into Tōro Term Planner and Tōro Kid Money respectively.
- [ ] Page does not say `SMS-first` anywhere. Mentions of communication are email-first.
- [ ] Mobile layout: the org diagram collapses gracefully — Tōro at top, then a single column of nine specialist cards. The shape should still read as a team.

---

## Three Gates audit footer

```
Three Gates · Brand drift PASS · Te reo PASS · NZ legislation PASS
Editorial tone PASS · Humanistic posture PASS
Overall 100% · ship
```

- **Brand drift:** lowercase `assembl` and `Tōro` enforced; no `SMS-first`, no `Tōroa`, no replacement framing ("the AI parent" rejected in favour of "the parent intelligence" / "the family AI team").
- **Te reo:** `Tōro`, `tamariki`, `rangatahi`, `whānau` macron-correct; no AI-generated karakia or sacred reo invocations.
- **NZ legislation:** no fabricated regulatory claims on the page; specialist roles reference real NZ family-life surfaces (NCEA, immunisation schedule, rates and rego) without inventing section numbers.
- **Editorial tone:** Wired / Economist / FT register — calm, specific, restraint-first. No velocity-as-virtue ("in seconds", "instant", "10× faster"). No bullet-point feature soup.
- **Humanistic posture:** every paragraph reinforces that the parent stays in charge. The agent reads, drafts, schedules, suggests — the parent signs. "Tōro keeps the days from running away" is the brand soul; "the AI parent" is rejected.
