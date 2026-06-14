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

## 2026-06-18 - [OS-Aware Keyboard Shortcuts]
**Learning:** Hard-coding keyboard shortcut hints (like "press ⌘K") creates friction for non-Mac users. Implementing simple client-side OS detection ensures that Windows and Linux users see the appropriate hint (e.g., "CTRL K"), making the command palette more discoverable and intuitive for everyone.
**Action:** Use `navigator.platform` in a `useEffect` to detect the OS and display appropriate keyboard shortcut hints in the UI.

## 2026-06-25 - [Actionable Command Palette Interaction]
**Learning:** Command palettes can feel disconnected if they lack entrance/exit animations and clear "actionability" hints. Adding subtle `tailwindcss-animate` transitions (fade/zoom) and a contextual "Press ↵" hint on the selected item makes the tool feel more responsive and intuitive, especially for keyboard-heavy workflows.
**Action:** Always include entrance/exit animations for modal overlays and provide explicit keyboard hints for the primary action on list-based interactive elements.

## 2026-06-28 - [Visual Anchoring and Dynamic State Feedback]
**Learning:** Improving selection visibility in list components (like `CommandPalette`) requires more than just a ring; a tinted background (`bg-assembl-pounamu/10`) provides a clear visual anchor. Furthermore, dynamic `title` and `aria-label` updates (e.g., "Reference copied") are crucial for providing state-specific feedback that maintains parity for both sighted and screen-reader users.
**Action:** Use brand-aligned tints for list selection states and ensure modal/dialog triggers have `aria-haspopup="dialog"`. Always use dynamic titles/labels for contextual feedback after successful user actions.

## 2026-06-30 - [High-Intent Indicators and Focus Parity]
**Learning:** Secondary tokens like "Soft Gold" (~2.2:1 contrast) fail accessibility standards for high-intent signals like the required asterisk (*) in forms. Furthermore, keyboard users miss out on UI "delight" if hover-triggered elevation or scaling isn't mirrored on focus. Finally, containers with `overflow-hidden` clip standard `ring` indicators.
**Action:** Use the primary "Pounamu" green (5.8:1 contrast) for all high-intent indicators including form required markers. Mirror all hover-lift and scale effects in `focus-within` or `focus-visible` states, and use `outline` with an offset for focus rings on `overflow-hidden` containers to prevent clipping.

## 2026-07-05 - [Real-time Chat Accessibility]
**Learning:** Interactive guide or concierge widgets that dynamically update with agent responses are invisible to screen readers unless the message container is explicitly marked as a live region.
**Action:** Always apply `aria-live="polite"` to containers where new chat messages or status updates are appended to ensure parity for non-sighted users.

## 2026-07-10 - [Mobile Internationalization Parity]
**Learning:** Components like language toggles are often hidden on mobile to save space, but this creates a "functional dead-end" for users needing different locales on the go. Furthermore, compact toggles designed for mouse-precision (e.g., 10-11px text) require explicit minimum touch target overrides to remain usable on touchscreens.
**Action:** Ensure locale-switching controls maintain parity across all breakpoints and apply explicit `min-h-[32px]` or `min-w-[44px]` overrides for touch targets in compact UI elements.

## 2026-07-15 - [Threshold-Based Counter Accessibility]
**Learning:** Real-time character counters are vital for UX but can be extremely noisy for screen reader users if every keystroke triggers an announcement. For high-limit inputs (e.g., 4000 characters), persistent live updates are more distracting than helpful.
**Action:** Use a "threshold-based" announcement pattern: hide the visual counter from ARIA and use a separate `sr-only` live region that only starts announcing the count once a significant threshold (e.g., 90%) is reached.
