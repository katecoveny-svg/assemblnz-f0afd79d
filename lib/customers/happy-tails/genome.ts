/**
 * Happy Tails Genome — the daycare's single source of truth.
 *
 * The same Business Genome shape the flagship tenants use (one row per fact
 * in `living_site_genome`, tenant 'happy-tails'), read by the gated ops
 * console. Edit a fact once and every reader renders the new value.
 *
 * REAL BUSINESS — BY PERMISSION: Happy Tails is a real business taking part
 * with the owner's permission — a deliberate exception to the fictional
 * demo-cast rule. Even so, this genome is deliberately PII-free: no names,
 * phone numbers, GST numbers, email addresses, street addresses or social
 * handles belong here. The personal details live in the RLS-locked tenant
 * data (`lib/tenants/happy-tails/data.ts`) and stay out of the genome by
 * design.
 */

import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';

export const HAPPY_TAILS_TENANT = 'happy-tails';

export const HAPPY_TAILS_GENOME_FACTS: GenomeFact[] = [
  // ── Identity ─────────────────────────────────────────────────────────
  {
    id: 'g-name',
    section: 'identity',
    label: 'Business',
    value: 'Happy Tails — a small family doggy daycare & boarding, West Auckland',
    readBy: ['website', 'voice', 'email', 'social'],
  },
  {
    id: 'g-voice',
    section: 'identity',
    label: 'Brand voice',
    value: "Warm, personal, NZ English — 'we care for every dog as if they were our own'",
    readBy: ['voice', 'email', 'support', 'social'],
  },
  {
    id: 'g-area',
    section: 'identity',
    label: 'Service area',
    value: 'West Auckland · door-to-door daycare bus across Auckland',
    readBy: ['website', 'booking', 'voice', 'crm'],
  },

  // ── Services & pricing ───────────────────────────────────────────────
  {
    id: 'g-daycare',
    section: 'services',
    label: 'Daycare with bus',
    value: 'NZ$57/day, GST incl · door-to-door pickup + drop-off',
    readBy: ['website', 'booking', 'proposals', 'voice', 'crm'],
  },
  {
    id: 'g-overnight',
    section: 'services',
    label: 'Overnight care',
    value: 'NZ$95/night · regular pups only · 10% small-pup discount',
    readBy: ['website', 'booking', 'proposals', 'voice', 'crm'],
  },
  {
    id: 'g-schedule',
    section: 'services',
    label: 'How enrolment works',
    value: 'Not a casual drop-in — every pup joins a weekly recurring schedule in a settled small group',
    readBy: ['website', 'faq', 'voice', 'email'],
  },
  {
    id: 'g-welcome',
    section: 'services',
    label: 'Welcome pack',
    value: "Five-page pack in the owner's voice — bus rules, pre-pickup checklist, small groups, monthly Xero invoicing",
    readBy: ['email', 'faq', 'crm'],
  },
  {
    id: 'g-invoicing',
    section: 'services',
    label: 'Invoicing',
    value: 'Monthly Xero invoicing · part-month · 7-day terms · drafts stay Draft until a human issues',
    readBy: ['proposals', 'crm', 'email'],
  },

  // ── Team ─────────────────────────────────────────────────────────────
  {
    id: 'g-two-voice',
    section: 'team',
    label: 'Two-voice rule (locked)',
    value: "Texts go out in the SMS carer's voice; emails in the owner's voice — Keeper drafts in the right voice automatically",
    readBy: ['voice', 'email', 'support'],
  },
  {
    id: 'g-team',
    section: 'team',
    label: 'The team',
    value: 'Owner + SMS carer, plus handlers, a vet-background handler, and a weekend bus driver',
    readBy: ['crm', 'support'],
  },

  // ── FAQs & policies ──────────────────────────────────────────────────
  {
    id: 'g-checklist',
    section: 'knowledge',
    label: 'Pre-pickup checklist',
    value: 'Every morning before the bus: fed · toileted · collar + tag on',
    readBy: ['faq', 'voice', 'support'],
  },
  {
    id: 'g-vax-policy',
    section: 'knowledge',
    label: 'Vaccination policy',
    value: 'Kennel cough must be current — no overnights after expiry until renewed',
    readBy: ['faq', 'booking', 'voice', 'support'],
  },
  {
    id: 'g-training',
    section: 'knowledge',
    label: 'Training questions',
    value: 'Routed to a force-free trainer (LIMA, humane hierarchy) — a bite or real aggression goes straight to a vet or behaviourist',
    readBy: ['voice', 'support', 'faq'],
  },

  // ── Proof ────────────────────────────────────────────────────────────
  {
    id: 'g-receipts',
    section: 'proof',
    label: 'Mana Receipts',
    value: 'Every draft carries a receipt: who drafted, who approved, which hard rules held',
    readBy: ['email', 'support'],
  },
  {
    id: 'g-law',
    section: 'proof',
    label: 'Grounded in NZ law',
    value: 'Animal Welfare Act 1999 · Privacy Act 2020 IPP 3A · Dog Control Act 1996',
    readBy: ['voice', 'support', 'faq'],
  },

  // ── Operations ───────────────────────────────────────────────────────
  {
    id: 'g-bus-route',
    section: 'operations',
    label: 'Morning bus route',
    value: 'One optimised loop from the West Auckland depot — sequenced stops with 30-minute pickup windows',
    readBy: ['booking', 'voice', 'crm'],
  },
  {
    id: 'g-drafts',
    section: 'operations',
    label: 'Draft-only',
    value: 'Keeper never sends — texts, emails and invoices all wait for one human yes',
    readBy: ['email', 'crm', 'support', 'voice'],
  },
  {
    id: 'g-privacy',
    section: 'operations',
    label: 'Owner privacy',
    value: 'Owner contact details are RLS-locked — never shown in a draft, referred to in masked form',
    readBy: ['support', 'crm'],
  },
];
