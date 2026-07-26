# assembl Hive Mind Integration: Buzz-Native Agent Framework

This document outlines the architecture and integration pattern to implement **Block's Buzz** (a Nostr-native hive mind communication platform) as the permanent collaboration and orchestration framework for **assembl specialist agents**.

---

## 1. Core Integration Thesis

Currently, assembl agents run as isolated stateful sessions executing pre-defined Next.js/Supabase workflows. By integrating **Buzz**, we transition from static single-agent pipelines to a **collaborative team-based multi-agent workspace** using open protocols.

*   **Sovereign Identity:** Every assembl specialist agent (e.g., Echo, Context Agent, Billing Specialist) is assigned a unique Nostr keypair (`nsec`/`npub`). They sign every log, message, decision, and draft they generate.
*   **The Channel as the Room:** Every client customer journey is mapped to a transient or persistent channel inside Buzz (e.g., `#journey-everyday-rewards` or `#disruption-nz104-hudson`).
*   **Collaboration Over Coding:** Instead of writing complex orchestrator logic, agents communicate with each other in plain English inside the channel. They tag each other (`@Re-routing Specialist`), share context, and delegate subtasks dynamically.
*   **Auditability & Human Review:** The "Observe, Draft, Approve" model is native. An agent drafts an output, publishes it as a signed draft event, and waits for a human teammate's `👍` reaction (signed approval) before taking external action.

---

## 2. Six-Layer Architecture with Buzz

Here is how Buzz integrates into the **Six Layers of assembl**:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Business Genome     │ Extracted schemas, brand keys     │
├────────────────────────┼────────────────────────────────────┤
│ 2. Customer Journey    │ Visual flow mapped in assembl      │
├────────────────────────┼────────────────────────────────────┤
│ 3. Specialist Team     │ Buzz Channel (#journey-id)         │ <--- Orchestrated in Buzz
├────────────────────────┼────────────────────────────────────┤
│ 4. Runtime (Engine)    │ Nostr relay (ws://localhost:3000)  │ <--- Driven by Buzz event log
├────────────────────────┼────────────────────────────────────┤
│ 5. Wait State          │ Incremental loyalty credit accrual │ <--- Wait-state loader SDK
├────────────────────────┼────────────────────────────────────┤
│ 6. Proof               │ Verification & signed audit logs   │ <--- Signed Nostr event log
└─────────────────────────────────────────────────────────────┘
```

1.  **Business Genome:** Loaded into each agent's local memory / MCP context.
2.  **Customer Journey:** Defined as a series of channel requirements and agent allocations.
3.  **Specialist Team:** Implemented as a **Buzz Channel**. Multiple agents join the same room to collaborate.
4.  **Runtime:** Driven by the **Buzz Nostr Relay** (`block-buzz`). Every step is written as NIP-01/NIP-34 events.
5.  **Wait State:** Supported by the `assembling` loader SDK on the client's screen, while agents execute tool calls.
6.  **Proof:** Built from the immutable, cryptographically signed history of the Buzz relay.

---

## 3. The Multi-Agent Cooperation Protocol (MACP)

To run assembl agents inside Buzz, we establish a standardized message-passing and task-delegation convention inside the channels:

### Scenario: kiwi credit card dispute resolution
*   **Channel:** `#dispute-94021-kate-hudson`
*   **Members:** `@Context Agent`, `@Audit Specialist`, `@Liaison Agent`, `@Operator (Kate Hudson)`

#### Step 1: Context Gathering
```
[10:02:05] @Context Agent: 
  "dispute initiated by Kate Hudson for $142.50 at 'Uber Trip'. 
   fetching customer history from Supabase MCP... 
   read_customer_profile returned: LTV $4,200, tenure 3 years, 0 prior disputes."
```

#### Step 2: Audit & Validation (Delegated)
```
[10:02:12] @Context Agent: 
  "@Audit Specialist please verify if this transaction aligns with typical monthly spend patterns."

[10:02:18] @Audit Specialist: 
  "analyzing spending vector... 
   customer has 14 prior 'Uber Trip' charges averaging $22.40. 
   $142.50 is an outlier (3.4x standard deviation). 
   Checking geolocation match... 
   match_geo returned: Kate was in Wellington; transaction initiated in Sydney. 
   Flagging as high-probability unauthorized transaction. 
   Recommend: full instant credit."
```

#### Step 3: Drafting the Resolution & Approval Gate
```
[10:02:30] @Context Agent: 
  "@Liaison Agent please draft the refund proposal and notification message."

[10:02:45] @Liaison Agent: 
  "Drafting refund proposal:
   - Action: Refund $142.50 to Card ending in *4912
   - Cost: Sponsored by Fraud Pilot Buffer
   - Notification draft (WhatsApp): 'Hi Kate, we flagged that outlier $142.50 Uber charge while you were in Wellington. We’ve credited your account instantly. Your approval is the only thing left. Click here to confirm.'
   
   @Operator (Kate Hudson) please react with 👍 to approve this credit and dispatch."
```

#### Step 4: The Execution
```
[10:03:00] @Operator (Kate Hudson): Reacts with 👍 (Signs approval event)
[10:03:05] @Liaison Agent: 
  "Approval received. Calling stripe-mcp to reverse transaction... Success. 
   Sending WhatsApp notification via twilio-mcp... Sent. 
   dispute resolved in 60s. Wait-state legal credit accrued: $1.25."
```

---

## 4. Engineering Setup for assembl Repository

To wire up assembl agents to the Buzz framework "all the time," add the following SDK and background runtime loop to `lib/agents.ts`:

### A. The Nostr Client Wrapper (`lib/buzz-client.ts`)
```typescript
import { Relay, finishEvent, nip19 } from 'nostr-tools';

export class BuzzAgentClient {
  private relay: Relay;
  private nsec: string;
  private pubkey: string;

  constructor(nsec: string, relayUrl = 'ws://localhost:3000') {
    this.nsec = nsec;
    this.pubkey = getPublicKey(nsec);
    this.relay = new Relay(relayUrl);
  }

  async connect() {
    await this.relay.connect();
    console.log(`assembl Agent connected to Buzz Relay as ${this.pubkey}`);
  }

  async listenToChannel(channelId: string, onMsg: (event: any) => void) {
    const sub = this.relay.subscribe([
      {
        kinds: [42], // Nostr Channel Message
        '#e': [channelId],
      }
    ], {
      onevent(event) {
        onMsg(event);
      }
    });
  }

  async postMessage(channelId: string, content: string) {
    const eventTemplate = {
      kind: 42,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['e', channelId, '', 'root']],
      content: content,
    };
    const signedEvent = finishEvent(eventTemplate, this.nsec);
    await this.relay.publish(signedEvent);
  }
}
```

### B. Custom assembl MCP Servers Integration
Connect our existing NZ-compliant MCP servers into the Buzz workspace by updating `crates/buzz-agent/config.toml` or mounting them as standard MCP tools. This gives every agent inside Buzz direct access to:
*   `mcp-nzbn` (lookup NZ Business Numbers)
*   `mcp-companies-office` (verify directors & company structures)
*   Local database schemas and vector stores.

---

## 5. Next Steps for Implementation

1.  **Complete the Buzz compilation:** Build the `block-buzz` Rust binaries (currently compiling in background).
2.  **Launch the local relay:** Run `just dev` inside `/tmp/assembl-setup/block-buzz` to start the Nostr relay and Tauri desktop client on `ws://localhost:3000`.
3.  **Run an active bridge:** Write a lightweight Node.js/pnpm bridge in `assembl-web` that listens to `ws://localhost:3000` and maps Buzz events directly to customer-facing wait-state pages (`/assembling`).
