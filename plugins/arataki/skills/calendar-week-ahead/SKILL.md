---
name: calendar-week-ahead
description: |
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
