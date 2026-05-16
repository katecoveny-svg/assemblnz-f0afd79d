/**
 * Hybrid-services workflow templates.
 * Spec: voyage-hybrid-services.md §5 item 2 — pre-wired agent loadout +
 * scheduled cadence + evidence-pack template, one per archetype on
 * /platform/hybrid-services.
 *
 * Each template is a *recipe*, not runtime config. When an Operator-as-
 * platform tenant adopts a template, the platform:
 *   1. seeds escalation_policies rows for every entry in `escalationPolicies`
 *   2. registers a cadence on each new client_seat using `cadence`
 *   3. enables the agents in `agents` for that tenant's loadout
 *   4. binds the evidence-pack generator to the `evidence` recipe
 *
 * Templates are TypeScript (not raw JSON) so they get IDE help and the
 * archetype-id type is enforced — but they remain pure data, no imports
 * from runtime modules.
 */

export type HybridArchetype =
  | 'preventative_legal'
  | 'always_on_learning'
  | 'mental_health_support'
  | 'continuous_finance'
  | 'co_parenting_navigator'
  | 'family_coordination';

export type CadenceKind =
  | 'weekly_check_in'
  | 'fortnightly_check_in'
  | 'monthly_review'
  | 'quarterly_review';

export interface EscalationSeed {
  name: string;
  trigger: Record<string, unknown>;
  severity: 1 | 2 | 3 | 4 | 5;
  routeToRole: string;
  slaSeconds: number;
  blockAutomation: boolean;
  notifyChannels: string[];
}

export interface HybridTemplate {
  id: HybridArchetype;
  label: string;
  /** One-line pitch for the template picker. */
  summary: string;
  /** Lucide icon name — resolved by the renderer. */
  icon: string;
  /** Pearl accent colour for cards. */
  accent: string;

  /** Assembl primitives this template binds to. */
  agents: string[];
  channels: ('sms' | 'whatsapp' | 'email' | 'dashboard')[];

  cadence: {
    kind: CadenceKind;
    iso8601Duration: 'P1W' | 'P2W' | 'P1M' | 'P3M';
    runKind: string;
    description: string;
  };

  evidence: {
    name: string;
    period: 'monthly' | 'quarterly';
    sections: string[];
    citations: string[];
  };

  escalationPolicies: EscalationSeed[];

  /** Defensive constraints surfaced in product copy. */
  guardrails: string[];
}

export const HYBRID_TEMPLATES: HybridTemplate[] = [
  {
    id: 'preventative_legal',
    label: 'Preventative legal maintenance',
    summary:
      'Monthly legal hygiene for SMEs and households — contracts scanned, regulatory drift caught, variations drafted.',
    icon: 'Scale',
    accent: '#2B6B57',
    agents: ['iho', 'compliance-scanner', 'nz-compliance-autoupdate', 'esign'],
    channels: ['email', 'dashboard'],
    cadence: {
      kind: 'monthly_review',
      iso8601Duration: 'P1M',
      runKind: 'monthly_legal_review',
      description:
        'Monthly scan of every contract the client is a party to, plus a regulatory-change diff against their exposure profile.',
    },
    evidence: {
      name: 'Legal Posture',
      period: 'quarterly',
      sections: [
        'Contracts reviewed',
        'Regulatory changes applicable',
        'Variations drafted and signed',
        'Open risks accepted by client',
      ],
      citations: ['Privacy Act 2020', 'Fair Trading Act 1986', 'Employment Relations Act 2000'],
    },
    escalationPolicies: [
      {
        name: 'Material contract change unflagged for 14 days',
        trigger: { kind: 'drift', field: 'unreviewed_changes_days', gte: 14 },
        severity: 3,
        routeToRole: 'navigator',
        slaSeconds: 86400,
        blockAutomation: false,
        notifyChannels: ['dashboard', 'email'],
      },
      {
        name: 'Regulatory change affects > 25% of clients',
        trigger: { kind: 'amount', field: 'affected_client_pct', gte: 0.25 },
        severity: 4,
        routeToRole: 'supervisor',
        slaSeconds: 3600,
        blockAutomation: false,
        notifyChannels: ['dashboard', 'email'],
      },
    ],
    guardrails: [
      'Not legal advice — every outbound document requires a licensed reviewer sign-off.',
      'Operator must be a paralegal, licensed lawyer, or supervised legal executive.',
    ],
  },

  {
    id: 'always_on_learning',
    label: 'Always-on personalised learning',
    summary:
      'Daily practice prompts plus a weekly human pathway-guide check-in. Persistence over content.',
    icon: 'GraduationCap',
    accent: '#AC5838',
    agents: ['agent-ako', 'memory-recall', 'te-reo-video-learn'],
    channels: ['sms', 'dashboard'],
    cadence: {
      kind: 'weekly_check_in',
      iso8601Duration: 'P1W',
      runKind: 'weekly_pathway_guide_session',
      description:
        '20-minute weekly check-in with the learner. The system pre-prepares the session brief: what was covered, where they got stuck, what to nudge.',
    },
    evidence: {
      name: 'Learner Monthly Report',
      period: 'monthly',
      sections: [
        'Topics covered',
        'Mastery delta',
        'Persistence streak',
        'Next month plan',
      ],
      citations: ['Education and Training Act 2020'],
    },
    escalationPolicies: [
      {
        name: 'Missed 3 daily prompts in a row',
        trigger: { kind: 'drift', field: 'missed_prompts_streak', gte: 3 },
        severity: 2,
        routeToRole: 'navigator',
        slaSeconds: 86400,
        blockAutomation: false,
        notifyChannels: ['dashboard'],
      },
      {
        name: 'Self-harm language in journal',
        trigger: {
          kind: 'keyword',
          patterns: ['kill myself', 'end it', 'hurt myself'],
          case_insensitive: true,
        },
        severity: 5,
        routeToRole: 'supervisor',
        slaSeconds: 0,
        blockAutomation: true,
        notifyChannels: ['dashboard', 'sms'],
      },
    ],
    guardrails: [
      'Learners under 16 require explicit caregiver consent recorded in the consent ledger.',
      'Pathway guide is not a credentialled teacher — escalate to a qualified educator for assessment-bearing content.',
    ],
  },

  {
    id: 'mental_health_support',
    label: 'Peer mental-health support layer',
    summary:
      'Between nothing and licensed therapy. Monitored check-ins, human-led groups, clinician on escalation.',
    icon: 'HeartHandshake',
    accent: '#3B7CB5',
    agents: ['iho', 'memory-recall', 'compress-conversation', 'kahu'],
    channels: ['sms', 'whatsapp', 'dashboard'],
    cadence: {
      kind: 'weekly_check_in',
      iso8601Duration: 'P1W',
      runKind: 'weekly_peer_session',
      description:
        'Weekly 1:1 or group session run by the peer worker, with a prepared session brief on adherence, mood trend, and any flagged signals.',
    },
    evidence: {
      name: 'Wellbeing Posture',
      period: 'monthly',
      sections: [
        'Adherence and attendance',
        'Mood trend',
        'Escalations triggered',
        'Referrals made',
      ],
      citations: ['Privacy Act 2020', 'Mental Health (Compulsory Assessment and Treatment) Act 1992'],
    },
    escalationPolicies: [
      {
        name: 'Crisis keyword in check-in',
        trigger: {
          kind: 'keyword',
          patterns: ['suicide', 'kill myself', 'end my life', 'hurt myself'],
          case_insensitive: true,
        },
        severity: 5,
        routeToRole: 'clinician',
        slaSeconds: 0,
        blockAutomation: true,
        notifyChannels: ['dashboard', 'sms'],
      },
      {
        name: 'Missed 2 weekly sessions in a row',
        trigger: { kind: 'drift', field: 'missed_sessions_streak', gte: 2 },
        severity: 3,
        routeToRole: 'navigator',
        slaSeconds: 86400,
        blockAutomation: false,
        notifyChannels: ['dashboard'],
      },
    ],
    guardrails: [
      'Peer worker is not a licensed therapist. Escalation pathway to a registered clinician must be documented before onboarding.',
      'PII masking is mandatory; mental-health content is SENSITIVE-classified under the data sovereignty layer.',
    ],
  },

  {
    id: 'continuous_finance',
    label: 'Continuous financial life support',
    summary:
      'Continuous Xero / bank-feed monitoring. Monthly reviews. Insurance, tax, debt, KiwiSaver — handled in $39/month cadence units.',
    icon: 'Wallet',
    accent: '#D4A853',
    agents: ['iho', 'xero-sync', 'compliance-scanner', 'flux-monday-briefing'],
    channels: ['email', 'dashboard'],
    cadence: {
      kind: 'monthly_review',
      iso8601Duration: 'P1M',
      runKind: 'monthly_financial_review',
      description:
        'Monthly financial-life pass: tax position, benefits eligibility, insurance gaps, debt trajectory, cash-flow flags.',
    },
    evidence: {
      name: 'Financial-Life Statement',
      period: 'monthly',
      sections: [
        'Tax position',
        'Benefit / credit eligibility',
        'Insurance gap',
        'Debt trajectory',
        'Actions taken',
        'Decisions deferred',
      ],
      citations: ['Tax Administration Act 1994', 'Social Security Act 2018', 'KiwiSaver Act 2006'],
    },
    escalationPolicies: [
      {
        name: 'Large unexplained expense',
        trigger: { kind: 'amount', field: 'expense.amount_nzd', gte: 2000 },
        severity: 3,
        routeToRole: 'navigator',
        slaSeconds: 86400,
        blockAutomation: false,
        notifyChannels: ['dashboard'],
      },
      {
        name: 'Tax position swung > $5k',
        trigger: { kind: 'amount', field: 'tax_delta_nzd_abs', gte: 5000 },
        severity: 4,
        routeToRole: 'supervisor',
        slaSeconds: 3600,
        blockAutomation: false,
        notifyChannels: ['dashboard', 'email'],
      },
    ],
    guardrails: [
      'Not financial advice — operator may not recommend KiwiSaver provider switches without an Authorised Financial Advisor in the loop.',
      'Bank-feed connection requires explicit informed consent every 90 days.',
    ],
  },

  {
    id: 'co_parenting_navigator',
    label: 'Co-parenting navigator (Family Court-ready)',
    summary:
      'Hash-chained communication log, shared expense ledger, court-admissible monthly posture pack.',
    icon: 'Gavel',
    accent: '#6B5B95',
    agents: ['agent-toro', 'signal-security', 'kahu', 'iho', 'esign'],
    channels: ['sms', 'whatsapp', 'email', 'dashboard'],
    cadence: {
      kind: 'monthly_review',
      iso8601Duration: 'P1M',
      runKind: 'monthly_coparenting_posture_pack',
      description:
        'Monthly compile of the hash-chained communication log, expense ledger reconciled against IRD child-support assessment, handover log, and flagged escalations.',
    },
    evidence: {
      name: 'Co-Parenting Posture',
      period: 'monthly',
      sections: [
        'Chronological communication log (hash-chain proof)',
        'Expense ledger and IRD reconciliation',
        'Care and handover log',
        'Escalations and flags',
        'Parenting plan compliance',
      ],
      citations: [
        'Care of Children Act 2004',
        'Child Support Act 1991',
        'Family Violence Act 2018',
        'Evidence Act 2006',
      ],
    },
    escalationPolicies: [
      {
        name: 'Coercive-control tone pattern',
        trigger: { kind: 'tone', score_gte: 0.8, label: 'coercive' },
        severity: 5,
        routeToRole: 'navigator',
        slaSeconds: 0,
        blockAutomation: true,
        notifyChannels: ['dashboard', 'sms'],
      },
      {
        name: 'Family violence keyword',
        trigger: {
          kind: 'keyword',
          patterns: ['threat', 'restraining', 'hit me', 'hurt the kid', 'protection order'],
          case_insensitive: true,
        },
        severity: 5,
        routeToRole: 'navigator',
        slaSeconds: 0,
        blockAutomation: true,
        notifyChannels: ['dashboard', 'sms'],
      },
      {
        name: 'Missed handover',
        trigger: { kind: 'drift', field: 'missed_handovers_30d', gte: 1 },
        severity: 3,
        routeToRole: 'navigator',
        slaSeconds: 14400,
        blockAutomation: false,
        notifyChannels: ['dashboard', 'sms'],
      },
      {
        name: 'Unpaid agreed expense > 30 days',
        trigger: { kind: 'drift', field: 'unpaid_expense_days', gte: 30 },
        severity: 3,
        routeToRole: 'navigator',
        slaSeconds: 86400,
        blockAutomation: false,
        notifyChannels: ['dashboard'],
      },
    ],
    guardrails: [
      'Not legal advice. The posture pack is a factual record, not a legal opinion.',
      'Children are not users. Their data is SENSITIVE-classified and locked behind operator + navigator roles.',
      'Coercive-control patterns trigger immediate human review — the platform never mediates a Family Violence Act 2018 concern unaided.',
      'Both parents must consent to the audit log being hash-chained and retained for Family Court use; consent is itself recorded.',
    ],
  },

  {
    id: 'family_coordination',
    label: 'Family coordination (elder / childcare / household)',
    summary:
      'The system handles calendars, medication, document collation. Human handles the relational and trust pieces.',
    icon: 'Users',
    accent: '#4AA5A8',
    agents: ['agent-toro', 'memory-recall', 'compress-context', 'google-calendar'],
    channels: ['sms', 'whatsapp', 'email', 'dashboard'],
    cadence: {
      kind: 'fortnightly_check_in',
      iso8601Duration: 'P2W',
      runKind: 'fortnightly_coordination_review',
      description:
        'Fortnightly review of the household calendar, medication adherence, upcoming appointments, and any flagged drift.',
    },
    evidence: {
      name: 'Care Plan Timeline',
      period: 'monthly',
      sections: [
        'Calendar adherence',
        'Medication adherence',
        'Appointments completed and upcoming',
        'Decisions taken and consents recorded',
      ],
      citations: ['Privacy Act 2020', 'Health Information Privacy Code 2020'],
    },
    escalationPolicies: [
      {
        name: 'Missed medication 2 doses',
        trigger: { kind: 'drift', field: 'missed_meds_streak', gte: 2 },
        severity: 4,
        routeToRole: 'coordinator',
        slaSeconds: 3600,
        blockAutomation: false,
        notifyChannels: ['dashboard', 'sms'],
      },
      {
        name: 'Missed GP appointment',
        trigger: { kind: 'keyword', patterns: ['did not attend', 'no-show'], case_insensitive: true },
        severity: 3,
        routeToRole: 'coordinator',
        slaSeconds: 86400,
        blockAutomation: false,
        notifyChannels: ['dashboard'],
      },
    ],
    guardrails: [
      'Operator does not provide healthcare advice — escalation routes to the household\'s registered GP or care provider.',
      'Health information is SENSITIVE-classified under HIPC 2020.',
    ],
  },
];

export function getTemplate(id: HybridArchetype): HybridTemplate | undefined {
  return HYBRID_TEMPLATES.find((t) => t.id === id);
}
