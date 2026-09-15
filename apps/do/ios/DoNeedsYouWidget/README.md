# DO Needs you — iOS WidgetKit stub

Home Screen widget showing **Needs you** count + top agent title. Tap opens `do://needs-you` (falls back to `https://assembl.co.nz/do#needs-you`).

## Open in Xcode

1. Add a Widget Extension target to the DO iOS app
2. Copy `NeedsYouWidget.swift` into the widget target
3. Set the widget URL scheme `do` on the containing app
4. Widget fetches `GET {apiBase}/api/do/agents?grouped=1` when the timeline reloads

## DEMO honesty

v0 stub uses a static placeholder timeline until the app ships with authenticated fetch. Web stand-in lives on `/do` (“Needs you” plate).
