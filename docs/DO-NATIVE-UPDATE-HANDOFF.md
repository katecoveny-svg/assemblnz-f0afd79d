# Single DO installed-update handoff

Prepared update only. The running installed app remains `/Users/kateharland/do-install/mac-out/DO.app`, bundle `nz.co.assembl.do.companion`, version 0.3.0. The prepared companion uses the same bundle identifier, version 0.4.0, and macOS 13 minimum. Download version 1.7.0 names the source/extension archive, not the native app version.

## Package and acceptance

Use only the exact reviewed commit's `DO-development-arm64-not-notarised` CI artifact for this Apple silicon Mac. Record its artifact ID, archive SHA256, extracted executable architecture, bundle version and successful strict ad-hoc signature verification before replacement. Do not substitute another build or the source ZIP. The source ZIP requires compilation and is not an installer. Both architecture builds, existing native fixtures and static/API/source download parity must pass first.

Accepted artwork is the seven-file native/extension export reviewed in Library `libfile_76f0d5f623f48191a150c556c9a1f962` v0. Exact unchanged SwiftUI orb and menu-image geometry at 1×/2×, rebuilt/decoded ICNS and hashes are in `libfile_6523b1da7644819188a5cc005e27bcb7` v0. Native PNGs are opaque, including the approved pale tile. The 1024px ICNS representation is upscaled from the approved512px source. This is offscreen evidence, not installed Finder/status-bar/keyboard/picker testing.

## Before closing the one running DO

Kate must finish or manually keep any unsent native review, editor draft, recording and open work somewhere she chooses. The native-v1 review editor is transient: acceptance into the editor is not saved or synced. Closing can lose unsent work; this update does not migrate an existing in-memory session. Do not inspect or export her drafts automatically. Stop any user-started recording through its normal visible control first.

Close/reopen is required to load a changed executable and native icon resources. After Kate agrees to a convenient window and confirms her work is kept, quit the existing app normally; confirm that process has exited. Never force-kill it or open a competing review copy. Preserve the exact original app as a rollback copy outside the installed target, without launching the backup. Replace only the existing app at its existing path, then open that path once.

Preserve the bundle identifier, installed path, WebKit data, UserDefaults, orb preferences, login association and existing OS privacy settings. Do not uninstall, reset storage/TCC, modify the Chrome extension, recreate the PWA shortcut, or change launch-at-login as part of this update. Chrome, WebKit and the PWA retain separate sessions and grants. Existing login may need ordinary sign-in if WebKit has no valid session; this is not a token migration.

## Prompts and first run

No new permission or legal consent is requested merely by opening this update. The build remains ad-hoc signed and not Apple-notarised: macOS may block it or display a security confirmation. Stop at any unexpected security/permission prompt; do not remove quarantine, bypass Gatekeeper or change privacy settings.

The action menu reads no context. Selection/paste checks existing Accessibility permission; a grant requires the separately labelled Enable app interaction action and is outside this update. Screenshot/photo opens the existing Look flow; no screen capture is linked. The explicit image picker may show the ordinary file-selection dialog, not camera or Screen Recording consent. Voice/meetings may request microphone access only when deliberately started; do not start them during update verification. Provider preparation still requires its separate named OpenAI/TypeSafe review consent and may incur existing API charges; do not prepare/send during this review.

## Controlled verification and rollback

With one running updated app, confirm its exact path/version/process, menu/orb identity, drag position and normal workspace opening. Check recipient without reading private content; an unavailable session must show signed-out/offline/version status truthfully. Live keyboard/Accessibility, file-picker cancel and generated image-fixture tests still need the coordinated review window; no new OS grants are implied. Do not claim universal phone control, background service or cross-device durable persistence.

If the update fails, quit the updated app normally after keeping any new unsent work, restore the exact preserved0.3.0 app to the same path and launch it once. Do not reset user data, grants or login items. Re-check the single process and original version. A source revert alone does not roll back an installed executable.

Beyond a convenient close/reopen, release needs exact CI package/hash reconciliation and root review; actual keyboard/picker checks need coordinated interaction. Developer ID signing/notarisation, automatic updater, live provider testing, new OS grants and durable phone-to-desktop persistence are separate work, not requirements silently added to this update.
