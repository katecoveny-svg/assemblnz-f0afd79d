import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { CAD_MANIFEST, PARTS } from '@/lib/living/catalogue';
import { KITS } from '@/lib/living/kits';
import { ITEMS, engineeringFor, sanitiseSelection } from './catalogue';
import { PACKS, PRODUCT_PHOTOS } from './editorial-data';
import { POST } from '@/app/api/living/shop-checkout/route';

describe('Living storefront reconciliation', () => {
  it('resolves every set and image to an existing proposed product', () => {
    for (const pack of PACKS) for (const id of [pack.primary, ...pack.extras]) {
      expect(ITEMS.some(item => item.id === id)).toBe(true);
      expect(PRODUCT_PHOTOS[id]).toBeTruthy();
    }
  });
  it('uses canonical AL-02 evidence and valid Studio starting points', () => {
    for (const id of ['grid-starter', 'tile-starter', 'stack-starter']) {
      const evidence = engineeringFor(id)!;
      expect(evidence.pack).toBe(CAD_MANIFEST.pack);
      for (const part of evidence.parts) expect(PARTS).toContain(part);
      const kit = new URL(evidence.studioHref, 'https://example.test').searchParams.get('kit');
      if (kit) expect(KITS.some(k => k.id === kit)).toBe(true);
    }
    expect(engineeringFor('bowl-surround')).toBeNull();
    expect(engineeringFor('unknown')).toBeNull();
  });
  it('preserves all nine canonical printable and editable files byte-for-byte', () => {
    expect(CAD_MANIFEST.parts).toHaveLength(9);
    expect(JSON.parse(readFileSync('public/living/cad/AL-02/manifest.json', 'utf8'))).toEqual(CAD_MANIFEST);
    for (const part of CAD_MANIFEST.parts) {
      for (const ext of ['stl', 'step'] as const) {
        const file = `public/living/cad/AL-02/${part.id}.${ext}`;
        expect(existsSync(file)).toBe(true);
        expect(createHash('sha256').update(readFileSync(file)).digest('hex')).toBe(part.files[ext]?.sha256);
      }
    }
  });
  it('discards forged manufacturing approval and invalid input on saved-kit import', () => {
    const selection = sanitiseSelection({ id: 'test', productId: 'grid-starter', manufacturingRevision: 'APPROVED', approvedForManufacture: true, quantity: 200, widthMm: -1, depthMm: Infinity, fitConfirmed: true });
    expect(selection).toMatchObject({ manufacturingRevision: null, approvedForManufacture: false, quantity: 20, widthMm: null, depthMm: null, fitConfirmed: false });
    expect(sanitiseSelection({ id: 'test', productId: 'unknown' })).toBeNull();
  });
  it('refuses checkout on the server without creating an order or checkout URL', async () => {
    const response = await POST();
    expect(response.status).toBe(409);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toMatchObject({ code: 'PRODUCT_RELEASE_REQUIRED', checkoutUrl: null, orderCreated: false });
  });
});
