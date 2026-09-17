# Immersive public site / browser review

Date: 18 September 2026, New Zealand time.

## First implementation: verified

PR #1358 added the living atelier experience and was merged by a separate repository action while its visual review was still running. That merge was not invoked by the assistant performing the visual review. Do not treat a draft label as an enforced branch protection.

The proposed-build review subsequently passed:

- Source head: `f3f70dc1be70084e1ff8c008b87f6ee57abcd4ec`.
- GitHub Actions run: `35277238040`, job `105390680870`.
- Artifact: `immersive-browser-proposed`, ID `10520789514`.
- Typecheck, targeted public tests, ESLint and production build with existing guards: passed.
- Chromium at 1440 × 1000 and 375 × 812: all four public pages returned 200; no horizontal page overflow or unhandled page errors.
- Home, Pursuit and Studio: one primary navigation each.
- Scene chapter, living-brief buttons, keyboard range slider, pointer hover and exact workspace links: passed.
- Studio selector, user-initiated video and identity selection: passed.
- Reduced-motion and JavaScript-disabled 375px views retained visible content and workspace links.

## Visual polish identified from the screenshots

The first capture set includes 27 screenshots. Visual inspection found issues that functional assertions alone did not catch:

1. The mobile living-brief card can grow over its fixed-bottom slider label. Move the mobile card and control into normal document flow rather than rely on a taller fixed container.
2. Desktop chapter labels need their own darker translucent backing over the bright atelier floor.
3. Gallery captures need to wait for the newly selected image to decode; a changed caption does not prove the corresponding image is ready.

The focused follow-up changes those two CSS rules and adds image-decoding and card/control-separation assertions. Its results must be recorded after the new run; the original passing run is not evidence for untested follow-up code.

## Boundaries

Browser captures run the built application, not a static mockup. They use anonymous reads only and do not sign in, send messages, publish assets, connect providers or submit forms. Existing Pursuit `/studios` and Creative Studio `/agency` links are checked for exact destinations; authenticated membership and post-login behaviour are not verified.

Chromium mobile emulation is not a physical-iPhone or Safari performance certification. No frame-rate, conversion or business-impact claim is made. Existing client data, authentication, billing and production credentials were not modified by this design work.
