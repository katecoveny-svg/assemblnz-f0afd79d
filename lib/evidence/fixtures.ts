/**
 * Evidence-pack fixtures.
 * Three canonical examples for the /evidence-pack/preview page and for
 * the visual-regression test harness (voyage-evidence-craft.md §8).
 *
 *   1. Waihanga · workflow pack · sealed
 *      A s14B precheck for 27 King St, accepted by Auckland Council BCA.
 *   2. Tōro / Co-parenting · posture pack · sealed
 *      Monthly co-parenting posture pack with hash-chained log + ledger.
 *   3. Pīkau · workflow pack · draft
 *      A Customs entry lodgement, still in Draft awaiting reviewer sign-off.
 *
 * Hashes are pre-computed-looking but illustrative; the live pack render
 * recomputes via hashPack() before sealing.
 */

import type { EvidencePack } from './pack-spec';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Waihanga · workflow · sealed
// ─────────────────────────────────────────────────────────────────────────────

export const waihangaPack: EvidencePack = {
  id: 'pack_wai_2026_05_11_27_king',
  tenantId: 'tenant_waihanga_demo',
  kete: 'waihanga',
  kind: 'workflow',
  title: {
    mi: 'Tirohanga ā-Wāhi 14B',
    en: 'Section 14B precheck',
  },
  subject: {
    kind: 'project',
    ref: 'proj_27_king',
    label: '27 King Street, Auckland · BCA precheck',
  },
  issuedAt: '2026-05-11T14:32:00+12:00',
  status: 'sealed',
  reviewer: {
    name: 'Aroha Witana',
    role: 'Licensed building practitioner · LBP 118234',
    email: 'aroha@aroha-build.co.nz',
  },
  agentLoadout: [
    { agent: 'arai', sectionIds: ['tuapapa', 'te-ahua-o-te-mahi'] },
    { agent: 'ata', sectionIds: ['whakaaro'] },
    { agent: 'iho-router', sectionIds: ['whakatupato'] },
    { agent: 'mana', sectionIds: ['whakapono'] },
  ],
  sections: [
    {
      id: 'tuapapa',
      title: { mi: 'Tūāpapa', en: 'Foundation' },
      draftedBy: 'arai',
      body: [
        {
          kind: 'paragraph',
          text:
            'This pack records the section 14B precheck assembled for the residential alteration at 27 King Street, Auckland — a category 2 alteration to a 1960s villa with an extension over the existing garage. The precheck was lodged with Auckland Council BCA on 9 May 2026 and accepted on 11 May 2026 at 13:58 NZST under reference BC/2026/04482.',
          cites: [1, 2],
        },
        {
          kind: 'paragraph',
          text:
            'The work covered: structural design review against the Acceptable Solution B1/AS1, weathertightness assessment against E2/AS1, and producer-statement collation for PS1 design and PS2 review. All references are cited in section §07.',
          cites: [3, 4],
        },
      ],
    },
    {
      id: 'te-ahua-o-te-mahi',
      title: { mi: 'Te āhua o te mahi', en: 'The work itself' },
      draftedBy: 'arai',
      body: [
        {
          kind: 'paragraph',
          text:
            'The structural design was audited against B1/AS1 with particular attention to clause 7.2 (wind zones) and clause 8.4 (snow loads for the upper-floor extension). The wind zone for the site was confirmed at "high" against NZS 3604 Table 5.1, consistent with the geotechnical report on file.',
          cites: [3, 5],
        },
        {
          kind: 'table',
          columns: ['Clause', 'Requirement', 'Evidence on file'],
          rows: [
            ['B1/AS1 §7.2', 'Wind zone confirmation', 'NZS 3604 Table 5.1 site report dated 17 Mar 2026'],
            ['B1/AS1 §8.4', 'Upper-floor snow load 0.9 kPa', 'Calc sheet by Te Whatu Consulting, 22 Mar 2026'],
            ['E2/AS1 §9', 'Weathertight cladding system', 'JAMES HARDIE Linea — manufacturer statement on file'],
            ['G12/AS1', 'Hot water supply', 'PS1 from licensed plumber, 02 Apr 2026'],
          ],
          caption: 'Clauses audited and the documents that support each',
        },
        {
          kind: 'paragraph',
          text:
            'Producer statements were collated: PS1 (design) from Te Whatu Consulting Ltd, PS2 (design review) from Aroha Witana LBP 118234, and PS3 (construction) was deferred until the LBP-on-site appointment confirmed at handover.',
          cites: [6],
        },
      ],
    },
    {
      id: 'whakaaro',
      title: { mi: 'Whakaaro', en: 'Reasoning' },
      draftedBy: 'ata',
      body: [
        {
          kind: 'paragraph',
          text:
            'One condition was identified that warranted reviewer attention before lodgement: the proposed deck on the eastern elevation reduces the existing weathertight detail at the upper window jamb. The agent flagged the detail for re-engineering before lodgement.',
        },
        {
          kind: 'pullQuote',
          text:
            'Do not lodge until the jamb-flashing detail at sheet A4-12 is re-cut. The current detail relies on a sealant joint that E2/AS1 §9.1.3 does not accept as a primary line of defence.',
          attributedTo: 'ata · weathertightness flag, 8 May 2026',
        },
        {
          kind: 'paragraph',
          text:
            'The detail was re-engineered the next morning; a revised sheet A4-12 was issued by the architect and the precheck proceeded.',
        },
      ],
    },
    {
      id: 'whakatupato',
      title: { mi: 'Whakatūpato', en: 'Flags' },
      draftedBy: 'iho-router',
      body: [
        {
          kind: 'callout',
          tone: 'pounamu',
          text:
            'No outstanding flags at lodgement. The weathertightness flag noted in §03 was resolved before lodgement and is recorded in the audit log.',
        },
      ],
    },
    {
      id: 'whakapono',
      title: { mi: 'Whakapono', en: 'Attestation' },
      draftedBy: 'mana',
      body: [
        {
          kind: 'paragraph',
          text:
            'I, Aroha Witana, LBP 118234, have reviewed this precheck against the documents on file and the Acceptable Solutions cited. The lodgement accurately represents the work to be carried out and the records held.',
        },
        {
          kind: 'signature',
          signedBy: 'Aroha Witana · LBP 118234',
          signedAt: '2026-05-11 14:31 NZST',
        },
      ],
    },
    // pou-taunaki body kept empty — the EvidencePackCitations component
    // renders pack.citations directly. This stub exists only to satisfy
    // the canonical section list for kind === 'workflow'.
    {
      id: 'pou-taunaki',
      title: { mi: 'Pou taunaki', en: 'Citations' },
      draftedBy: 'mana',
      body: [],
    },
  ],
  citations: [
    {
      n: 1,
      ref: 'Building Act 2004 s 14B',
      context: 'Duty of builder to carry out building work in accordance with the building consent',
      url: 'https://www.legislation.govt.nz/act/public/2004/0072/latest/DLM306036.html',
    },
    {
      n: 2,
      ref: 'Auckland Council BCA reference BC/2026/04482',
      context: 'Lodgement accepted 11 May 2026 at 13:58 NZST',
      url: 'https://aucklandcouncil.govt.nz/bc/BC-2026-04482',
    },
    {
      n: 3,
      ref: 'Acceptable Solution B1/AS1',
      context: 'Structure — clauses 7.2 (wind) and 8.4 (snow) audited',
      url: 'https://www.building.govt.nz/asvm/b1-as1',
    },
    {
      n: 4,
      ref: 'Acceptable Solution E2/AS1',
      context: 'External moisture — clause 9 weathertightness',
      url: 'https://www.building.govt.nz/asvm/e2-as1',
    },
    {
      n: 5,
      ref: 'NZS 3604:2011 Table 5.1',
      context: 'Wind zone confirmation for the King Street site',
      url: 'https://www.standards.govt.nz/sponsored-standards/nzs-3604/',
    },
    {
      n: 6,
      ref: 'PS1 — Te Whatu Consulting Ltd · 22 March 2026',
      context: 'Producer Statement (Design) for structural and weathertight design',
    },
  ],
  hashChain: {
    prevHash: '1b80c1a9e2f7d4c3b6a508d2f1e0c4a17e30b5d9c81f72e6a3b40c9d8e5f10a17',
    thisHash: '7f3a9c8b21e0d4f5c6a9e8b7d4f3c2a1b0d4e2f5c8b1a09e7d6c5b4a3210d4e2',
    sealedAt: '2026-05-11T14:32:08+12:00',
    verifierUrl: '/evidence/verify/7f3a9c8b21e0d4f5c6a9e8b7d4f3c2a1b0d4e2f5c8b1a09e7d6c5b4a3210d4e2',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Tōro · Co-parenting posture · sealed
// ─────────────────────────────────────────────────────────────────────────────

export const coParentingPack: EvidencePack = {
  id: 'pack_toro_2026_04_coparent',
  tenantId: 'tenant_navigator_hamilton',
  kete: 'toro',
  kind: 'posture',
  title: {
    mi: 'Whakatakotoranga Mātua-Whāngai',
    en: 'Co-parenting posture · April 2026',
  },
  subject: {
    kind: 'period',
    ref: 'family_w_april',
    label: 'Whānau W. · April 2026',
  },
  issuedAt: '2026-05-04T09:00:00+12:00',
  status: 'sealed',
  reviewer: {
    name: 'Mereana Tipene',
    role: 'Co-parenting navigator · FDR mediator',
    email: 'mereana@navigator.hamilton.nz',
  },
  agentLoadout: [
    { agent: 'agent-toro', sectionIds: ['tuapapa', 'mahi-i-mahia'] },
    { agent: 'signal-security', sectionIds: ['rehita'] },
    { agent: 'iho-router', sectionIds: ['whakatupato'] },
    { agent: 'kahu', sectionIds: ['anga-whakamua'] },
    { agent: 'mana', sectionIds: ['whakapono'] },
  ],
  sections: [
    {
      id: 'tuapapa',
      title: { mi: 'Tūāpapa', en: 'Foundation' },
      draftedBy: 'agent-toro',
      body: [
        {
          kind: 'paragraph',
          text:
            'This pack records the April 2026 co-parenting posture for Whānau W. — two children in shared care, parenting order in force since June 2024. Both parents have consented to the use of Assembl as a coordination and record-keeping surface; consent receipts are on file and cited below.',
          cites: [1, 2],
        },
        {
          kind: 'paragraph',
          text:
            'The pack is intended as a factual record. It is not legal advice and does not replace counsel.',
        },
      ],
    },
    {
      id: 'mahi-i-mahia',
      title: { mi: 'Mahi i mahia', en: 'Work completed' },
      draftedBy: 'agent-toro',
      body: [
        {
          kind: 'list',
          items: [
            '38 hash-chained messages exchanged between the parents through the platform.',
            '12 shared expenses logged with receipts attached, totalling $1,847.20.',
            '8 care-handover events recorded (4 Friday handovers, 4 Sunday handovers).',
            '3 tone-rewrite suggestions accepted by Parent A before sending.',
            '2 GP appointments coordinated; medication transferred 4 times.',
            '1 in-person navigator check-in held on 18 April with each parent separately.',
          ],
          cites: [3],
        },
      ],
    },
    {
      id: 'rehita',
      title: { mi: 'Rēhita', en: 'Ledger' },
      draftedBy: 'signal-security',
      body: [
        {
          kind: 'table',
          columns: ['Date', 'Description', 'Paid by', 'Share owed', 'Status'],
          rows: [
            ['03 Apr', 'School fees · Term 2 (T.)', 'Parent A', '$240.00 (B)', 'Settled 09 Apr'],
            ['08 Apr', 'GP visit · ear infection (A.)', 'Parent B', '$48.50 (A)', 'Settled 12 Apr'],
            ['11 Apr', 'Football boots (T.)', 'Parent A', '$70.00 (B)', 'Settled 15 Apr'],
            ['17 Apr', 'Holiday programme · 1 day', 'Parent B', '$36.50 (A)', 'Settled 22 Apr'],
            ['24 Apr', 'Birthday cake + cards', 'Parent A', '$22.00 (B)', 'Outstanding'],
          ],
          caption: 'Shared expenses · April 2026 · reconciled against IRD child-support assessment 2025/26',
        },
      ],
    },
    {
      id: 'whakatupato',
      title: { mi: 'Whakatūpato', en: 'Flags' },
      draftedBy: 'iho-router',
      body: [
        {
          kind: 'callout',
          tone: 'pounamu',
          text:
            'No coercive-control or family-violence patterns triggered this period.',
        },
        {
          kind: 'paragraph',
          text:
            'One tone-rewrite was offered on 14 April; the originating parent accepted the rewrite and the message was sent in its softened form. The original draft is held in the audit log and is recoverable on order from a properly constituted authority.',
        },
      ],
    },
    {
      id: 'anga-whakamua',
      title: { mi: 'Anga whakamua', en: 'Forward posture' },
      draftedBy: 'kahu',
      body: [
        {
          kind: 'list',
          items: [
            'Term 2 fees for the second child fall due 6 May 2026 — Parent B to pay, Parent A to reimburse 50%.',
            'Annual parenting-plan review scheduled for 18 June 2026 with the navigator.',
            'GP follow-up on the older child\'s ear is booked for 14 May 2026.',
          ],
        },
      ],
    },
    {
      id: 'whakapono',
      title: { mi: 'Whakapono', en: 'Attestation' },
      draftedBy: 'mana',
      body: [
        {
          kind: 'paragraph',
          text:
            'I, Mereana Tipene, have reviewed this posture pack against the records held in the Assembl ledger. The records reflect the activity of both parents through the platform during April 2026.',
        },
        {
          kind: 'signature',
          signedBy: 'Mereana Tipene · Co-parenting navigator',
          signedAt: '2026-05-04 08:58 NZST',
        },
      ],
    },
    {
      id: 'pou-taunaki',
      title: { mi: 'Pou taunaki', en: 'Citations' },
      draftedBy: 'mana',
      body: [],
    },
  ],
  citations: [
    {
      n: 1,
      ref: 'Care of Children Act 2004 s 46G',
      context: 'Parenting plans — both parents have entered into a documented plan',
      url: 'https://www.legislation.govt.nz/act/public/2004/0090/latest/DLM317245.html',
    },
    {
      n: 2,
      ref: 'Privacy Act 2020',
      context: 'Both parents have given informed consent under IPP 3 to processing of children\'s data',
      url: 'https://www.legislation.govt.nz/act/public/2020/0031/latest/LMS23223.html',
    },
    {
      n: 3,
      ref: 'Evidence Act 2006 s 137',
      context:
        'The hash-chained communication log is held in a form that satisfies the integrity requirement for documentary evidence',
      url: 'https://www.legislation.govt.nz/act/public/2006/0069/latest/DLM393463.html',
    },
    {
      n: 4,
      ref: 'Child Support Act 1991',
      context: 'Shared-expense ledger reconciled against current IRD child-support assessment',
      url: 'https://www.legislation.govt.nz/act/public/1991/0142/latest/DLM253151.html',
    },
  ],
  hashChain: {
    prevHash: '4c2e1d8b9f3a5c6e7d4b2a0f1e9c8d7b6a5f4e3d2c1b0a98765e4d3c2b1a0f9e',
    thisHash: 'a3b4c5d6e7f8091a2b3c4d5e6f7081a2b3c4d5e6f7081a2b3c4d5e6f7081a2b3',
    sealedAt: '2026-05-04T09:00:00+12:00',
    verifierUrl: '/evidence/verify/a3b4c5d6e7f8091a2b3c4d5e6f7081a2b3c4d5e6f7081a2b3c4d5e6f7081a2b3',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Pīkau · workflow · DRAFT
// ─────────────────────────────────────────────────────────────────────────────

export const pikauDraftPack: EvidencePack = {
  id: 'pack_pikau_2026_05_11_maw',
  tenantId: 'tenant_pikau_demo',
  kete: 'pikau',
  kind: 'workflow',
  title: {
    mi: 'Whakaurunga Tūmataiti',
    en: 'Customs entry lodgement',
  },
  subject: {
    kind: 'project',
    ref: 'entry_MAW1234567',
    label: 'Entry MAW1234567 · 14 cartons electrical components ex SIN',
  },
  issuedAt: '2026-05-11T11:08:00+12:00',
  status: 'draft',
  reviewer: null,
  agentLoadout: [
    { agent: 'agent-pikau', sectionIds: ['tuapapa', 'te-ahua-o-te-mahi'] },
    { agent: 'ata-bim', sectionIds: ['whakaaro'] },
    { agent: 'iho-router', sectionIds: ['whakatupato'] },
  ],
  sections: [
    {
      id: 'tuapapa',
      title: { mi: 'Tūāpapa', en: 'Foundation' },
      draftedBy: 'agent-pikau',
      body: [
        {
          kind: 'paragraph',
          text:
            'This pack accompanies the proposed Customs entry MAW1234567 for 14 cartons of electrical components ex Singapore on behalf of Tāmaki Imports Ltd. The entry is drafted for lodgement to Trade Single Window pending reviewer sign-off.',
          cites: [1],
        },
      ],
    },
    {
      id: 'te-ahua-o-te-mahi',
      title: { mi: 'Te āhua o te mahi', en: 'The work itself' },
      draftedBy: 'agent-pikau',
      body: [
        {
          kind: 'table',
          columns: ['Line', 'Tariff', 'Description', 'CIF NZD'],
          rows: [
            ['01', '8504.40.19', 'Switching mode power supplies', '$8,940.20'],
            ['02', '8536.69.90', 'Plug and socket assemblies', '$2,118.00'],
            ['03', '8544.42.20', 'Cable harness assemblies', '$1,407.50'],
          ],
          caption: 'Lines drafted against the Working Tariff Document 2026',
        },
        {
          kind: 'paragraph',
          text:
            'Goods are classified to HS 2022; the IHS biosecurity declaration was prepared on the basis of "no untreated wood packaging" supported by the supplier\'s ISPM-15 certificate on file.',
          cites: [2, 3],
        },
      ],
    },
    {
      id: 'whakaaro',
      title: { mi: 'Whakaaro', en: 'Reasoning' },
      draftedBy: 'ata-bim',
      body: [
        {
          kind: 'paragraph',
          text:
            'Tariff line 8504.40.19 was selected over 8504.40.30 on the basis that the units are output ≤ 100 W, consistent with Tāmaki Imports\' previous lodgements for the same supplier. The agent flagged the line for reviewer confirmation because the invoice description is ambiguous.',
        },
      ],
    },
    {
      id: 'whakatupato',
      title: { mi: 'Whakatūpato', en: 'Flags' },
      draftedBy: 'iho-router',
      body: [
        {
          kind: 'callout',
          tone: 'draft',
          text:
            'One flag pending review: confirm tariff classification for line 01 against supplier datasheet before lodgement.',
        },
      ],
    },
    {
      id: 'whakapono',
      title: { mi: 'Whakapono', en: 'Attestation' },
      draftedBy: 'mana',
      body: [
        {
          kind: 'callout',
          tone: 'draft',
          text:
            'Awaiting reviewer sign-off. This pack remains in Draft and is not lodgeable.',
        },
      ],
    },
    {
      id: 'pou-taunaki',
      title: { mi: 'Pou taunaki', en: 'Citations' },
      draftedBy: 'mana',
      body: [],
    },
  ],
  citations: [
    {
      n: 1,
      ref: 'Customs and Excise Act 2018',
      context: 'Entry of imported goods — Part 4',
      url: 'https://www.legislation.govt.nz/act/public/2018/0004/latest/DLM7038920.html',
    },
    {
      n: 2,
      ref: 'Working Tariff Document of New Zealand 2026',
      context: 'Tariff classification for lines 01–03',
      url: 'https://www.customs.govt.nz/business/tariff/',
    },
    {
      n: 3,
      ref: 'Biosecurity (Import) Standard — ISPM-15',
      context: 'Wood packaging declaration on supplier ISPM-15 certificate',
      url: 'https://www.mpi.govt.nz/biosecurity/border-clearance/ispm-15/',
    },
  ],
  hashChain: {
    prevHash: '6c4e2d1f8b9a3c5e7d4b2a0f1e9c8d7b6a5f4e3d2c1b0a98765e4d3c2b1a0f9e',
    thisHash: '',
    sealedAt: null,
    verifierUrl: '',
  },
};

export const FIXTURE_PACKS: EvidencePack[] = [
  waihangaPack,
  coParentingPack,
  pikauDraftPack,
];
