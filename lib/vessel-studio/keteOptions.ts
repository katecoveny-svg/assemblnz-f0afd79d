import type {
  AspectRatio,
  KeteOption,
  LightingToken,
  MotionToken,
} from './types';

// Locked kete naming + material grammars per Kate's brand memory.
// Canonical visual system locked 2026-05-08:
// every kete vessel = cream stoneware base + brass wire square display stand
// + layered translucent kete-coloured glass plates + cream stoneware top form,
// varying only in colour and the top form's silhouette per kete.
//
// Grammars copied verbatim from the standalone vessel-studio.html — do not
// paraphrase. The `id` is the filename slug (lowercased, macrons stripped).
export const KETE_OPTIONS: readonly KeteOption[] = [
  {
    id: 'waihanga',
    name: 'Waihanga',
    label: 'Waihanga (Construction)',
    pillar: 'construction',
    grammar:
      'editorial still-life photograph of a sculptural evidence vessel: cream stoneware ceramic base sitting on a fine brass wire square display stand, layered translucent jade pounamu glass plates stacked horizontally, topped with a tilted cream stoneware pitched-roof element evoking architecture',
    tonalSignature: 'calm Aotearoa intelligence object, self-supporting form',
  },
  {
    id: 'auaha',
    name: 'Auaha',
    label: 'Auaha (Creative)',
    pillar: 'creative',
    grammar:
      'editorial still-life photograph of a sculptural evidence vessel: cream stoneware ceramic base sitting on a fine brass wire square display stand, layered translucent deep violet glass plates stacked at a dynamic tilt, topped with a raw-edged organic cream stoneware shell evoking creative motion',
    tonalSignature: 'generative cultural intelligence, self-supporting form',
  },
  {
    id: 'arataki',
    name: 'Arataki',
    label: 'Arataki (Leadership / Guidance)',
    pillar: 'leadership · guidance',
    grammar:
      'editorial still-life photograph of a sculptural evidence vessel: cream stoneware ceramic base sitting on a fine brass wire square display stand, layered translucent amber and honey glass plates stacked horizontally with a forward lean, topped with a flowing cream stoneware spear-form evoking direction and forward motion',
    tonalSignature: 'calm leadership intelligence, self-supporting form',
  },
  {
    id: 'manaaki',
    name: 'Manaaki',
    label: 'Manaaki (Hospitality)',
    pillar: 'hospitality',
    grammar:
      'editorial still-life photograph of a sculptural evidence vessel: cream stoneware ceramic base sitting on a fine brass wire square display stand, layered translucent peach and warm rose glass plates stacked horizontally, topped with a smooth cream stoneware dome evoking welcome and protection',
    tonalSignature: 'hospitality warmth',
  },
  {
    id: 'pikau',
    name: 'Pīkau',
    label: 'Pīkau (Freight & Customs)',
    pillar: 'freight & customs',
    grammar:
      'editorial still-life photograph of a sculptural evidence vessel: cream stoneware ceramic base sitting on a fine brass wire square display stand, layered translucent cobalt and ice blue glass plates stacked with a slight horizontal drift, topped with a flowing cream stoneware crescent form evoking quiet movement',
    tonalSignature: 'calm logistics intelligence, self-supporting form',
  },
  {
    id: 'hoko',
    name: 'Hoko',
    label: 'Hoko (Trade)',
    pillar: 'trade',
    accent: '#7B3F8F',
    grammar:
      'editorial still-life photograph of a sculptural evidence vessel: cream stoneware ceramic base sitting on a fine brass wire square display stand, layered translucent mulberry and aubergine glass plates stacked horizontally, topped with a balanced cream stoneware ovoid form evoking exchange',
    tonalSignature: 'calm trade intelligence, self-supporting form',
  },
  {
    id: 'ako',
    name: 'Ako',
    label: 'Ako (Learning)',
    pillar: 'learning',
    accent: '#6B5843',
    grammar:
      'editorial still-life photograph of a sculptural evidence vessel: cream stoneware ceramic base sitting on a fine brass wire square display stand, layered translucent warm sepia and oak glass plates stacked horizontally with a quiet stillness, topped with a contemplative cream stoneware orb evoking learning and reflection',
    tonalSignature: 'calm learning intelligence, self-supporting form',
  },
  {
    id: 'toro',
    name: 'Toro',
    label: 'Toro (Family / Lifestyle)',
    pillar: 'family · lifestyle',
    grammar:
      'editorial still-life photograph of a sculptural evidence vessel: cream stoneware ceramic base sitting on a fine brass wire square display stand, layered translucent smoky charcoal and warm grey glass plates stacked horizontally, topped with a quiet cream stoneware oval form evoking home',
    tonalSignature: 'quiet domestic intelligence, self-supporting form',
  },
  {
    id: 'custom',
    name: 'Custom',
    label: 'Custom',
    pillar: 'your own material grammar',
    grammar: '',
    tonalSignature: '',
    custom: true,
  },
  // Founder Portrait — different mode entirely. Skips the "evidence vessel" opener,
  // uses portrait-specific camera spec (100mm portrait lens, f2.8), and overrides
  // the vessel-specific flag negatives with a portrait-specific list.
  {
    id: 'founder-portrait',
    name: 'Founder Portrait',
    label: 'Founder Portrait',
    pillar: 'Brand · Founder content',
    grammar:
      'editorial portrait photograph of a woman in her late 30s with shoulder-length sun-kissed blonde hair, warm gentle smile, calm and present expression, wearing soft cream or beige knitwear, sometimes holding a long-haired black dachshund with tan markings, seated in a warm cream-paper interior with soft natural light from a window upper left, plants and books in soft focus background',
    tonalSignature: 'quiet intelligence, time returned, no harsh shadows',
    defaultAspectRatio: '4:5',
    defaultMotion: 'still',
    portrait: true,
    flagNegatives: [
      'harsh shadows',
      'beauty filter',
      'plastic skin',
      'oversaturated',
      'neon',
      'dark moody',
      'studio backdrop',
      'white seamless',
    ],
  },
] as const;

export const AR_OPTIONS: readonly AspectRatio[] = ['16:9', '4:5', '1:1', '9:16'];

export const MOTION_OPTIONS: readonly MotionToken[] = [
  'slow gentle rotation',
  'slow drift',
  'gentle sway',
  'falling cloth',
  'still',
];

export const LIGHTING_OPTIONS: readonly LightingToken[] = [
  'soft natural light',
  'morning sun through linen',
  'overcast diffuse',
  'candle warmth',
  'studio rake light',
  'late afternoon gold',
];

// Two-part negative system — body inline (conceptual rejections, written in
// natural language inside the prompt body) and --no flag (visual/architectural
// rejections, sent as discrete tokens for stronger MJ rejection).
export const BODY_INLINE_NEGATIVES: readonly string[] = [
  'text',
  'logos',
  'patterns',
  'carvings',
  'kowhaiwhai',
  'neon',
  'sci-fi',
];

// Canonical update 2026-05-08: removed "brass", "metal", "hard edges", "geometric"
// because the canonical look INCLUDES a small brass wire display stand and is
// architectural by design. What stays banned is brass *through* the form
// (armatures, cages, rails, spines, metal frames binding plates), and any kind
// of linear/wire/route element drawn through the vessel.
export const FLAG_NEGATIVES: readonly string[] = [
  'dark background',
  'forest',
  'gemstone',
  'pebble',
  'armature',
  'cage',
  'rails',
  'spine',
  'metal frame',
  'linear gold',
  'gold lines',
  'route lines',
  'trajectories',
  'threads',
  'wires',
  'sci-fi',
  'neon',
  'organic shell',
];

// Text-to-image endpoint takes preset names.
export const FAL_AR_MAP: Record<AspectRatio, string> = {
  '16:9': 'landscape_16_9',
  '4:5': 'portrait_4_5',
  '1:1': 'square_hd',
  '9:16': 'portrait_16_9',
};

// Image-to-image (v1.1-ultra/redux) takes raw "W:H" strings, but its enum is
// [21:9, 16:9, 4:3, 3:2, 1:1, 2:3, 3:4, 9:16, 9:21] — no 4:5. Map 4:5 → 3:4.
export const FAL_REDUX_AR_MAP: Record<AspectRatio, string> = {
  '16:9': '16:9',
  '4:5': '3:4',
  '1:1': '1:1',
  '9:16': '9:16',
};

export const PRICE_TEXT = 0.04; // usd, flux pro v1.1
export const PRICE_REDUX = 0.05; // usd, flux pro v1.1 ultra/redux

export const REF_MAX_BYTES = 8 * 1024 * 1024; // 8MB
export const REF_VALID_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export function getKete(id: string): KeteOption {
  return KETE_OPTIONS.find((k) => k.id === id) ?? KETE_OPTIONS[0];
}

export function reduxAspectFor(ar: AspectRatio): string {
  return FAL_REDUX_AR_MAP[ar] ?? '1:1';
}

export function activeFlagNegatives(kete: KeteOption): readonly string[] {
  return Array.isArray(kete.flagNegatives) && kete.flagNegatives.length > 0
    ? kete.flagNegatives
    : FLAG_NEGATIVES;
}

export function activeNegatives(kete: KeteOption): readonly string[] {
  return [...BODY_INLINE_NEGATIVES, ...activeFlagNegatives(kete)];
}
