# Assembl Brand Guidelines

**Version 1.0 | March 2026**
**Confidential — Internal & Agency Use Only**

---

## Table of Contents

1. [Brand Essence](#1-brand-essence)
2. [Visual Identity](#2-visual-identity)
3. [Typography](#3-typography)
4. [Logo Usage](#4-logo-usage)
5. [Tone of Voice](#5-tone-of-voice)
6. [Agent Naming Convention](#6-agent-naming-convention)
7. [Social Media Guidelines](#7-social-media-guidelines)
8. [Photography Style](#8-photography-style)
9. [Pricing Display](#9-pricing-display)
10. [Do's and Don'ts](#10-dos-and-donts)

---

## 1. Brand Essence

### Who We Are

Assembl is the operating system for New Zealand business. We provide 42 purpose-built AI agents, each trained on NZ legislation, regulation, and business practice, working together as a single intelligence layer. Founded by Kate Hudson in Auckland, Assembl exists to give every Kiwi business access to the same AI capability that was previously only available to enterprise organisations with massive budgets.

- **Domain:** assembl.co.nz
- **Twitter / X:** @AssemblNZ
- **Location:** Auckland, Aotearoa New Zealand

### Mission

Democratise AI for New Zealand business.

### Vision

Become the default business operating system for Aotearoa.

### Primary Tagline

> The Operating System for NZ Business

### Secondary Taglines

Use these in marketing materials, social posts, and campaigns as appropriate:

| Tagline | Best Used For |
|---|---|
| **42 agents. One brain.** | Product capability messaging, technical audiences |
| **Built in Aotearoa.** | NZ identity, local pride, provenance |
| **Replace six platforms with one.** | Cost/efficiency messaging, comparison marketing |

### Brand Values

- **Accessible** — AI should not be a privilege reserved for corporates.
- **Grounded** — Every claim is backed by NZ legislation and real business context.
- **Kiwi-first** — Built here, for here. Not a Silicon Valley product with a `.co.nz` bolted on.
- **Intelligent** — 42 agents working in concert, not a single chatbot with a search bar.
- **Bold** — We are not afraid to challenge the status quo of overpriced, fragmented SaaS.

---

## 2. Visual Identity

### Colour Palette

Assembl uses a dark-first, neon-accent visual system. All primary interfaces, marketing materials, and collateral use a near-black background with vibrant neon accents.

#### Core Colours

| Role | Colour | Hex | HSL | Usage |
|---|---|---|---|---|
| **Background** | Near-black | `#0A0A14` | `240 10% 3.9%` | All backgrounds, canvases, cards |
| **Foreground / Text** | Near-white | `#FAFAFA` | `0 0% 98%` | Body text, headings, labels |
| **Primary (Emerald)** | Emerald green | — | `160 84% 39%` | Primary buttons, links, focus rings |
| **Border** | Dark grey | — | `240 6% 14%` | Card borders, dividers, separators |
| **Muted text** | Mid grey | — | `240 5% 64.9%` | Secondary text, captions, metadata |

#### Neon Accent Palette

These are the signature agent colours. Each is used to identify agents, highlight key information, and add energy to the visual system.

| Name | Hex | HSL | Tailwind Class |
|---|---|---|---|
| **Neon Green** | `#00FF88` | `153 100% 50%` | `neon-green` |
| **Neon Cyan** | `#00E5FF` | `189 100% 50%` | `neon-cyan` |
| **Purple** | `#B388FF` | — | `neon-gold` |
| **Neon Pink** | `#FF2D9B` | `326 100% 59%` | `neon-pink` |
| **Neon Lime** | `#7CFF6B` | `113 100% 70%` | `neon-lime` |
| **Neon Red** | `#FF4D6A` | `349 100% 65%` | `neon-red` |
| **Neon Teal** | `#00FF94` | `157 100% 55%` | `neon-teal` |
| **Neon Blue** | `#5B8CFF` | `224 100% 68%` | `neon-blue` |
| **Neon Amber** | `#FF8C42` | `24 100% 55%` | `neon-amber` |

#### Colour Hierarchy

- **Primary action colour:** Emerald (`hsl(160 84% 39%)`) for buttons, links, and interactive elements.
- **Neon Green (`#00FF88`)** is the flagship brand accent. Use it for hero highlights, feature callouts, and the most important visual anchors.
- **Cyan and Pink** are secondary accents for visual variety and agent differentiation.
- **Purple** is used sparingly for premium or advanced features.

### Glassmorphism Treatment

Cards, panels, and floating UI elements use a frosted-glass aesthetic:

```css
.glass-panel {
  background: rgba(14, 14, 26, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.75rem;
}
```

Key properties:
- **Background:** `rgba(14, 14, 26, 0.7)` — semi-transparent near-black
- **Backdrop blur:** `16px`
- **Border:** `rgba(255, 255, 255, 0.06)` — barely visible white edge
- **Border radius:** `0.75rem` (12px)

### Gradient Text

Hero headings and feature titles use a signature gradient text effect:

```css
.gradient-text {
  background: linear-gradient(135deg, #00FF88, #00E5FF, #5B8CFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 12px rgba(0, 229, 255, 0.3));
}
```

Direction: green to cyan to blue, at 135 degrees. Always paired with a subtle glow `drop-shadow` for depth.

### Neon Glow Effects

Interactive elements and agent identifiers pulse with a soft neon glow:

```css
.neon-pulse {
  filter: drop-shadow(0 0 4px currentColor);
  animation: neon-pulse 2.5s ease-in-out infinite;
}
```

Use glow effects purposefully. They should draw the eye to the most important element on screen, not be applied to everything.

---

## 3. Typography

### Font Stack

| Role | Font Family | Weights | Fallback |
|---|---|---|---|
| **Display** | General Sans | 600, 700 (Bold/Extrabold) | Inter, sans-serif |
| **Headings** | General Sans | 700 (Extrabold), tracking tight | Inter, sans-serif |
| **Body** | Inter | 300-900 | sans-serif |
| **Monospace** | JetBrains Mono | 400, 500 | monospace |

**Note:** Syne was part of the original brand concept but the production system maps `font-syne` to General Sans for consistency. Use General Sans for all new materials. Legacy references to Syne should be treated as General Sans.

### Font Sources

```
Google Fonts:  Inter, JetBrains Mono
Fontshare:     General Sans
```

### Type Scale

| Element | Font | Size | Weight | Tracking | Notes |
|---|---|---|---|---|---|
| Hero headline | General Sans | 48-72px | 700 | -0.02em (tight) | Gradient text treatment |
| Section heading (H2) | General Sans | 32-40px | 700 | -0.01em | Near-white |
| Subsection (H3) | General Sans | 24-28px | 600 | Normal | Near-white |
| Body text | Inter | 16-18px | 400 | Normal | Near-white or muted grey |
| Caption / metadata | Inter | 13-14px | 500 | Normal | Muted grey `hsl(240 5% 64.9%)` |
| Agent code | JetBrains Mono | 13-14px | 500 | 0.05em (wide) | Neon accent colour |
| Button label | Inter | 14-16px | 600 | 0.01em | Uppercase optional for CTAs |

### Typography Rules

- Headlines are always **tight-tracked** (letter-spacing: -0.02em to -0.01em).
- Body copy is always set at comfortable reading width (max 65-75 characters per line).
- Agent codes (e.g., `ASM-003`) are always in **JetBrains Mono** with their assigned neon colour.
- Never use light or thin weights on dark backgrounds below 16px — readability suffers.

---

## 4. Logo Usage

### Logo Components

The Assembl logo consists of two elements:

1. **Molecule Icon** — An abstract molecular/node structure representing connected intelligence.
2. **Wordmark** — "ASSEMBL" set in tracked uppercase General Sans (Bold).

These two elements should always appear together in primary usage. The molecule icon may be used alone as a favicon, app icon, or social avatar.

### Clear Space

Maintain a minimum clear space of **1x the logo height** on all sides. No other text, imagery, or graphic elements should intrude into this space.

```
     ┌──────────────────────────┐
     │         1x height        │
     │   ┌──────────────────┐   │
     │   │                  │   │
     │   │   [ASSEMBL LOGO] │   │
     │   │                  │   │
     │   └──────────────────┘   │
     │         1x height        │
     └──────────────────────────┘
```

### Background Requirements

- The logo must **only** appear on dark backgrounds (`#0A0A14` or similar near-black).
- **Never** place the logo on white, light grey, or any light-coloured background.
- When placing on photography, ensure sufficient contrast with a dark overlay if needed.

### Logo Don'ts

- **Never** stretch, compress, or distort the logo proportions.
- **Never** rotate the logo.
- **Never** recolour the logo outside the approved palette (white wordmark + emerald/neon-green accent).
- **Never** add shadows, outlines, or effects not defined in these guidelines.
- **Never** recreate the logo using alternative fonts.
- **Never** place the logo inside a coloured box or badge on light backgrounds.

---

## 5. Tone of Voice

### Personality

Assembl sounds like a smart, confident Kiwi who knows their stuff but does not talk down to anyone. We are direct, warm, and grounded. We do not hide behind jargon or buzzwords.

### Voice Attributes

| Attribute | What it means | Example |
|---|---|---|
| **Confident** | We know what we have built and we stand behind it | "42 agents trained on NZ law. Not generic AI with a flag on it." |
| **Warm** | We are approachable, not cold or robotic | "Kia ora. Let's get your business sorted." |
| **Kiwi-authentic** | We sound like New Zealand, not Silicon Valley | "Built right here in Aotearoa, for Kiwi businesses." |
| **Direct** | We say what we mean without padding | "Replace six platforms with one. Save $2,000/month." |
| **Technically accurate** | We reference real legislation and specifics | "APEX handles Employment Relations Act 2000 compliance." |

### Language Conventions

#### NZ English Spelling (Mandatory)

Always use New Zealand/British English spelling:

- **analyse** (not analyze)
- **colour** (not color)
- **licence** (noun) / **license** (verb)
- **organisation** (not organization)
- **programme** (not program, except in software context)
- **centre** (not center)
- **behaviour** (not behavior)
- **recognise** (not recognize)
- **customise** (not customize)

#### Te Reo Maori Integration

Incorporate Te Reo Maori naturally and respectfully. Do not force it or use it as decoration.

**Appropriate usage:**
- "Built in Aotearoa" — natural, widely understood
- "Kia ora" — greetings and welcomes
- "Whanau" — when referring to community or team
- "Kaupapa" — when discussing purpose or mission
- "Kaitiaki" — when discussing guardianship or stewardship of data
- "Aotearoa" — always acceptable as an alternative or companion to "New Zealand"

**Macron usage:** Use macrons where correct (Maori, whanau, kaupapa). If technical limitations prevent macrons, omit them rather than using incorrect substitutions.

### Words We Use vs. Words We Avoid

| Use | Avoid |
|---|---|
| AI operating system | Chatbot |
| AI agents | Bots |
| Intelligence layer | AI assistant |
| NZ legislation | "The law" (too vague) |
| Kiwi businesses | SMEs (too corporate) |
| Platform | Tool |
| Built in Aotearoa | Made in New Zealand (less distinctive) |
| Compliance automation | "Keeping you legal" (too casual) |

---

## 6. Agent Naming Convention

### Format

Every Assembl agent follows a strict naming format:

```
NAME (ASM-XXX)
```

- **NAME** — All uppercase, 4-6 letters
- **ASM** — The Assembl prefix, always uppercase
- **XXX** — Three-digit numeric identifier, zero-padded

**Examples:**
- `APEX (ASM-003)` — Employment & HR compliance
- `ANCHOR (ASM-007)` — Financial stability & reporting
- `HELM (ASM-012)` — Strategic business steering
- `SPARK (ASM-015)` — Marketing & creative content

### Naming Philosophy

Agent names are evocative of their capability. They are short, punchy, and memorable.

| Name Pattern | Evokes |
|---|---|
| APEX | Peak performance, top-tier |
| ANCHOR | Stability, grounding, reliability |
| HELM | Steering, leadership, control |
| SPARK | Creativity, ignition, energy |
| SCOUT | Discovery, reconnaissance, exploration |
| FORGE | Building, creation, strength |

### Agent Colour Assignment

Each agent is assigned a **signature neon colour** from the accent palette. This colour is used consistently across:

- Agent avatar border/glow
- Agent card accent
- Agent code text colour in technical contexts
- Dashboard indicators

Colour assignments are permanent once made. An agent's colour is part of its identity and must not change.

### Agent Card Layout (Glassmorphism)

Agent cards follow the standard glassmorphism pattern with these additions:

```
┌──────────────────────────────────┐
│  [Agent Avatar with neon glow]   │
│                                  │
│  AGENT NAME                      │  ← General Sans Bold, white
│  ASM-XXX                         │  ← JetBrains Mono, agent neon colour
│                                  │
│  Brief capability description    │  ← Inter, muted grey
│                                  │
│  [Status indicator]              │  ← Neon dot + label
└──────────────────────────────────┘

Background: rgba(14, 14, 26, 0.7)
Border: rgba(255, 255, 255, 0.06)
Agent-colour glow on avatar
```

---

## 7. Social Media Guidelines

### Handle

**@AssemblNZ** across all platforms (Twitter/X, LinkedIn, Instagram, TikTok, YouTube).

### Visual Standards

- **Always** use dark backgrounds in social graphics. The minimum background colour is `#0A0A14`.
- **Never** use white or light backgrounds for any Assembl social content.
- Use neon accent colours for text highlights, underlines, and callout elements.
- Agent cards in social content follow the same glassmorphism pattern used in the product.
- Maintain the gradient text treatment for key phrases in hero graphics.

### Content Templates

#### Feature Announcement Post
- Dark background
- Agent card or product screenshot
- Neon-highlighted headline
- Brief copy (2-3 lines max)
- CTA to assembl.co.nz

#### Agent Spotlight Post
- Agent avatar with signature neon glow
- Agent name and code in correct typography
- Capability description
- Relevant NZ legislation reference

#### Founder / Thought Leadership Post
- Minimal dark background
- Quote text in gradient treatment (if short)
- Attribution: Kate Hudson, Founder — Assembl

### Hashtags

Primary (always include at least one):
- `#Assembl`
- `#NZTech`

Secondary (use as relevant):
- `#AIforBusiness`
- `#Aotearoa`
- `#BuiltInNZ`
- `#NZBusiness`
- `#KiwiBusiness`
- `#AIAgents`

### Platform-Specific Notes

| Platform | Notes |
|---|---|
| **Twitter/X** | Short, punchy. Lead with the hook. Use agent codes as shorthand. |
| **LinkedIn** | More detail permitted. Reference specific legislation. Professional tone. |
| **Instagram** | Visual-first. Agent cards, product screenshots, dark aesthetic. Stories for behind-the-scenes. |
| **YouTube** | Tutorials, agent demos, NZ business case studies. Thumbnail style: dark + neon text. |

---

## 8. Photography Style

### Aesthetic

Assembl photography is **dark, moody, and premium**. It reflects the digital-first, neon-accented visual identity of the brand.

### Requirements

- **Dark and atmospheric** — Low-key lighting, deep shadows, rich contrast.
- **NZ landscapes** — Use as subtle, desaturated backgrounds. Aotearoa's natural environment reinforces the "Built in Aotearoa" message.
- **Tech-forward** — Incorporate screens, devices, and workspaces with neon accent lighting where possible.
- **Neon highlights** — Practical neon lighting (green, cyan, pink) in photography bridges the gap between the digital brand and physical world.
- **Real people, real businesses** — Feature actual NZ business owners, workplaces, and locations.

### Absolute Don'ts

- **Never** use stock photography with staged smiles, handshakes, or "diverse team looking at laptop" cliches.
- **Never** use white or brightly lit photography.
- **Never** use photography that could be from anywhere in the world — it must feel like Aotearoa.
- **Never** use AI-generated faces or people.

### Photo Treatment

When photography is used in layouts:
- Apply a dark overlay (`rgba(10, 10, 20, 0.6)` minimum) to maintain text readability.
- Desaturate slightly to keep neon accents as the dominant colour source.
- Crop and compose so the subject does not compete with UI elements or text overlays.

---

## 9. Pricing Display

### Currency

- **Always** display prices in NZD (New Zealand Dollars).
- Use the `$` symbol with "NZD" clarification where international audiences may see the pricing: `$49 NZD/month`.
- For domestic-only contexts, `$49/month` is acceptable.

### Price Presentation

- **Monthly prices are the primary display.** Show the monthly cost prominently.
- **Annual savings** are shown as a percentage discount, not a separate price: "Save 20% with annual billing".
- **Never** show only the annual price. Always lead with monthly.

### Free Tier

- The free tier must **always** be visible in any pricing comparison or table.
- This reinforces accessibility and the mission to democratise AI.
- Label it "Free" or "Starter — Free", never "Trial" (it is not time-limited).

### Pricing Layout Example

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   STARTER   │  │     PRO     │  │ ENTERPRISE  │
│    Free     │  │  $XX NZD/mo │  │   Custom    │
│             │  │             │  │             │
│  Core agents│  │ All agents  │  │ All agents  │
│  Basic usage│  │ Priority    │  │ Dedicated   │
│             │  │ support     │  │ support     │
│  [Get       │  │             │  │             │
│   Started]  │  │ [Subscribe] │  │ [Contact]   │
└─────────────┘  └─────────────┘  └─────────────┘

Annual toggle: "Save XX% with annual billing"
```

---

## 10. Do's and Don'ts

### Do

- **Reference specific NZ legislation by name.** Say "Employment Relations Act 2000", not "employment law". Say "Privacy Act 2020", not "privacy regulations". Specificity builds trust.
- **Use agent neon colours consistently.** Every agent has one colour. Use it in every context where that agent appears.
- **Include "Built in Aotearoa" in marketing materials.** This is a core differentiator.
- **Use dark backgrounds everywhere.** The brand lives in the dark. This is non-negotiable.
- **Show the 42-agent number.** It is concrete and differentiating. "42 agents" is more compelling than "multiple AI agents".
- **Use the glassmorphism card treatment.** It is the signature UI pattern and should appear in product, marketing, and social.
- **Be specific about cost savings.** "Replace six platforms" or "Save $X/month" with real numbers.
- **Use Te Reo Maori naturally.** Not as tokenism, but as a genuine part of how we speak.
- **Credit NZ context in all AI claims.** "Trained on NZ legislation" is the qualifier that makes our AI claims credible.

### Don't

- **Don't use light or white backgrounds.** Not in the product, not in marketing, not in social, not in email. Dark only.
- **Don't call Assembl a "chatbot".** It is an AI operating system. The distinction matters.
- **Don't make generic AI claims.** "Powered by AI" means nothing. "42 agents trained on NZ employment, tax, and privacy law" means everything. Always ground claims in NZ context.
- **Don't use American English spelling.** No "color", "analyze", or "organization". This is a Kiwi product.
- **Don't use stock photography.** See Photography Style section.
- **Don't use light font weights on dark backgrounds.** Readability comes first.
- **Don't change an agent's assigned colour.** Once set, it is permanent.
- **Don't use the logo on light backgrounds.** It was designed for dark surfaces only.
- **Don't describe the product as a "tool".** It is a platform, an operating system, an intelligence layer.
- **Don't compare to offshore competitors by name unless strategically justified.** Focus on what Assembl does, not what others do not.

---

## Quick Reference Card

| Element | Value |
|---|---|
| **Primary tagline** | The Operating System for NZ Business |
| **Background** | `#0A0A14` / `hsl(240 10% 3.9%)` |
| **Text** | `#FAFAFA` / `hsl(0 0% 98%)` |
| **Primary accent** | Emerald `hsl(160 84% 39%)` |
| **Hero accent** | Neon Green `#00FF88` |
| **Display font** | General Sans (Bold) |
| **Body font** | Inter |
| **Code font** | JetBrains Mono |
| **Glass background** | `rgba(14, 14, 26, 0.7)` |
| **Glass blur** | `backdrop-filter: blur(16px)` |
| **Glass border** | `rgba(255, 255, 255, 0.06)` |
| **Border radius** | `0.75rem` |
| **Domain** | assembl.co.nz |
| **Handle** | @AssemblNZ |
| **Currency** | NZD |
| **Agent format** | `NAME (ASM-XXX)` |

---

*Assembl — Built in Aotearoa.*
