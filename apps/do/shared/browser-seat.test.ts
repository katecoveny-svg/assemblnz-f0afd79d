import { describe, expect, it } from 'vitest';

import {
  BROWSER_SEAT_BOUNDARY,
  BROWSER_SEAT_FOLLOW_UPS,
  browserSeatCaptureInput,
  isAllowedHouseholdBrowserHost,
  mintBrowserSeatReceipt,
  playbookFromLearnCapture,
} from './browser-seat';

describe('DO browser seat', () => {
  const base = {
    doId: '11111111-1111-4111-8111-111111111111',
    sessionKey: 'do-browser-seat:11111111-1111-4111-8111-111111111111',
    consent: true as const,
    consentScope: 'domain' as const,
    url: 'https://demo-college.bridge.school.nz/notices',
    title: 'Notices',
    pageText: 'Sports tomorrow. Bring shin pads. No payments listed.',
  };

  it('requires consent and mints a read-only receipt', () => {
    expect(browserSeatCaptureInput.safeParse({ ...base, consent: false }).success).toBe(false);
    const parsed = browserSeatCaptureInput.parse(base);
    const receipt = mintBrowserSeatReceipt(parsed, { now: '2026-09-16T08:00:00.000Z' });
    expect(receipt.boundary).toBe(BROWSER_SEAT_BOUNDARY);
    expect(receipt.screenshotAttached).toBe(false);
    expect(receipt.source).toBe('chrome_extension');
  });

  it('allows catalog school hosts and learn-mode playbooks', () => {
    expect(isAllowedHouseholdBrowserHost(base.url)).toBe(true);
    expect(isAllowedHouseholdBrowserHost('https://evil.example/pay')).toBe(false);
    const parsed = browserSeatCaptureInput.parse({
      ...base,
      learnMode: true,
      playbookLabel: 'open college notices',
      screenshotBase64: 'aaa',
      screenshotMimeType: 'image/png',
    });
    const receipt = mintBrowserSeatReceipt(parsed);
    const playbook = playbookFromLearnCapture(parsed, receipt.id);
    expect(playbook?.label).toBe('open college notices');
    expect(playbook?.steps.length).toBeGreaterThan(2);
    expect(BROWSER_SEAT_FOLLOW_UPS.isolatedChromiumProfiles.status).toBe('follow_up');
  });
});
