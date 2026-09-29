# DO iPhone app · development build

Native SwiftUI workspace, Share Sheet intake, UIKit keyboard and WidgetKit launcher. Generated from `project.yml` using XcodeGen, iOS 17+. No signed IPA, TestFlight upload or App Store release has been made.

## What works in this source

- Type or explicitly paste a draft; save up to 20 drafts locally; open/delete them.
- Explicit Copy & open DO action writes a local-only clipboard item expiring after two minutes, then opens the existing HTTPS web workspace. Paste there and use its own sign-in/provider consent. No source is sent automatically and no native model connection is claimed.
- Review the exact native draft, then share with the system sheet or release a single keyboard draft for one hour. Editing resets review. Remove keyboard access at any time.
- Keyboard Load draft reads only that released record, previews the full scrollable text and inserts only on a separate tap. Expiry/revocation is rechecked immediately before insertion. Field/selection changes clear the in-memory preview. Ordinary typing works separately.
- Share extension takes one user-shared text/URL item, lets the user edit/review it, then saves locally. Its system Post button means local save only; no message is posted externally.
- Home widget opens DO and reflects whether a local keyboard draft is available. It never displays draft contents or fictional approvals. Widget updates are scheduled by iOS and can lag.

## Build

On a Mac with Xcode and Homebrew:

```sh
brew install xcodegen
cd apps/do/ios
xcodegen generate
open DO.xcodeproj
```

Select scheme **DO**. The CI workflow `.github/workflows/do-ios-development.yml` builds all four targets for an iOS Simulator without distribution signing, runs store tests, and attempts a simulator screenshot. CI proof is not physical-iPhone or App Store approval. Check the actual run before claiming success.

For a device build, select your Apple development team for all four targets and register the App Group `group.co.assembl.do`. Bundle identifiers are `co.assembl.do`, `.keyboard`, `.share` and `.widget`. Change these consistently if your team owns different identifiers. No Apple credentials are included. Provisioning/App Group access and physical-device testing remain required.

Add the keyboard in Settings → General → Keyboard → Keyboards → Add New Keyboard → DO. Full Access is not requested. Apple's current open-access documentation allows shared-container reads without open access, while writes/network access remain restricted. This implementation reads only from the keyboard; confirm the signed device behaviour. If unavailable, it displays an error rather than claiming a connection. Secure text fields and some host apps use the system keyboard.

## Data and permission boundaries

No native network client, provider secret, analytics, automatic clipboard reads, host-app inspection or automatic send. The containing app alone writes a released keyboard record; Share Sheet saves do not approve keyboard access. Shared JSON files use complete file protection and are excluded from backup. Drafts stay until deleted; keyboard records stop being readable after one hour but can remain on disk until removed/replaced. Deleting the source text's saved draft revokes the matching keyboard copy. The single released record may be reused until expiry/revocation; it is not a one-time send receipt.

Remaining product work: authenticated native preparation (with revocation/quotas/consent), a reviewed cloud-result return path, keyboard layout/VoiceOver/Dynamic Type/rotation testing, signed device App Group proof, physical-device Share Sheet/keyboard checks, privacy disclosures and TestFlight distribution. App Group entitlement functionality cannot be established by an unsigned compile.

Primary references:
- https://developer.apple.com/documentation/uikit/configuring-open-access-for-a-custom-keyboard
- https://developer.apple.com/documentation/uikit/handling-text-interactions-in-custom-keyboards
- https://developer.apple.com/documentation/xcode/configuring-app-groups
- https://github.com/yonaskolb/XcodeGen/blob/master/Docs/ProjectSpec.md
