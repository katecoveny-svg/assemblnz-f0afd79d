import { describe, expect, it } from 'vitest';
import { buildDealerTemplate, dealerBriefSchema, dealerPackText, type DealerBrief } from './dealer-content';

const brief: DealerBrief = { marque: 'Subaru', model: 'WRX', dealership: 'Sample dealership', location: 'Auckland', campaign: 'Vehicle introduction', facts: 'Blue\nFour-door sedan', contact: '', reviewer: 'Sales manager' };

describe('dealership campaign drafts', () => {
  it('uses the supplied facts without inferring finance, price or stock availability', () => {
    const output = JSON.stringify(buildDealerTemplate(brief));
    expect(output).toContain('Four-door sedan');
    expect(output).not.toMatch(/\$|finance|interest|warranty|in stock|available now|202kW|AWD/);
  });
  it('keeps different marques and vehicles independent across drafts', () => {
    buildDealerTemplate(brief);
    const output = JSON.stringify(buildDealerTemplate({ ...brief, marque: 'Toyota', model: 'Corolla', facts: 'White hatchback' }));
    expect(output).toContain('Toyota Corolla');
    expect(output).toContain('White hatchback');
    expect(output).not.toMatch(/Subaru|WRX|Four-door sedan|Blue/);
  });
  it('makes a service campaign relevant to the ownership stage', () => {
    const pack = buildDealerTemplate({ ...brief, campaign: 'Service reminder' });
    expect(pack.social).toContain('service appointment');
    expect(pack.social).not.toContain('test drive');
  });
  it('requires vehicle facts and a reviewer before drafting', () => {
    expect(dealerBriefSchema.safeParse({ ...brief, facts: '', reviewer: '' }).success).toBe(false);
    expect(dealerBriefSchema.safeParse({ ...brief, model: '' }).success).toBe(false);
    expect(dealerBriefSchema.safeParse(brief).success).toBe(true);
  });
  it('exports an editable record with its method, supplied facts and human review state', () => {
    const pack = buildDealerTemplate(brief); pack.social = 'Edited by the dealership.';
    const record = dealerPackText(brief, pack, 'Template draft');
    expect(record).toContain('Edited by the dealership.');
    expect(record).toContain('Prepared for: Sales manager');
    expect(record).toContain('Method: Template draft');
    expect(record).toContain('nothing published');
  });
});
