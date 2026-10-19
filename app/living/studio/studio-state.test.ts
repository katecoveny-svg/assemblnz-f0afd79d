import { describe, expect, it } from 'vitest';
import { gridAccessories, kitById, validatePlacements } from '@/lib/living';
import { FIELD_OPTIONS, autoPlace, fieldId, initialStudioState, studioReducer } from './studio-state';

describe('Space Studio reducer', () => {
  it('starts from the space door and keeps the customer context when a kit is loaded', () => {
    let s = initialStudioState({ space: 'my-space', surface: 'vanity', aesthetic: 'warm' });
    s = studioReducer(s, { type: 'need', need: 'Makeup everywhere' });
    s = studioReducer(s, { type: 'keep', keep: ['a mirror'] });
    s = studioReducer(s, { type: 'name', name: 'mila!' });
    const kit = kitById('vanity-lab')!;
    s = studioReducer(s, { type: 'kit', kit });
    expect(s.step).toBe('assemble');
    expect(s.design.need).toBe('Makeup everywhere');
    expect(s.design.name).toBe('MILA');
    expect(s.design.field).toEqual({ columns: [4, 2], rows: 1 });
    expect(validatePlacements(s.design)).toEqual([]);
  });

  it('places only where the rules allow, nudges within bounds and drops parts when the field shrinks', () => {
    let s = initialStudioState({ space: 'my-room', surface: 'wall', aesthetic: 'contrast' });
    s = studioReducer(s, { type: 'tool', handle: 'al-shelf-3' });
    s = studioReducer(s, { type: 'place', col: 2, row: 0 }); // 3 wide at col 2 on a 4-wide board
    expect(s.design.placements).toHaveLength(0);
    s = studioReducer(s, { type: 'place', col: 0, row: 0 });
    expect(s.design.placements).toHaveLength(1);
    const id = s.design.placements[0].id;
    s = studioReducer(s, { type: 'nudge', dc: -1, dr: 0 });
    expect(s.design.placements[0].col).toBe(0);
    s = studioReducer(s, { type: 'nudge', dc: 1, dr: 0 });
    expect(s.design.placements[0].col).toBe(1);
    s = studioReducer(s, { type: 'field', field: { columns: [4, 4], rows: 1 } });
    s = studioReducer(s, { type: 'select', placementId: id });
    s = studioReducer(s, { type: 'nudge', dc: 4, dr: 0 });
    expect(s.design.placements[0].col).toBe(5);
    s = studioReducer(s, { type: 'field', field: { columns: [4], rows: 1 } });
    expect(s.design.placements).toHaveLength(0);
  });

  it('auto-places every grid accessory until the field is full, never overlapping', () => {
    let s = initialStudioState({ space: 'work-and-create', surface: 'wall', aesthetic: 'calm' });
    s = studioReducer(s, { type: 'field', field: { columns: [4, 4], rows: 2 } });
    for (let i = 0; i < 30; i++) {
      for (const product of gridAccessories()) {
        const next = autoPlace(s.design, product.handle);
        if (next) s = { ...s, design: next };
      }
    }
    expect(s.design.placements.length).toBeGreaterThan(8);
    expect(validatePlacements(s.design)).toEqual([]);
  });

  it('round-trips field ids and records door measurements', () => {
    for (const o of FIELD_OPTIONS) expect(fieldId(o.field)).toBe(o.id);
    let s = initialStudioState({ space: 'store-and-organise', surface: 'door', aesthetic: 'calm' });
    s = studioReducer(s, { type: 'measure', method: 'door-gap-gauge', widthMm: 700, heightMm: 2000, doorMm: 35, doorGapOk: true, confirmed: true });
    expect(s.design.measurements.doorGapOk).toBe(true);
    s = studioReducer(s, { type: 'photo', name: 'door.jpg' });
    expect(s.design.photo).toEqual({ provided: true, analysis: 'not_available' });
  });
});
