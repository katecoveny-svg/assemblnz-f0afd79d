# Assembl Design Tokens

**Single source of truth for every colour, radius, shadow, and font in the platform.**

Update colours in ONE place and the entire app reflects the change.

---

## Files

| File | Layer | Purpose |
|------|-------|---------|
| `palette.ts` | TS / runtime | Raw palette + semantic tokens + kete accents + `getToken()` helper |
| `tokens.css` | CSS variables | Mirror of `palette.ts` for Tailwind / shadcn / `className` styling |
| `typography.ts` | TS / runtime | Type ramp + semantic roles (agentCode, roleText, tagline…) + `typeStyle()` |
| `typography.css` | CSS variables | Mirror of `typography.ts` + ready-to-use `.type-*` utility classes |
| `AgentTypography.tsx` | React primitives | `<AgentCode>`, `<RoleText>`, `<Tagline>`, `<AgentName>`, `<MetaLabel>` |
| `index.ts` | Public entry | Re-exports — always import from `@/design/tokens` |

`tokens.css` and `typography.css` are auto-loaded via `src/index.css`.

---

## Typography scale

Six semantic roles, each with a fluid `clamp()` size that adapts from
mobile to desktop. Use the React primitives whenever possible — they
already wire colour + size + weight + line-height + tracking.

| Role | Family | Weight | Size (sm → lg) | Leading | Tracking | Use |
|------|--------|--------|----------------|---------|----------|-----|
| `agentCode` | Mono | 500 | 11 → 13 px | 1.10 | 0.12em UPPER | Agent identifier (e.g. `ASM-008`) |
| `roleText`  | Inter | 500 | 13 → 15 px | 1.25 | -0.01em | Role under the name (e.g. `Privacy Copilot`) |
| `tagline`   | Inter | 400 | 14 → 18 px | 1.45 | 0 | One-line promise |
| `agentName` | Cormorant | 400 | 22 → 32 px | 1.10 | -0.01em | The agent's display name |
| `metaLabel` | Inter | 500 | 12 px fixed | 1.25 | 0.04em UPPER | Section/eyebrow labels |

```tsx
import { AgentCode, RoleText, Tagline, AgentName }
  from "@/design/tokens/AgentTypography";

<header>
  <AgentCode>ASM-008</AgentCode>
  <AgentName>Flux</AgentName>
  <RoleText>Sales Intelligence Engine</RoleText>
  <Tagline>Surfaces the next best conversation, not the next cold pitch.</Tagline>
</header>
```

Or via classes / inline styles when the primitives don't fit:

```tsx
<span className="type-agent-code">ASM-008</span>
<p style={typeStyle("tagline")}>…</p>
```

---

## Naming convention (LOCKED 2026-04-24)

### Neutrals — warm earth
`mist` · `cloud` · `sand` · `taupe` · `taupeDeep` · `taupeLight` · `charcoal` · `white`

### Accent (only one)
`goldLeaf` / `goldLeafDeep` — Soft Gold #D9BC7A. Used for CTAs, focus rings, active rail.
**Never call this "gold" or "yellow".**

### Status — warm, quiet
`moss` (ok) · `honey` (warn) · `clay` (alert) · `haze` (info)

### Per-kete accents
`keteManaaki`, `keteWaihanga`, `keteAuaha`, `keteArataki`, `ketePikau`, `keteHoko`, `keteAko`, `keteToro`.

### Banned
- ❌ Neon (any saturated digital hue)
- ❌ Pure black (#000) — use `charcoal` (#3D4250)
- ❌ Dark backgrounds (#09090F, #0A1628 are retired)
- ❌ Purple

---

## Usage

### TypeScript / inline styles
```ts
import { tokens, getKeteAccent, getToken } from "@/design/tokens";

<div style={{
  background: tokens.surface.raised,
  color:      tokens.text.strong,
  boxShadow:  tokens.shadow.soft,
}} />

const accent = getKeteAccent("waihanga").base;  // "#CBB8A4"
const muted  = getToken("text.muted");          // "#A89E94"
```

### CSS / Tailwind arbitrary values
```css
.card {
  background: var(--token-surface-raised);
  color:      var(--token-text-strong);
  border:     1px solid var(--token-border-soft);
  box-shadow: var(--token-shadow-soft);
  border-radius: var(--token-radius-card);
}
```

```tsx
<div className="bg-[var(--token-surface-raised)] text-[var(--token-text-strong)]" />
```

---

## How to change a colour platform-wide

1. Edit the value in **`palette.ts`** (raw `palette` block).
2. Edit the matching `--c-*` variable in **`tokens.css`**.
3. That's it. Every component that imports tokens (TS) or reads `var(--token-*)` (CSS) updates automatically.

The four legacy token files (`design/assemblTokens.ts`, `components/shared/marama/tokens.ts`,
`components/auaha/auahaTheme.ts`, `AdminGlassCard.tsx`) still work and will be migrated
incrementally — they are NOT yet wired through this canonical system.
