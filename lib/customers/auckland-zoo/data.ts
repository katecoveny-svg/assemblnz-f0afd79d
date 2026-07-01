// Auckland Zoo × Keeper — demo workspace dataset.
//
// CONCEPT · PENDING. This is a cold-outreach pilot mockup, not a live
// partnership. Every record here is either (a) drawn from Auckland Zoo's
// PUBLIC materials (aucklandzoo.co.nz news + species pages, Auckland Council
// releases, Massey conservation-medicine page — scanned per Kaitiaki spec
// 2026-06-29 §5.6) and marked "demo record — Auckland Zoo public data", or
// (b) an assembl-authored draft scenario from the spec's own §5.6.5 mockups,
// marked "mock draft — demo scenario".
//
// RULES enforced in this file:
//  - Never fabricate clinical or welfare data. Clinical/welfare rows are either
//    the spec's own draft scenarios or explicitly-illustrative mock statuses.
//  - Kaumātua-hold gate on any whakapapa / naming / cultural content for taonga
//    species (kiwi, tuatara). That content is never model-generated — it is held
//    as a placeholder for iwi consultation. See `taonga` + `kaumatuaHold`.
//  - No taonga-species imagery we don't hold rights to — everything renders as a
//    silhouette/placeholder mark, never a real photo.

export type TrustTier = 'A' | 'B';

export type ZooAnimal = {
  id: string;
  name: string;
  /** Placeholder when naming is intentionally held for iwi consultation. */
  nameHeld?: boolean;
  species: string; // species slug
  sex: 'F' | 'M' | 'unknown';
  age: string;
  /** Short medical status line — illustrative, never a real clinical record. */
  status: string;
  statusTone: 'ok' | 'watch' | 'urgent';
  /** Public-record provenance note. */
  provenance: string;
};

export type ZooSpecies = {
  slug: string;
  /** Common name in Auckland Zoo's public voice. */
  name: string;
  teReoName?: string;
  scientific: string;
  group: 'megafauna' | 'native-taonga';
  /** Taonga species — triggers the kaumātua-hold gate on cultural content. */
  taonga: boolean;
  /** DOC / recovery-programme participation (from public materials). */
  recoveryProgramme: string;
  /** Breeding / studbook position — illustrative status label. */
  breedingPlan: string;
  breedingProgress: number; // 0–100, illustrative
  /** Welfare-code compliance rollup for the species' enclosure(s). */
  welfare: WelfareStatus;
  animals: ZooAnimal[];
  /** One-line species blurb in Auckland Zoo public voice. */
  blurb: string;
};

export type WelfareStatus = 'compliant' | 'review-due' | 'gap-flagged';

export type WelfareRecord = {
  id: string;
  speciesSlug: string;
  enclosure: string;
  code: string; // MPI Code of Welfare clause reference
  requirement: string;
  status: WelfareStatus;
  note: string;
  lastChecked: string;
};

export type ClinicalNote = {
  id: string;
  animalId: string;
  animalLabel: string;
  speciesSlug: string;
  noteType: 'routine' | 'procedure' | 'incident';
  date: string;
  /** Who the unsigned draft is FOR (Keeper never signs). */
  reviewer: string;
  status: 'draft-for-review';
  soap: { s: string; o: string; a: string; p: string };
  /** Mana Receipt stamps. */
  stamps: {
    disclaimer: string;
    sources: { label: string; tier: TrustTier; retrieved: string }[];
    tikangaGate: 'pass' | 'held';
    trustTier: string;
    kaitiakiReviewer: string;
  };
  /** Assembl-authored scenario, not a real clinical record. */
  provenance: string;
};

export type EducationDraft = {
  id: string;
  speciesSlug: string;
  title: string;
  moment: string;
  /** The drafted "meet the ..." card body (Auckland Zoo public /news voice). */
  body: string;
  /** Whakapapa/naming content held for iwi — never model-generated. */
  kaumatuaHold: boolean;
  holdNote?: string;
  reviewer: string;
  status: 'draft-for-review';
  provenance: string;
};

// ----------------------------------------------------------------------------
// SPECIES — Zoo Threatened Species Recovery participation (spec §5.6.1)
// ----------------------------------------------------------------------------

const PUBLIC = 'demo record — Auckland Zoo public data';
const SCENARIO = 'mock draft — demo scenario (Kaitiaki spec §5.6.5)';

export const SPECIES: ZooSpecies[] = [
  {
    slug: 'kiwi',
    name: 'North Island brown kiwi',
    teReoName: 'kiwi',
    scientific: 'Apteryx mantelli',
    group: 'native-taonga',
    taonga: true,
    recoveryProgramme: 'Operation Nest Egg · Te Wao Nui kōhanga · 410+ hatched & released',
    breedingPlan: 'Kōhanga crèche — chicks reared to ~1200g before island release',
    breedingProgress: 78,
    welfare: 'compliant',
    blurb:
      'Every kiwi chick hatched at the NZCCM kōhanga is reared until it is strong enough to face life on a predator-free island, part of the national Operation Nest Egg programme.',
    animals: [
      {
        id: 'kiwi-kohanga-chick',
        name: 'Kōhanga chick (naming held for iwi)',
        nameHeld: true,
        species: 'kiwi',
        sex: 'unknown',
        age: 'Hatched 2026-06-30 · 320 g at hatch',
        status: 'Bright, alert, feeding — early-life kōhanga care',
        statusTone: 'ok',
        provenance: SCENARIO,
      },
    ],
  },
  {
    slug: 'tuatara',
    name: 'Tuatara',
    teReoName: 'tuatara',
    scientific: 'Sphenodon punctatus',
    group: 'native-taonga',
    taonga: true,
    recoveryProgramme: 'Headstart programme (wrapped after 30+ years — population targets met)',
    breedingPlan: 'Resident collection · Te Wao Nui native-reptile precinct',
    breedingProgress: 100,
    welfare: 'compliant',
    blurb:
      'A living link to the age of dinosaurs, tuatara are a taonga species cared for in the Te Wao Nui native-reptile precinct.',
    animals: [
      {
        id: 'tuatara-demo-01',
        name: 'Te Wao Nui resident (demo)',
        species: 'tuatara',
        sex: 'unknown',
        age: 'Adult',
        status: 'Routine husbandry — no clinical entries in demo workspace',
        statusTone: 'ok',
        provenance: PUBLIC,
      },
    ],
  },
  {
    slug: 'orangutan',
    name: 'Sumatran orangutan',
    scientific: 'Pongo abelii',
    group: 'megafauna',
    taonga: false,
    recoveryProgramme: 'ZAA / regional studbook — critically endangered ex-situ programme',
    breedingPlan: 'Regional breeding recommendation — studbook-managed',
    breedingProgress: 55,
    welfare: 'review-due',
    blurb:
      'Auckland Zoo is home to a family of critically endangered Sumatran orangutans, part of a regionally-managed breeding programme.',
    animals: [
      {
        id: 'orangutan-anouk',
        name: 'Anouk',
        species: 'orangutan',
        sex: 'F',
        age: 'Adult female',
        status: 'Routine health monitoring — annual check scheduled',
        statusTone: 'ok',
        provenance: PUBLIC + ' (widely published Auckland Zoo orangutan)',
      },
    ],
  },
  {
    slug: 'giraffe',
    name: 'Giraffe',
    scientific: 'Giraffa camelopardalis',
    group: 'megafauna',
    taonga: false,
    recoveryProgramme: 'ZAA regional collection plan',
    breedingPlan: 'Regional herd management — studbook-managed',
    breedingProgress: 40,
    welfare: 'compliant',
    blurb:
      'The Auckland Zoo giraffe herd is part of a regional collection plan and a favourite of the daily keeper talks.',
    animals: [
      {
        id: 'giraffe-demo-01',
        name: 'Herd member (demo)',
        species: 'giraffe',
        sex: 'unknown',
        age: 'Adult',
        status: 'Routine husbandry — no clinical entries in demo workspace',
        statusTone: 'ok',
        provenance: PUBLIC,
      },
    ],
  },
  {
    slug: 'rhino',
    name: 'Southern white rhinoceros',
    scientific: 'Ceratotherium simum simum',
    group: 'megafauna',
    taonga: false,
    recoveryProgramme: 'ZAA regional collection plan — near-threatened',
    breedingPlan: 'Regional herd management — studbook-managed',
    breedingProgress: 35,
    welfare: 'gap-flagged',
    blurb:
      'Southern white rhinos are among the flagship megafauna at Auckland Zoo, cared for by the NZCCM veterinary team.',
    animals: [
      {
        id: 'rhino-zambezi',
        name: 'Zambezi',
        species: 'rhino',
        sex: 'F',
        age: '24 yo',
        status: 'Acute front-left lameness post-transfer — NZCCM assessment pending',
        statusTone: 'urgent',
        provenance: SCENARIO,
      },
    ],
  },
];

export function getSpecies(slug: string): ZooSpecies | undefined {
  return SPECIES.find((s) => s.slug === slug);
}

export const ALL_ANIMALS: ZooAnimal[] = SPECIES.flatMap((s) => s.animals);

export function getAnimal(id: string): ZooAnimal | undefined {
  return ALL_ANIMALS.find((a) => a.id === id);
}

// ----------------------------------------------------------------------------
// WELFARE — MPI Code of Welfare (Zoos) + ZAA Accreditation Manual (illustrative)
// ----------------------------------------------------------------------------

export const WELFARE_RECORDS: WelfareRecord[] = [
  {
    id: 'wr-rhino-1',
    speciesSlug: 'rhino',
    enclosure: 'Rhino outer paddock',
    code: 'MPI Code of Welfare (Zoos) — minimum standard: handling & transfer',
    requirement: 'Welfare grade of large-mammal transfers must be assessable if a repeat pattern emerges.',
    status: 'gap-flagged',
    note: 'Post-transfer lameness event (Zambezi) flagged — Keeper surfaced this against the transfer-handling standard. Illustrative only.',
    lastChecked: '2026-07-01',
  },
  {
    id: 'wr-orangutan-1',
    speciesSlug: 'orangutan',
    enclosure: 'Orangutan habitat',
    code: 'ZAA Accreditation Manual — enclosure enrichment',
    requirement: 'Enrichment programme documented and reviewed for great apes.',
    status: 'review-due',
    note: 'Quarterly enrichment review falls due this month — Keeper drafted the review checklist. Illustrative only.',
    lastChecked: '2026-06-15',
  },
  {
    id: 'wr-kiwi-1',
    speciesSlug: 'kiwi',
    enclosure: 'NZCCM kōhanga crèche',
    code: 'MPI Code of Welfare (Zoos) — early-life care of native species',
    requirement: 'Early-life husbandry parameters (weight, feeding, temperature) logged for reared chicks.',
    status: 'compliant',
    note: 'Kōhanga chick husbandry log current. Taonga species — cultural content held for iwi.',
    lastChecked: '2026-07-01',
  },
  {
    id: 'wr-tuatara-1',
    speciesSlug: 'tuatara',
    enclosure: 'Te Wao Nui native-reptile precinct',
    code: 'MPI Code of Welfare (Zoos) — thermal & habitat provision (reptiles)',
    requirement: 'Thermal gradient and habitat provision meet native-reptile standard.',
    status: 'compliant',
    note: 'Precinct within standard. Taonga species — cultural content held for iwi.',
    lastChecked: '2026-06-20',
  },
  {
    id: 'wr-giraffe-1',
    speciesSlug: 'giraffe',
    enclosure: 'Giraffe habitat',
    code: 'ZAA Accreditation Manual — herd social structure',
    requirement: 'Herd social grouping appropriate to species.',
    status: 'compliant',
    note: 'Herd structure within standard. Illustrative only.',
    lastChecked: '2026-06-18',
  },
];

export const WELFARE_SUMMARY = {
  compliant: WELFARE_RECORDS.filter((r) => r.status === 'compliant').length,
  reviewDue: WELFARE_RECORDS.filter((r) => r.status === 'review-due').length,
  gaps: WELFARE_RECORDS.filter((r) => r.status === 'gap-flagged').length,
};

// ----------------------------------------------------------------------------
// CLINICAL — spec §5.6.5 Mockup 1 (Zambezi rhino SOAP note)
// ----------------------------------------------------------------------------

export const CLINICAL_NOTES: ClinicalNote[] = [
  {
    id: 'cn-zambezi-2026-07-01',
    animalId: 'rhino-zambezi',
    animalLabel: 'Zambezi (southern white rhinoceros, 24 yo, F)',
    speciesSlug: 'rhino',
    noteType: 'incident',
    date: '2026-07-01 10:14',
    reviewer: 'James Chatterton (Manager of Veterinary Services) or on-shift NZCCM vet',
    status: 'draft-for-review',
    soap: {
      s: 'Non weight-bearing front left forelimb, observed by keeper on shift after morning transfer to outer paddock. Loading normally on RH, LH, RF. Appetite normal (full breakfast eaten). No visible external injury reported on visual inspection over the fence. Annual TB re-check due next week (scheduled).',
      o: 'Not yet examined. NZCCM vet to complete standing assessment ± hoist-crush if lameness grade > 3/5.',
      a: 'Acute-onset unilateral forelimb lameness in a mature rhinoceros post-transfer. Differentials include soft-tissue injury (strain, sprain — most likely given the transfer trigger), sole abscess or nail-bed infection (verify with a lift + inspection), foreign body in the sole, and — less likely but must be ruled out — septic pedal osteitis, physiological/nutritional foot disease, and rarely for a 24-yo female, degenerative joint disease. TB should not be interpreted as related unless systemic signs emerge.',
      p: '1. Confine to outer paddock (already in place); withhold outward transfer until re-examined. 2. NZCCM standing assessment today, staff on either side, hoist-crush available if depth-of-exam required. 3. Consider NSAID (meloxicam) after clinical exam — dose per weight from AZWMP rhino formulary, cross-checked against VetMed NZ; withhold if the exam surfaces contraindication. 4. Foot lift + hoof-knife inspection of the affected foot — sole, wall, coronet, interdigital cleft. Photograph for the record. 5. Re-assess in 24h; if no improvement, image (portable radiograph if tolerated) + cultures if any discharge. 6. TB re-check next week — proceed as scheduled unless the vet elects to defer for welfare reasons.',
    },
    stamps: {
      disclaimer:
        'This is an unsigned draft for a registered veterinarian to review and sign. assembl is not a veterinary practice and has not examined this animal.',
      sources: [
        { label: 'AZWMP rhino formulary', tier: 'B', retrieved: '2026-07-01' },
        { label: 'VetMed NZ formulary', tier: 'A', retrieved: '2026-07-01' },
        { label: 'NZVA Code of Professional Conduct', tier: 'A', retrieved: '2026-07-01' },
      ],
      tikangaGate: 'pass',
      trustTier: 'A on the base draft, B on rhinoceros-specific dosing',
      kaitiakiReviewer: 'N/A (no taonga species implicated)',
    },
    provenance: SCENARIO,
  },
];

export function notesForAnimal(animalId: string): ClinicalNote[] {
  return CLINICAL_NOTES.filter((n) => n.animalId === animalId);
}

// ----------------------------------------------------------------------------
// EDUCATION — spec §5.6.5 Mockup 2 (meet-the-kiwi-chick card, whakapapa held)
// ----------------------------------------------------------------------------

export const EDUCATION_DRAFTS: EducationDraft[] = [
  {
    id: 'ed-kiwi-chick-2026-07-01',
    speciesSlug: 'kiwi',
    title: 'Meet the newest member of our kōhanga',
    moment: 'Hatch — North Island brown kiwi chick, kōhanga, 320 g at hatch',
    body: `Yesterday morning at the New Zealand Centre for Conservation Medicine, a brand-new North Island brown kiwi chick hatched — bright, alert, and weighing in at a very respectable 320 grams.

This little one is the latest addition to Auckland Zoo's kiwi kōhanga — the crèche where kiwi chicks receive the specialist early-life care they need before heading to a predator-free island to grow up strong enough to face life on the mainland.

Every kiwi chick that hatches here is part of Operation Nest Egg, the national programme that gives kiwi eggs and chicks the best possible start by hatching and raising them in human care until they're the size and strength of an adult — around 1200 grams — at which point they're released back into their forest of origin.

Auckland Zoo has hatched and released more than 410 kiwi to the wild over the years, alongside the community of trusts, iwi kaitiaki, and DOC teams who make it possible.

[ Naming and whakapapa content held — this chick's name and the forest its whakapapa traces to will be confirmed in consultation with iwi partners. Keeper never generates this content. ]`,
    kaumatuaHold: true,
    holdNote:
      'Taonga species. Naming and whakapapa content is intentionally held for iwi consultation and rohe-appropriate kaitiaki sign-off — never model-generated. The education-team lead reviews the clinical/public-voice draft; iwi kaitiaki confirm the held content before publish.',
    reviewer: 'Auckland Zoo education-team lead + rohe-appropriate iwi kaitiaki (for held content)',
    status: 'draft-for-review',
    provenance: SCENARIO,
  },
];

export function educationForSpecies(slug: string): EducationDraft[] {
  return EDUCATION_DRAFTS.filter((e) => e.speciesSlug === slug);
}

// ----------------------------------------------------------------------------
// NZCCM — New Zealand Centre for Conservation Medicine integration (spec §5.6.1)
// ----------------------------------------------------------------------------

export const NZCCM = {
  name: 'New Zealand Centre for Conservation Medicine',
  opened: 2007,
  summary:
    "Auckland Zoo's on-site veterinary hospital — Aotearoa's flagship conservation-medicine hospital. Treats the resident collection and wild-native casualties, and hosts conservation-medicine research in close collaboration with DOC and Massey University.",
  scope: [
    'Preventative medicine',
    'Surgery',
    'Nutrition',
    'Reproductive management',
    'Quarantine & biosecurity',
    'Emergency animal care',
  ],
  bridges: [
    {
      title: 'Rescue-coordination bridge for wild natives',
      body: 'When members of the public bring an injured native to the Zoo gate (kererū, ruru, kiwi hit by cars), Keeper runs the Rescue Coordination specialty inside the Zoo\'s own workflow — DOC HOTline draft, chain-of-custody note, referral to Wildbase if needed.',
    },
    {
      title: 'DOC + Massey collaboration bridge',
      body: 'Keeper cross-links NZCCM outputs into Wildbase Recovery + DOC Species Recovery workflows once those specialties come online — the NZCCM becomes the operational bridge, not a walled garden.',
    },
    {
      title: 'Kākāpō Recovery clinical support',
      body: 'NZCCM provides surgical, aspergillosis and reproductive care for named kākāpō when the on-island team can\'t manage a case — the plausible bridge to Ngāi Tahu + DOC Kākāpō Recovery. Taonga species: all cultural content kaumātua-gated.',
    },
  ],
  caseload: [
    { label: 'Resident collection — routine & preventative', tone: 'ok' as const },
    { label: 'Wild-native casualties — emergency intake', tone: 'watch' as const },
    { label: 'Zambezi (rhino) — acute lameness, assessment pending', tone: 'urgent' as const },
  ],
};

// ----------------------------------------------------------------------------
// DASHBOARD — today's focus rollup (spec §5.6.2)
// ----------------------------------------------------------------------------

export const TODAY = {
  focusAnimalId: 'rhino-zambezi',
  urgentNotes: [
    {
      id: 'u-zambezi',
      label: 'Zambezi (rhino) — acute front-left lameness post-transfer',
      detail: 'NZCCM standing assessment pending. Clinical note drafted for vet review.',
      href: '/customers/auckland-zoo/keeper/clinical',
    },
    {
      id: 'u-welfare-rhino',
      label: 'Welfare-code gap flagged — rhino transfer handling',
      detail: 'MPI Code of Welfare (Zoos) transfer-handling standard — repeat-pattern watch.',
      href: '/customers/auckland-zoo/keeper/welfare',
    },
  ],
  upcoming: [
    { id: 'up-tb', label: 'Zambezi annual TB re-check', when: 'Next week' },
    { id: 'up-enrich', label: 'Orangutan quarterly enrichment review', when: 'This month' },
    { id: 'up-kiwi', label: 'Kōhanga chick — public content card (education review)', when: 'Pending iwi naming' },
  ],
};
