import { describe, expect, it } from 'vitest';
import {
  calendarWeekAhead,
  nzPrivacyAct2020,
  pipelineMovement,
  pulseSynthesis,
  tikangaCompliance,
  xeroCashPosition,
  type BusinessPulseInputs,
} from '../skills';

function baseInputs(overrides: Partial<BusinessPulseInputs> = {}): BusinessPulseInputs {
  return {
    integrations: [],
    syncedData: [],
    pilotHealthRows: [],
    threshold: 5000,
    ...overrides,
  };
}

describe('Business Pulse skills', () => {
  it('computes a Xero cash forecast from cached invoices', async () => {
    const cash = await xeroCashPosition(
      baseInputs({
        syncedData: [
          {
            provider_code: 'xero',
            data_type: 'bank_balance',
            data: { balance: 3000 },
          },
          {
            provider_code: 'xero',
            data_type: 'invoices',
            data: { type: 'ACCREC', status: 'AUTHORISED', amount_due: 4500, contact_name: 'Pilot Co' },
          },
          {
            provider_code: 'xero',
            data_type: 'invoices',
            data: { type: 'ACCPAY', status: 'AUTHORISED', amount_due: 1000, contact_name: 'Supplier Co' },
          },
        ],
      }),
    );

    expect(cash.fourteenDayForecast).toBe(6500);
    expect(cash.accountsReceivableDue).toBe(4500);
    expect(cash.accountsPayableDue).toBe(1000);
    expect(cash.belowThreshold).toBe(false);
  });

  it('keeps synthesis to three items and stages outbound actions', async () => {
    const cash = await xeroCashPosition(
      baseInputs({
        threshold: 10000,
        syncedData: [
          { provider_code: 'xero', data_type: 'bank_balance', data: { balance: 1000 } },
          { provider_code: 'xero', data_type: 'invoices', data: { type: 'ACCREC', status: 'AUTHORISED', amount_due: 500 } },
        ],
      }),
    );
    const commitments = calendarWeekAhead(
      baseInputs({
        integrations: [
          {
            provider_code: 'google_calendar',
            status: 'connected',
            metadata: { week_ahead: [{ title: 'TOA Architecture review', prep_note: 'Read the pack first.' }] },
          },
        ],
      }),
    );
    const pipeline = pipelineMovement(
      baseInputs({
        integrations: [
          {
            provider_code: 'hubspot',
            status: 'connected',
            metadata: { stuck_deals: [{ name: 'Aironaut', days_stuck: 21, stage: 'Pilot' }] },
          },
        ],
      }),
    );

    const priorities = pulseSynthesis({ cash, commitments, pipeline });

    expect(priorities).toHaveLength(3);
    expect(priorities.filter((item) => item.approvalRequired)).toHaveLength(2);
    expect(priorities.every((item) => item.stagedAction?.status)).toBe(true);
  });

  it('flags privacy and tikanga review issues', () => {
    expect(nzPrivacyAct2020('IRD 123456789 belongs here').passed).toBe(false);
    expect(tikangaCompliance('Maori governance note').passed).toBe(false);
    expect(tikangaCompliance('Māori governance note').passed).toBe(true);
  });
});
