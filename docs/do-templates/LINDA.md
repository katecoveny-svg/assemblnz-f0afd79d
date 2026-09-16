# Linda — DO task boards

**Status:** shipping v0 — 16 September 2026 NZ  
**Route:** `/do/linda`  
**Primitive stance:** intentionally one-off UI over a small shared module (`apps/do/shared/linda.ts`); not a new Factory primitive yet.

## What it is

Linda is Assembl DO’s **Linear-inspired to-do list** — clean rows, priority pills, status chips, keyboard-friendly navigation — in plum/paper Assembl brand.

**Each DO / specialist / workstream gets its own board**, not one giant dump.

Linda is for **honest human TODOs** about open DO work. It is **not**:

- Linear.app sync (do not claim that)
- Office / Builder durable jobs (`do_agents` / receipts)
- a running agent

Office shows execution state and receipts. Linda tracks what still needs doing across workstreams.

## Boards (seed)

Seeded 16 Sep 2026 from real open Assembl DO work (editable):

| Board | Surface |
|---|---|
| Portable widget | `/do/widget` · PR #1302 |
| White-label Task DO Maker | `/do/builder` · PR #1301 |
| Household Floor | `/do/household` |
| Meeting DO | `/do/meetings` |
| Connections / MCP | `/do/connections` |
| Downloads | `/do` + `/api/do/download` |
| DO task manager (Linda) | `/do/linda` itself |

## Data model

- **Board** — `id`, `title`, `glyph`, `href`, `issues[]`
- **Issue** — `id`, `title`, `status` (`backlog` \| `todo` \| `doing` \| `blocked` \| `done`), `priority` (`p0` \| `p1` \| `p2`), `notes`, optional `href`

## Persistence (v0)

`localStorage` key:

`assembl:do:linda:v1:<ownerKey>`

- Signed-in Supabase user id when available
- Otherwise `device`

UI copy must stay honest: local owner/device store, **not** Linear.app.

New seed boards merge in additively; user edits on existing boards are preserved. **Reset to seed** clears the current owner/device store back to the Assembl seed list.

## UI

- Left: board / DO switcher
- Main: issues grouped by status (Linear-like rows)
- Row: priority · title · status · optional link hint
- Click → detail drawer (notes, mark done, open href)
- Add task on each board
- Keyboard: `j`/`k` move, `Enter` open, `c` add, `Esc` close

## Linda strip

`components/do/LindaStrip.tsx` — embeddable “this DO’s next 3 todos” for portable widget / Office. Same storage as the full board. Links into `/do/linda?board=…`.

## Later (optional)

Wire to `do_agents` / receipts only if a clean persistence path appears **without** conflating human TODOs with Builder execution jobs. Receipt honesty rules still apply.

## Related

- `docs/do-templates/DO-PORTABLE-AGENT.md`
- `docs/do-templates/HOUSEHOLD-FLOOR.md`
- `/do/office` — durable jobs + receipts
- `/do/builder` — software build plans
