import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { WIDGET_KITS, WIDGET_PRODUCTS, WidgetMessageSchema, buildItem, defaultAccent, itemMessage, kitSku, lineItemProperties, partCode, partRole, printSheet, textSpecFor, widgetSpec } from './index';
import type { Colourway } from './system';

describe('widget spec', () => {
  it('describes a plain board: seven living colours, no choices, no text, no accent', () => {
    const spec = widgetSpec('al-board-4x4')!;
    expect(spec.colours.map((c) => c.id)).toEqual(['chalk', 'oat', 'sage', 'clay', 'plum', 'ash', 'ink']);
    expect(spec.choices).toEqual([]);
    const parts = spec.partsFor({});
    expect(textSpecFor(parts.map((p) => p.id))).toBeNull();
    expect(parts.some((p) => partRole(p.id) === 'accent')).toBe(false);
  });

  it('gives every manifest product a spec that builds with defaults', () => {
    for (const p of WIDGET_PRODUCTS) {
      const spec = widgetSpec(p.handle)!;
      expect(spec).not.toBeNull();
      const text = textSpecFor(spec.partsFor({}).map((x) => x.id));
      const r = buildItem({ handle: p.handle, colour: spec.colours[0].id, text: text ? (text.pattern.test('7') ? '7' : 'Mia') : null, now: '2026-10-19T00:00:00Z' });
      expect(r.ok, `${p.handle}: ${r.issues.join(' ')}`).toBe(true);
      expect(r.item!.estimate.perUnit.massG).toBeGreaterThan(0);
    }
  });

  it('returns null for unknown handles', () => {
    expect(widgetSpec('nope')).toBeNull();
    expect(buildItem({ handle: 'nope', colour: 'chalk' }).ok).toBe(false);
  });

  it('offers only the colours the launch catalogue lists: twelve for dayrally, not the wider manifest set', () => {
    const pod = widgetSpec('al-pod-standard')!;
    expect(pod.colours.length).toBe(12);
    expect(pod.colours.some((c) => c.id === 'sage')).toBe(false);
    expect(widgetSpec('al-kit-dayrally-ride-kit')!.colours.length).toBe(12);
  });

  it('derives pod lids and inserts from the manifest, swapping the default parts', () => {
    const spec = widgetSpec('al-pod-standard')!;
    const lid = spec.choices.find((c) => c.key === 'lid')!;
    const insert = spec.choices.find((c) => c.key === 'insert')!;
    expect(lid.defaultId).toBe('plain');
    expect(lid.options.map((o) => o.id)).toEqual(expect.arrayContaining(['plain', 'name', 'waves', 'dots', 'stars']));
    expect(insert.defaultId).toBe('everyday');
    const ids = spec.partsFor({ lid: 'name', insert: 'tackle' }).map((p) => p.id);
    expect(ids).toEqual(expect.arrayContaining(['dr2-pod-standard', 'dr2-lid-standard-name', 'dr2-lid-standard-name-inlay', 'dr2-insert-standard-tackle', 'grid-turn-key']));
    expect(ids).not.toContain('dr2-lid-standard-plain');
    expect(ids).not.toContain('dr2-insert-standard-everyday');
  });

  it('offers charm shapes with their inlays', () => {
    const spec = widgetSpec('al-bag-charm')!;
    const shape = spec.choices.find((c) => c.key === 'shape')!;
    expect(shape.defaultId).toBe('star');
    expect(shape.options.map((o) => o.id)).toEqual(expect.arrayContaining(['heart', 'fish', 'wave']));
    expect(spec.partsFor({ shape: 'heart' }).map((p) => p.id)).toEqual(['dr2-charm-heart', 'dr2-charm-heart-inlay']);
  });
});

describe('building an item', () => {
  it('needs a name on the name plate and prints the lettering in a differing accent', () => {
    const missing = buildItem({ handle: 'al-name-plate', colour: 'chalk' });
    expect(missing.ok).toBe(false);
    expect(missing.issues).toContain('Add the name.');
    const same = buildItem({ handle: 'al-name-plate', colour: 'chalk', accent: 'chalk', text: 'Mia' });
    expect(same.ok).toBe(false);
    const r = buildItem({ handle: 'al-name-plate', colour: 'chalk', text: 'Mia', now: '2026-10-19T00:00:00Z' });
    expect(r.ok).toBe(true);
    const item = r.item!;
    expect(item.accent?.id).toBe('ink');
    expect(item.text).toEqual({ label: 'Name', value: 'Mia' });
    expect(item.printFiles.find((f) => f.id === 'grid-name-plate-text')?.role).toBe('accent');
    expect(item.printFiles.find((f) => f.id === 'grid-name-plate')?.role).toBe('body');
    expect(item.sku).toBe('AL-NP-CHA-' + partCode({ short: 'NP' }, 'chalk')!.slice(-1));
    expect(item.estimate.perUnit.massG).toBeCloseTo(20 + 0.8 + 2 * item.printFiles.find((f) => f.id === 'grid-turn-key')!.massG, 1);
    expect(item.estimate.perUnit.printMinutes).toBe(Math.round((item.estimate.perUnit.massG / 30) * 60));
    expect(item.purchasing.status).toBe('store_decides');
  });

  it('asks for a lid name only when the name lid is chosen', () => {
    expect(buildItem({ handle: 'al-pod-mini', colour: 'tomato' }).ok).toBe(true);
    const r = buildItem({ handle: 'al-pod-mini', colour: 'tomato', choices: { lid: 'name' } });
    expect(r.ok).toBe(false);
    expect(r.issues[0]).toMatch(/name on the lid/);
    const ok = buildItem({ handle: 'al-pod-mini', colour: 'tomato', choices: { lid: 'name' }, text: 'Ari' });
    expect(ok.ok).toBe(true);
    expect(ok.item!.choices.lid).toEqual({ id: 'name', label: 'Name' });
  });

  it('keeps plate numbers to one to three digits', () => {
    expect(buildItem({ handle: 'al-number-plate', colour: 'lime', text: '12a' }).issues[0]).toMatch(/digits/);
    expect(buildItem({ handle: 'al-number-plate', colour: 'lime', text: '1234' }).issues[0]).toMatch(/limited to 3/);
    expect(buildItem({ handle: 'al-number-plate', colour: 'lime', text: '42' }).ok).toBe(true);
  });

  it('bounds quantity and multiplies totals', () => {
    expect(buildItem({ handle: 'al-hook', colour: 'oat', qty: 0 }).ok).toBe(false);
    expect(buildItem({ handle: 'al-hook', colour: 'oat', qty: 21 }).ok).toBe(false);
    const r = buildItem({ handle: 'al-hook', colour: 'oat', qty: 3 });
    expect(r.item!.estimate.total.suggestedRetailNzd).toBe(r.item!.estimate.perUnit.suggestedRetailNzd! * 3);
    expect(r.item!.estimate.total.printMinutes).toBe(r.item!.estimate.perUnit.printMinutes * 3);
  });

  it('matches the manifest SKU to the part code for every living colour', () => {
    for (const p of WIDGET_PRODUCTS.filter((x) => x.colours === 'living' && x.short)) {
      for (const c of widgetSpec(p.handle)!.colours) {
        const sku = p.skus.find((s) => s.colour.toLowerCase() === c.name.toLowerCase())?.sku;
        expect(sku, `${p.handle} ${c.id}`).toBe(partCode(p, c.id as Colourway));
      }
    }
  });

  it('picks a readable default accent', () => {
    const spec = widgetSpec('al-name-plate')!;
    expect(defaultAccent(spec.colours, spec.colours.find((c) => c.id === 'chalk')!).id).toBe('ink');
    expect(defaultAccent(spec.colours, spec.colours.find((c) => c.id === 'ink')!).id).toBe('chalk');
  });
});

describe('what the store receives', () => {
  const item = buildItem({ handle: 'al-pod-standard', colour: 'sky', accent: 'ink', choices: { lid: 'name', insert: 'tech' }, text: 'Tane', qty: 2, now: '2026-10-19T00:00:00Z' }).item!;

  it('writes readable line item properties and one hidden machine record', () => {
    const props = lineItemProperties(item);
    expect(props).toMatchObject({ Colour: 'Sky', Accent: 'Ink', Lid: 'Name', Insert: 'Tech', 'Name on the lid': 'Tane' });
    expect(props['Part code']).toBe(item.sku);
    const hidden = JSON.parse(props._assembl_item);
    expect(hidden.schema).toBe('assembl.living.item/1');
    expect(hidden.files.some((f: { id: string }) => f.id === 'dr2-lid-standard-name-inlay')).toBe(true);
    expect(props._assembl_item.length).toBeLessThan(1500);
  });

  it('emits a parseable item message naming the Colour variant', () => {
    const msg = itemMessage(item);
    expect(WidgetMessageSchema.parse(msg)).toEqual(msg);
    expect(msg.type === 'assembl:item' && msg.variant).toEqual({ option: 'Colour', value: 'Sky', sku: item.sku });
    expect(WidgetMessageSchema.safeParse({ type: 'assembl:item', item: { nope: true } }).success).toBe(false);
  });

  it('prints a sheet with a colour per role and says where files come from', () => {
    const sheet = JSON.parse(printSheet(item));
    expect(sheet.status).toBe('proposed');
    const inlay = sheet.files.find((f: { id: string }) => f.id === 'dr2-lid-standard-name-inlay');
    expect(inlay.colour).toBe('Ink');
    expect(sheet.files.find((f: { id: string }) => f.id === 'dr2-pod-standard').colour).toBe('Sky');
    expect(sheet.files.find((f: { id: string }) => f.id === 'grid-turn-key').servedFrom).toBe('public pack');
    expect(sheet.note).toMatch(/test kit/);
  });
});

describe('kits as one customisable package', () => {
  it('builds every kit in its first colour, summing the parts of every line', () => {
    for (const k of WIDGET_KITS) {
      const spec = widgetSpec(k.handle)!;
      expect(spec.kind).toBe('kit');
      expect(spec.lines.length).toBe(k.lines.length);
      const text = textSpecFor(spec.partsFor({}).map((x) => x.id));
      const r = buildItem({ handle: k.handle, colour: spec.colours[0].id, text: text ? (text.pattern.test('7') ? '7' : 'Mia') : null, now: '2026-10-19T00:00:00Z' });
      expect(r.ok, `${k.handle}: ${r.issues.join(' ')}`).toBe(true);
      expect(r.item!.estimate.perUnit.suggestedRetailNzd).toBe(k.price_nzd);
      expect(r.item!.lines.every((l) => l.sku)).toBe(true);
    }
  });

  it('asks for the name when a kit contains the name plate, and codes the kit like the launch catalogue', () => {
    const missing = buildItem({ handle: 'al-kit-teen-room-starter', colour: 'chalk' });
    expect(missing.ok).toBe(false);
    expect(missing.issues).toContain('Add the name.');
    const r = buildItem({ handle: 'al-kit-teen-room-starter', colour: 'chalk', text: 'Mia', now: '2026-10-19T00:00:00Z' });
    expect(r.ok).toBe(true);
    const item = r.item!;
    expect(item.sku).toBe('AL-KTEEROO-CHA');
    expect(item.accent?.id).toBe('ink');
    expect(item.printFiles.find((f) => f.id === 'grid-board-4x4')?.qty).toBe(2);
    expect(item.lines.find((l) => l.handle === 'al-name-plate')?.sku).toBe('AL-NP-CHA-' + partCode({ short: 'NP' }, 'chalk')!.slice(-1));
    const props = lineItemProperties(item);
    expect(props.Contents).toContain('2 × Grid board 4×4');
    expect(props.Name).toBe('Mia');
    expect(JSON.parse(props._assembl_item).lines.length).toBe(5);
  });

  it('matches every kit SKU in the launch catalogue CSV', () => {
    const csv = readFileSync(path.join(process.cwd(), 'tools/living-cad/launch/shopify-products.csv'), 'utf8');
    const skus = new Set([...csv.matchAll(/\bAL-K[A-Z]{6}-[A-Z]{3}\b/g)].map((m) => m[0]));
    expect(skus.size).toBeGreaterThan(100);
    for (const k of WIDGET_KITS) {
      for (const c of widgetSpec(k.handle)!.colours) {
        expect(skus.has(kitSku(k, c.id)!), `${k.handle} ${c.id}`).toBe(true);
      }
    }
  });
});

describe('lab items', () => {
  it('builds the dayrally cam with a name skin and a lab part code, purchasing not enabled', () => {
    const spec = widgetSpec('lab-dayrally-cam')!;
    expect(spec.kind).toBe('prototype');
    expect(spec.choices.map((c) => c.key)).toEqual(['skin']);
    const name = spec.choices[0].options.find((o) => o.id === 'name')!;
    expect(name.partIds).toEqual(['cam-skin-name', 'cam-skin-name-pattern']);
    expect(textSpecFor(name.partIds)?.label).toBe('Name on the skin');
    const r = buildItem({ handle: 'lab-dayrally-cam', colour: 'tomato', accent: 'cloud', choices: { skin: 'name' }, text: 'MILA', qty: 1 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.item.sku).toBe('LAB-DAYRALLY-CAM-TOM');
    expect(r.item.purchasing.status).toBe('not_enabled');
    expect(r.item.estimate.perUnit.suggestedRetailNzd).toBeNull();
    expect(r.item.interface.pack).toBe('v0.3');
    expect(r.item.printFiles.find((f) => f.id === 'cam-skin-name-pattern')?.role).toBe('accent');
    expect(r.item.printFiles.find((f) => f.id === 'cam-body')?.sha256).toBeTruthy();
    expect(lineItemProperties(r.item)['Name on the skin']).toBe('MILA');
  });

  it('lists the rod and the wharf reel with served print files', () => {
    for (const h of ['lab-dayrally-rod', 'lab-wharf-reel', 'lab-dayrally-cast', 'lab-dayrally-ride', 'lab-ride-grips', 'lab-ride-watch', 'lab-ride-phone', 'lab-ride-bottle', 'lab-ride-stand']) {
      const r = buildItem({ handle: h, colour: 'lime', qty: 1 });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.item.printFiles.every((f) => f.sha256)).toBe(true);
    }
  });
});
