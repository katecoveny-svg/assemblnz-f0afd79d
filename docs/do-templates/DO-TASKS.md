# Per-DO to-do lists

**Status:** shipping v0 — 16 September 2026 NZ  
**Primary UX:** compact panel on each major DO surface  
**Optional rollup:** `/do/tasks`  
**Module:** `apps/do/shared/do-tasks.ts`

## What it is

Each DO / specialist / workstream gets its **own in-product to-do list** — Linear-inspired rows (priority, status, check off, add task) in Assembl plum/paper.

This is **not** a separately branded product, and it is **not** Linear.app sync.

Office / Builder `do_agents` remain execution + receipt storage. These lists are honest human TODOs.

## Where it shows

| Surface | Board id | Embed |
|---|---|---|
| Household Floor `/do/household` | `household-floor` | `DoTaskPanel` |
| Meeting DO `/do/meetings` | `meeting-do` | `DoTaskPanel` |
| Builder DO `/do/builder` | `builder` | `DoTaskPanel` |
| DO Office `/do/office` | `office` | `DoTaskPanel` + strip |
| Portable widget `/do/widget` | `portable-widget` | `DoTaskStrip` |
| Writing / Personal | `writing` / `personal` | via `/do/tasks` rollup |

## Data model

- **Board** — `id`, `title`, `glyph`, `href`, `issues[]`
- **Task** — `id`, `title`, `status` (`backlog` \| `todo` \| `doing` \| `blocked` \| `done`), `priority` (`p0` \| `p1` \| `p2`), `notes`, optional `href`

## Persistence (v0)

`localStorage` key: `assembl:do:tasks:v1:<ownerKey>`

- Signed-in Supabase user id when available
- Otherwise `device`

Legacy key `assembl:do:linda:v1:*` (short-lived misname) is read once and migrated.

## Components

- `components/do/DoTaskPanel.tsx` — interactive panel (check off, add, expand notes)
- `components/do/DoTaskStrip.tsx` — next-3 strip for companion / compact embeds

## Related

- `docs/do-templates/DO-PORTABLE-AGENT.md`
- `docs/do-templates/HOUSEHOLD-FLOOR.md`
- `/do/office` — durable jobs + receipts
- `/do/builder` — software build plans
