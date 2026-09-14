import { describe, expect, it } from 'vitest';
import {
  compileAgent,
  enforceApprovalPolicy,
  requiresHumanApproval,
  detectConsequentialVerb,
  DEMO_TEMPLATES,
  CONSEQUENTIAL_VERBS,
  templatesByLane,
  getTemplate,
  activateAgent,
  saveAgent,
} from './index';

describe('DO approval policy', () => {
  it('flags every consequential verb', () => {
    for (const v of CONSEQUENTIAL_VERBS) {
      expect(requiresHumanApproval(`please ${v} now`)).toBe(true);
      expect(detectConsequentialVerb(`please ${v} now`)).toBe(v);
    }
  });

  it('does not flag safe observation verbs', () => {
    expect(requiresHumanApproval('snapshot the page')).toBe(false);
    expect(requiresHumanApproval('draft a comparison')).toBe(false);
  });

  it('moves consequential actions out of can_do_without_asking', () => {
    const enforced = enforceApprovalPolicy({
      can_do_without_asking: ['snapshot page', 'buy the item', 'draft a note'],
      must_ask_before: [],
      never: [],
    });
    expect(enforced.can_do_without_asking).toEqual(['snapshot page', 'draft a note']);
    expect(enforced.must_ask_before.some((a) => /buy/i.test(a))).toBe(true);
    expect(enforced.never.some((n) => /human yes/i.test(n))).toBe(true);
  });
});

describe('DO compile', () => {
  it('compiles “tell me if this changes” into a watch AgentSpec', () => {
    const { spec, honesty } = compileAgent({
      brief: 'tell me if this changes',
      page: {
        url: 'https://example.co.nz/deal',
        title: 'Weekend deal',
        selectedText: '$49',
        pageText: 'Weekend deal now $49 while stocks last.',
      },
    });
    expect(spec.primitive).toBe('watch');
    expect(spec.watches[0]).toBe('https://example.co.nz/deal');
    expect(spec.status).toBe('needs_you');
    expect(spec.demo).toBe(true);
    expect(honesty).toMatch(/DEMO/);
    expect(spec.can_do_without_asking.every((a) => !requiresHumanApproval(a))).toBe(true);
  });

  it('ships a broad launch catalog with Mitre 10 SAP pack', () => {
    expect(DEMO_TEMPLATES.length).toBeGreaterThanOrEqual(20);
    const ids = DEMO_TEMPLATES.map((t) => t.id);
    expect(ids).toContain('power-price-watch');
    expect(ids).toContain('mitre10-sap-rfp-brief');
    expect(ids).toContain('mitre10-sap-competitor-watch');
    expect(ids).toContain('mitre10-sap-stakeholder-map');
    expect(ids).toContain('mitre10-sap-proposal-compare');
    expect(ids).toContain('mitre10-sap-next-meeting');
    expect(ids).toContain('xero-recurring-cost-watch');
    expect(ids).toContain('explain-until-solve');

    const mitre = DEMO_TEMPLATES.filter((t) => t.lane === 'pursuit-mitre10-sap');
    expect(mitre).toHaveLength(5);
    expect(mitre.every((t) => t.summary.length > 10)).toBe(true);

    const groups = templatesByLane();
    expect(groups.some((g) => g.lane === 'pursuit-mitre10-sap')).toBe(true);
    expect(groups.some((g) => g.lane === 'personal-household')).toBe(true);
    expect(groups.some((g) => g.lane === 'sme')).toBe(true);
  });

  it('compiles from a template id', () => {
    const { spec } = compileAgent({ brief: '', templateId: 'kids-tomorrow' });
    expect(spec.primitive).toBe('prepare');
    expect(spec.name).toMatch(/Kids tomorrow/i);
    expect(spec.templateId).toBe('kids-tomorrow');
  });

  it('compiles Mitre 10 RFP brief with SAP connector hint available', () => {
    const template = getTemplate('mitre10-sap-rfp-brief');
    expect(template?.connectorHint).toBe('sap');
    expect(template?.lane).toBe('pursuit-mitre10-sap');
    const { spec } = compileAgent({
      brief: '',
      templateId: 'mitre10-sap-rfp-brief',
      page: {
        url: 'fixture://mitre10-sap-rfp',
        title: 'DEMO · Mitre 10 SAP pursuit — RFP snippet',
        pageText: 'PO visibility · SAP MM / SD · human approval before write-back',
      },
      connector: 'sap',
    });
    expect(spec.primitive).toBe('prepare');
    expect(spec.connector).toBe('sap');
    expect(spec.watches.some((w) => w.includes('mitre10-sap-rfp'))).toBe(true);
  });
});

describe('DO Mitre activate → Evidence', () => {
  it('activates Mitre RFP brief into Needs you with Evidence', async () => {
    const { spec } = compileAgent({
      brief: '',
      templateId: 'mitre10-sap-rfp-brief',
      page: {
        url: 'fixture://mitre10-sap-rfp',
        title: 'DEMO · Mitre 10 SAP pursuit — RFP snippet',
        pageText: 'Closing 24 Oct 2026 · SAP MM / SD touchpoints',
      },
    });
    await saveAgent(spec);
    const activated = await activateAgent(spec.id, { connector: 'hook-later' });
    expect(activated).not.toBeNull();
    expect(activated!.status).toBe('needs_you');
    expect(activated!.evidence).toBeTruthy();
    expect(activated!.evidence!.summary).toMatch(/Draft ready/i);
    expect(activated!.pendingApprovals.length).toBeGreaterThan(0);
    expect(activated!.connector).toBe('hook-later');
  });
});
