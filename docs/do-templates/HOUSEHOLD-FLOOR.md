# Household Floor — DO template

**Status:** canonical product template (16 September 2026 NZ)  
**Surfaces:** `/do/household` · Office link · Chrome extension browser seat  
**Name:** always **DO** (never DOO)

## What it is

Household Floor is an installable, runnable family DO with nine specialist seats, schedule hooks that open **Needs you / Working / Done**, drafts-only hard gates, and an owner-browser seat for school/council/transport pages.

It is the Assembl twin of a Grok Bot–style household assistant — portable widget + Office board + consented browser capture — not a chatbot clone.

## Public vs private

| Template | Id | Share tonight? |
|---|---|---|
| **Household Floor** (scrubbed) | `public_household_floor` | **Yes** — fictional Avery / Quinn / Harper household |
| **Household Floor · owner** | `owner_private_household_floor` | **No** — owner-personal context; install only from private path |

Public template deliberately uses placeholder schools (`demo-college.bridge.school.nz`, `demo-secondary.bridge.school.nz`), fictional addresses, and first-name-only children.

## Seats

`SCHOOL` · `PACK` · `KITCHEN` · `MONEY` · `TRAVEL` · `WEATHER` · `BINS` · `BUS` · `DESK`

Each seat declares `canDoWithoutAsking`, `mustAskBefore`, and `never`. School / weather / bins / bus prefer the browser seat over paste-forever.

## Schedules (Pacific/Auckland)

- **19:30 daily** — evening board  
- **07:00 Mon–Fri** — weather + bus  
- **Sunday 10:00** — week board  
- **Sunday 19:00** — cleaner key draft (fortnightly intent)

v0 produces board items via `tickHouseholdFloor` / `POST /api/do/household` (`action: tick`) rather than a full cron worker.

## Hard gates

- Drafts-only messaging (kids / co-parent draft → approve)  
- School portals read-only unless explicitly asked to submit  
- Never invent fixtures, grades or medical  
- Never send / pay / book / submit without OK  
- Consent for browser/see; dragging the floating ✦ does **not** share the screen  
- No child tracking  

## Customisation

On the DO object / UI:

- `displayName`
- `accentColor` (plum defaults)
- `avatarMark` (`✦` `◎` `⌂` …)

## What Kate can click

1. Open `/do/household`  
2. **Install public template**  
3. Customise name / colour / mark  
4. **Share tonight** (public only)  
5. Download extension → Load unpacked → paste DO id + session key → capture with consent  
6. **Run evening board** → work **Needs you**

Owner-private: `/do/household?install=owner-private` — do not share.

## Related

- `docs/do-templates/DO-BROWSER-SEAT.md`
- `docs/do-templates/HOUSEHOLD-FLOOR-DO-SPEC.md`
- `docs/reviews/2026-09-16-household-floor-do.md`
