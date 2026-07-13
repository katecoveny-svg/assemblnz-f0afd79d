import { describe, expect, it } from 'vitest';
import { CAPABILITIES, resolveCapability } from './capabilities';
import { OS_AGENTS, recommendStartingTeam } from './agents';

describe('resolveCapability', () => {
  it('routes customer email through the approval gate', () => {
    const cap = resolveCapability('send_customer_email');
    expect(cap.resolution).toBe('action_request');
    expect(cap.requestKind).toBe('email_draft');
    expect(cap.risk).toBe('high');
    expect(cap.needsApproval).toBe(true);
    expect(cap.available).toBe(true);
  });

  it('internal capabilities run without approval only when low risk', () => {
    expect(resolveCapability('read_genome').needsApproval).toBe(false);
    expect(resolveCapability('suggest_genome_fact').needsApproval).toBe(true);
    expect(resolveCapability('suggest_genome_fact', true).needsApproval).toBe(false);
  });

  it('is honest about unconnected capabilities', () => {
    const cal = resolveCapability('create_calendar_event');
    expect(cal.available).toBe(false);
    expect(cal.resolution).toBe('not_connected');
  });

  it('unknown capabilities resolve unavailable at high risk', () => {
    const cap = resolveCapability('teleport_customer');
    expect(cap.available).toBe(false);
    expect(cap.risk).toBe('high');
    expect(cap.needsApproval).toBe(true);
  });

  it('no capability resolves to a direct external side effect', () => {
    for (const c of CAPABILITIES) {
      expect(['action_request', 'internal', 'not_connected']).toContain(c.resolution);
    }
  });
});

describe('OS agent registry', () => {
  it('every agent only requests declared capabilities', () => {
    const keys = new Set(CAPABILITIES.map((c) => c.key));
    for (const agent of Object.values(OS_AGENTS)) {
      for (const cap of agent.capabilities) expect(keys.has(cap)).toBe(true);
    }
  });

  it('recommends a small starting team, never the catalogue', () => {
    const team = recommendStartingTeam('dog-training');
    expect(team.length).toBe(3);
    expect(team.map((a) => a.id)).toContain('desk');
  });

  it('the desk agent may read the whole genome but never self-approves', () => {
    const desk = OS_AGENTS.desk;
    expect(desk.genomeDomains.length).toBe(6);
    expect(desk.approvalRequirements).toMatch(/named operator/);
  });
});
