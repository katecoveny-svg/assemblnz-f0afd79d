/**
 * Clinic-scheduling policy pack — Scribe / Practice-Manager flagship deep-port.
 *
 * Ported from the clinic section of `assemblnz-latest/src/aaaip/policy/library.ts`.
 * Five rules a `schedule_appointment` action is gated by: no double-booking,
 * emergency-triage-first, patient consent on file, wait-time fairness, and the
 * uncertainty hand-off. This is the consent/escalation skeleton the audit flags
 * as reusable; the SOAP / ICD-10 clinical-note layer is genuinely greenfield and
 * is NOT ported here (it does not exist in the old code).
 */

import { fail, pass, type Policy, type PolicyPredicate, type RegisteredPolicy } from '../types';

const NO_DOUBLE_BOOK: Policy = {
  id: 'clinic.no_double_book',
  domain: 'clinic_scheduling',
  name: 'No double-booking',
  rationale:
    'Clinicians cannot be in two places at once. Overbooking degrades care quality and creates wait-list bias.',
  source: 'Operational standard — NZ Health Quality & Safety Commission',
  severity: 'block',
  oversight: 'ask_each_time',
  tags: ['safety', 'operational'],
};
const noDoubleBookPredicate: PolicyPredicate = (action, ctx) => {
  if (action.kind !== 'schedule_appointment') return pass(NO_DOUBLE_BOOK.id, 'block');
  const slot = action.payload.slotId as string | undefined;
  const occupied = (ctx.world.occupiedSlots as string[]) ?? [];
  if (slot && occupied.includes(slot)) {
    return fail(NO_DOUBLE_BOOK.id, 'block', `Slot ${slot} is already booked. Refusing to overbook.`);
  }
  return pass(NO_DOUBLE_BOOK.id, 'block');
};

const TRIAGE_FIRST: Policy = {
  id: 'clinic.triage_first',
  domain: 'clinic_scheduling',
  name: 'Emergency triage takes priority',
  rationale:
    'Emergency / high-acuity patients must be offered the next available clinical slot before routine bookings.',
  source: 'Australasian Triage Scale (ATS) + AAAIP safety alignment',
  severity: 'block',
  oversight: 'ask_each_time',
  tags: ['safety', 'fairness'],
};
const triagePredicate: PolicyPredicate = (action, ctx) => {
  if (action.kind !== 'schedule_appointment') return pass(TRIAGE_FIRST.id, 'block');
  const acuity = (action.payload.acuity as number | undefined) ?? 5;
  const pendingEmergency = (ctx.world.pendingEmergency as boolean) ?? false;
  if (pendingEmergency && acuity >= 3) {
    return fail(TRIAGE_FIRST.id, 'block', 'An emergency is pending — routine bookings must wait.');
  }
  return pass(TRIAGE_FIRST.id, 'block');
};

const CONSENT_REQUIRED: Policy = {
  id: 'clinic.consent',
  domain: 'clinic_scheduling',
  name: 'Patient consent on file',
  rationale:
    'NZ Health Information Privacy Code requires informed consent before storing or acting on health data.',
  source: 'Health Information Privacy Code 2020 — Rule 2 & Rule 11',
  severity: 'block',
  oversight: 'ask_each_time',
  tags: ['privacy', 'consent', 'compliance'],
};
const consentPredicate: PolicyPredicate = (action) => {
  const consent = action.payload.consentOnFile as boolean | undefined;
  if (consent === false) {
    return fail(CONSENT_REQUIRED.id, 'block', 'Patient has not given consent for AI-assisted scheduling.');
  }
  return pass(CONSENT_REQUIRED.id, 'block');
};

const FAIRNESS: Policy = {
  id: 'clinic.fairness',
  domain: 'clinic_scheduling',
  name: 'Equitable wait times',
  rationale:
    'Wait times should not differ systematically by ethnicity, postcode or insurance status. Drift triggers a warning.',
  source: 'Pae Ora (Healthy Futures) Act 2022 — equity duty',
  severity: 'warn',
  oversight: 'always_allow',
  tags: ['fairness', 'equity'],
};
const fairnessPredicate: PolicyPredicate = (action, ctx) => {
  const bias = (ctx.world.fairnessDriftScore as number | undefined) ?? 0;
  if (bias > 0.25) {
    return fail(FAIRNESS.id, 'warn', `Wait-time fairness drift = ${bias.toFixed(2)}. Investigate before more bookings.`);
  }
  return pass(FAIRNESS.id, 'warn');
};

const UNCERTAINTY: Policy = {
  id: 'clinic.uncertainty_handoff',
  domain: 'clinic_scheduling',
  name: 'Defer to humans when uncertain',
  rationale:
    "If the agent's confidence in a decision is below the configured threshold, escalate to a human clinician.",
  source: 'AAAIP safe-operation principle: human-in-the-loop fallback',
  severity: 'warn',
  oversight: 'ask_each_time',
  tags: ['oversight', 'human-in-the-loop'],
};
const uncertaintyPredicate: PolicyPredicate = (action, ctx) => {
  if (action.confidence < ctx.uncertaintyThreshold) {
    return fail(
      UNCERTAINTY.id,
      'warn',
      `Confidence ${action.confidence.toFixed(2)} below threshold ${ctx.uncertaintyThreshold.toFixed(2)} — requesting human approval.`,
    );
  }
  return pass(UNCERTAINTY.id, 'warn');
};

export const CLINIC_POLICIES: RegisteredPolicy[] = [
  { policy: NO_DOUBLE_BOOK, predicate: noDoubleBookPredicate },
  { policy: TRIAGE_FIRST, predicate: triagePredicate },
  { policy: CONSENT_REQUIRED, predicate: consentPredicate },
  { policy: FAIRNESS, predicate: fairnessPredicate },
  { policy: UNCERTAINTY, predicate: uncertaintyPredicate },
];

export const CLINIC_POLICY_METADATA: Policy[] = CLINIC_POLICIES.map((p) => p.policy);
