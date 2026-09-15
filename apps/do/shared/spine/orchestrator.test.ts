import { describe, expect, it } from 'vitest';
import { createOrchestratorSpine } from './orchestrator';
import type { DoRuntimeStatus } from '../runtime-status';

const demoRuntime: DoRuntimeStatus = {
  mode: 'assembl',
  provider: 'assemblHosted',
  capability: 'demo',
  label: 'Assembl runtime · DEMO',
  note: 'test',
  spine: 'orchestrator',
};

describe('DO Agents spine orchestrator', () => {
  it('compiles a portable AgentSpec (not a chat turn)', async () => {
    const spine = createOrchestratorSpine(() => demoRuntime);
    const result = await spine.compile({
      brief: 'watch this page for price changes',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.spine).toBe('orchestrator');
    expect(result.output.spec.primitive).toBe('watch');
    expect(result.handoffs[0]?.to).toBe('do.compile');
    expect(result.session.job).toBe('compile');
  });

  it('Clear is anti-slop rewrite with marks', async () => {
    const spine = createOrchestratorSpine(() => demoRuntime);
    const result = await spine.clear('We act in order to win due to the fact that time is short.');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output.rewritten.toLowerCase()).not.toContain('in order to');
    expect(result.output.marks.length).toBeGreaterThan(0);
    expect(result.handoffs[0]?.reason).toMatch(/not Grammarly/i);
  });

  it('HITL pauses consequential hard jobs', async () => {
    const spine = createOrchestratorSpine(() => demoRuntime);
    const result = await spine.hardJob({
      brief: 'compare quotes then send the winner to the buyer',
      contextSummary: 'fixture quotes',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.interruptions.length).toBeGreaterThan(0);
    const resolved = await spine.resolveInterruption({
      sessionId: result.session.id,
      interruptionId: result.interruptions[0].id,
      decision: 'approve',
    });
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    expect(resolved.output.note).toMatch(/DEMO/i);
  });
});
