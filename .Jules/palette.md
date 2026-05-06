## 2026-05-03 - [Contact Form Accessibility]
**Learning:** The existing `Field` wrapper pattern in the site components was missing explicit `id` and `htmlFor` associations, breaking label-input connectivity for screen readers. Required fields also lacked visual and programmatic indicators.
**Action:** Always ensure `Field` wrappers or similar abstractions correctly pass and associate `id`s to their children, and provide both visual (*) and ARIA (`aria-required`) signals for required inputs.

## 2026-05-05 - [Root Layout Focus Management]
**Learning:** Implementing a "Skip to main content" link requires careful focus management. Using `tabIndex={-1}` on the target container (e.g., `<main>`) allows it to receive programmatic focus when the skip link is clicked, ensuring the next Tab press starts from the beginning of the content, while avoiding a default browser focus ring that might confuse mouse users.
**Action:** When adding skip links, always ensure the target element has an `id` and `tabIndex={-1}` to handle focus correctly across different browsers.

## 2026-05-15 - [Character Limit Transparency]
**Learning:** Enforcing character limits on long-form inputs (like textareas) without providing visual feedback creates a "dead end" for users. They may reach the limit without warning, leading to frustration. A real-time character counter, coupled with a visual warning state (e.g., color change) near the limit, transforms a silent constraint into helpful guidance.
**Action:** Always provide a real-time character counter for inputs with a `maxLength`, and use `aria-live="polite"` to ensure the update is accessible to screen reader users.
