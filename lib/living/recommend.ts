/**
 * assembl / living — "three ways to improve it"
 * ---------------------------------------------
 * Deterministic proposals from the customer's space, surface, words and
 * aesthetic. Code, not a model: the same inputs always assemble the same
 * three designs, which makes them testable and honest to label.
 *
 * Every proposal is `proposed`. None has read a photograph.
 */

import { gridAccessories, partById, partsForSpace } from './catalogue';
import { kitById } from './kits';
import { newDesign, placementId, canPlace, gridSize } from './design';
import { requireSpace } from './spaces';
import type { Aesthetic, Part, Placement, SpaceDesign, SpaceId, Surface } from './system';

export type ProposalId = 'minimal' | 'system' | 'expressive';

export type Proposal = {
  id: ProposalId;
  title: string;
  summary: string;
  why: string[];
  design: SpaceDesign;
};

export type Understanding = {
  /** What the studio took from the customer's words. Shown back before anything is proposed. */
  needs: string[];
  /** Parts whose cues matched the words, most relevant first. */
  matchedParts: Part[];
  surface: Surface;
  /** Things the customer wants to keep, display or fit. */
  keep: string[];
  /** Always true today. Photo understanding is not built, and the copy must say so. */
  photoAnalysisAvailable: false;
};

const STOP = new Set(['the', 'a', 'an', 'and', 'my', 'is', 'are', 'in', 'on', 'of', 'to', 'i', 'it', 'for', 'with', 'no', 'all', 'at']);

export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

export function understand(input: { space: SpaceId; surface: Surface; need: string; keep: string[] }): Understanding {
  const words = new Set(tokenise(input.need));
  const scored = partsForSpace(input.space)
    .map((p) => ({ p, score: p.cues.filter((c) => words.has(c)).length }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.p.id.localeCompare(b.p.id));

  const needs: string[] = [];
  const w = (...xs: string[]) => xs.some((x) => words.has(x));
  if (w('cable', 'cables', 'cords', 'chargers')) needs.push('Cables and chargers need a home off the surface.');
  if (w('makeup', 'brushes', 'brush', 'skincare', 'lipstick')) needs.push('Beauty things want to be visible and upright, not in a pile.');
  if (w('keys', 'sunglasses', 'wallet', 'lead', 'leads', 'leash')) needs.push('Daily grab-and-go items belong at eye level by the door.');
  if (w('tools', 'screwdriver', 'pliers', 'bits', 'parts')) needs.push('Tools used every day should be seen, not stored.');
  if (w('lure', 'lures', 'tackle', 'hooks', 'swivels', 'rod')) needs.push('Small tackle needs sleeves and trays; hooks need to be covered.');
  if (w('drawer', 'drawers')) needs.push('The drawer needs dividers that stay where they are put.');
  if (w('plant', 'plants', 'cuttings')) needs.push('Small plants want a ledge with a lip and light.');
  if (w('clutter', 'cluttered', 'mess', 'messy', 'everywhere', 'pile')) needs.push('The surface is doing too many jobs. Move the small things up.');
  if (w('rent', 'renting', 'drill', 'holes', 'landlord')) needs.push('No drilling: prefer freestanding and drawer pieces.');
  if (needs.length === 0) needs.push(`Make the ${input.surface} easier to use with fewer loose things on it.`);

  return {
    needs,
    matchedParts: scored.map((s) => s.p),
    surface: input.surface,
    keep: input.keep,
    photoAnalysisAvailable: false,
  };
}

function fill(design: SpaceDesign, partIds: string[]): SpaceDesign {
  const placements: Placement[] = [...design.placements];
  const { cols, rows } = gridSize(design);
  for (const partId of partIds) {
    const part = partById(partId);
    if (!part?.footprint) continue;
    let placed = false;
    for (let r = 0; r < rows && !placed; r++) {
      for (let c = 0; c < cols && !placed; c++) {
        const candidate: Placement = { id: placementId(), partId, col: c, row: r };
        if (canPlace({ panels: design.panels, placements }, candidate)) {
          placements.push(candidate);
          placed = true;
        }
      }
    }
  }
  return { ...design, placements };
}

function preferredAccessories(space: SpaceId, understanding: Understanding): string[] {
  const grid = new Set(gridAccessories().map((p) => p.id));
  const matched = understanding.matchedParts.filter((p) => grid.has(p.id)).map((p) => p.id);
  const defaults: Record<SpaceId, string[]> = {
    'my-room': ['grid-hook-single', 'grid-hook-single', 'grid-ledge-96', 'grid-cup-48'],
    'my-space': ['grid-cup-48', 'grid-ledge-96', 'grid-hook-single', 'grid-hook-single'],
    'work-and-create': ['grid-hook-single', 'grid-hook-single', 'grid-cup-48', 'grid-ledge-96'],
    'store-and-organise': ['grid-hook-single', 'grid-hook-single', 'grid-ledge-96', 'grid-hook-single'],
    'pets-and-everyday': ['grid-hook-single', 'grid-hook-single', 'grid-ledge-96', 'grid-cup-48'],
    'plants-and-objects': ['grid-ledge-96', 'grid-ledge-96', 'grid-hook-single', 'grid-cup-48'],
  };
  return [...matched, ...defaults[space]];
}

export function recommend(input: {
  space: SpaceId;
  surface: Surface;
  need: string;
  keep: string[];
  aesthetic: Aesthetic;
  now?: string;
}): Proposal[] {
  const understanding = understand(input);
  const entry = requireSpace(input.space);
  const noDrill = understanding.needs.some((n) => n.startsWith('No drilling'));
  const base = () => newDesign({ ...input, origin: 'proposal' });
  const accessories = preferredAccessories(input.space, understanding);

  /* 1 · minimal refresh — one riser and trays, or one rail; nothing on the wall. */
  const minimal: SpaceDesign = {
    ...base(),
    extras:
      input.surface === 'drawer'
        ? [{ partId: 'tile-tray-96x96', qty: 1 }, { partId: 'tile-tray-96x48', qty: 2 }, { partId: 'tile-clip', qty: 4 }]
        : input.surface === 'wall' && !noDrill
          ? [{ partId: 'rail-bar-192', qty: 1 }, { partId: 'grid-hook-single', qty: 4 }]
          : [{ partId: 'stack-riser-192', qty: 1 }, { partId: 'tile-tray-96x48', qty: 2 }],
  };

  /* 2 · full organisation system — one or two panels, filled from what was said. */
  const systemPanels = input.surface === 'drawer' ? { cols: 1, rows: 1 } : { cols: 2, rows: 1 };
  let system: SpaceDesign = { ...base(), panels: systemPanels };
  if (noDrill || input.surface === 'drawer') {
    system = {
      ...system,
      panels: { cols: 1, rows: 1 },
      extras: [
        { partId: 'stack-riser-192', qty: 1 },
        { partId: 'tile-tray-96x96', qty: 2 },
        { partId: 'tile-tray-96x48', qty: 2 },
        { partId: 'tile-clip', qty: 4 },
      ],
    };
  } else {
    system = fill(system, accessories.slice(0, 6));
    system = { ...system, extras: [{ partId: 'tile-tray-96x48', qty: 2 }] };
  }

  /* 3 · expressive — the curated kit for this door, in the expressive aesthetic. */
  const kit = kitById(entry.kits[0]) ?? kitById('setup-wall')!;
  let expressive: SpaceDesign = {
    ...base(),
    aesthetic: 'expressive',
    panelColour: 'rose',
    accentColour: 'graphite',
    panels: { ...kit.panels },
    placements: kit.placements.map((p) => ({ ...p, id: placementId() })),
    extras: kit.extras.map((e) => ({ ...e })),
  };
  if (noDrill) {
    expressive = { ...expressive, panels: { cols: 1, rows: 1 }, placements: [], extras: [{ partId: 'stack-riser-192', qty: 2 }, { partId: 'tile-tray-96x96', qty: 4 }] };
  }

  return [
    {
      id: 'minimal',
      title: 'minimal refresh',
      summary: 'The fewest parts that change the surface. Nothing to drill unless you want to.',
      why: [understanding.needs[0], 'Start small, add the same accessories later.'],
      design: minimal,
    },
    {
      id: 'system',
      title: 'full organisation system',
      summary: 'A panel field filled from what you told us, with a tray or two for the bench.',
      why: [...understanding.needs.slice(0, 2), 'Every part uses the same 24 mm interface, so nothing here is a dead end.'],
      design: system,
    },
    {
      id: 'expressive',
      title: 'expressive layout',
      summary: `${kit.name}, in muted rose and graphite. More personality, still quiet.`,
      why: [kit.tagline, 'Swap colourways any time; the parts do not change.'],
      design: expressive,
    },
  ];
}
