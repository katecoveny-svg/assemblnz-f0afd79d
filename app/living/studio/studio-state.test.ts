import { describe, expect, it } from 'vitest';
import { kitById, validatePlacements, gridAccessories } from '@/lib/living';
import { autoPlace, initialStudioState, studioReducer } from './studio-state';

describe('Space Studio reducer', () => {
  it('starts from the space door and keeps the customer context when a proposal is adopted', () => {
    let s = initialStudioState({ space: 'my-space', surface: 'vanity', aesthetic: 'warm' });
    s = studioReducer(s, { type: 'need', need: 'Makeup everywhere' });
    s = studioReducer(s, { type: 'keep', keep: ['a mirror'] });
    const kit = kitById('get-ready-wall')!;
    s = studioReducer(s, { type: 'kit', kit });
    expect(s.step).toBe('assemble');
    expect(s.design.need).toBe('Makeup everywhere');
    expect(s.design.keep).toEqual(['a mirror']);
    expect(s.design.panels).toEqual(kit.panels);
    expect(validatePlacements(s.design)).toEqual([]);
  });

  it('places only where the rules allow, nudges within bounds and drops parts when the field shrinks', () => {
    let s = initialStudioState({ space: 'my-room', surface: 'wall', aesthetic: 'contrast' });
    s = studioReducer(s, { type: 'tool', partId: 'grid-ledge-96' });
    s = studioReducer(s, { type: 'place', col: 6, row: 0 }); // 4 wide: out of bounds on an 8-wide panel
    expect(s.design.placements).toHaveLength(0);
    s = studioReducer(s, { type: 'place', col: 0, row: 0 });
    expect(s.design.placements).toHaveLength(1);
    const id = s.design.placements[0].id;
    expect(s.selected).toBe(id);
    s = studioReducer(s, { type: 'nudge', dc: -1, dr: 0 });
    expect(s.design.placements[0].col).toBe(0); // blocked
    s = studioReducer(s, { type: 'nudge', dc: 4, dr: 0 });
    expect(s.design.placements[0].col).toBe(4);
    s = studioReducer(s, { type: 'panels', cols: 2, rows: 1 });
    s = studioReducer(s, { type: 'select', placementId: id });
    s = studioReducer(s, { type: 'nudge', dc: 6, dr: 0 });
    expect(s.design.placements[0].col).toBe(10);
    s = studioReducer(s, { type: 'panels', cols: 1, rows: 1 });
    expect(s.design.placements).toHaveLength(0); // no longer fits
  });

  it('auto-places every grid accessory until the panel is full, never overlapping', () => {
    let s = initialStudioState({ space: 'work-and-create', surface: 'wall', aesthetic: 'calm' });
    for (let i = 0; i < 40; i++) {
      for (const part of gridAccessories()) {
        const next = autoPlace(s.design, part.id);
        if (next) s = { ...s, design: next };
      }
    }
    expect(s.design.placements.length).toBeGreaterThan(10);
    expect(validatePlacements(s.design)).toEqual([]);
  });

  it('records measurements as confirmed only with both numbers', () => {
    let s = initialStudioState({ space: 'my-room', surface: 'wall', aesthetic: 'calm' });
    s = studioReducer(s, { type: 'measure', method: 'tape-measure', widthMm: 500, confirmed: true });
    expect(s.design.measurements.confirmed).toBe(true); // reducer stores what the UI decided
    expect(s.design.measurements.heightMm).toBeUndefined();
    s = studioReducer(s, { type: 'photo', name: 'wall.jpg' });
    expect(s.design.photo).toEqual({ provided: true, analysis: 'not_available' });
  });
});
