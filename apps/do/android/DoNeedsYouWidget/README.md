# DO Needs you — Android App Widget stub

Home screen widget: **Needs you** count + top agent title. Tap opens `do://needs-you` or `https://assembl.co.nz/do#needs-you`.

## Open in Android Studio

1. Import `DoNeedsYouWidget` as a library/module next to `DoIme`, or copy sources into the main DO app
2. Register `NeedsYouWidgetProvider` in the app manifest with `@xml/needs_you_widget_info`
3. Timeline / update period refreshes from `GET /api/do/agents?grouped=1` when networked

## DEMO honesty

Stub provider paints placeholder counts. Web stand-in is the Needs you plate on `/do`.
