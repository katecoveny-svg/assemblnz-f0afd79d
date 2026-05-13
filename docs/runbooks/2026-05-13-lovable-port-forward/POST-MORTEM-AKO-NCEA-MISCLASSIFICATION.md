# Post-mortem — AKO/NCEA misclassification

**Date:** 2026-05-13 (afternoon, ~16:00 NZST)
**Severity:** Medium — caught before any SQL applied to prod incorrectly
**Caught by:** Reo (specialist agent for editorial merge + content verification)
**Root cause owner:** Kaihanga (this agent)

## What happened

During the 2026-05-13 Lovable Cloud port-forward, when Kate locked Q2 = "Split Ako into ECE + new Mātauranga kete", Kaihanga shipped a Phase 7 brief addendum claiming:

> "The 'AKO trio' originally listed in this brief was secondary-education content (NCEA L1-3, Sacred Heart College weekly reports, NZQA, UE Literacy/Numeracy)."

That claim was **wrong**. The Lovable AKO trio (`ako`, `ako-comply`, `ako-whanau`) is entirely Early Childhood Education content — Te Whāriki, ERO, Education (Early Childhood Services) Regulations 2008, Licensing Criteria, 1:5/1:10 ratios, kōhanga reo, kaiako/tamariki vocabulary throughout.

## How it was caught

Reo, when given the editorial-merge brief, refused to start writing UPDATE statements until she verified the source content. Her process:

1. Read brief + addendum on `main`
2. Noticed the brief's opener excerpts described ECE content but the addendum described NCEA content. Those couldn't both be true.
3. Fetched the full Lovable system_prompt text via Lovable Cloud's anon REST endpoint (using `VITE_SUPABASE_PUBLISHABLE_KEY` from the repo `.env`)
4. Ran keyword counts on NZ legislation acronyms:

| Row | length | NCEA | NZQA | Sacred Heart | ERO | Te Whāriki | kaiako | tamariki |
|---|---|---|---|---|---|---|---|---|
| ako | 9,680 | 0 | 0 | 0 | 6 | 6 | 4 | 8 |
| ako-comply | 5,549 | 0 | 0 | 0 | 7 | 2 | 1 | 6 |
| ako-whanau | 5,193 | 0 | 0 | 0 | 3 | 4 | 5 | 5 |

5. Surfaced the contradiction back to Kaihanga with data, not opinion.

## What I (Kaihanga) did wrong

When building the brief addendum, I described AKO content based on:
- Length (9,680 + 5,549 + 5,193 chars = ~20 KB; "looked secondary-education-sized")
- The first ~400 chars of each prompt (which contained generic education framing language that I read as NCEA-style)

I never opened the FULL system_prompt body for any of the three rows. The body content (which Reo did read) was unambiguously ECE.

## Where the NCEA content actually lives

In the **Tōro family kete** I ported in Phase 2 today:

| Agent | Pack | NCEA refs | Sacred Heart refs |
|---|---|---|---|
| `toro-education` | toro | 8 | ✓ |
| `toro-email` | toro | 1 | ✓ |
| `toro-family` | toro | 2 | — |
| `toro-homework` | toro | 4 | — |

The NCEA content is **whānau-facing** (parents tracking their kids), not school-operator-facing. That use case is correctly placed under Tōro.

## Impact

- Phase 8 SQL carve-out (move AKO trio to Mātauranga) drafted but **not applied** to prod. Cancelled.
- Brief addendum corrected with verification data; Reo's brief updated; Cowork's brief updated.
- Mātauranga kete remains in canon as a placeholder for the school-operator audience (Sacred Heart pilot pending).

**No production data was harmed.** Reo's verification discipline caught the bug at the brief-review stage, before any SQL touched prod.

## Lesson logged

Saved as memory 2026-05-13: "Read prompt BODY before asserting what's in it. Openers + length are insufficient."

When asserting facts about prompt content:
1. Fetch the FULL system_prompt text — not just `length()` + opener
2. Run keyword counts on NZ legislation acronyms (NCEA, NZQA, ERO, Te Whāriki, HSWA, Privacy Act, etc.)
3. Include keyword-count table in any strategic recommendation that asserts content classification
4. Cross-validate against the original Lovable system_prompt content, not interpretation of section headers

## What Reo did right

Refused to improvise past a content contradiction. Went to source. Surfaced with data and a recommended decision path (A/B/C). This is exactly the locked-source discipline assembl needs — and exactly what Kaihanga should have done in the first place when writing the brief.

Filed for future Kaihanga reference.
