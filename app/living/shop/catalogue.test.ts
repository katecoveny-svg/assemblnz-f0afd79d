import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { CAD_MANIFEST, PRODUCTS } from '@/lib/living/catalogue';
import { SURFACES } from '@/lib/living/system';
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
  it('uses related TURN references without asserting product equivalence', () => {
    for (const id of ['grid-starter', 'tile-starter', 'stack-starter']) {
      const evidence = engineeringFor(id)!;
      expect(evidence.pack).toBe('v0.3');
      expect(evidence.relationship).toBe('related-family-only');
      expect(ITEMS.find(item => item.id === id)).toMatchObject({ status: 'concept', revision: null });
      for (const product of evidence.products) expect(PRODUCTS).toContain(product);
      for (const part of evidence.parts) expect(CAD_MANIFEST.parts).toContainEqual(part);
      const destination = new URL(evidence.studioHref, 'https://example.test');
      expect(destination.pathname).toBe('/living/studio');
      expect(destination.searchParams.has('kit')).toBe(false);
      expect(SURFACES).toContain(destination.searchParams.get('surface'));
    }
    expect(engineeringFor('bowl-surround')).toBeNull();
    expect(engineeringFor('unknown')).toBeNull();
  });
  it('verifies every served TURN file against its generated size and checksum', () => {
    expect(CAD_MANIFEST.parts).toHaveLength(201);
    const served = CAD_MANIFEST.parts.filter(part => part.file);
    expect(served).toHaveLength(201);
    for (const part of served) {
      const file = part.file!;
      expect(file.path.startsWith('/living/cad/v0.3/')).toBe(true);
      const bytes = readFileSync(`public${file.path}`);
      expect(bytes.length).toBe(file.bytes);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.sha256);
    }
    for (const file of CAD_MANIFEST.test_kit.files) expect(existsSync(`public${file.path}`)).toBe(true);
    expect(existsSync('public/living/cad/AL-02')).toBe(false);
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
