# private-concept platform — strategic brief

_The strategic direction for assembl's private outreach concepts (Woolworths /
Everyday Rewards, Air New Zealand, Contact Energy). Kate's brief, captured
2026-07-22, with the four implementation additions below._

## The central idea

One shared journey engine. One private editorial structure. One completely
recognisable customer experience per organisation.

The Woolworths, Air New Zealand and Contact concepts are **not** rebuilt as
generic assembl dashboards. They become **branded customer-facing moments within
the same verified journey architecture** (`lib/journey/*`, `/experience`,
verification, proof, capability truth model).

**Commercial shift.** The existing microsites say _"here is an exciting product
idea."_ The new format says: _here is a specific customer journey, the working
experience it creates, the system operating underneath it, the business result
we would test, and the smallest credible way to pilot it._ That moves assembl
from speculative design toward forward-deployed agentic customer-experience
strategy.

## What each concept must prove

- **Woolworths / Everyday Rewards** (the golden journey): natural-language input
  → context assembly → plan & basket → budget resolution → approval → productive
  wait state → proof. (Reuses `everyday, assembled`.)
- **Air New Zealand**: a very different journey — passenger state → disruption /
  wait detection → useful intervention → reward or partner moment → onward action
  → proof. Operations stays the decision authority; no autonomous rebooking.
- **Contact Energy**: a service & account relationship — household context →
  usage/billing concern → recommendation → approval → action preparation →
  service resolution → retention/support proof.

Once all three run through **one renderer**, assembl has a reusable private-
concept platform.

## Four implementation additions (mandatory)

### 1. Preserve before replacing
Before modifying any existing concept, capture its current route, screenshots,
copy, responsive behaviour, animations and reusable components. Preserve the
strongest implementation rather than recreating it approximately. _(See
`docs/concept-visual-inventory.md`.)_ The existing
`/customers/{everyday-rewards,air-nz,contact-energy}` microsites are **not
deleted or degraded** by this work — the private-concept surface is additive.

### 2. Separate configuration from bespoke presentation
Not every screen is one generic component. Split:

```
shared                         tenant-specific
──────                         ───────────────
private arrival                signature visual moment
journey map                    brand-adapted interaction
runtime state                  customer scenario
inside-the-journey             micro-animation
verification                   industry language
proof
commercial model
pilot
disclosures
```

Do **not** force all three signature demos into identical card structures. The
editorial frame, runtime, proof and verification are shared; each organisation
gets a genuinely custom signature experience slot.

### 3. One shared run ID across both views
The customer view and inside-the-journey view must be **two representations of
the same journey run**, not separate mock states.

> **Acceptance:** the customer experience and inside-the-journey view consume the
> same journey run id, event stream, scenario state, approvals and
> `ProofMetric`s. Changing a scenario input in either view updates both
> representations consistently.

_(The existing `JourneyExperience` already renders both views from a single
`run` object — this brief keeps that invariant and validates it explicitly.)_

### 4. Protect the microsites appropriately
"Unlisted" URLs are not meaningfully private. For flagship targets:

- named private routes;
- optional organisation-specific access tokens / magic links;
- `noindex`;
- no sitemap inclusion;
- no public tenant directory;
- expiry / revocation support;
- clear independent-concept disclosure ("independent concept · simulated data ·
  not an active partnership").

## Build sequence (do not build all three in parallel)

```
shared private renderer
→ Woolworths complete golden journey
→ validate shared architecture
→ Air New Zealand adaptation
→ Contact adaptation
```

## Provided outreach assets (source of copy — do not paraphrase)

Kate's `build.py` + outreach emails define the exact hooks, chips, pilot asks and
disclosures per organisation. Concept copy is taken from those verbatim; no new
marketing copy is authored. Recipients/targets: Oliver Lynch (Everyday Rewards),
Jeremy O'Brien (Air New Zealand), Carolyn Luey (Contact Energy). Outreach URLs
point at the concept-studio host; the assembl repo serves the equivalent private
routes.

## Non-negotiables carried from the platform

Everything simulated + labelled; nothing sends/orders (ordering `unavailable`);
approvals cannot be overridden by input; agent invocations are contract-verified
and block downstream on failure; tenant isolation enforced; secrets server-side;
proof metrics carry data lineage. See `docs/public-sandbox-security-review.md`
and `docs/staging-verification-report.md`.
