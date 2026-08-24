import { describe, expect, it } from 'vitest';
import {
  FOOD_WASTE_BILL_TITLE,
  parseParliamentBillRss,
  parseProposedBillDetail,
} from './parliament-bills';

describe('Parliament Bill feeds', () => {
  it('captures title-only proposed Bill RSS items', () => {
    const xml = `
      <rss><channel><item>
        <guid isPermaLink="false">03d4e61a-c2ca-419e-226e-08dee83dd17b</guid>
        <link>https://bills.parliament.nz/v/1/03d4e61a-c2ca-419e-226e-08dee83dd17b</link>
        <title>Waste Minimisation (Food Waste) Amendment Bill</title>
        <description />
      </item></channel></rss>
    `;

    expect(parseParliamentBillRss(xml, 'proposed')).toEqual([
      {
        id: '03d4e61a-c2ca-419e-226e-08dee83dd17b',
        title: FOOD_WASTE_BILL_TITLE,
        url: 'https://bills.parliament.nz/v/1/03d4e61a-c2ca-419e-226e-08dee83dd17b',
        stage: 'proposed',
      },
    ]);
  });

  it('extracts the evidence fields from Parliament’s proposed Bill API', () => {
    expect(parseProposedBillDetail({
      ProposedDate: '2026-07-23T00:00:00+12:00',
      Description: 'This bill seeks to address food waste.',
      Members: [
        { PreferredFormOfAddress: 'Another Member', IsInCharge: false },
        { PreferredFormOfAddress: 'Kahurangi Carter', IsInCharge: true },
      ],
      BillBallots: [{ Drawn: false }],
    })).toEqual({
      lodgedDate: '23 Jul 2026',
      memberInCharge: 'Kahurangi Carter',
      summary: 'This bill seeks to address food waste.',
      drawn: false,
    });
  });
});
