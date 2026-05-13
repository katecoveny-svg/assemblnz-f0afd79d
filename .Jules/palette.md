## 2026-05-03 - [Contact Form Accessibility]
**Learning:** The existing `Field` wrapper pattern in the site components was missing explicit `id` and `htmlFor` associations, breaking label-input connectivity for screen readers. Required fields also lacked visual and programmatic indicators.
**Action:** Always ensure `Field` wrappers or similar abstractions correctly pass and associate `id`s to their children, and provide both visual (*) and ARIA (`aria-required`) signals for required inputs.

## 2026-05-05 - [Root Layout Focus Management]
**Learning:** Implementing a "Skip to main content" link requires careful focus management. Using `tabIndex={-1}` on the target container (e.g., `<main>`) allows it to receive programmatic focus when the skip link is clicked, ensuring the next Tab press starts from the beginning of the content, while avoiding a default browser focus ring that might confuse mouse users.
**Action:** When adding skip links, always ensure the target element has an `id` and `tabIndex={-1}` to handle focus correctly across different browsers.

## 2026-05-15 - [Character Limit Transparency]
**Learning:** Enforcing character limits on long-form inputs (like textareas) without providing visual feedback creates a "dead end" for users. They may reach the limit without warning, leading to frustration. A real-time character counter, coupled with a visual warning state (e.g., color change) near the limit, transforms a silent constraint into helpful guidance.
**Action:** Always provide a real-time character counter for inputs with a `maxLength`, and use `aria-live="polite"` to ensure the update is accessible to screen reader users.

## 2026-05-20 - [Design System Color Consistency]
**Learning:** During the "Evidence Vessel" pivot, many component-level styles (like focus rings or success states) were still using the old "Soft Gold" tokens instead of the primary "Pounamu" green. This creates visual inconsistency in high-intent areas like forms.
**Action:** Always cross-reference component-level inline styles or CSS with `globals.css` and `tailwind.config.ts` during theme pivots to ensure primary interaction colors (focus, success) are updated to the current brand primary.

## 2026-05-25 - [Interactive Element Focus Contrast]
**Learning:** Using "Soft Gold" for interactive focus indicators often provides insufficient contrast against the "Paper" background, making keyboard navigation difficult. The "Pounamu" green is the intended primary accent for high-intent areas and provides the necessary visual weight for accessibility.
**Action:** Ensure all interactive elements (buttons, inputs) use `var(--assembl-pounamu)` or the `ring` variable for focus-visible states to maintain brand consistency and accessibility standards.

## 2026-06-05 - [Global Focus and Navigation Active States]
**Learning:** Standardizing focus visibility and active navigation states significantly improves the "quiet intelligence" feel of the UI. Applying `aria-current="page"` and visual active styles in the `SiteHeader` provides critical orientation context for all users, while global `@apply` rules for focus rings in `globals.css` ensure consistent, brand-aligned keyboard accessibility across all interactive components.
**Action:** Use `usePathname` in navigation components to provide clear visual and ARIA signals for active routes, and always consolidate focus ring logic in global styles for design system consistency.

## 2026-06-12 - [High-Intent Contrast and Footer A11y]
**Learning:** High-intent visual indicators like scroll progress bars and footer navigation often fall into the "secondary detail" trap, using low-contrast tokens like "Soft Gold" (~2.2:1 contrast). Switching to the primary "Pounamu" green (5.8:1 contrast) and applying standardized `focus-visible` rings with proper offsets ensures these elements are both brand-aligned and accessible to all users.
**Action:** Always use primary interaction colors (Pounamu) for status indicators and ensure all footer links have explicit focus-visible states and rounded corners to match the site-wide navigation pattern.

## 2026-06-15 - [Interaction Parity and Focus Visibility]
**Learning:** Forgetting to mirror hover effects (like scaling or color shifts) on keyboard focus creates a second-class experience for accessibility users. Furthermore, elements with `overflow-hidden` (common for card designs) will clip standard focus rings.
**Action:** Use `group-focus-visible` on child elements to mirror hover delight for keyboard users, and always apply a `ring-offset-4` on focus rings for `overflow-hidden` containers to ensure the indicator is fully visible.
