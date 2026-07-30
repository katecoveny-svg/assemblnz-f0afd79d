## 2026-06-25 - Standardizing Focus in Hidden Overflows
**Learning:** Tailwind's `ring` utility (using `box-shadow`) is clipped by `overflow-hidden` containers, which are common for glass-morphism and animation-ready components. Native CSS `outline` with `outline-offset` bypasses this clipping and provides better high-contrast support.
**Action:** Always use `focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring` instead of `ring` utilities for interactive elements inside `overflow-hidden` parents.

## 2026-06-25 - Interaction Parity for Delight
**Learning:** Visual delight effects (like hover lift/translation) must be mirrored in focus-visible states to ensure keyboard users receive the same high-quality sensory feedback as mouse users.
**Action:** Pair `hover:-translate-y-0.5` with `focus-visible:-translate-y-0.5` and background tint changes across all interactive modes.

## 2026-06-25 - Tactile Feedback for Lift Effects
**Learning:** Adding a subtle "lift" (e.g., -translate-y-0.5) on hover/focus is delightful, but it feels disconnected without a corresponding "press" state. Using `active:translate-y-0` provides the necessary tactile confirmation that an interaction has been triggered.
**Action:** When implementing lift animations, always include an `active:translate-y-0` state for visual click feedback.

## 2026-07-02 - Standardizing Active Press States Site-Wide
**Learning:** Adding standardized active/pressed CSS transitions (like `active:translate-y-0` and `active:scale-100`) to complex cards and quick action prompts with hover/focus lift states completes the sensory feedback loop, dramatically improving the responsiveness and tactile feel of the interface.
**Action:** Pair hover/focus lifts (such as `-translate-y-0.5` or `-translate-y-1` and hover scale boosts) with `active:translate-y-0 active:scale-100` on elements like marketing cards, prompt buttons, and concierge triggers.

## 2026-07-08 - High-Intent Checkout Form Accessibility & Polite Counters
**Learning:** High-intent interactive forms like checkout and fit-checks demand strong accessibility features. Implicit nested labels can fail screen readers and limit click-target sizing; explicit `htmlFor` and `id` associations are superior. In addition, when adding text length constraints, using a standard visual character counter is great, but screen-reader announcements can get highly annoying (verbose) if they declare the count on every keystroke. Combining visual counters with an `sr-only` polite live region that is silent until hitting a critical 90% threshold strikes the perfect utility/verbosity balance.
**Action:** Always refactor forms to use explicit `htmlFor` properties on labels. Implement character counters with a dual visual/polite live-region setup that remains silent for screen readers until the input length reaches 90% of `maxLength`.

## 2026-07-20 - Balanced Focus Styles for Highly-Styled Form Elements
**Learning:** While native CSS outlines are ideal for elements in overflow-hidden containers, they can look visually jarring or floating awkwardly when forced onto highly-styled rounded text inputs, textareas, and toggle tab buttons. Using customized, elegant focus indicators (like `focus-visible:ring-2` with ring-offsets or opacity/tint styling matching the brand) preserves premium design-system polish while fully complying with high accessibility standards.
**Action:** For highly-styled inputs and toggle tabs, design with custom focus rings/offsets instead of raw outlines to ensure visual excellence and WCAG focus compliance remain in perfect harmony.

## 2026-07-24 - Inclusive Input Validation & Interactive Form Character Limits
**Learning:** User forms that capture loose text input (such as waitlist use cases or customized API needs) benefit heavily from soft limits (1000 characters) paired with silent, polite screen reader announcements (under `aria-live="polite"`). Adding visual green asterisks matching the brand and explicit label associations with programmatically verified `aria-required` tags ensures screen readers and keyboard-only users receive perfect validation cues.
**Action:** When designing a public lead-capture waitlist form, implement programmatic `aria-required` alongside visual asterisks and use `focus-visible` selectors to ensure click-only mouse users do not get unneeded focus outlines while keyboard navigation users retain clear indicators.
