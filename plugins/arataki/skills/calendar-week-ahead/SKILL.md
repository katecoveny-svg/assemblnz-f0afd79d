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
  Reads the operator's Google Calendar (or Microsoft 365 Calendar)
  for the next 7 days and filters down to the events that actually
  need the operator's attention — external meetings, prep-required
  blocks, double-bookings, and anyone-blocked-with-me slots.
  Stages a "this week's commitments" block for the Business Pulse
  weekly brief. Read-only — never accepts, declines, moves, or
  cancels an event.

  Trigger phrases / contexts: "what's on this week", "calendar
  this week", "week ahead", "meetings this week", "schedule",
  "external meetings", "prep required".
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
# calendar-week-ahead — Business Pulse skill (Arataki)

[Kaihanga: scaffold — written 16 May 2026 against the Business Pulse
spec. Full body to be tuned against Kate's own calendar and pilot
operators' calendars once Google Workspace / Microsoft 365
connectors are wired through `tenant_tool_connections`.]

## When to use

Fires when the operator (or the Business Pulse workflow) asks for
any of the following:

- Next 7 days of calendar events.
- Filtered view of "external" meetings (anyone outside the
  operator's domain on the attendee list).
- Prep-required blocks the operator has booked with themselves.
- Double-bookings, back-to-back-with-no-buffer warnings, and
  anyone-blocked-with-me holds.
- Travel-time conflicts where two physical-location events sit
  back to back.

## What this skill will NOT do

- Will NOT accept, decline, or tentatively respond to an event
  invite. Responses remain with the operator.
- Will NOT move, reschedule, or cancel an event. Reschedule
  drafts can be staged for the operator to send, but the
  calendar change is made by the operator.
- Will NOT create a new event. Event creation drafts are
  separately staged.
- Will NOT share calendar access with anyone. Calendar sharing
  remains an operator decision.

## Tikanga check

[Kaihanga: write the tikanga frame — calendar events involving
iwi, hapū, marae, or kura have tikanga considerations the operator
should be reminded of (kawa around timing, kaumātua engagement
protocols, karakia at hui openings). The skill flags such events
for operator attention rather than auto-actioning anything.]

## Privacy Act check

[Kaihanga: write the IPP coverage — calendar events contain
attendee names and email addresses (personal information), event
titles can carry sensitive context (health, legal, employment).
IPP 5 storage and security at the highest level. IPP 11 limits
disclosure to the operator. IPP 9 retention — the cached calendar
snapshot is purged after the brief is written. IPP 3A
(1 May 2026) for attendee data collected indirectly via
invites the operator did not initiate.]

## Workflow steps

1. Resolve the operator's calendar connection through
   `tenant_tool_connections`.
2. Read events for the next 7 days in the operator's timezone
   (default Pacific/Auckland; the operator's timezone is sourced
   from `tenant_intake.timezone`).
3. Classify each event:
   - External (any attendee outside the operator's domain).
   - Prep-required (event title contains "prep", "review", or
     the operator's custom prep markers).
   - Anyone-blocked-with-me (the operator is the only attendee
     and the title looks like a hold).
   - Travel-conflict (two physical-location events back to back).
4. Output a `weekly_commitments` JSON block matching the schema
   in `business_pulse_briefs.weekly_commitments`.
5. If any event needs the operator's preparation today and has
   no preceding prep block, add a flag for the `pulse-synthesis`
   skill to surface in the top three.

## Approval gates

Read-only. Any draft reschedule message is staged in Gmail drafts
or the calendar tool's draft surface, never sent.

## References

- Google Calendar API:
  `https://developers.google.com/calendar/api/v3/reference`
- Microsoft Graph Calendar API:
  `https://learn.microsoft.com/graph/api/resources/calendar`
- assembl Business Pulse spec:
  `docs/handover/claude-for-small-business-2026-05-16.md`
