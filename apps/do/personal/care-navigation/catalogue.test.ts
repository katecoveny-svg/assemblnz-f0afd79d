import { describe, expect, it } from 'vitest';
import { NZ_CARE_BOUNDARY, NZ_CARE_CONTACTS, NZ_CARE_GUIDES, NZ_CARE_REVIEWED_ON, NZ_CARE_SOURCES, nextNzCareStep, nzCareChecklistText, nzCareGuide, nzCareReviewNeedsChecking } from './catalogue';

describe('NZ care navigation catalogue', () => {
  it('offers practical, sourced guides across health, aged care and retirement', () => {
    expect(NZ_CARE_GUIDES.map((guide) => guide.id)).toEqual(['nz-super', 'supergold', 'home-support', 'residential-care', 'gp-appointments', 'carer-breaks', 'retirement-village', 'rights-support']);
    expect(new Set(NZ_CARE_GUIDES.map((guide) => guide.id)).size).toBe(NZ_CARE_GUIDES.length);
    for (const guide of NZ_CARE_GUIDES) {
      expect(guide.steps).toHaveLength(4);
      expect(new Set(guide.steps.map((step) => step.id)).size).toBe(4);
      expect(guide.questions.length).toBeGreaterThanOrEqual(3);
      expect(guide.documents.length).toBeGreaterThanOrEqual(2);
      expect(guide.sourceIds.length).toBeGreaterThanOrEqual(2);
      expect(guide.sourceIds.every((id) => NZ_CARE_SOURCES[id])).toBe(true);
      expect(guide.boundary.length).toBeGreaterThan(60);
    }
  });
  it('keeps date-stamped sources on explicitly curated official domains', () => {
    const hosts = new Set(['www.police.govt.nz', 'www.healthnz.govt.nz', 'www.workandincome.govt.nz', 'www.supergold.govt.nz', 'www.govt.nz', 'www.hdc.org.nz', 'www.officeforseniors.govt.nz', 'www.companiesoffice.govt.nz', 'www.legislation.govt.nz']);
    for (const source of Object.values(NZ_CARE_SOURCES)) {
      const url = new URL(source.url);
      expect(url.protocol).toBe('https:');
      expect(hosts.has(url.hostname)).toBe(true);
      expect(url.search + url.hash + url.username + url.password).toBe('');
      expect(source.reviewedOn).toBe(NZ_CARE_REVIEWED_ON);
    }
  });
  it('uses the verified emergency and human-service numbers directly', () => {
    expect(NZ_CARE_CONTACTS.map((contact) => [contact.id, contact.href])).toEqual([
      ['emergency', 'tel:111'], ['healthline', 'tel:0800611116'], ['seniorline', 'tel:0800725463'],
      ['police', 'tel:105'], ['advocacy', 'tel:0800555050'], ['elder-abuse', 'tel:08003266865'],
    ]);
    for (const contact of NZ_CARE_CONTACTS) {
      expect(contact.href).toBe(`tel:${contact.number.replaceAll(' ', '')}`);
      expect(NZ_CARE_SOURCES[contact.sourceId]).toBeDefined();
    }
    expect(NZ_CARE_BOUNDARY).toContain('monitor emergencies');
  });
  it('does not add an unverified mental-health crisis number', () => {
    expect(NZ_CARE_CONTACTS.some((contact) => /suicide|self.harm|mental.health|crisis/i.test(JSON.stringify(contact)))).toBe(false);
  });
  it('labels the fixed review date conservatively, including invalid and old clocks', () => {
    expect(nzCareReviewNeedsChecking(new Date('2026-09-30T00:00:00Z'))).toBe(false);
    expect(nzCareReviewNeedsChecking(new Date('2026-12-28T23:59:59Z'))).toBe(false);
    expect(nzCareReviewNeedsChecking(new Date('2026-12-29T00:00:00Z'))).toBe(true);
    expect(nzCareReviewNeedsChecking(new Date('2026-09-29T23:59:59Z'))).toBe(true);
    expect(nzCareReviewNeedsChecking(new Date('invalid'))).toBe(true);
  });
  it('finds only known guides and returns the next unreviewed preparation step', () => {
    const guide = nzCareGuide('nz-super')!;
    expect(nzCareGuide('not-a-guide')).toBeUndefined();
    expect(nextNzCareStep(guide, [])?.id).toBe('rules');
    expect(nextNzCareStep(guide, ['rules', 'made-up-step'])?.id).toBe('timing');
    expect(nextNzCareStep(guide, guide.steps.map((step) => step.id))).toBeUndefined();
  });
  it('exports only the selected guide, useful questions and dated sources', () => {
    const text = nzCareChecklistText(nzCareGuide('nz-super')!, ['rules', 'injected\n[ x ] secret']);
    expect(text).toContain('[x] Read the official eligibility guide');
    expect(text).toContain('[ ] Check your application window');
    expect(text).toContain('QUESTIONS TO ASK');
    expect(text).toContain('DOCUMENTS TO KEEP PRIVATELY');
    expect(text).toContain(NZ_CARE_SOURCES.super.url);
    expect(text).toContain(NZ_CARE_REVIEWED_ON);
    expect(text).toContain('not a service, assessment or application completed');
    expect(text).toContain('Emergency in New Zealand: call 111');
    expect(text).toContain('No information has been sent');
    expect(text).not.toContain('injected');
    expect(text).not.toContain('Rest-home care & funding');
  });
  it('does not bake payment amounts, means-test thresholds or entitlement calculators into a guide', () => {
    const funding = JSON.stringify(nzCareGuide('residential-care'));
    expect(funding).not.toMatch(/\$\d/);
    expect(funding).toContain('No means test');
    expect(JSON.stringify(nzCareGuide('nz-super'))).toContain('cannot decide whether you qualify');
    expect(JSON.stringify(nzCareGuide('retirement-village'))).toContain('independent legal advice before signing');
  });
});
