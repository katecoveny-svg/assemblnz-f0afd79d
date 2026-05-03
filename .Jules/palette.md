## 2026-05-03 - [Contact Form Accessibility]
**Learning:** The existing `Field` wrapper pattern in the site components was missing explicit `id` and `htmlFor` associations, breaking label-input connectivity for screen readers. Required fields also lacked visual and programmatic indicators.
**Action:** Always ensure `Field` wrappers or similar abstractions correctly pass and associate `id`s to their children, and provide both visual (*) and ARIA (`aria-required`) signals for required inputs.
