# Handoff Guide: Setting up assembl to run on Buzz (Nostr-Native Framework)

This document is a step-by-step technical plan designed to be copy-pasted directly into **Claude** (e.g., Claude Code, Cursor, or Windsurf) to integrate **Block's Buzz** as the permanent multi-agent collaboration framework for **assembl intuitive agentic customer journeys**.

---

## 1. What we are building (The Plain-English Concept)

Instead of running assembl agents as hidden background scripts, we are routing them into **private collaboration channels** inside a self-hosted **Nostr-native team workspace (Buzz)**. 

*   **For the customer:** They see a standard, fast, and beautiful wait-state page on our Next.js frontend (e.g., `/assembling` or `/concept-woolworths-v3.html`).
*   **For the enterprise client:** They see a Slack-like dashboard (themed in assembl's deep navy & gold) where their human employees and our assembl specialist agents share a channel, chatting and cooperating in real-time.
*   **For the audit trail:** Every single action, document read, and email draft is cryptographically signed by the agent who performed it, waiting for a human "Thumbs-Up" (`👍`) reaction before dispatching.

---

## 2. Technical Prerequisites for the Local Machine

To run Buzz locally, your Mac requires **Docker Desktop** to run the underlying Postgres and Redis databases. 

1.  **Install Docker Desktop:** Download and launch it from [docs.docker.com/get-docker](https://docs.docker.com/get-docker/).
2.  **Open the Terminal and Launch Buzz:**
    ```bash
    cd /Users/kateharland/block-buzz
    . bin/activate-hermit
    just setup   # Runs migrations & starts databases in Docker
    just dev     # Starts the relay and the desktop chat app together
    ```
    *This starts the Nostr relay at `ws://localhost:3000`.*

---

## 3. Instructions for Claude: Step-by-Step Implementation

*Feed the following prompt directly into Claude inside your main `/Users/kateharland/assemblnz-f0afd79d` repository:*

```markdown
Hi Claude, we want to integrate Block's Nostr-native BUZZ platform (running locally at ws://localhost:3000) as the multi-agent orchestration backend for our assembl fleet. Please implement this bridge:

### Step 1: Install Nostr Dependencies
Install the required lightweight Nostr client library in the Next.js workspace:
`pnpm add nostr-tools` (or install via npm/yarn if needed).

### Step 2: Update Agent Fleet Registry with Keys
In `lib/agents.ts`, assign a unique, secure Nostr keypair to every registered specialist in our fleet (Echo, Context Agent, Re-routing Specialist, etc.). Keep keys environment-gated:
```typescript
import { generateSecretKey, getPublicKey } from 'nostr-tools';

export interface SpecialistAgent {
  id: string;
  name: string;
  avatar: string;
  nsec?: string; // Private key (kept secure)
  npub: string;  // Public cryptographic identity
}
```

### Step 3: Create the Nostr Relay Client Bridge
Create a new file `lib/buzz-bridge.ts` that handles connecting to the Buzz relay (`ws://localhost:3000`), subscribing to a specific customer journey channel, and publishing agent actions as signed NIP-29 group events.
* Ensure agents listen to messages in their channel, run their normal LLM completions (using our local Gemini fallback), and post their reasoning back to the channel.
* For wait-state actions, when an agent prepares a draft, they should publish a NIP-34 draft event and wait for a NIP-25 reaction event (`👍` from the human operator) before marking the task complete.

### Step 4: Wire the Wait-State Web Interface to the Relay
In our Next.js App Router under `app/assembling/page.tsx` or similar wait-state screens:
* Establish a standard WebSocket subscription to the Buzz channel matching the customer's current session ID.
* As the agents post their signed event logs inside the Buzz channel in the background, read these events live on the client's screen to drive the ticking progress bars and legal-fee/Everyday-Rewards credit accruals in real-time.
```

---

## 4. How to Theme the Buzz Client in assembl Gallery Style

Buzz is a monorepo that contains a React frontend (`web/` and `admin-web/`) and a Tauri-wrapped desktop shell (`desktop/`). 

To style the Buzz chat workspace to look like a premium, native **assembl intuitive** application:

1.  **Open the Theme variables:** Go to `/Users/kateharland/block-buzz/desktop/src/styles/` or the root web stylesheet.
2.  **Swap the colors to the assembl Gallery Canon:**
    *   Set the background canvas to deep navy: `#080D1A` or `#05070F`.
    *   Set cards and panels to glassmorphism: `rgba(255,255,255,0.05)` with `backdrop-filter: blur(24px)`.
    *   Set the primary accent and buttons to assembl Brass: `#B8964F`.
    *   Replace standard Slack-like icons with CSS-gradient metallic plates (Chrome, Brass, Silver).
    *   Inject your staggered **Inter Tight (weight 600)** display headers and **IBM Plex Mono** micro-labels for that high-end, premium editorial feel.
3.  **Embed 3D WebGL Objects:**
    *   Embed a small Three.js canvas in the sidebar or room backdrop rendering a subtle, transparent gold-orbit wireframe (referencing `concept-kiwibank-v2.html` or your homepage) to physically represent the "intelligence foundation" of the room!
