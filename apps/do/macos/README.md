# DO Mac companion — local development build

A native floating DO companion with the hosted workspace. The orb can be dragged over desktop apps and stays available across Spaces/full-screen apps while DO is running.

## persistence

The development companion now:

- remembers the orb's last screen position between launches;
- remembers whether the floating orb was shown or hidden;
- exposes **Start DO at login** in the menu-bar menu on macOS 13+ using Apple's `SMAppService` login-item API;
- links to the macOS Login Items settings so the user can approve/manage startup directly.

Launch-at-login is opt-in. macOS may require approval in System Settings. The app does not attempt to bypass Login Items controls.

This is still an unsigned/ad-hoc local development companion, not a notarised public Mac release. Public distribution requires Developer ID signing/notarisation and a proper release/update path.

## current interaction model

The toolbar offers explicit selection capture from the previously active app and review-first paste.

Open DO, choose the app you want to work in, select text, then return to DO and choose **Use selected text**. Capture stays in the local review box until you choose **Add to DO**. Use **Review clipboard** to inspect copied text. **Paste reviewed text** inserts only the reviewed content into the chosen editable field. It never presses Return or Send.

Accessibility permission is requested only through the labelled **Enable app interaction** button. Each capture and paste checks permission and target application again. Secure text fields are refused. No selected text or clipboard content is automatically read on launch.

## what it does not do yet

The companion does **not** silently record the screen, browse accounts, click arbitrary controls or send messages.

The intended next context-capture step is explicit user-selected screen/window capture using Apple's ScreenCaptureKit system sharing picker. That should:

- be initiated by a clear user action;
- use the system content picker rather than a custom hidden selector;
- show what window/app/display is shared;
- require the normal macOS Screen Recording permission;
- provide a visible stop-sharing state;
- pass only task-relevant frames/context into DO;
- keep capture separate from authority to click/send/buy/submit.

This provides the desired “DO can see what I’m working on” experience without defaulting to continuous invisible surveillance.

## build

Build with the included `build.sh` on macOS with Xcode Command Line Tools:

```bash
./apps/do/macos/build.sh /path/to/output
open /path/to/output/DO.app
```

The build links Cocoa, SwiftUI, WebKit, ApplicationServices and ServiceManagement. Do not disable Gatekeeper or other macOS security controls.

## product direction

The Mac companion is the durable cross-app surface for **do this here, now**. The browser extension should remain the browser-aware sensor/side-panel layer. Both should resolve to the same portable AgentSpec/runtime rather than becoming separate agent systems.

See `docs/DO-OFFICE-ARCHITECTURE.md` for the companion + DO Office model.
