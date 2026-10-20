/**
 * assembl / living — Space Studio state
 * -------------------------------------
 * A pure reducer over the typed `SpaceDesign`. The studio UI dispatches;
 * the rules in `lib/living/design.ts` decide. Kept separate from React so
 * it can be tested without a DOM.
 */

import {
  AESTHETIC_PRESETS,
  applyKit,
  canPlace,
  gridSize,
  newDesign,
  placementId,
  productByHandle,
  type Aesthetic,
  type Colourway,
  type Field,
  type Kit,
  type MeasurementMethod,
  type Placement,
  type SpaceDesign,
  type SpaceId,
  type Surface,
} from '@/lib/living';

export type StudioStep = 'space' | 'ways' | 'assemble' | 'fit';
export const STUDIO_STEPS: { id: StudioStep; label: string }[] = [
  { id: 'space', label: '01 · show us your space' },
  { id: 'ways', label: '02 · three ways to improve it' },
  { id: 'assemble', label: '03 · assemble your design' },
  { id: 'fit', label: '04 · made for your space' },
];

/** Board fields the studio offers. */
export const FIELD_OPTIONS: { id: string; label: string; field: Field }[] = [
  { id: '4', label: '1 board', field: { columns: [4], rows: 1 } },
  { id: '4+2', label: 'board + half', field: { columns: [4, 2], rows: 1 } },
  { id: '4+4', label: '2 boards', field: { columns: [4, 4], rows: 1 } },
  { id: '4x2', label: '1 × 2 boards', field: { columns: [4], rows: 2 } },
  { id: '4+4x2', label: '2 × 2 boards', field: { columns: [4, 4], rows: 2 } },
  { id: '4+4+4', label: '3 boards', field: { columns: [4, 4, 4], rows: 1 } },
];

export function fieldId(field: Field): string {
  return field.columns.join('+') + (field.rows > 1 ? `x${field.rows}` : '');
}

export type StudioState = {
  step: StudioStep;
  design: SpaceDesign;
  tool: string | null;
  selected: string | null;
  photoName: string | null;
  show3d: boolean;
};

export type StudioAction =
  | { type: 'space'; space: SpaceId; surface: Surface }
  | { type: 'surface'; surface: Surface }
  | { type: 'need'; need: string }
  | { type: 'keep'; keep: string[] }
  | { type: 'name'; name: string }
  | { type: 'aesthetic'; aesthetic: Aesthetic }
  | { type: 'photo'; name: string | null }
  | { type: 'step'; step: StudioStep }
  | { type: 'adopt'; design: SpaceDesign }
  | { type: 'kit'; kit: Kit }
  | { type: 'field'; field: Field }
  | { type: 'colour'; which: 'board' | 'accessory'; colour: Colourway }
  | { type: 'tool'; handle: string | null }
  | { type: 'place'; col: number; row: number }
  | { type: 'auto'; handle: string }
  | { type: 'select'; placementId: string | null }
  | { type: 'nudge'; dc: number; dr: number }
  | { type: 'remove'; placementId: string }
  | { type: 'extra'; handle: string; qty: number }
  | { type: 'measure'; method: MeasurementMethod; widthMm?: number; heightMm?: number; doorMm?: number; doorGapOk?: boolean; confirmed: boolean }
  | { type: 'show3d'; on: boolean }
  | { type: 'restore'; design: SpaceDesign };

export function initialStudioState(input: { space: SpaceId; surface: Surface; aesthetic: Aesthetic; kit?: Kit | null }): StudioState {
  let design = newDesign({ space: input.space, surface: input.surface, aesthetic: input.aesthetic });
  if (input.kit) design = applyKit(design, input.kit);
  return { step: 'space', design, tool: null, selected: null, photoName: null, show3d: true };
}

/** Drop placements that no longer fit when the field shrinks. */
function clampPlacements(design: SpaceDesign): SpaceDesign {
  const { cols, rows } = gridSize(design);
  const kept: Placement[] = [];
  for (const p of design.placements) {
    const product = productByHandle(p.handle);
    if (!product?.footprint) continue;
    if (p.col + product.footprint.cols <= cols && p.row + product.footprint.rows <= rows) kept.push(p);
  }
  return { ...design, placements: kept };
}

export function autoPlace(design: SpaceDesign, handle: string): SpaceDesign | null {
  const { cols, rows } = gridSize(design);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const candidate: Placement = { id: placementId(), handle, col: c, row: r };
      if (canPlace(design, candidate)) return { ...design, placements: [...design.placements, candidate] };
    }
  }
  return null;
}

export function studioReducer(state: StudioState, action: StudioAction): StudioState {
  const d = state.design;
  switch (action.type) {
    case 'space':
      return { ...state, design: { ...d, space: action.space, surface: action.surface } };
    case 'surface':
      return { ...state, design: { ...d, surface: action.surface } };
    case 'need':
      return { ...state, design: { ...d, need: action.need } };
    case 'keep':
      return { ...state, design: { ...d, keep: action.keep } };
    case 'name':
      return { ...state, design: { ...d, name: action.name.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 12) || undefined } };
    case 'aesthetic': {
      const preset = AESTHETIC_PRESETS[action.aesthetic];
      return { ...state, design: { ...d, aesthetic: action.aesthetic, boardColour: preset.board, accessoryColour: preset.accessory } };
    }
    case 'photo':
      return { ...state, photoName: action.name, design: { ...d, photo: { provided: action.name !== null, analysis: 'not_available' } } };
    case 'step':
      return { ...state, step: action.step, tool: null, selected: null };
    case 'adopt':
      return {
        ...state,
        step: 'assemble',
        design: { ...action.design, need: d.need, keep: d.keep, name: d.name, space: d.space, surface: d.surface, measurements: d.measurements, photo: d.photo },
        tool: null,
        selected: null,
      };
    case 'kit':
      return { ...state, step: 'assemble', design: applyKit(d, action.kit), tool: null, selected: null };
    case 'field':
      return { ...state, design: clampPlacements({ ...d, field: { columns: [...action.field.columns], rows: action.field.rows } }), selected: null };
    case 'colour':
      return { ...state, design: action.which === 'board' ? { ...d, boardColour: action.colour } : { ...d, accessoryColour: action.colour } };
    case 'tool':
      return { ...state, tool: action.handle, selected: null };
    case 'place': {
      if (!state.tool) return state;
      const candidate: Placement = { id: placementId(), handle: state.tool, col: action.col, row: action.row };
      if (!canPlace(d, candidate)) return state;
      return { ...state, design: { ...d, placements: [...d.placements, candidate], origin: 'customer' }, selected: candidate.id };
    }
    case 'auto': {
      const next = autoPlace(d, action.handle);
      return next ? { ...state, design: { ...next, origin: 'customer' }, tool: null } : state;
    }
    case 'select':
      return { ...state, selected: action.placementId, tool: null };
    case 'nudge': {
      if (!state.selected) return state;
      const current = d.placements.find((p) => p.id === state.selected);
      if (!current) return state;
      const moved: Placement = { ...current, col: current.col + action.dc, row: current.row + action.dr };
      const others = d.placements.filter((p) => p.id !== current.id);
      if (!canPlace({ field: d.field, placements: others }, moved)) return state;
      return { ...state, design: { ...d, placements: [...others, moved], origin: 'customer' } };
    }
    case 'remove':
      return { ...state, design: { ...d, placements: d.placements.filter((p) => p.id !== action.placementId), origin: 'customer' }, selected: null };
    case 'extra': {
      const extras = d.extras.filter((e) => e.handle !== action.handle);
      if (action.qty > 0) extras.push({ handle: action.handle, qty: action.qty });
      return { ...state, design: { ...d, extras, origin: 'customer' } };
    }
    case 'measure':
      return {
        ...state,
        design: { ...d, measurements: { method: action.method, widthMm: action.widthMm, heightMm: action.heightMm, doorMm: action.doorMm, doorGapOk: action.doorGapOk, confirmed: action.confirmed } },
      };
    case 'show3d':
      return { ...state, show3d: action.on };
    case 'restore':
      return { ...state, design: action.design };
    default:
      return state;
  }
}
