import { describe, expect, it } from 'vitest';
import { AC02, AC02_HANDLE_PREFIX, WIDGET_PROTOTYPES, WidgetMessageSchema, ac02Lines, ac02Part, ac02Roles, buildItem, itemMessage, lineItemProperties, printSheet, textSpecFor, widgetSpec } from './index';

describe('AC-02 digital prototypes', () => {
  it('bundles the delivery as checked: 109 parts, 18 views, nothing approved', () => {
    expect(AC02.revision).toBe('AC-02');
    expect(AC02.parts.length).toBe(109);
    expect(AC02.assemblies.length).toBe(18);
    expect(AC02.approvedForManufacture).toBe(false);
    expect(AC02.parts.every((p) => p.watertight)).toBe(true);
    expect(AC02.parts.every((p) => p.massG > 0)).toBe(true);
    expect(AC02.interfaces.wall).toBe('TURN-42-AC02-candidate');
  });

  it('turns every assembled view into a buildable prototype with no price and purchasing not enabled', () => {
    for (const a of WIDGET_PROTOTYPES) {
      const spec = widgetSpec(`${AC02_HANDLE_PREFIX}${a.id}`)!;
      expect(spec.kind).toBe('prototype');
      expect(spec.priceNzd).toBeNull();
      expect(spec.glb).toBe(`/living/cad/ac02/${a.id}.glb`);
      const text = textSpecFor(spec.partsFor({}).map((p) => p.id));
      const r = buildItem({ handle: spec.handle, colour: spec.colours[0].id, text: text ? 'Mila' : null, now: '2026-10-19T00:00:00Z' });
      expect(r.ok, `${a.id}: ${r.issues.join(' ')}`).toBe(true);
      expect(r.item!.purchasing.status).toBe('not_enabled');
      expect(r.item!.estimate.perUnit.suggestedRetailNzd).toBeNull();
      expect(r.item!.printFiles.every((f) => f.sha256?.length === 64 && f.path === null)).toBe(true);
    }
  });

  it('sums component instances and decides accent by designed colour', () => {
    const wall = AC02.assemblies.find((a) => a.id === 'wall-station')!;
    const lines = ac02Lines(wall);
    expect(lines.find((l) => l.partId === 'turn-key-clearance')!.qty).toBeGreaterThan(1);
    const roles = ac02Roles(wall);
    expect(roles.accentParts.size).toBeGreaterThan(0);
    const flow = AC02.assemblies.find((a) => a.id === 'dayrally-mini-flow')!;
    expect(ac02Lines(flow).find((l) => l.partId === 'mini-wheel-25p5')!.qty).toBe(2);
  });

  it('asks for the name where the delivery rebuilds lettering, and keeps the rebuild honest in the properties', () => {
    const missing = buildItem({ handle: 'ac02-dayrally-mini-flow', colour: 'tomato' });
    expect(missing.ok).toBe(false);
    expect(missing.issues[0]).toMatch(/name/i);
    const r = buildItem({ handle: 'ac02-dayrally-mini-flow', colour: 'tomato', text: 'Mila', now: '2026-10-19T00:00:00Z' });
    expect(r.ok).toBe(true);
    const props = lineItemProperties(r.item!);
    expect(props.Name).toBe('Mila');
    expect(props['Part code']).toBe('AC02-DAYRALLY-MINI-FLOW-TOM');
    expect(props.Contents).toContain('2 ×');
    expect(WidgetMessageSchema.parse(itemMessage(r.item!)).type).toBe('assembl:item');
    const sheet = JSON.parse(printSheet(r.item!));
    expect(sheet.files.every((f: { servedFrom: string }) => f.servedFrom.includes('AC-02'))).toBe(true);
    expect(sheet.interface.pack).toBe('AC-02');
  });

  it('gives the pet walk kit a pet name, and no lettering to views without a lettered part', () => {
    expect(textSpecFor(widgetSpec('ac02-pet-walk-kit')!.partsFor({}).map((p) => p.id))?.label).toBe('Pet name');
    expect(textSpecFor(['wall-name-panel'])?.label).toBe('Wall label');
    expect(textSpecFor(widgetSpec('ac02-orbit-planter')!.partsFor({}).map((p) => p.id))).toBeNull();
    expect(ac02Part('wall-panel-4x4')?.group).toBe('wall');
  });
});
