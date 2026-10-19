# Homepage CI repair — 19 October 2026

The public homepage already uses Direction4cHome. Browser jobs still expected the retired scene headline, chapter controls and inner header, causing a null-parent failure before meaningful checks ran. This repair changes test expectations, not the approved homepage.

The boundary matrix retains all seven viewport sizes in both motion modes, overflow and touch-target checks, and real assistant open/close/focus assertions. It now verifies the coastal poster/video, ready renderer, keyboard pause, reduced-motion state and actual DO entry links. The shared Python proof replaces obsolete homepage assertions in immersive and Pursuit reviews; Pursuit's walkthrough, historical evidence, no-research-submit checks, Studio gallery and no-JavaScript checks remain. Command navigation still verifies destination content/canonical URLs, keyboard focus, filtering, dismissal races and redirects; its homepage signature and motion controls now match the coastal page. Workflow path filters include the current implementation and shared proof helper.

Both `/preview/the-work` and `/living/shop` exclusions are retained in the public assistant router. Explicit positive and negative boundary cases prevent accidental suppression of `/living`, Space Studio, `/living-site` and lookalike paths. Main's #1620 context record and the homepage preview record coexist.

Local proof: 14 homepage boundary cases, immersive review (four routes at desktop/375px plus reduced/no-JavaScript), Pursuit walkthrough across desktop/375px and both motion modes, and command navigation at desktop/375px passed. Focused PR1614 checks: 43 tests. Browser proof blocks external mutations and does not establish production deployment.

## Desktop command close follow-up

The final #1614 Immersive log at candidate `439f0eda1` identified the Close-button dismissal immediately after Meta+K opening (`review-public-command.cjs`, formerly line 119). The dialog remained `data-state=open`; this was not a focus-restoration timeout.

A bounded native-animation reproduction captured the defect: at 1440px, Close moved from x=1364.05 (width 41.80) to x=1019 (width 44) during entrance, shifting its centre by −343.95px. A pointer press begun on Close and released after entrance missed the control and left the palette open. Desktop `translateX(-50%)` centering was missing from the zoom keyframes.

The repair supplies matching responsive −50% entrance/exit offsets, retaining existing zoom, fade, mobile layout, dismissal and focus semantics. The browser regression captures the actual native `enter` animation as the dialog mounts, pauses its first frame, presses Close, finishes the animation and releases at the same pointer coordinates. It requires a captured animation, retained pointer target, actual dismissal and restored initiating focus at 375px and 1440px. Existing keyboard, selection, redirect, reduced-motion and deferred-focus race coverage remains in place; no retry or timeout extension was introduced.

An independent read-only reviewer checked the implementation and regression, including protection against passing without capturing an animation. No remaining code-review findings were identified; production browser proof is recorded with the pushed follow-up.

Validation: production build and TypeScript passed; 34 focused command/route tests and scoped CommandPalette lint passed. The complete production browser proof passed at 375px and 1440px, including captured entrance pointer dismissal, all five destinations, keyboard/dismissal, deferred-focus races, redirect hydration and reduced motion, with no page errors. Desktop entrance Close centre shift is now +16.05px within the 44px target instead of −343.95px. Evidence: `output/playwright/command-dismissal-repair/results.json` and accompanying screenshots (local; the workflow uploads corresponding CI evidence).
