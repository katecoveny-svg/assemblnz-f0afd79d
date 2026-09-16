# Household Floor — DO AgentSpec / runtime spec

**Visibility:** public template + owner-private seed  
**Runtime spine:** `context + intent → seats/schedules → browser seat / vision → Needs you → draft → approve`

## Object shape (v0)

```ts
HouseholdFloorInstance {
  id, templateId, visibility,
  personalisation: { displayName, accentColor, avatarMark },
  context: { timezone, people, homes, custodyNote, schoolPortals, kitchenMode, messaging, hardGates },
  seats[], schedules[], dailyBoardOrder[],
  board[], receipts[],
  browserSeatSessionKey,
  installedAt, updatedAt, lastTickAt?
}
```

## Status mapping

| Board column | Meaning |
|---|---|
| `needs_you` | Capture, draft review, or approval required |
| `working` | Preparing / waiting on a non-blocking step |
| `done` | Finished with a receipt — still no silent external send |

## APIs

| Method | Path | Role |
|---|---|---|
| GET | `/api/do/household` | Public template catalogue + honesty path |
| POST | `/api/do/household` `action=install` | Install public (anyone) or private (auth) |
| POST | `/api/do/household` `action=tick` | Run schedule / forced evening board |
| POST | `/api/do/browser-seat` | Consented page capture + receipt |

Device demo state also persists in `localStorage` key `assembl-do-household-floor-v1` so the public share works signed-out.

## Safety invariants

1. `assertDraftsOnlyAction` rejects send/pay/book/submit language on autonomous paths  
2. Browser seat requires `consent: true` and matching per-DO `sessionKey`  
3. Public GET/share copy never includes owner-private people/addresses  
4. Receipts stamp `executionClaimed: false` for install/tick/capture  

## Customisation

Plum defaults (`#240B21`, mark `⌂`). User may change display name, accent, and avatar mark without forking the template.
