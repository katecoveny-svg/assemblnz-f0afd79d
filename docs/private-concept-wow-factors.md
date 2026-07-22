# private-concept demo — wow-factor roadmap

_Kate's brief, 2026-07-22. These are the moments that make a flagship concept
feel like a dynamic, configurable platform rather than a polished slideshow. The
unifying principle: **let the executive change reality inside the demo and watch
the journey, agents and commercial outcome recompute.** Prioritised; each maps to
the existing verified architecture so it stays real, not decorative._

## Priority 1 — build next

### 1. The "change one thing" moment ⭐ (highest value)
One beautifully presented control that changes what happens; the experience
visibly reassembles: `household changed → plan reconsidered → basket rebalanced →
budget restored → approval updated → proof recalculated`.
- **Woolworths:** +2 guests · budget $240→$190 · a guest becomes gluten-free ·
  cancel Wednesday dinner · a product goes out of stock.
- **Air NZ:** delay +75m · traveller has a child · lounge full · tight connection
  · passenger declines the partner offer.
- **Contact:** household moves · bill spike · broadband outage · financially
  vulnerable · solar/EV added.
- **Fits today:** `currentPlan(run)` already re-derives deterministically from
  structured intent + context + applied resolutions. A control that mutates those
  and calls `setRun` recomputes plan/basket/budget/proof and both views update
  (they share one run — brief §3). This is the recommended next PR.

### 5. Agent negotiation made visible
A beautifully designed decision table (not a chat): basket agent best-fit vs
budget agent limit vs preference agent constraint → resolution agent's resolved
outcome assembling in the centre. Communicates why specialist agents beat one
generic assistant. **Fits:** driven by the resolution service + verification.

### 11. A commercial hypothesis that changes live
As the journey changes, the commercial opportunity + proposed pilot measures
update — proving assembl designs testable commercial systems, not screens.
**Fits:** recompute from run state + `ProofMetric` lineage.

## Priority 2

### 2. Journey director's cut
A premium horizontal cinematic timeline ("How this journey assembled") from the
run's event stream; each event expands to what changed / which agent / evidence /
approval / metric moved. **Fits:** `run.timeline` + `run.verifications` already
hold this; it's a richer read of existing data.

### 6. Executive control room ("What you could control")
Alter **business rules** (not customer inputs): reward budget, escalation
threshold, approval authority, acceptable basket variance, autonomy level, tone,
vulnerable-customer rule — then rerun. Makes it feel like a configurable
platform. **Fits:** the `GROCERY_RULES` / capability authority model.

### 3. Before assembl / with assembl
The fragmented journey (≈17 actions) collapsing to three (describe → review →
approve); taps removed, systems crossed, minutes saved, service contacts avoided.

### 14. Pilot simulator
Configure the smallest credible pilot (eligible customers, journey type,
duration, autonomy, data source, approval, primary measure) → assembl generates
scope, integrations, agent authority, test scenarios, measures, risks, timeline,
hypothesis. Final CTA: **"Save this pilot architecture"** (a strong lead signal).

## Priority 3

### 4. Counterfactual view — "what would have happened without intervention?"
Clearly labelled simulated/modelled, not measured. Shows why the agent intervened.

### 12. "Ask this journey anything"
Grounded Q&A over the actual run + capability registry + agent contracts +
disclosures + commercial hypothesis + pilot proposal (not a generic chatbot).

### 13. The human-rescue moment
One graceful handoff packaging goal / context / steps done / unresolved issue /
recommended next action / evidence / sentiment — "ready for Hannah, without asking
the customer to repeat anything." Resolution over autonomy. **Fits:** the
`human_handoff` event + escalation already in the runtime.

### 7. Customer memory passport
Only useful, permissioned context — each memory viewable / correctable /
one-time / removable / never-stored. "Personalisation you can see and control."

### 8. Cross-surface continuity
Journey begins on one surface (voice/app/email) and carries context to the next
(approval notification, shared household view, operator proof) without repeating.

### 10. The journey constellation
A quiet kinetic spatial composition (customer centre, stages as editorial nodes,
agents assembling around the active stage, Genome fragments as silver, approvals
as a threshold, proof gathering behind). Real-time from journey state; used
sparingly (hero reveal, transition into inside-the-journey, final replay).

### 9. One real live signal per flagship
Connect one genuine live source (Auckland weather; a public flight-status feed;
temperature-driven household energy) — labelled `live signal` vs `illustrative
context` vs `assembl response`. Dramatically increases believability without full
integration.

## Standing rules for every wow factor
Real, derived from journey state — never a background video. Counterfactuals and
projections are labelled simulated/modelled, never measured. Respect
reduced-motion. Nothing sends/orders; approvals stay in control. Live signals are
clearly separated from simulated context.
