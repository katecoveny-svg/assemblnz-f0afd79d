## 2026-06-25 - Standardizing Focus in Hidden Overflows
**Learning:** Tailwind's `ring` utility (using `box-shadow`) is clipped by `overflow-hidden` containers, which are common for glass-morphism and animation-ready components. Native CSS `outline` with `outline-offset` bypasses this clipping and provides better high-contrast support.
**Action:** Always use `focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring` instead of `ring` utilities for interactive elements inside `overflow-hidden` parents.

## 2026-06-25 - Interaction Parity for Delight
**Learning:** Visual delight effects (like hover lift/translation) must be mirrored in focus-visible states to ensure keyboard users receive the same high-quality sensory feedback as mouse users.
**Action:** Pair `hover:-translate-y-0.5` with `focus-visible:-translate-y-0.5` and background tint changes across all interactive modes.

## 2026-06-25 - Tactile Feedback for Lift Effects
**Learning:** Adding a subtle "lift" (e.g., -translate-y-0.5) on hover/focus is delightful, but it feels disconnected without a corresponding "press" state. Using `active:translate-y-0` provides the necessary tactile confirmation that an interaction has been triggered.
**Action:** When implementing lift animations, always include an `active:translate-y-0` state for visual click feedback.
