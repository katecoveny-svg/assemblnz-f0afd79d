

# Audit: Agent Mascots & PWA Installation

## Current State

### Mascots — Mostly Correct
The unified `AgentAvatar` component (`src/components/AgentAvatar.tsx`) correctly uses a **single base image** (`assembl-mascot-base.png`) with CSS `mix-blend-hue` and `mix-blend-saturation` overlays to tint eyes/glow to each agent's brand colour. This is used across 29 files.

**However, several pages bypass `AgentAvatar` and import individual agent PNGs directly:**

| File | Import | Should Use |
|------|--------|------------|
| `HelmSection.tsx` | `helm-3d-avatar.png` | `AgentAvatar` with Helm colour |
| `HelmApp.tsx` | `helm-3d-avatar.png` | `AgentAvatar` with Helm colour |
| `EchoSection.tsx` | `echo-fullbody.png` | `AgentAvatar` with Echo colour |
| `EchoPage.tsx` | `echo.png` | `AgentAvatar` with Echo colour |
| `SparkSection.tsx` | `spark.png` | `AgentAvatar` with Spark colour |
| `AgentApp.tsx` | `helm-3d-avatar.png` (lazy) | `AgentAvatar` |

These six files use **different robot images** instead of the unified mascot template. `RobotIcon.tsx` is dead code (not imported anywhere).

Files that correctly stay as-is:
- `AssemblHeroAgent.tsx` — uses `hero-orb-robot.png` (the hero, not an agent mascot)
- `BrandGuidelinesPage.tsx` — uses `hero-orb-robot.png` for brand docs
- `EchoChatWidget.tsx` — already uses `assembl-mascot-base.png`
- `MyAppsPage.tsx` / `ChatPage.tsx` — use `spark.png` as a CTA illustration (not an avatar)

### PWA — Already Working
PWA is already configured:
- `public/manifest.json` exists with correct metadata
- `index.html` has manifest link and Apple meta tags
- `public/sw.js` service worker handles caching
- `src/utils/pwaManifest.ts` generates per-agent manifests dynamically
- `AgentApp.tsx` and `HelmApp.tsx` both call `setDynamicManifest()` on mount

**How to install as PWA**: On mobile (iOS Safari or Android Chrome), visit the agent app route (e.g., `/app/aura` or `/helm`), then use the browser's "Add to Home Screen" option. On desktop Chrome/Edge, click the install icon in the address bar.

---

## Plan

### Step 1 — Replace direct agent image imports with AgentAvatar (4 files)

Update these files to use the `AgentAvatar` component instead of individual PNGs:

1. **`src/components/HelmSection.tsx`** — Replace `helmImg` with `<AgentAvatar agentId="operations" color="#B388FF" size={180} />`
2. **`src/components/EchoSection.tsx`** — Replace `echoImg` with `<AgentAvatar agentId="echo" color="#00E5FF" size={180} />`
3. **`src/components/SparkSection.tsx`** — Replace `sparkImg` with `<AgentAvatar agentId="spark" color="#FF6B00" size={180} />`
4. **`src/pages/EchoPage.tsx`** — Replace `echoImg` with `<AgentAvatar>`

### Step 2 — Fix AgentApp.tsx avatar fallback

Remove the `agentAvatars` lazy-load map and use `AgentAvatar` component directly for the chat header/sidebar avatar, so every agent gets the unified mascot with correct brand colour.

### Step 3 — Fix HelmApp.tsx avatar

Replace `helmImg` import with `AgentAvatar` component usage.

### Step 4 — Delete dead code

Remove `src/components/RobotIcon.tsx` (unused).

### Step 5 — No PWA changes needed

PWA is already functional. I will add a brief install-prompt banner or tooltip to agent app pages so users know they can install, OR simply document the install flow in the response.

---

## Technical Details

- All agent colours come from `src/data/agents.ts` — no hardcoding needed in most cases
- The `AgentAvatar` component handles glow, hue-shift, and eager/lazy loading
- The hero robot (`hero-orb-robot.png`) and brand guidelines references remain untouched
- `MyAppsPage.tsx` and `ChatPage.tsx` spark imports are CTA illustrations, not mascots — left as-is

