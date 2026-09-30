# Personal DO interface · 30 September 2026

Status: review implementation, not production or live-account proof.

## Intent and visual direction

The `/do/personal` workspace now puts the person's note and next step ahead of product explanation. It uses the canonical deep plum, dusty rose, chalk and paper palette, Instrument Sans UI and IBM Plex Mono evidence labels. An authored, lightweight SVG sculpture gives each saved character a distinct material form. The canonical DO mark remains in the product navigation; the character supplements it.

The responsive composition is one plum stage and a paper task composer, then a clear Today / Needs you / Done rail. Talk, Photo, Forward and Type are explicit entry controls. The voice panel and image intake open only when requested. Forward explains the existing reviewed text/share route; it does not claim an inbox connection.

The first four checklist categories are shortcuts; all twelve remain available through “All 12 checklists” and the category selector. Source links, optional naming, ongoing responsibilities, capability details, care navigation and public updates remain available in deliberate disclosures instead of competing full-size panels.

## First use

- An optional three-step guide starts with meeting/personalising DO, moves to one note, then points to reviewing the resulting checklist.
- Name/look opens the existing consent-led account profile wizard. Guest users can start a note without signing in or connecting anything.
- Saved, completed profiles and incoming share handoffs bypass the introduction. The guide can be skipped; skipping does not change permissions or save preferences.
- The browser setup link points to the existing Chrome companion instructions. Copy explicitly says no personal cloud computer is connected. Browser capture is not represented as an autonomous executor.

## Boundaries preserved

No data schema, provider request, storage permission or action approval is changed by the visual layer. Workspace keys still remount account-owned state. Profile save, screenshot processing, voice capture, draft generation and browser snapshots retain their independent permissions. Guest loss warnings remain visible and the existing guarded leave flow remains in force. The care/weather modules are optional secondary surfaces; neither auto-fetches private context.

The character is decorative and never indicates provider availability, connectivity or completed work. Its movement is one state transition when a note becomes nonempty, with a complete static reduced-motion rendering and no WebGL or image-network dependency.

## Checks and proof

- Focused personal engine/profile/session tests: 34 passed during implementation.
- Focused ESLint for changed UI components: passed.
- Brand guard and public-front-door guard: passed.
- Aggregate typecheck/build and browser proof belong to the final integrated branch; do not infer them from the focused checks above.
- Required preview review: 375px and desktop, first use and saved profile, settings consent/cancel, all twelve categories, Photo/Forward/Type, voice opening and return, ongoing responsibilities, large-text care, weather/updates failure and cancellation, guest leave warning, keyboard focus, reduced motion and no horizontal overflow.

This extends the existing Personal DO interface and character primitive; it does not create a second runtime or permission model.
