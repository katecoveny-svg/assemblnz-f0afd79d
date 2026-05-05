## 2026-05-03 - [Contact Form Accessibility]
**Learning:** The existing `Field` wrapper pattern in the site components was missing explicit `id` and `htmlFor` associations, breaking label-input connectivity for screen readers. Required fields also lacked visual and programmatic indicators.
**Action:** Always ensure `Field` wrappers or similar abstractions correctly pass and associate `id`s to their children, and provide both visual (*) and ARIA (`aria-required`) signals for required inputs.

## 2026-05-05 - [Root Layout Focus Management]
**Learning:** Implementing a "Skip to main content" link requires careful focus management. Using `tabIndex={-1}` on the target container (e.g., `<main>`) allows it to receive programmatic focus when the skip link is clicked, ensuring the next Tab press starts from the beginning of the content, while avoiding a default browser focus ring that might confuse mouse users.
**Action:** When adding skip links, always ensure the target element has an `id` and `tabIndex={-1}` to handle focus correctly across different browsers.
