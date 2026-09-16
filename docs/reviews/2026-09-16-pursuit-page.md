# Pursuit page refresh

## Scope and evidence

Route: `/pursuit`.
Audience: teams researching an opportunity and preparing a credible client conversation.

The user supplied a narrow-mobile screenshot with the bird backdrop and an unreadably dark heading. Current browser inspection confirmed the page then moved into a plain three-step list and engagement section. The hosted hub destination is preserved from `lib/product-destinations.ts`; this pass did not authenticate into or verify the hosted hub's private workflows.

## Implemented

- Dedicated, responsive Pursuit landing page. No nature/bird background.
- Existing headline preserved, set in light Instrument Sans with explicit high-contrast colours.
- Plum/rose visual system through hero, process, connected products, engagement and footer.
- Interactive research → opportunity → brief example. Brief is editable in page state; nothing sent, saved remotely or represented as a real client finding.
- Existing hub and contact destinations retained. Correct absolute page title removes duplicate assembl.
- Keyboard-operable stage controls and visual pause; reduced-motion CSS disables decorative animations.

## Verification

- Desktop render inspected; 375px and 319px mobile layouts inspected.
- Heading computed colour rgb(255,244,246), weight 400. Document width matched each tested viewport.
- Found and fixed a hidden-overflow focus bug that shifted the hero horizontally. Hero now uses clip; after focusing controls, scrollLeft remained 0 and the text area remained inside the viewport.
- Editing the brief, changing stages and returning preserved the edit.
- Keyboard Tab followed by Space selected Opportunity.
- Pause changed to Resume; full lower-page scroll inspected.
- Scoped ESLint, TypeScript and full production build passed.

Limitations: no physical-device performance test or complete accessibility certification; reduced-motion rule inspected but OS preference not toggled. Hosted workspace sign-in and provider execution are outside this public-page verification.

## Copy gate

The page says what visitors can do: research an opportunity, shape a concept and prepare a conversation. It does not claim live signals in the example or automatic outreach. The sprint is a scoped engagement; private hub access and connections remain explicitly agreed setup.
