# DO Keyboard (iOS) — compiling-ready stub

Swift **Keyboard Extension** scaffold for assembl DO. Not App Store–ready; Linux CI cannot build this. Open in Xcode on a Mac.

## What it does (intended)

- ✦ key + template strip: **Watch / Brief / Slop-check / Mitre brief**
- On ✦: send selection or clipboard (+ optional host bundle id) to DO compile API
- Default API base: `http://localhost:3000` (Debug) or your deployed origin

## Open in Xcode

1. Create an iOS App + Keyboard Extension target named `DoKeyboard` (or open this folder once wired into an `.xcodeproj`)
2. Copy sources under `DoKeyboard/` into the Keyboard Extension target
3. Enable **RequestsOpenAccess** in `Info.plist` (Full Access) — required for network compile calls
4. Run on simulator/device → Settings → General → Keyboard → Keyboards → Add **DO** → Allow Full Access

## Full Access trust warning

Apple requires **Full Access** for a keyboard to use the network. Tell users plainly:

> DO Keyboard needs Full Access only to call your assembl DO API with the text you choose. It does not keylog. You can revoke Full Access anytime in Settings.

## Configure API base

Edit `DoKeyboardConfig.swift` → `apiBaseURL`.

```
POST {apiBase}/api/do/message
{ "surface": "keyboard", "brief": "…", "selection": "…", "hostBundleId": "…" }
```

Or compile directly:

```
POST {apiBase}/api/do/agents/compile
{ "brief": "…", "page": { "url": "keyboard://…", "title": "…", "selectedText": "…" }, "templateId": "…" }
```

## Template strip ids

| Key | templateId |
|-----|------------|
| Watch | `price-watcher` |
| Brief | `prepare-bid-brief` |
| Slop-check | `clear-writing-watch` |
| Mitre brief | `mitre10-sap-rfp-brief` |

## Related

- Android IME: `apps/do/android/DoIme/`
- Web keyboard preview plate: `/do`
- Home widget stub: `DoNeedsYouWidget/`
