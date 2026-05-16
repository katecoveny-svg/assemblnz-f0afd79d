---
name: calendar-week-ahead
description: |
  Filters the next 7 days of the connected user's primary calendar to
  the events that need the named reviewer's attention — external
  meetings, anyone-blocked-with-Kate slots, events that need prep,
  and any all-day blocks. Skips internal-only or back-to-back filler
  blocks unless explicitly flagged.

  Trigger phrases / contexts: "week ahead", "this week", "calendar",
  "meetings this week", "external meetings", "prep needed".
mandatory: false
applies_to: ["arataki"]
---

# Calendar Week Ahead — next-7-days attention filter (Arataki)

**STATUS**: scaffold — full skill body deferred until Codex picks up
the build per `docs/handover/claude-for-small-business-2026-05-16.md`
Part 3.

## When to use

Inside `business-pulse` for the Monday brief, and standalone when the
named reviewer asks "what's on this week".

## Inputs

Google Workspace Calendar connector. Reads next-7-days events on the
primary calendar of the connected user.

## Filter rules

Include:
- Events with at least one external attendee (domain ≠ user's domain)
- Events titled with "blocked" or "hold" + a person's name
- Events with attached docs that haven't been opened yet
- Any all-day event

Exclude:
- Internal stand-ups, syncs, or recurring 1:1s shorter than 30 minutes
- Personal events marked private

## Output contract

```json
{
  "captured_at": "2026-05-16T07:00:00+12:00",
  "window_days": 7,
  "events": [
    {
      "start": "2026-05-19T10:00:00+12:00",
      "title": "...",
      "attendees_external": ["..."],
      "needs_prep": true,
      "prep_reason": "Attached deck unopened",
      "doc_links": ["..."]
    }
  ]
}
```

## Out of scope

- Sending invites or moving events (read-only)
- Multi-calendar merging (primary calendar only for v1)
