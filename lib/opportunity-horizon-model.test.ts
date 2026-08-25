import { describe, expect, it } from 'vitest';
import {
  inferOpportunityStage,
  normalizeOpportunity,
  OPPORTUNITY_LIFECYCLE,
  shouldIncludeOpportunity,
  type OpportunityDocumentContext,
  type OpportunitySourceContext,
} from './opportunity-horizon-model';

const now = new Date('2026-08-26T00:00:00.000Z');

function source(overrides: Partial<OpportunitySourceContext> = {}): OpportunitySourceContext {
  return {
    id: 'source-1',
    name: 'GETS — Future Procurement Opportunities',
    url: 'https://www.gets.govt.nz/m/FutureProcurementOpportunitiesIndex.htm',
    category: 'opportunity_horizon',
    authorityTier: 1,
    authorityWeight: 0.98,
    provenance: 'Official GETS register',
    status: 'ok',
    lastCheckedAt: '2026-08-25T22:00:00.000Z',
    config: {
      opportunity: {
        source_class: 'procurement_forecast',
        default_stage: 'PROCUREMENT_FORECAST',
        publisher_org: 'Government Electronic Tenders Service',
        extraction_scope: 'item',
        include_keywords: ['future procurement opportunity'],
      },
    },
    ...overrides,
  };
}

function document(overrides: Partial<OpportunityDocumentContext> = {}): OpportunityDocumentContext {
  return {
    id: 'doc-1',
    title: 'Future Procurement Opportunity — food rescue service platform',
    url: 'https://www.gets.govt.nz/example',
    content: 'Organisation: Ministry Example Tender Type: FPO. A digital participant service and provider handoff pilot. Close 30 Sep 2026.',
    publishedAt: '2026-08-25T00:00:00.000Z',
    insertedAt: '2026-08-25T01:00:00.000Z',
    metadata: null,
    ...overrides,
  };
}

describe('Opportunity Horizon model', () => {
  it('models the full proposed-to-journey lifecycle in order', () => {
    expect(OPPORTUNITY_LIFECYCLE.map((stage) => stage.key)).toEqual([
      'POLICY_PROPOSED',
      'CABINET_DECIDED',
      'MONEY_ALLOCATED',
      'DELIVERY_OBLIGATION',
      'PROCUREMENT_FORECAST',
      'MARKET_ENGAGEMENT',
      'RFX_OPEN',
      'AWARD',
      'CUSTOMER_JOURNEY_CHANGE',
    ]);
  });

  it('keeps FPO ahead of generic RFx language', () => {
    expect(inferOpportunityStage('FPO — Future Procurement Opportunity with an indicative RFx date', 'RFX_OPEN'))
      .toBe('PROCUREMENT_FORECAST');
  });

  it('extracts a buyer only from an explicitly labelled item', () => {
    const item = normalizeOpportunity({ source: source(), document: document(), now });
    expect(item.buyerOrg).toBe('Ministry Example');
    expect(item.stage).toBe('PROCUREMENT_FORECAST');
    expect(item.likelyToSayYesQuickly).toBeGreaterThanOrEqual(7);
    expect(item.likelyToSayYesQuickly).toBeLessThanOrEqual(10);
  });

  it('does not invent a buyer from a publisher or broad listing page', () => {
    const listingSource = source({
      name: 'Ministry for Regulation — Regulatory Analysis Summaries',
      authorityTier: 2,
      config: {
        opportunity: {
          source_class: 'regulatory_analysis',
          default_stage: 'POLICY_PROPOSED',
          publisher_org: 'Ministry for Regulation',
          extraction_scope: 'listing_page',
          include_keywords: ['regulatory analysis'],
        },
      },
    });
    const item = normalizeOpportunity({
      source: listingSource,
      document: document({ title: 'Regulatory analysis library', content: 'Regulatory analysis for food waste settings.' }),
      now,
    });
    expect(item.publisherOrg).toBe('Ministry for Regulation');
    expect(item.buyerOrg).toBeNull();
    expect(item.limitations).toContain('No buyer is named in the extracted evidence.');
  });

  it('applies keyword gates and lowers confidence for market signals', () => {
    const nzx = source({
      authorityTier: 3,
      config: {
        opportunity: {
          source_class: 'private_nzx',
          default_stage: 'CUSTOMER_JOURNEY_CHANGE',
          publisher_org: 'NZX',
          extraction_scope: 'listing_page',
          include_keywords: ['transformation'],
        },
      },
    });
    expect(shouldIncludeOpportunity(nzx, document({ content: 'Routine dividend notice' }))).toBe(false);
    const relevant = document({ content: 'Customer service transformation and platform investment' });
    expect(shouldIncludeOpportunity(nzx, relevant)).toBe(true);
    expect(normalizeOpportunity({ source: nzx, document: relevant, now }).confidence).toBeLessThan(0.8);
  });
});
