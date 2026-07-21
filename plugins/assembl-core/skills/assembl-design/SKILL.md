---
name: assembl-design
description: Design constitution for assembl (Kate's agentic customer journey platform). Single source of truth for every interface, animation, and customer experience under the assembl brand. Use whenever producing ANY visual, written, or interface work for assembl — websites, marketing pages, decks, mockups, dashboards, design critiques, copy, component design, or Claude Code prompts about assembl's look and feel. Trigger on "assembl", "minute one", "Business Genome", "agentic customer journey", or any request to design, redesign, style, critique, or review something for this brand, even without the word "design". Defines naming rules, colour system, materials, typography, motion/3D language, components, wait states, agent visibility, proof design, page structure, and what to avoid (glowing AI clichés, cartoon robots, canary yellow, enterprise-dashboard feel).
---

# assembl Design Constitution

This is the single source of truth for every interface, animation, and customer experience in assembl. If an implementation requirement conflicts with this document, stop and reconsider the design before adding more UI. Read the whole file before producing assembl work.

**The goal is not another SaaS dashboard. The goal is the world's first premium Agentic Customer Experience Platform.**

## 0. Naming Rule (non-negotiable)

Always write the brand as lowercase **assembl** — no capital "A," no trailing "e" — in body copy, headings, code, file names, everything. Sub-brands follow suit, e.g. **assembl / minute one**. Fix this before outputting anything.

## 1. Core Principle

assembl should never feel like software. It should feel like entering a beautifully designed space where work quietly assembles itself around the customer.

- Every interaction reduces cognitive effort.
- Every screen creates confidence.
- Every animation communicates progress.
- Nothing exists purely for decoration.

## 2. Emotional Goal

- The customer should feel: *"I don't need to think so hard."*
- The business should feel: *"My customers are finally understood."*
- The operator should feel: *"I can see exactly what is happening."*

## 3. The Visual Metaphor: Assembly

Everything in assembl is assembling — intent, knowledge, journeys, agents, recommendations, confidence, proof. Nothing suddenly appears; everything gradually becomes more complete. If a piece of motion or imagery can't be explained as "this is becoming more complete," cut it.

## 4. Design References

Sit somewhere between: Apple Human Interface, Notion, Linear, Raycast, Arc Browser, Pitch, Vercel, Stripe, Monograph, editorial magazine layouts, high-end architectural photography, art galleries, luxury museum wayfinding, Swiss editorial design, fashion editorials.

**Explicitly not:** enterprise dashboards, Salesforce, generic AI products, cyberpunk, glowing gradients, neon.

## 5. Visual Personality

Elegant · calm · intelligent · confident · minimal · warm · invisible · human · premium · quietly magical.

**Design goal:** the interface should disappear. Customers think about their goal, not the software.

## 6. Colour System

| Role | Tone |
|---|---|
| Primary background | Paper white |
| Secondary surfaces | Very light warm grey |
| Depth | Soft graphite |
| Accent | Pale sea-glass blue |
| Supporting | Soft sage, muted stone, cloud grey |
| Chrome | Brushed silver — **never** polished mirror chrome |

Typography stays black or dark graphite. No saturated colours, no canary yellow, no bright AI blues, no purple gradients, no rainbow accents.

## 7. Materials & Light

Surfaces should feel like paper, ceramic, frosted glass, soft aluminium, linen, light. Avoid plastic, heavy shadows, glassmorphism, floating neon cards.

Everything is lit by soft natural daylight — never dramatic spotlights, never dark mode by default. Light creates depth, not shadows.

## 8. Typography

Typography carries the interface. Prefer hierarchy through weight, spacing, scale, alignment — not colour. Avoid excessive font weights and ALL CAPS (except subtle labels). The interface should feel editorial, not corporate.

## 9. Layout Philosophy & Grid

Whitespace is functionality: large margins, comfortable spacing, clear reading rhythm. Every page should breathe — never fill space; empty space communicates confidence.

Use a disciplined layout grid: strong alignment, consistent rhythm, generous spacing. Avoid arbitrary positioning — every component should feel intentionally placed.

## 10. Interaction Philosophy

Never overwhelm the user. Ask only one meaningful thing at a time. Use progressive disclosure — reveal complexity only when needed. The journey should feel conversational without becoming chat-first.

## 11. Motion Philosophy & Animation Language

Motion communicates work, never entertainment. Examples: intent becomes structure, context expands, recommendations assemble, journey progresses, proof resolves. Nothing should simply fade in — everything should feel like information taking shape.

**Preferred motion:** particle assembly, soft morphing, fluid positioning, weightless transitions, slow materialisation, subtle depth.

**Avoid:** spinning loaders, bouncing elements, parallax, dramatic easing, flashy transitions, attention-seeking animation.

Motion should feel inevitable.

## 12. 3D Language

3D should be abstract. Never literal robots, AI brains, holograms, or floating hexagons.

**Preferred forms:** soft chrome geometry, porcelain objects, glass volumes, smooth rounded blocks, modular architectural pieces, gentle particles, abstract landscapes. Everything should feel manufacturable — like industrial design.

## 13. Illustration & Icons

Illustration: avoid cartoon illustrations and stock vectors; feel editorial, architectural, minimal, abstract, beautiful.

Icons: simple, monoline, consistent stroke, small, supportive — never decorative.

## 14. Data Visualisation

Data should feel calm: simple charts, minimal colour, large typography, editorial spacing. Avoid noisy dashboards — every graph should answer one question.

## 15. Components

**Cards** feel like printed objects placed on a table, not floating software panels — rounded corners, soft depth, generous padding, no heavy borders.

**Buttons** feel quiet and tactile, not glossy. Avoid oversized CTAs.
- Primary: dark graphite
- Secondary: light grey
- Destructive: muted red

## 16. Customer Journey

The journey is the product. Every journey feels continuous — customers never feel like they changed applications. Transitions carry context forward; the system remembers; the customer never repeats themselves.

## 17. Wait States Are a Feature

Never show "Loading...". Instead: show progress, show understanding, show preparation, show recommendations assembling, show confidence increasing. Waiting should feel productive.

## 18. AI Visibility & Agent Visibility

AI should not be hidden, but should not dominate. The customer should understand what is happening, why, what the system knows, what assumptions were made, and what requires approval. Transparency builds trust.

Customers do not need to see every internal agent; operators do. Two modes:
- **Customer View** — beautiful, minimal, focused.
- **Journey View** (operator) — shows active agent, current stage, selected context, permissions, tools, proposed actions, evidence, proof.

## 19. The Business Genome

Invisible to customers — it quietly shapes every experience. Never expose its complexity unnecessarily.

## 20. Proof

Proof is beautiful, and should not resemble analytics software. Instead it should feel like a certificate, a flight log, a premium report, an engineer's inspection. It should create trust.

## 21. Page Structure

Every page follows a similar rhythm: large hero statement → small explanation → primary interaction → supporting information → evidence → next action. Never begin with navigation — begin with purpose.

## 22. Empty & Error States

**Empty states** inspire — never apologise, never blame the user, guide naturally.

**Error states** feel calm and explain: what happened, what was affected, what the customer can do next. Never expose technical language.

## 23. Accessibility & Performance

Accessibility is part of premium design: keyboard-first, reduced-motion support, high contrast, large click targets, clear focus states, readable typography. Every animation should degrade gracefully.

The interface should feel immediate — animations never delay work. Perceived speed matters more than visual complexity. Prefer removing UI over optimising unnecessary UI.

## 24. The Design Test

Every screen should pass these questions:
1. Can someone understand the purpose in three seconds?
2. Can they identify the next action immediately?
3. Does the page feel calmer than the software it replaces?
4. Would this still feel premium if every animation were removed?
5. Is there anything on screen that exists only because software usually has it? **If yes — remove it.**

## 25. The Assembl Standard

Every design decision should move toward one goal: create the calmest, most trustworthy, and most beautiful agentic customer journey platform in the world. Software should disappear. Confidence should remain.

## When Producing Output

1. Check §0 (naming) and §3 (metaphor) first — the easiest slips.
2. Match the colour system (§6), materials/light (§7), and typography (§8) exactly — no "close enough" substitutes, no saturated colour, no dark mode by default.
3. For anything with motion or a loading/processing state, apply §11 and §17 before defaulting to a spinner or generic animation.
4. For any 3D or illustrative asset, check §12–13 — abstract and manufacturable, never literal robots/AI iconography.
5. Before finalizing, run the output through §24's five questions. If something exists only because software usually has it, remove it.
6. If touching the live assembl site specifically, default to preserving current look and feel — refine rather than fully redesign — unless explicitly asked for a redesign.
