import { describe, expect, it } from 'vitest';
import { HOME_RANGE, widgetSpec } from './index';

describe('home range', () => {
  it('names every AC-02 view it lists, with a preview and a prototype widget', () => {
    expect(HOME_RANGE.length).toBe(12);
    for (const item of HOME_RANGE) {
      expect(item.preview).toMatch(/^\/living\/cad\/ac02\/previews\/.+\.webp$/);
      expect(item.view.approvedForManufacture).toBe(false);
      const spec = widgetSpec(item.handle);
      expect(spec?.kind).toBe('prototype');
      expect(spec?.priceNzd ?? null).toBeNull();
    }
  });
  it('covers shelving, furniture and decor', () => {
    const groups = new Set(HOME_RANGE.map((h) => h.group));
    for (const g of ['shelving', 'furniture', 'decor']) expect(groups.has(g as never)).toBe(true);
  });
});
