# Installed portable DO audit

Read-only audit on Kate's Mac, 2026-10-02. Current main inspected at `70ce219e1`. Private screen capture stayed local; no private screenshot was uploaded. No install/update, grants, provider calls, database activation or heavy build occurred. A fresh headless browser context was used instead of shared/protected tabs.

## What Kate has

| Surface | Confirmed reality | Would updating help? |
| --- | --- | --- |
| Native floating/menu-bar D | Running binary `/Users/kateharland/do-install/mac-out/DO.app`, bundle `nz.co.assembl.do.companion`, version **0.3.0**, binary dated 2026-09-16. Installed source opens `/do/widget`. The orb's click calls `showWorkspace`, which raises its retained window; drag moves only. Accessibility metadata confirms Open DO / Show floating DO / Hide floating DO menu controls. | Current source is **0.4.0**, with unified entry/media plumbing, but its orb also only raises that window. An update alone would not fix the user's underlying complaint or create sync. |
| Native window's text tools | 0.3.0 binary/source includes Use selected text, Review clipboard and Add to DO. Capture is local first; Add to DO offers it to `/do/widget`; provider preparation is separate. Selected text requires the app's existing Accessibility permission. Its current permission/actual private selection was not exercised. | These tools already exist; making them discoverable directly from the D is the useful next change. |
| Installed DO browser shortcut | `~/Applications/Chrome Apps.localized/DO by assembl.app` opens **`https://www.assembl.co.nz/do/personal`**. This is a Chrome web-app launcher, distinct from the native app. | Hosted UI changes arrive on page reload. Reinstalling the shortcut does not create shared phone/desktop state. |
| Chrome extension | `~/do-install/apps/do/extension` contains **1.4.0** source. Current repo/download is **1.7.0**, with explicit browser text/area handoff. An enabled DO extension could not be confirmed from readable profile metadata; do not label the source folder an active installed extension. | A deliberate extension update could expose newer browser capture tools, but would not add general Mac control or cross-device storage. No update performed. |
| Phone web/PWA | Existing paste and supported text/link share intake can offer reviewed text to DO. Browser/OS support controls whether the share target is offered. No installed native phone app was verified. | Using the supported web surface is possible; this is not universal phone control. |
| Task continuity | `/do/continue` still explicitly saves fictional tasks only in that browser; durable activation is false. SQL proposals and other owners' inactive modules are not live sync. | An installer update cannot enable phone-to-desktop continuation. That needs separately approved authenticated persistent storage and actual two-device proof. |

## Runtime proof and limits

The production `/do/widget` receiver was checked in a fresh signed-out browser with fictional `assembl-do:context` text and all outgoing mutations blocked. It accepted the text into the existing editor, left preparation consent unchecked and made no provider call. Evidence: isolated checkout `output/widget-handoff-audit.json` and `widget-fictional-handoff.png` (fictional public-page data only).

Installed native click routing was inspected through the running app identity, local source/binary strings and existing Accessibility control labels. The installed app was not activated/clicked or replaced; no user's private selection or clipboard was read. The installed native capture flow therefore is not newly claimed as on-device tested.

## Smallest useful implementation

Prepared source-only change: clicking the D opens **Review selected text / Review clipboard / Open workspace** in a plum/rose glass popover, keeping the existing D asset. No reading occurs when opening it. Capture uses existing review functions and existing permission checks, clears stale native review, then opens the review window. Add to DO and provider consent stay separate. No inferred context, provider call, native grant or new storage interface.

Changed files: `apps/do/macos/DOCompanion.swift`, its README and this audit. Isolated branch `codex/portable-widget-actions`. Swift parse-only check, 12 existing native/intake/portable tests and diff checks passed. This has **not been compiled, installed or released**. Coordinated Mac compilation and controlled fictional native interaction/visual proof are required next, per the delegation's “No heavy build until coordinated.” No UI sketch is represented as native proof.
