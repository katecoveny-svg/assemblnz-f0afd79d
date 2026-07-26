# Redesign Plan: assembl-izing the Assembling (Wait-State) Product

This plan transitions the `/assembling` microsite and product representation from the cartoonish, canary-yellow, dog-mascot legacy "Dash" sub-brand into the premium, editorial, high-end **assembl V2 Brand Canon** (navy gallery, brass, and liquid chrome).

---

## 1. Brand Alignment Gap Analysis

| Aspect | Current (Legacy "Dash/Birdie") | Proposed (Correct assembl V2 Brand) |
|---|---|---|
| **Color Palette** | Canary Yellow (`#FFD42A`/`#BFA37A`) and Charcoal (`#3A3832`). | **Paper-White Premium:** Paper `#FAFAF7` base, Ink `#1C1B18` text, Brass `#B8964F`/`#D4A843` accent, Chrome `#C8CCD2` 3D. <br>**Or Navy Gallery:** Deep Navy `#080D1A` base, Brass `#B8964F` accent, Chrome `#D6DADF` 3D. |
| **Typography** | Lato (display + UI) + Space Mono (technical code). | **Inter Tight (weight 600)** for headlines, **Lato 300** for body, and **IBM Plex Mono** for micro-labels/counters. |
| **Mascot / Visuals** | "Dash" the floaty dachshund dog mascot (cartoonish, startup-y). | **3D Sculptural Art:** Liquid chrome, brass, and dark chromium WebGL geometric forms rotating elegantly on a plinth. "Vessel" imagery. |
| **Loader / State** | "Fill-the-dog" loader (the dog fills up with gold progress). | **The signature Wait State Module:** A glassmorphic panel where operational steps light up sequentially, a brass progress bar fills, ending with: *"ready — your approval is the only thing left"*. |
| **Identity / Logo** | Lowercase `dash` wordmark + canary dash-bar (`-`). | Lowercase **`assembl` wordmark in Cormorant Garamond 500**, accompanied by a technical `assembling` sub-label in IBM Plex Mono. |
| **Copy Tone** | Startup-y, casual ("Sit. Stay. Get paid."). | Editorial, high-end, operational ("Find the friction. Assemble the journey. Prove the result."). |

---

## 2. Redesign Architecture: Step-by-Step

### Step 1: Re-aligning the Theme & Layout (`app/assembling/layout.tsx` & `dash-kit.css`)
*   **Colors:** Swap the canary yellow background and accents for **Deep Navy (`#080D1A`)** or **Paper-White (`#FAFAF7`)** with **Brass/Amber (`#B8964F`)**.
*   **Wordmark:** Replace the custom `<Wordmark />` component (which renders `dash-` or `assembling-` with a yellow block) with the canonical lowercase **`assembl`** in Cormorant Garamond 500, followed by a thin hairline separator and `assembling` in IBM Plex Mono.
*   **Marquee:** Style the marquee in Deep Navy base with Brass text or Paper-White base with Charcoal text.

### Step 2: Redesigning the Hero (`app/assembling/page.tsx`)
*   **Hero Headline:** Transition from "Get paid to wait" to a more powerful, B2B-aligned headline:
    *   *Current headline:* "Get paid to wait." (very consumer-heavy).
    *   *Proposed headline:*
        ```html
        <h1 className="text-display">
          <span>The wait state,</span><br />
          <span style={{ marginLeft: '8vw', color: 'var(--brass)' }}>productive.</span><br />
          <span style={{ marginLeft: '16vw' }}>every journey, assembled.</span>
        </h1>
        ```
*   **Hero Copy:** "Your application makes customers wait. assembl turns that friction into an agentic loyalty layer. While specialist agents compile answers, customers earn real value (bill credits, Airpoints, or charity donations) right inside the wait state. One line of code to integrate."
*   **Mascot Stage Replacement:** Replace the static dachshund image (`mascot-dog.png`) with a **live WebGL 3D canvas** rendering a rotating, fluid liquid-chrome core structure with a tilted brass torus ring and orbiting capsules representing the operational agents completing tasks in real-time.

### Step 3: Redesigning the Signature Loader (Replacing `FillDogLoader.tsx`)
*   **The Transition:** Retire the "fill-the-dog" animation.
*   **The Wait State Module:** Build a premium, glassmorphic UI container (`rgba(255,255,255,0.05)` base, `backdrop-filter: blur(24px)`) representing a live journey step-tracker:
    1.  **Step 1:** `Reading context...` (Monospace, brass indicator pulse)
    2.  **Step 2:** `Consulting specialist team...`
    3.  **Step 3:** `Assembling draft...`
    4.  **Step 4:** `Awaiting approval` (Typewriter detail: *"Your approval is the only thing left"*).
*   **The Loyalty Layer:** Incorporate an incremental **Credit Counter / Reward Tracker** that ticks up dynamically (e.g., `+$0.05`, `+$0.10`, `+$1.25`) as the steps progress. This physically proves the reward is accruing live in the wait state.

### Step 4: Redesigning the Audience Doors & Evidence Section
*   **Three Audience Doors:** Instead of cartoonish tiles, use asymmetric **NYC Gallery Plinths** (glass panels with 24px-32px rounded corners and CSS-gradient metallic icons replacing emojis).
    *   *Door 1 (For Developers):* "The Loader SDK — One line of code to embed. Fully asynchronous." (Metallic Chrome Icon)
    *   *Door 2 (For Enterprises):* "The Loyalty Integration — Bridge the friction. Support Air New Zealand, Everyday Rewards, or Contact Energy." (Metallic Brass Icon)
    *   *Door 3 (For Users):* "Sovereign wait states. You decide what data is processed. You approve every output." (Metallic Ink Icon)
*   **The Proof Certificate:** Rebuild the reward ladder into a clean **2x2 Proof Certificate Grid** showing metrics with thin, elegant numbers, explicitly labeled "measured" or "calculated":
    *   `Average Wait Friction Reduced: 84% (measured)`
    *   `Value Accrued to Customers: $4.20 per journey (calculated)`
    *   `Sovereign Approval Rate: 100% (audited)`
    *   `System Latency: <180ms (real-time)`

---

## 3. Implementation Plan for Next.js

1.  **Introduce CSS Variables:** Define `--paper`, `--ink`, `--brass`, and `--chrome` in `app/assembling/dash-kit.css` to match assembl's shared design system.
2.  **Mount the WebGL Canvas:** Use a lightweight `Three.js` canvas inside `app/assembling/page.tsx` utilizing the global `three.min.js` UMD bundle (r149) or a client-side component.
3.  **Refactor Components:** Port the existing components (like `DashWaitlistForm`) into `AssemblingWaitlistForm`, styling inputs with a glassmorphic border and brass focus states.
4.  **Verification:** Run `npm run build` and brand checks to verify no "Dash" or "canary-dog" legacy copy remains visible to users.
