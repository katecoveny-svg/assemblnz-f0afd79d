# Portable DO — agent everywhere

**Status:** product vision + shipping path — 16 September 2026 NZ

## Idea

DO is a **portable agent** that works wherever the person already is — writing, phone typing (stub), email drafting, real work in their systems.

UX: drag the floating ✦ → little chat sheet → tell it to do something **it can see right then** (page / selection / screen with consent).

## Same object, many seats

| Surface | Path | See-this |
|---|---|---|
| Web floating ✦ | `GlowDoWidget` · `/do/widget` · `DoFloatingWidget` | Selected text + page text chips; “Use selected text / refresh see-this” |
| Chrome extension | `apps/do/extension` floating orb + side panel → `/do/widget` | Explicit capture / browser seat consent |
| Mac companion | `apps/do/macos` orb | Accessibility-gated **Use selected text** / Show DO |
| Household Floor | `/do/household` | Same DO instance — seats, boards, connectors, NZ Live — **not** an inert Builder job parked in Office |

Writing help / email draft help = Clear + prepare skills; **drafts-only for send**.

## Phone keyboard

Stubs exist; not blocking tonight. Vision: same portable object when the person is typing on mobile.

## Do not confuse

- **Office** holds durable jobs / receipts — it is not where the agent “lives inert”
- **Builder DO** plans software jobs — different from the portable companion ✦
- **Cursor MCP** ≠ DO MCP — IDE plugins do not become this portable agent’s tools

## Related

- `docs/DO-PURPLE-COMPANION.md`
- `docs/do-templates/DO-MCP-GATEWAY.md`
- `docs/do-templates/DO-NZ-LIVE.md`
- `docs/reviews/2026-09-16-household-floor-do.md`
