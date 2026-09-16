# DO browser seat v0

**Status:** shipping vertical slice (16 September 2026 NZ)  
**Code:** `apps/do/extension` · `apps/do/shared/browser-seat.ts` · `POST /api/do/browser-seat`

## Promise

Each DO gets its **own browser seat session** (`do-browser-seat:<do-uuid>`), not one shared anonymous scrape.

With **explicit consent**, the Chrome extension can:

1. Open an https URL for that DO  
2. Capture **visible page text**  
3. Optionally capture a **visible-tab screenshot**  
4. Return a **receipt** (`url` / `title` / `time` / `source` / hashes)  
5. Optionally store a **learn-mode playbook stub** (“show me once”)

It must **never** send, pay, book, or submit forms.

Dragging the floating ✦ / placing the widget alone must **not** share the screen (same rule as Show DO).

## Household Floor uses

| Seat | Typical hosts |
|---|---|
| SCHOOL | `*.bridge.school.nz` (demo + owner portals) |
| BINS | Auckland Council |
| BUS / WEATHER | AT / public weather pages |

Read notices/timetables/forms. Never submit absences, permissions or payments unless the owner explicitly approves outside this seat.

## Install

1. `/api/do/download?format=extension` or load `apps/do/extension` unpacked  
2. Open `/do/household`, install a floor, copy DO id + session key into the side panel  
3. Tick consent → **Capture page for this DO**

Optional host permissions cover SchoolBridge-style hosts, AT and Council — grant only when needed.

## Follow-ups (do not pretend v0 is full parity)

Documented in `BROWSER_SEAT_FOLLOW_UPS`:

- **Isolated per-DO Chromium profiles** (separate cookies/storage)  
- **Multi-frame screen-record learn mode** via Mac ScreenCaptureKit (`apps/do/macos`) — explicit picker, visible stop, never silent always-on  

v0 is still a real owner-browser path with receipts — not paste-only.

## Mac companion hook

`apps/do/macos/README.md` remains the direction for ScreenCaptureKit window capture. Same receipt shape; orb drag is not consent.
