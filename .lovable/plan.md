

## Onboarding Quiz — Premium Branding Overhaul

The quiz currently uses flat cards, static `star-field` background, and the old Outfit font. It needs to match the rest of the site's premium aesthetic: particle canvas, glassmorphism, neon glows, Syne/Plus Jakarta Sans fonts, and animated sparkle effects.

### Changes

**1. Add ParticleField background**
- Import and render `<ParticleField />` behind the quiz content, replacing the static `star-field` CSS class with a proper layered layout (particle canvas at z-0, content at z-10).

**2. Upgrade AssemblLogo with animated neon glow**
- Wrap the logo SVG nodes with a pulsing glow filter (`feGaussianBlur` + `feComposite`) so the triangle logo breathes with neon light.
- Add a sparkle animation on the top node (the green circle) — a small starburst SVG that fades in/out on a 3-second cycle.
- Add animated connection lines that subtly pulse in opacity.

**3. Glassmorphism cards for all option buttons**
- Replace `bg-card border-border` with the glass treatment: `rgba(14,14,26,0.7)` background, `backdrop-blur-xl`, `border border-white/[0.06]`, `rounded-2xl`.
- Add the top-edge gradient glow line (`::after` pseudo-element) using neon-green for WHO options and contextual neon colours for PAIN options.
- On hover: neon border glow (`box-shadow: 0 0 20px color/15, 0 0 60px color/08`), slight scale (`scale(1.01)`), and `translateY(-4px)`.

**4. Neon icon upgrades**
- Give each NeonIcon a subtle animated drop-shadow glow matching its colour, pulsing on a 2–3s cycle (CSS `filter: drop-shadow` with keyframe animation).
- On card hover, icons brighten (increase glow intensity).

**5. Typography update**
- Import Syne (700, 800) and Plus Jakarta Sans (300–600) via Google Fonts in `index.css`.
- Add `font-syne` and `font-jakarta` to Tailwind config.
- Apply `font-syne` to quiz headings ("Welcome to Assembl", "What best describes you?", etc.).
- Apply `font-jakarta` to body/label text.
- Brand name "ASSEMBL" rendered in Syne weight 800, tracking `3px`.

**6. CTA button upgrade**
- "Get started" button gets a gradient neon border glow on hover (green → cyan → pink blur behind the button).
- Subtle shimmer sweep animation across the button surface every 4 seconds.

**7. Results step — agent cards with premium treatment**
- Glass card with agent-colour top-edge glow.
- Agent avatar gets a subtle neon halo ring.
- "Start chatting →" pill gets the agent's neon colour as a glowing background on hover.

**8. Floating ambient orbs**
- Add 2-3 large blurred gradient orbs (like `AnimatedHero`'s `FloatingOrb`) drifting slowly behind the quiz content for atmospheric depth.

### Files to modify
- `src/index.css` — add Syne + Plus Jakarta Sans font imports
- `tailwind.config.ts` — add `font-syne`, `font-jakarta` families + sparkle/shimmer keyframes
- `src/components/OnboardingQuiz.tsx` — full restyle with glass cards, ParticleField, floating orbs, new typography, neon hover effects
- `src/components/AssemblLogo.tsx` — add animated SVG glow filter and sparkle on top node

