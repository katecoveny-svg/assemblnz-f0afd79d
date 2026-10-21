/** Every widget item (products, kits, lab) with its default parts, for the cost model. Run from the repo root:
 *    pnpm exec tsx tools/living-cad/launch/dump_items.ts > tools/living-cad/launch/widget-items.json */
import { widgetSpec, WIDGET_LAB, WIDGET_PRODUCTS, WIDGET_KITS, LAB_HANDLE_PREFIX } from '../../../lib/living/widget';
const out: unknown[] = [];
const handles = [...WIDGET_PRODUCTS.map((p) => p.handle), ...WIDGET_KITS.map((k) => k.handle), ...WIDGET_LAB.map((l) => LAB_HANDLE_PREFIX + l.id)];
for (const h of handles) {
  const s = widgetSpec(h);
  if (!s) continue;
  out.push({ handle: h, kind: s.kind, title: s.title, type: s.type, material: s.material, size: s.size, priceNzd: s.priceNzd, shipG: s.shipG, parts: s.partsFor({}), lines: s.lines });
}
process.stdout.write(JSON.stringify(out, null, 1));
