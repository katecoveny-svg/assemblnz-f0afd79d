import { describe, expect, it } from 'vitest';
import {
  compileAgent,
  enforceApprovalPolicy,
  requiresHumanApproval,
  detectConsequentialVerb,
  DEMO_TEMPLATES,
  CONSEQUENTIAL_VERBS,
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

  it('ships five NZ DEMO templates', () => {
    expect(DEMO_TEMPLATES).toHaveLength(5);
    const ids = DEMO_TEMPLATES.map((t) => t.id);
    expect(ids).toEqual([
      'price-watcher',
      'school-notice',
      'gets-opportunity',
      'quote-compare',
      'kids-tomorrow',
    ]);
  });

  it('compiles from a template id', () => {
    const { spec } = compileAgent({ brief: '', templateId: 'kids-tomorrow' });
    expect(spec.primitive).toBe('prepare');
    expect(spec.name).toMatch(/Kids tomorrow/i);
  });
});
