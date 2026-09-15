import { describe, expect, it } from 'vitest';
import {
  compileAgent,
  enforceApprovalPolicy,
  requiresHumanApproval,
  detectConsequentialVerb,
  DEMO_TEMPLATES,
  CONSEQUENTIAL_VERBS,
  templatesByLane,
  templatesForPack,
  getTemplate,
  activateAgent,
  saveAgent,
  chooseLane,
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

  it('public catalog excludes Mitre / SAP and includes creative-web-director', () => {
    const publicTemplates = templatesForPack('public');
    const ids = publicTemplates.map((t) => t.id);
    expect(ids).toContain('power-price-watch');
    expect(ids).toContain('creative-web-director');
    expect(ids).toContain('xero-recurring-cost-watch');
    expect(ids).not.toContain('mitre10-sap-rfp-brief');
    expect(ids).not.toContain('mitre10-sap-competitor-watch');
    expect(ids.every((id) => !/mitre|sap/i.test(id))).toBe(true);

    const groups = templatesByLane('public');
    expect(groups.some((g) => g.lane === 'pursuit-mitre10-sap')).toBe(false);
    expect(groups.some((g) => g.lane === 'creative-ensemble')).toBe(true);
    expect(groups.some((g) => g.lane === 'personal-household')).toBe(true);

    const mitre = templatesForPack('mitre10');
    expect(mitre).toHaveLength(5);
    expect(mitre.every((t) => t.lane === 'pursuit-mitre10-sap')).toBe(true);
  });

  it('compiles from a template id', () => {
    const { spec } = compileAgent({ brief: '', templateId: 'kids-tomorrow' });
    expect(spec.primitive).toBe('prepare');
    expect(spec.name).toMatch(/Kids tomorrow/i);
    expect(spec.templateId).toBe('kids-tomorrow');
  });

  it('compiles creative web director from NL (not Mitre / price watch)', () => {
    const { spec, honesty } = compileAgent({
      brief: 'create a creative agent that could direct web design',
      page: {
        url: 'https://example.co.nz/brand',
        title: 'Brand page',
      },
    });
    expect(spec.templateId).toBe('creative-web-director');
    expect(spec.name).toBe('Creative web director');
    expect(spec.primitive).toBe('prepare');
    expect(spec.lane).toBe('ensemble');
    expect(spec.watches.some((w) => /brand refs|brief|page/i.test(w))).toBe(true);
    expect(spec.can_do_without_asking.some((a) => /art directions/i.test(a))).toBe(true);
    expect(spec.must_ask_before).toEqual(
      expect.arrayContaining(['publish', 'export', 'send']),
    );
    expect(spec.brief.toLowerCase()).not.toMatch(/mitre|sap|price watch/i);
    expect(JSON.stringify(spec).toLowerCase()).not.toMatch(/mitre 10/);
    expect(honesty).toMatch(/Ensemble/i);
    expect(chooseLane('prepare', spec.brief)).toBe('ensemble');
  });

  it('compiles creative-web-director template id cleanly', () => {
    const template = getTemplate('creative-web-director');
    expect(template?.lane).toBe('creative-ensemble');
    const { spec } = compileAgent({
      brief: '',
      templateId: 'creative-web-director',
    });
    expect(spec.name).toBe('Creative web director');
    expect(spec.lane).toBe('ensemble');
    expect(spec.must_ask_before).toEqual(
      expect.arrayContaining(['publish', 'export', 'send']),
    );
  });

  it('still compiles Mitre pack when templateId is explicit (private)', () => {
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

describe('DO Mitre activate → Evidence (private pack)', () => {
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

describe('DO catalog integrity', () => {
  it('ships a broad public launch catalog', () => {
    expect(templatesForPack('public').length).toBeGreaterThanOrEqual(18);
    expect(DEMO_TEMPLATES.length).toBeGreaterThanOrEqual(20);
  });
});

describe('DO public agent list filter', () => {
  it('hides Mitre/SAP pursuit agents from the public pack', async () => {
    const { filterAgentsForPack, isPublicAgent } = await import('./public-agents');
    const mitre = compileAgent({
      brief: '',
      templateId: 'mitre10-sap-rfp-brief',
      page: {
        url: 'fixture://mitre10-sap-rfp',
        title: 'DEMO · Mitre 10 SAP pursuit — RFP snippet',
      },
    }).spec;
    const publicAgent = compileAgent({ brief: '', templateId: 'plan-compare' }).spec;

    expect(isPublicAgent(mitre)).toBe(false);
    expect(isPublicAgent(publicAgent)).toBe(true);
    expect(filterAgentsForPack([mitre, publicAgent], 'public').map((a) => a.id)).toEqual([
      publicAgent.id,
    ]);
    expect(filterAgentsForPack([mitre, publicAgent], 'mitre10')).toHaveLength(2);
  });
});
