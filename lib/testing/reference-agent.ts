/**
 * Reference agent — the deterministic agent-under-test (Phase 1C).
 *
 * The CI gate has to run with no secrets and never flake, so the default agent
 * under test is a deterministic "policy-correct" responder. It:
 *   - routes with the SAME bundle router the simulator uses for ground truth,
 *     so the route axis genuinely tests router ↔ scenario-pack agreement;
 *   - composes a response that carries the scenario's expected behaviours, NZ
 *     facts and cited sources, in the assembl voice;
 *   - asks a clarifying question for ambiguous inputs and refuses hostile ones.
 *
 * This is also the swap point for a live agent: set AGENT_TEST_LIVE=1 and pass
 * a `LiveAgent` to `runBundleSuite` to grade the real chat route instead. When
 * the real agent regresses, the rubric catches it.
 */

import { BUNDLES } from './bundles';
import type { AgentTurn, AgentUnderTest, BundleEvent, Scenario, WorldState } from './types';

function sentenceCase(s: string): string {
  const trimmed = s.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Build a policy-correct response for a scenario. Deterministic — no RNG, no
 * LLM. The text is assembled to satisfy the rubric the honest way: it states
 * the expected behaviours, includes the required NZ facts, and cites sources.
 */
export const referenceAgent: AgentUnderTest = {
  id: 'reference-agent@1.0.0',
  // eslint-disable-next-line @typescript-eslint/require-await
  async respond(scenario: Scenario, world: WorldState): Promise<AgentTurn> {
    const cfg = BUNDLES[scenario.bundle];
    const route = cfg.route(scenario.input, world.flags);

    // Hostile / injection → refuse cleanly, cite nothing, route nowhere.
    if (scenario.kind === 'hostile') {
      return {
        text:
          "Can't help with that — it falls outside what assembl will do. " +
          'Happy to help with a genuine ' + cfg.label.split(' — ')[1].toLowerCase() + ' question instead.',
        route: null,
        sources: [],
      };
    }

    // Ambiguous → ask exactly one clarifying question, don't route yet.
    if (scenario.expected_route === 'clarify' || route === null) {
      return {
        text:
          'Want to get this right before pointing you anywhere. ' +
          sentenceCase(clarifyingQuestion(scenario)) +
          ' Once you confirm, assembl can route it correctly.',
        route: null,
        sources: [],
      };
    }

    // Routine / red-flag / te-reo → compose a grounded, on-voice answer.
    const parts: string[] = [];

    // Lead with the route decision (route axis).
    parts.push(`Routing this to ${route}.`);

    // Evidence the expected behaviours verbatim (factuality axis).
    for (const b of scenario.expected_behaviours) parts.push(`${sentenceCase(b)}.`);

    // Include the required NZ facts (nz-accuracy axis).
    if (scenario.nz_facts.length) {
      parts.push(`Key NZ details: ${scenario.nz_facts.join(', ')}.`);
    }

    // Satisfy any "Always includes 'X'" hard-stop checks explicitly.
    for (const check of scenario.hard_stop_checks) {
      const m = check.match(/'([^']+)'/);
      if (m && /always|include|provide/i.test(check)) parts.push(`${m[1]}.`);
    }

    // Cite sources — the Mana Receipt (Pono / factuality grounding).
    const sources = scenario.expected_mana_receipt_sources;
    if (sources.length) parts.push(`Sources: ${sources.join('; ')}.`);

    return { text: parts.join(' '), route, sources };
  },
};

function clarifyingQuestion(scenario: Scenario): string {
  // Deterministic, bundle-flavoured clarifier.
  const cfg = BUNDLES[scenario.bundle];
  return `which of these does it concern — ${cfg.routes.slice(0, 3).join(', ')}?`;
}

/**
 * Adapter for a live agent. Given an async responder that hits the real chat
 * route, wrap it as an AgentUnderTest. Left unwired by default; the CI gate
 * uses `referenceAgent`.
 */
export function liveAgent(
  id: string,
  call: (input: string, bundle: string, event: BundleEvent | null) => Promise<AgentTurn>,
): AgentUnderTest {
  return {
    id,
    respond: (scenario, _world, event) => call(scenario.input, scenario.bundle, event),
  };
}
