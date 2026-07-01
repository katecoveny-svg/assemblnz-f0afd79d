/**
 * MPI biosecurity checklist — ported from
 * legacy-vite/src/components/pikau/PikauBiosecurity.tsx. Walks the common
 * import-health pathways so nothing is missed before goods are released.
 * Advisory only — MPI clearance is a regulated step handled through the
 * broker / transitional facility.
 */
export interface BioItem {
  id: string;
  label: string;
  detail: string;
  citation: string;
}

export const BIOSECURITY_ITEMS: BioItem[] = [
  {
    id: 'timber',
    label: 'Timber / wood packaging (ISPM 15)',
    detail: 'Pallets, crates and dunnage must be ISPM 15 treated and marked, or have fumigation evidence.',
    citation: 'Import Health Standard: Sea Container / Wood Packaging',
  },
  {
    id: 'food',
    label: 'Food & beverage products (MPI IHS)',
    detail: 'Food for sale needs the relevant Import Health Standard and, often, importer registration.',
    citation: 'Biosecurity Act 1993 / Food Act 2014',
  },
  {
    id: 'plant',
    label: 'Plant material (phytosanitary certificate)',
    detail: 'Plants, seeds and plant products need a phytosanitary certificate from the exporting country.',
    citation: 'Import Health Standard: Plants & Plant Products',
  },
  {
    id: 'animal',
    label: 'Animal products (veterinary certificate)',
    detail: 'Products of animal origin need the correct veterinary certification and permits.',
    citation: 'Import Health Standard: Animal Products',
  },
  {
    id: 'used_equipment',
    label: 'Used equipment (soil-free / cleaned)',
    detail: 'Used machinery and vehicles must be cleaned to a contamination-free standard.',
    citation: 'Import Health Standard: Vehicles, Machinery & Equipment',
  },
  {
    id: 'soil',
    label: 'Soil / organic matter',
    detail: 'Any soil or organic contamination is a high biosecurity risk and may require treatment on arrival.',
    citation: 'Biosecurity Act 1993',
  },
];

export type BioStatus = 'pass' | 'fail' | 'na';

export function bioProgress(states: Record<string, BioStatus>): {
  completed: number;
  total: number;
  flagged: string[];
} {
  const total = BIOSECURITY_ITEMS.length;
  let completed = 0;
  const flagged: string[] = [];
  for (const item of BIOSECURITY_ITEMS) {
    const s = states[item.id];
    if (s === 'pass' || s === 'na') completed += 1;
    if (s === 'fail') flagged.push(item.label);
  }
  return { completed, total, flagged };
}
