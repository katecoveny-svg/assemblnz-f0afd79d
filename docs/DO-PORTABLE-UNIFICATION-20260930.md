# One DO across portable surfaces · 30 September 2026

## This change

Extends the existing shared companion in `apps/do/shared/distribution.ts`; it does not create another agent or import the unmerged native application.

- On `/do/personal`, tapping the movable glowing D focuses `#personal-assistant-input` (with the existing primary-input/life-admin fallbacks). No second writing workspace loads.
- On `/do/widget`, the same action returns to the mounted writing editor via `assembl:do-focus`; the existing draft survives the mode switch.
- On other pages, the current movable context-review panel remains available. A previously opened panel and its draft are retained when moving between routes; tapping the D on the personal route hides it and focuses the existing assistant.
- The compact mark retains the canonical D + luminous inner dot. Dragging remains limited to the launcher/handle, with Alt + arrows for the launcher and arrows for the workspace. Dragging never captures page text or starts work.
- The stable PWA identity `/do` now starts at `/do/personal`; the writing workspace remains a shortcut. Existing installations may need the browser's normal manifest refresh. The install guide opens the same assistant.
- The extension is generated from the exact web companion; its downloadable ZIP is refreshed without new permissions.

## Current feature map

These are source/verification findings, not a claim of a new production deploy.

| Surface | What exists | Remaining boundary |
|---|---|---|
| Personal web DO | Shared authenticated web identity, local/task preparation, voice entry and reviewed work | Current PR must pass combined checks and be deployed; live-provider proof is separate |
| Installable PWA | DO manifest, home-screen launch, scoped network-first service worker and explicit share intake | OS/browser install support varies; this is not a native iPhone binary; DO phone notifications are not connected |
| Portable web D | Movable launcher and review panel, touch/keyboard movement, viewport clamping, explicit selected/pointed context | Limited to the webpage; cannot float above unrelated phone apps |
| Chrome extension | MV3 toolbar/side panel, explicitly injected floating D, reviewed bounded selection handoff and browser popout | Unpacked installation; no store publication established; browser popout is not a native always-on-top window |
| Mac companion | Native floating source, reviewed accessibility capture/paste, positioning | No notarised public app; Apple toolchain, signing and device validation remain separate |
| iPhone app PR #1417 | SwiftUI local drafts, UIKit keyboard, Share Sheet, WidgetKit, XcodeGen, XCTest | Separate open conflicted PR, not merged into this change; no native model/auth client or signed release |
| Android | Hardened offline draft-helper source: explicit paste, exact-text review, session-bound insertion and fixed web handoff; historical widget scaffold remains | No complete Gradle project, native preparation bridge, build or release proof. Widget placeholder counts are not live status |

## Android safety correction

The audit found implicit clipboard fallback, an obsolete API submission and a fabricated success-like placeholder in the historical IME. The mobile task now removes all three, plus the IME network permission and nonexistent settings activity. Literal clipboard text is read only after **Paste to review**; a separate checkbox and insertion tap are required. Field/selection/lifecycle changes clear the in-memory draft and review, and password/private fields disable the helper. **Open DO** transfers no text and **Other keyboard** exposes the system keyboard picker. No new network, overlay, storage or account permissions were added. Five source-contract tests cover these boundaries. No Kotlin/Gradle/Android SDK toolchain is available here, so compilation and device testing remain unperformed.

## Native iPhone evidence

Audit reference: [PR #1417](https://github.com/katecoveny-svg/assemblnz-f0afd79d/pull/1417), head `6a2db9e4032387712132a2253cbdb5b54e2d2689`, observed 30 Sep 2026. It is **open and not draft**, with GitHub reporting merge conflicts. Its latest [iPhone development workflow](https://github.com/katecoveny-svg/assemblnz-f0afd79d/actions/runs/36589065017), DO core validation, context-health check and Vercel status succeeded. Passing compilation and store tests are not physical-device or signed App Group proof.

Reviewed code provides:

- Up to 20 local drafts, complete file protection and exclusion from backup.
- Explicit local-only clipboard handoff, expiring in two minutes, to the existing HTTPS writing workspace. No text is automatically sent to a model.
- Exactly one explicitly reviewed keyboard record, with a one-hour lifetime. Keyboard reads are read-only; insertion rechecks record identity/expiry/revocation.
- Share Sheet receives one selected text/URL item and saves it locally; saving does not release it to the keyboard.
- Home-screen widget reveals local draft availability, never draft text or fictional approval counts.
- No native cloud-preparation client, identity/preferences sync, push delivery or background screen reading.

### Required next work for a real installable app

1. Resolve the native PR against current main in a separate controlled integration, preserving new personal DO rather than copying the complete branch indiscriminately.
2. Validate on a current distribution-capable Apple toolchain. The existing recorded simulator run used Xcode 16.4; [Apple's current upload requirements](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds) list Xcode 26 or later for iOS builds. The workflow presently selects the runner default rather than pinning the validated Xcode version.
3. On an authorised Mac, select the user's Apple development team for app, keyboard, share and widget targets; provision the matching bundle IDs and `group.co.assembl.do` App Group. No credentials or new access were created in this task.
4. Prove the signed-device App Group path, Share Sheet round trip, field/selection-change invalidation, secure-field/host-app keyboard fallback, expiry/revocation, rotation, Dynamic Type and VoiceOver.
5. Implement an authenticated, consent-bound native preparation/result bridge if native cloud DO is required. Existing local-only text and approval records must not be treated as cloud authority.
6. With explicit distribution authority, prepare App Store Connect record/privacy disclosures, sign/archive, upload, and complete TestFlight processing/review. No TestFlight URL, signed IPA or App Store release is currently established.

### Platform limits, from primary documentation

- [Apple custom keyboard guidance](https://developer.apple.com/documentation/uikit/creating-a-custom-keyboard): users enable an extension in Settings and hosts can restrict where it is available.
- [Apple open-access guidance](https://developer.apple.com/documentation/uikit/configuring-open-access-for-a-custom-keyboard): without Full Access, the keyboard cannot use the network or write the containing app's shared container, but read-only shared-container access is permitted. This supports the current design but does not replace signed-device testing.
- [Apple keyboard drawing boundary](https://developer.apple.com/library/archive/documentation/General/Conceptual/ExtensibilityPG/CustomKeyboard.html): a custom keyboard draws only within its keyboard view. Its keyboard extension is not a freely movable iPhone overlay.
- [Apple shared data](https://developer.apple.com/documentation/technologyoverviews/shared-data): apps/extensions share via configured App Groups. This is scoped shared storage, not access to other apps' screens or data.
- [WebKit Home Screen web apps](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/): web push is an opt-in Home Screen web-app capability. The presence of a PWA manifest does not connect notification delivery.
- [Android overlays](https://developer.android.com/reference/android/view/WindowManager.LayoutParams#TYPE_APPLICATION_OVERLAY): Android has a separately permissioned native overlay API. No such implementation or permission has been added to DO. A web D should not be marketed as a system overlay.

## Verification

Passed locally:

- 38 focused tests across floating companion, PWA manifest, downloadable package parity and Android IME source safety. Android checks are static source contracts, not Kotlin compilation.
- Full TypeScript no-emit check, changed TypeScript/TSX ESLint, browser-script syntax, diff check, brand and macron guards.
- Generated source is byte-for-byte identical between web generation and the extension; ZIP/source/API parity test passes. No manifest permissions changed.

`scripts/review-do-portable.cjs` adds browser regression coverage for repeated same-assistant activation, touch drag, ordinary touch page scrolling, keyboard movement, mobile viewport/soft-keyboard clamping, reviewed context, SPA navigation and reduced motion. All requests are intercepted with fictional DOM. It uses `ASSEMBL_PLAYWRIGHT_MODULE`, `ASSEMBL_CHROMIUM_PATH` and `ASSEMBL_REVIEW_OUTPUT`; no application server is required.

Local Chromium launch was blocked by this execution environment's socket permission restriction, including the authorised escalation attempt. Therefore the new browser script has not yet established a local pass; CI must run it and the actual integrated personal page needs visual proof. No physical phone was tested here.

Rollback: revert these scoped companion/manifest/entry-link changes and regenerate the extension ZIP. No schema, permission, account, signing or production state changes are included.
