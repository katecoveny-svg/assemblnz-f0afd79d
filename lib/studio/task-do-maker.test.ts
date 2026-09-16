import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BRAND,
  DEFAULT_CONFIG,
  applyTemplate,
  compileTaskDoSpec,
  draftFromSearchParams,
  draftToSearchParams,
  makerHref,
  normaliseBrand,
  previewHref,
} from './task-do-maker';

describe('task-do-maker', () => {
  it('compiles a drafts-only AgentSpec with white-label name', () => {
    const spec = compileTaskDoSpec(
      { ...DEFAULT_BRAND, displayName: 'Coastal Care' },
      {
        ...DEFAULT_CONFIG,
        templateId: 'research-brief',
        title: 'Research brief',
        job: 'Turn sources into a short brief.',
        opportunity: 'Quote prep wait state',
        partner: 'Coastal Care',
        task: 'research-brief',
      },
      { id: '11111111-1111-4111-8111-111111111111', now: '2026-09-16T00:00:00.000Z' },
    );

    expect(spec.name).toContain('Coastal Care');
    expect(spec.primitive).toBe('prepare');
    expect(spec.demo).toBe(true);
    expect(spec.status).toBe('needs_you');
    expect(spec.connector).toBe('hook-later');
    expect(spec.must_ask_before.some((item) => /send/i.test(item))).toBe(true);
    expect(spec.never.some((item) => /send without/i.test(item))).toBe(true);
    expect(spec.can_do_without_asking.some((item) => /\bsend\b/i.test(item))).toBe(false);
    expect(spec.brief).toContain('Opportunity: Quote prep wait state');
  });

  it('applies starter templates without wiping custom title', () => {
    const next = applyTemplate('school-admin', {
      ...DEFAULT_CONFIG,
      title: 'Kura notice helper',
      job: '',
    });
    expect(next.templateId).toBe('school-admin');
    expect(next.title).toBe('Kura notice helper');
    expect(next.job).toMatch(/school notice/i);
  });

  it('round-trips Pursuit handoff params through the share URL', () => {
    const draft = draftFromSearchParams(
      new URLSearchParams({
        opportunity: 'Service quote prep',
        partner: 'Northside Joinery',
        task: 'outreach-draft',
        template: 'outreach-draft',
        brand: 'Northside Joinery',
        accent: '#17384D',
        accent2: '#D6A55A',
        promise: 'Draft the next useful note.',
      }),
    );

    expect(draft.brand.displayName).toBe('Northside Joinery');
    expect(draft.brand.accent).toBe('#17384D');
    expect(draft.config.opportunity).toBe('Service quote prep');
    expect(draft.config.templateId).toBe('outreach-draft');
    expect(draft.config.title).toBe('Outreach draft');

    const params = draftToSearchParams(draft);
    expect(params.get('partner')).toBe('Northside Joinery');
    expect(params.get('opportunity')).toBe('Service quote prep');
    expect(previewHref(draft)).toContain('preview=1');
    expect(makerHref({ partner: 'Northside Joinery', task: 'outreach' })).toBe(
      '/studio/do-maker?partner=Northside+Joinery&task=outreach',
    );
  });

  it('rejects invalid accent colours', () => {
    expect(normaliseBrand({ accent: 'not-a-colour' }).accent).toBe(DEFAULT_BRAND.accent);
    expect(normaliseBrand({ accent: '#abc' }).accent).toBe('#abc');
  });
});
