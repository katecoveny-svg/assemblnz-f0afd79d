/**
 * Dangerous goods declaration drafter — ported from
 * legacy-vite/src/components/pikau/PikauDangerousGoods.tsx and the Pīkau
 * ta-rules (IMDG class validation, Class 1 explosives permit block).
 *
 * Draft-only: produces a declaration for a qualified person to check and sign.
 * Pīkau never self-certifies dangerous goods.
 */
export const IMDG_CLASSES = [
  '1', '1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '3',
  '4.1', '4.2', '4.3', '5.1', '5.2', '6.1', '6.2', '7', '8', '9',
];

export interface DgInput {
  unNumber: string;
  properShippingName: string;
  imdgClass: string;
  packingGroup: 'I' | 'II' | 'III' | '';
  netQuantityKg: number;
  emergencyContact: string;
  hasExplosivesLicence: boolean;
}

export interface DgResult {
  valid: boolean;
  errors: string[];
  blocks: string[];
  declaration: string | null;
  citation: string;
}

const UN_RE = /^UN\d{4}$/i;

export function draftDangerousGoods(input: DgInput): DgResult {
  const errors: string[] = [];
  const blocks: string[] = [];

  if (!UN_RE.test(input.unNumber.trim())) errors.push('UN number must look like "UN1234".');
  if (!input.properShippingName.trim()) errors.push('Proper shipping name is required.');
  if (!IMDG_CLASSES.includes(input.imdgClass.trim())) {
    blocks.push(`IMDG class "${input.imdgClass}" is not recognised — refer to the IMDG Code before proceeding.`);
  }
  if (!['I', 'II', 'III'].includes(input.packingGroup)) errors.push('Packing group must be I, II or III.');
  if (!(input.netQuantityKg > 0)) errors.push('Net quantity (kg) must be greater than zero.');
  if (!input.emergencyContact.trim()) errors.push('A 24-hour emergency contact is required.');

  if (input.imdgClass.trim().startsWith('1') && !input.hasExplosivesLicence) {
    blocks.push('HSNO Act 1996 — Class 1 (explosives) require an Explosives Controller licence. Cannot draft without it.');
  }

  const valid = errors.length === 0 && blocks.length === 0;
  const declaration = valid
    ? [
        'DANGEROUS GOODS DECLARATION — DRAFT (Pīkau pre-check)',
        `UN number: ${input.unNumber.toUpperCase()}`,
        `Proper shipping name: ${input.properShippingName}`,
        `IMDG class / division: ${input.imdgClass}`,
        `Packing group: ${input.packingGroup}`,
        `Net quantity: ${input.netQuantityKg} kg`,
        `24-hr emergency contact: ${input.emergencyContact}`,
        '',
        'I declare the contents are fully and accurately described above by the proper shipping name,',
        'and are classified, packaged, marked and labelled, and in all respects in proper condition for',
        'transport according to the applicable international and national regulations.',
        '',
        '— DRAFT ONLY. A qualified/authorised person must review and sign. Pīkau does not certify dangerous goods.',
      ].join('\n')
    : null;

  return {
    valid,
    errors,
    blocks,
    declaration,
    citation: 'IMDG Code · HSNO Act 1996 · Land Transport Rule: Dangerous Goods 2005',
  };
}

export const DG_DEFAULTS: DgInput = {
  unNumber: 'UN1263',
  properShippingName: 'Paint (flammable)',
  imdgClass: '3',
  packingGroup: 'III',
  netQuantityKg: 220,
  emergencyContact: '+64 9 309 8814',
  hasExplosivesLicence: false,
};
