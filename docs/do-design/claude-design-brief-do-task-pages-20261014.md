# Claude Design brief: DO task pages that look like the front door

Prepared 14 October 2026 for Kate to paste into Claude Design. Companion to the approved Direction 4c homepage and the DO07 assembled plum glass identity. This brief proposes design work; it does not authorise merge, deployment or asset purchase.

## Why the DO pages are "all text" today

Three different visual decisions were made on three different days, and only one of them was ever carried into the working task pages:

1. **Direction 4c** (13 October) was designed and built as a homepage composition: coastal footage with a plum treatment, the assembling flock, word-by-word reveals and the simulated Try DO. Its README scopes it as "intentionally homepage-specific". It was never applied to `/do/*`.
2. **DO07 assembled plum glass** (approved 2 October) gave the personal DO shell its hero, the glass D and the identity controls. It is a shell and identity decision, not a task-page system.
3. **The task pages themselves** (Bills, Shop, School, Household, Travel, Memory) were built for correctness first: integer money, checked dates, reviewed drafts, receipts. They inherit the plum palette, Instrument Sans and the shared product frame, and nothing else. No imagery, no composition, no motion that shows work happening.

So the gap is not a missing palette. It is that the task pages have no visual system of their own. This brief asks Claude Design for that system, using Bills as the first worked page, then School, then Shop.

## The one-paragraph brief

> Design the working task pages of DO by assembl so they feel like the same product as the approved homepage: paper-white, editorial, calm, with original dimensional illustration and motion that shows information assembling. Each page must let a person do the task, see what DO knows, what it found, what it prepared, and decide. Use the canonical palette and type only. No dashboards, no gradients-as-decoration, no robots, no glowing AI, no copied reference assets. Start with Bills.

## Fixed inputs (do not improvise)

- Palette: deep plum `#240B21`, visible plum ink `#492B3E` on light fields, muted plum `#654A4E`, dusty rose `#916A70`, chalk `#F5F1F2`, paper `#FFFDFB`. Nothing else, no gold, teal, canary, cobalt.
- Type: Instrument Sans for everything a person reads or presses. IBM Plex Mono only for evidence, timestamps, sources, permissions and wait-state labels.
- Identity: the canonical glass D and lowercase `assembl` wordmark, unchanged. Task art never redraws the mark.
- Master visual idea: **things gather, organise and move with purpose until a useful whole is visible.** Two modes: brand/narrative assembly (aerial collective movement, Aotearoa sensibility) on the front door; product/proof assembly (recognisable inputs becoming a reviewable output with permission, reviewer and evidence visible) on task pages. Task pages use the second mode.
- Motion: 160 to 220 ms hover and focus, 240 to 320 ms opening a card, 280 to 360 ms one shared-image transition. Opacity and transform only. Reduced motion honoured at first paint. Motion communicates work; it is never decorative.
- Honesty is part of the design. Fictional, prepared, simulated, connected and verified are visibly different states, in the page, not in a tooltip.

## The page anatomy every task page shares

Design these as a system first, then instantiate.

1. **Task header.** Title, a one-line state in plain words ("Fictional household, 21 September"; "Connected, read-only, fetched 10:41"), and the source chips. Write / Speak / Add stay reachable without leaving the task.
2. **Know.** What DO already knows from permitted records, as recognisable cards, not a table. For Bills: one card per service with provider, the monthly figure large, the rhythm small, and a rise flagged in rose. Imagery: a small original still life per category (power, fibre, mobile, cover, streaming) from one illustration family.
3. **Found.** What DO went and found, with dated evidence on every item: source host, verified date, stale flag. For Bills: cheaper public offers ranked by possible yearly saving, worded as possible, before fees, never promised.
4. **Prepared.** The thing DO wrote for the person: editable, with the review line and the fingerprint under it. The draft is the hero of this block, not the buttons.
5. **Decide.** One primary decision, secondary options behind it. The decision is always a human act: review, keep, ask, watch. Never switch, pay, send.
6. **Receipt.** Saw, decided, prepared, asked, did, evidence. Mono. Compact. Always present once something was prepared.
7. **Boundary.** What this page does not do and what unlocks it, written as a sentence, visible, not hidden in a footer.

## Bills, the first worked page

Design `/do/bills` end to end at 1440, 820, 390 and 375 px:

- **Know**: three to six service cards, with the yearly total as the one big number on the page. Show the "provider not matched" state as a quiet label, not an error.
- **Found**: the hunt result inline under a card: up to three offers, each with source and verified date in mono, a stale one visibly older, and the empty state ("no offer in the price book is at least NZ$5 a month cheaper").
- **Prepared**: an enquiry draft with the review line.
- **Watch**: the hand-off to Personal DO ("Ask DO to watch this") shown as a review step, because the person reads the request before it is kept.
- **Bank connection**: an honest "not enabled, here is what unlocks it" block that still looks designed. It must not look like a broken connect button.
- States to draw: fictional example, own CSV (no provider matched), connected read-only (future, labelled proposed), hunting, empty hunt, stale offer, error, reduced motion.

## Then School and Shop

Apply the same anatomy. School: sources, old/new change view, agenda, unresolved questions, one review decision, the prepared record; warm, coherent colour; not a black-and-white form. Shop: photo to corrected pantry to meals to list, with recognisable food imagery from the approved art direction, and the trolley step labelled as handoff until a retailer execution path is verified.

## Deliverables back to the repo

- One design file per page with the states above, plus the shared component sheet (task header, know card, found row, prepared draft, decide bar, receipt, boundary).
- An asset register for any illustration: creator, date, licence, intended crop, alt text, synthetic status.
- A short note on anything in the brief you deliberately changed and why.

## Acceptance

Kate reviews desktop and phone with real content density. Readable type, intentional colour, usable evidence expansion, keyboard and focus order, reduced motion, contrast, safe areas, no clipped headings. Then Claude Code implements against the existing components (`DoProductFrame`, `DoPresence`, `DoTaskScene`, `bills-workspace.module.css`) without changing any authority, consent or provider behaviour.
