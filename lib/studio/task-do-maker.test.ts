import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BRAND,
  DEFAULT_CONFIG,
  PARTNER_SKINS,
  applyCustomClient,
  applyPartnerSkin,
  applyTemplate,
  compileTaskDoSpec,
  draftFromSearchParams,
  draftToSearchParams,
  makerHref,
  normaliseBrand,
  partnerAliasHref,
  partnerMakerHref,
  previewHref,
  templatesForMode,
} from './task-do-maker';
import {
  bpLoyaltyMomentConciergeJourney,
  normaliseJourney,
} from './pursuit-journey';

describe('task-do-maker', () => {
  it('compiles a drafts-only AgentSpec with white-label name (Mode A)', () => {
    const spec = compileTaskDoSpec(
      { ...DEFAULT_BRAND, displayName: 'Coastal Care' },
      {
        ...DEFAULT_CONFIG,
        mode: 'pursuit',
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
    expect(spec.brief).toContain('Mode: pursuit');
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

    expect(draft.config.mode).toBe('pursuit');
    expect(draft.brand.displayName).toBe('Northside Joinery');
    expect(draft.brand.accent).toBe('#17384D');
    expect(draft.config.opportunity).toBe('Service quote prep');
    expect(draft.config.templateId).toBe('outreach-draft');
    expect(draft.config.title).toBe('Outreach draft');
    expect(draft.journey).toBeTruthy();

    const params = draftToSearchParams(draft);
    expect(params.get('partner')).toBe('Northside Joinery');
    expect(params.get('opportunity')).toBe('Service quote prep');
    expect(params.get('mode')).toBeNull();
    expect(previewHref(draft)).toContain('preview=1');
    expect(makerHref({ partner: 'Northside Joinery', task: 'outreach' })).toBe(
      '/studio/do-maker?partner=Northside+Joinery&task=outreach',
    );
  });

  it('loads Mode B partner skins offline with rewarded-wait posture and BP concierge journey', () => {
    const seeded = applyPartnerSkin('bp');
    expect(seeded.brand.displayName).toBe(PARTNER_SKINS.bp.productName);
    expect(seeded.config.mode).toBe('partner');
    expect(seeded.config.partnerSlug).toBe('bp');
    expect(seeded.config.templateId).toBe('rewarded-wait');
    expect(seeded.journey.title).toMatch(/Loyalty Moment Concierge/i);
    expect(seeded.journey.sponsored.enabled).toBe(true);
    expect(seeded.journey.sponsored.asaLabel).toBe('Sponsored');
    expect(seeded.journey.sponsored.stages.map((s) => s.id)).toEqual([
      'ad_loyalty',
      'branded_agent',
      'useful_step',
      'genuine_offer',
      'permit',
      'action',
      'receipt',
    ]);
    expect(seeded.journey.sponsored.honesty).toMatch(/no bp account link/i);
    expect(PARTNER_SKINS.bp.verticalHint).toMatch(/fuel/i);

    const draft = draftFromSearchParams(new URLSearchParams({ mode: 'partner', partner: 'warehouse' }));
    expect(draft.config.mode).toBe('partner');
    expect(draft.config.partnerSlug).toBe('warehouse');
    expect(draft.brand.accent).toBe(PARTNER_SKINS.warehouse.brand.accent);
    expect(draft.config.templateId).toBe('task-utility');
    expect(draft.journey.sponsored.enabled).toBe(true);

    const spec = compileTaskDoSpec(draft.brand, draft.config, {
      id: '22222222-2222-4222-8222-222222222222',
      now: '2026-09-16T00:00:00.000Z',
    });
    expect(spec.brief).toContain('Mode: partner');
    expect(spec.brief).toContain('Partner skin: warehouse');
    expect(spec.never.some((item) => /scrape/i.test(item))).toBe(true);
    expect(spec.connector).toBe('hook-later');
    expect(spec.lastNote).toMatch(/partner-facing skin/i);

    expect(partnerMakerHref('bp')).toBe('/studio/do-maker?mode=partner&partner=bp');
    expect(partnerAliasHref('warehouse')).toBe('/do/maker/partner/warehouse');
    expect(draftToSearchParams(draft).get('mode')).toBe('partner');
    expect(draftToSearchParams(draft).get('sponsored')).toBe('1');
  });

  it('supports custom clients without a partner skin dropdown', () => {
    const custom = applyCustomClient('Northside Joinery', { mode: 'pursuit' });
    expect(custom.config.partnerSlug).toBeNull();
    expect(custom.brand.displayName).toBe('Northside Joinery');
    expect(custom.journey.title).toMatch(/Northside Joinery/);
  });

  it('normalises BP Loyalty Moment Concierge seed', () => {
    const journey = normaliseJourney(bpLoyaltyMomentConciergeJourney());
    expect(journey.sponsored.asaLabel).toBe('Sponsored');
    expect(journey.outreach.enabled).toBe(true);
    expect(journey.brief).toMatch(/fuel/i);
    expect(journey.steps).toHaveLength(4);
  });

  it('filters templates by mode', () => {
    const pursuit = templatesForMode('pursuit').map((t) => t.id);
    const partner = templatesForMode('partner').map((t) => t.id);
    expect(pursuit).toContain('research-brief');
    expect(pursuit).not.toContain('rewarded-wait');
    expect(partner).toContain('rewarded-wait');
    expect(partner).toContain('task-utility');
    expect(partner).not.toContain('outreach-draft');
  });

  it('rejects invalid accent colours', () => {
    expect(normaliseBrand({ accent: 'not-a-colour' }).accent).toBe(DEFAULT_BRAND.accent);
    expect(normaliseBrand({ accent: '#abc' }).accent).toBe('#abc');
  });
});
