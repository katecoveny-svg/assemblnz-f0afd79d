# DO Office — coordination architecture

**Status:** proposal + foundation started  
**Date:** 16 September 2026

DO Office is the visual coordination surface for a person's or organisation's DO agents.

It is **not** a second agent runtime and it is **not** a chat room full of bots. It sits on top of the existing portable `AgentSpec` model and makes work, responsibility, handoffs, approvals and proof visible.

## two surfaces, one runtime

### DO Companion

Purpose: **do this here, now**.

The companion is the spatial/portable surface that stays near the user while they work. It can appear as:

- native Mac floating companion
- browser side panel / extension
- hosted widget
- mobile/share sheet
- voice session

The surface gathers only explicitly selected/approved context, resolves the relevant DO capability and brings back the next useful action.

### DO Office

Purpose: **show me my team of DOs and what is happening**.

The office is the coordination cockpit for:

- personal DOs
- work DOs
- client/customer DOs
- tasks currently working
- approvals that need the human
- handoffs between specialist DOs
- evidence/receipts
- inboxes and provisioned identities

Both surfaces use the same runtime/policy/evidence primitives.

## model

Existing core:

`context + intent → AgentSpec → tools → permissions → outcome`

Office adds a coordination projection:

`AgentSpec → identity → workspace → task state → handoff/inbox → approval → evidence`

Canonical shared types begin in `apps/do/shared/office.ts`.

## identity

A DO may have:

- a stable display name
- a clear role
- workspace membership (`personal`, `work`, `client`)
- an icon/initials/visual identity
- optional tool permissions
- optional **actually provisioned** email address

Never invent an email address and display it as live merely because an agent has a name. The Office model distinguishes:

- `none`
- `proposed`
- `provisioned`
- `disabled`

Agent email already has infrastructure hooks elsewhere in the repo. DO Office should reuse/provision through that infrastructure rather than creating a parallel mail system.

## communication between DOs

Agents should not maintain an invisible free-form group chat as their primary coordination mechanism.

Use structured handoff messages:

- from
- to
- workspace
- message kind (`handoff`, `update`, `question`, `approval`, `evidence`)
- concise summary
- task id
- requested action
- evidence refs
- timestamp/read state

This makes coordination inspectable and prevents the system from becoming an unauditable conversation swarm.

A human-facing Office can render these as natural messages while retaining the structured envelope underneath.

## visual model

The Office should feel like a calm operating room, not Slack with robot avatars.

Suggested first view:

### top rail

- workspace picker: **personal · work · clients**
- universal `+ DO`
- overall system status
- compact search

### four primary zones

1. **needs you** — approvals/questions/blockers
2. **working** — active DOs with clear current task/progress
3. **done** — completed work with receipts
4. **inbox / handoffs** — structured messages and evidence transitions

### agent card / desk

Show:

- name + role
- personal/work/client badge
- current task
- status
- tools currently in use
- latest note
- approvals waiting
- recent receipt/evidence
- mailbox state/address only if provisioned
- open / pause / handoff / archive controls

Avoid noisy chat streams, fake typing indicators and anthropomorphic theatre that obscures what the system actually did.

## workspaces

### personal

Household, family, bills, travel, school, shopping, personal admin.

Personal memory is user-scoped. It must not be written back into Assembl company canon.

### work

Pursuit/research, customer work, tender monitoring, sales preparation, scheduling, documents, operations.

### client

A customer/tenant-owned DO team with its own Business Genome/context, permissions, data boundaries and proof.

A customer should eventually be able to adopt the Assembl platform and receive their own DO Office with agent templates relevant to their business.

## handoff rules

A handoff is useful when:

- one DO lacks the required specialist capability
- another DO owns the next stage of a workflow
- a skeptic/reviewer must check an important decision
- a task crosses personal/work/client boundaries and needs explicit permission

A handoff must preserve:

- user intent
- minimal required context
- authority boundary
- evidence/provenance
- requested output

Do not forward an entire conversation or entire Business Genome by default.

## approval model

Existing DO policy remains authoritative.

Consequential actions such as buy/book/send/post/submit/pay/sign remain approval-gated unless a future product policy explicitly grants a bounded authority level.

Office makes those approval boundaries more visible; it does not weaken them.

## emails and external identity

A DO may eventually send/receive through a provisioned mailbox, but:

- mailbox provisioning is explicit
- inbound/outbound credentials remain server-side
- the agent's outbound authority remains separate from owning an address
- important external sends should preview recipient/content and follow policy
- all external activity should leave evidence/audit receipts

## persistence

The current DO v0 JSON/in-memory store is explicitly not durable on serverless cold starts. DO Office should not deepen reliance on that store.

Production Office requires user/tenant-scoped durable persistence for:

- identities
- AgentSpecs
- workspace membership
- task state
- handoffs/messages
- approvals
- evidence refs
- mailbox provisioning state

The likely durable target is existing Supabase infrastructure, behind server-side authorization/RLS. Design the schema only after mapping existing agent/user tables so the repo does not gain another parallel identity/task system.

## relationship to Gemini Live

Gemini Live is one interaction channel into DO, not the Office runtime.

Voice may:

- create/compile an AgentSpec
- query Office state
- ask which DO needs the user
- prepare a handoff
- discuss evidence

It must not bypass normal tool permissions/approval policy simply because the interaction is conversational.

## first implementation sequence

1. shared Office types/projection over `AgentSpec` — **started**
2. persist Mac companion state + launch-at-login — **started**
3. audit existing durable agent/user/email tables before schema design
4. build read-only Office projection with Personal / Work / Client spaces
5. add structured internal handoff envelope
6. connect Needs You and evidence receipts
7. provision optional DO identities/mailboxes through existing email infrastructure
8. add voice as a controllable Office/Companion input
9. only then add bounded external actions

## product test

A good DO Office should let a user answer these in seconds:

- What are my DOs doing?
- What needs me?
- What just finished?
- What proof do I have?
- Who owns the next step?
- What can each DO actually access/do?

If the UI mainly makes the agents feel alive but makes those questions harder to answer, it is the wrong design.
