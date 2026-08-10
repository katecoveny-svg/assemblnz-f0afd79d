# assembl · context

> Public website and demonstrator copy must follow [the assembl copy standard](./assembl-copy-standard.md). Where older positioning in this document conflicts with that standard, the copy standard wins.

## Project overview

assembl is building a new category of software.

It is **not** a chatbot platform. It is **not** an automation agency. It is
**not** a traditional customer experience platform.

assembl creates agentic customer journeys that understand customer intent,
assemble the right specialist agents around that journey, complete meaningful
work on behalf of customers and businesses, and provide measurable proof that
the experience has improved.

The long-term vision is to become the operating system for agentic customer
experiences.

## Vision

Every business already has a customer journey. Today those journeys are
fragmented across:

- websites
- CRMs
- email
- support systems
- loyalty platforms
- booking systems
- internal staff
- spreadsheets
- disconnected AI tools

assembl sits above those systems. It assembles a coordinated digital workforce
that helps customers move through the journey with less friction and more
confidence.

The customer should feel like the business understands them. The business
should feel like work is disappearing.

## Core positioning

assembl creates agentic customer journeys that:

- understand intent
- gather only useful context
- recommend the next best action
- complete work safely
- keep humans in control
- prove business outcomes

Our promise is not intelligence. Our promise is:

**Find the friction. Assemble the journey. Prove the result.**

## Product philosophy

Every feature must answer one question: **Does this help a customer complete
something meaningful?**

Avoid building AI simply because AI is possible. Everything must remove friction.

## Design philosophy

assembl should feel unlike traditional SaaS. The interface should feel calm,
premium and highly visual.

- paper white
- generous whitespace
- editorial layout
- restrained typography
- subtle motion
- premium interaction
- no dashboard clutter
- no glowing AI clichés
- no cartoon robots
- no canary yellow

Motion should communicate work happening — never decorative animation.
Everything should feel like information assembling.

_(Current design canon: [`assembl-brand-system.md`](./assembl-brand-system.md).)_

## Visual language

The visual metaphor is assembly. Knowledge assembles. Intent assembles.
Journeys assemble. Agents assemble. Recommendations assemble. Proof assembles.

The customer should always understand what the system is doing. The interface
should make invisible AI visible.

## Strategic direction — six layers

### 1. Business Genome

The structured understanding of a business: products, services, customer types,
policies, terminology, workflows, permissions, goals, systems, tools, knowledge,
success metrics. The Genome is the source of truth for every journey.

### 2. Customer Journey

A reusable journey model. Every customer journey consists of stages — typically:
entry, intent, context, recommendation, commitment, action, wait, fulfilment,
resolution, continuation. Every industry uses the same architecture; only
configuration changes.

### 3. Specialist agent team

assembl does not believe in one giant assistant. Every journey is supported by
specialist roles (Intent, Context, Planning, Recommendation, Action, Wait,
Resolution, Loyalty…). The customer may never know these agents exist;
internally they collaborate through a shared runtime.

### 4. Runtime

The Runtime is the operating system: context selection, orchestration,
permissions, tools, memory, traces, approvals, state, policy, reliability. Every
journey runs through the Runtime — no customer has bespoke orchestration.

### 5. Wait state

Waiting is part of almost every journey. assembl transforms waiting into value.
Instead of "Loading…", the customer experiences progress, understanding,
preparation, recommendations, confidence and useful interaction. Waiting should
feel productive.

### 6. Proof

Every journey should prove value: time saved, work completed, recommendations
accepted, interventions, approvals, journey completion, customer effort
reduction, business outcome improvements. Proof is a core product feature.

## The Business Genome

The Business Genome is not a CRM and not customer data — it is structured
business intelligence. Typical objects: Business, Products, Services, Customer
Segments, Knowledge, Policies, Rules, Brand Voice, Terminology, Tools,
Permissions, Success Metrics, Journey Templates, Agent Definitions, Evaluation
Suites, Industry Packs. Everything references the Genome; never duplicate
business configuration.

## Agent principles

Agents must be specialised. Every agent has: Purpose, Inputs, Outputs, Authority,
Tools, Skills, Limitations, Evaluations, Owner, Version. Agents do not improvise
responsibilities — they collaborate.

### Authority levels

Every action has authority: observe · draft · recommend · act with approval ·
act within limits · autonomous with audit. Humans always remain in control of
important actions.

## Customer journey philosophy

Customers should never complete long forms. assembl asks only the smallest
useful next question. Every interaction should feel relevant, timely, helpful,
minimal. The system should progressively understand the customer.

### Context

Only retrieve context required for the current journey stage. Never load the
entire Business Genome into every request. Context selection is a product
feature.

### Credibility

assembl must never exaggerate capability. If something is simulated, label it
simulated. If something is proposed, label it proposed. If something requires
approval, say so clearly. Trust is more important than appearing intelligent.

### Wait state philosophy

Waiting should reduce uncertainty, collect missing context, prepare the next
step, educate, reward and increase confidence. Waiting should never be a spinner.

### Experience principles

The customer should feel: "I don't have to explain myself twice." · "I always
know what happens next." · "The business understands my situation." · "I stayed
in control."

## Technical principles

Prefer deterministic workflows over unnecessary AI. Use AI where reasoning adds
value; use code where code is more reliable. Every output should be typed. Every
action should be traceable. Every important decision should have evidence. Every
journey should be measurable.

## Initial reference journey

The first production reference journey is **everyday, assembled**. The customer
enters natural-language intent; the platform understands, asks relevant
questions, creates recommendations, builds an approval-ready basket, uses a
productive wait state, handles exceptions and records proof. The architecture
must remain reusable for every future industry.

_(Implementation: `lib/journey/` + `app/journeys/` — see
`docs/agentic-customer-journey.md`.)_

## Future journey templates

The architecture should support Retail, Energy, Airlines, Insurance, Healthcare,
Trades, Professional Services, Hospitality, Property, Education and Government
without changing the underlying Runtime. Only the Business Genome configuration
changes.

## Long-term goal

```
Business Genome → Journey Composer → Runtime → Agent Team → Customer Experience → Proof
```

The customer sees a beautiful journey. The business sees measurable outcomes.
The platform sees reusable architecture.

That is assembl.
