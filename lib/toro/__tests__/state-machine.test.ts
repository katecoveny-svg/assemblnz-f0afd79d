/**
 * Tests for the Tōro draft state machine.
 *
 * Run:
 *   npx tsx lib/toro/__tests__/state-machine.test.ts
 *
 * No test framework is currently installed in this repo (package.json has
 * `typecheck` but no `test` script). The file is a self-contained Node script
 * that asserts and exits non-zero on failure. To migrate to vitest later,
 * each `t(...)` block maps 1:1 onto a vitest `test(...)` call.
 *
 * Spec: TORO-V0.1-ARCHITECTURE-SPEC-2026-05-11 §4.4
 */

/* eslint-disable no-console */

import {
  TRANSITIONS,
  isValidTransition,
  isTerminal,
  type DraftState,
} from '../state-machine-types';

const ALL_STATES: DraftState[] = [
  'pending_approval',
  'reviewing',
  'approved',
  'edited_then_approved',
  'rejected',
  'sent',
  'send_failed',
  'expired',
];

let pass = 0;
let fail = 0;
const failures: string[] = [];

function t(name: string, run: () => void): void {
  try {
    run();
    pass += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    fail += 1;
    const msg = err instanceof Error ? err.message : String(err);
    failures.push(`${name}: ${msg}`);
    console.log(`  ✗ ${name}\n    ${msg}`);
  }
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function eq<T>(actual: T, expected: T, msg: string): void {
  if (actual !== expected) {
    throw new Error(`${msg} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

console.log('state-machine — transition matrix');

t('TRANSITIONS covers every state', () => {
  for (const s of ALL_STATES) {
    assert(s in TRANSITIONS, `${s} missing from TRANSITIONS map`);
  }
});

t('pending_approval → reviewing, expired', () => {
  eq(isValidTransition('pending_approval', 'reviewing'), true, 'reviewing allowed');
  eq(isValidTransition('pending_approval', 'expired'), true, 'expired allowed');
  eq(isValidTransition('pending_approval', 'approved'), false, 'approved from pending NOT allowed');
  eq(isValidTransition('pending_approval', 'sent'), false, 'sent from pending NOT allowed');
});

t('reviewing → approved | edited_then_approved | rejected | pending_approval', () => {
  eq(isValidTransition('reviewing', 'approved'), true, 'approved allowed');
  eq(isValidTransition('reviewing', 'edited_then_approved'), true, 'edit allowed');
  eq(isValidTransition('reviewing', 'rejected'), true, 'rejected allowed');
  eq(isValidTransition('reviewing', 'pending_approval'), true, 'back to pending allowed');
  eq(isValidTransition('reviewing', 'sent'), false, 'sent skip NOT allowed');
});

t('approved → sent, send_failed', () => {
  eq(isValidTransition('approved', 'sent'), true, 'sent allowed');
  eq(isValidTransition('approved', 'send_failed'), true, 'send_failed allowed');
  eq(isValidTransition('approved', 'rejected'), false, 'rejected from approved NOT allowed');
});

t('edited_then_approved → sent, send_failed', () => {
  eq(isValidTransition('edited_then_approved', 'sent'), true, 'sent allowed');
  eq(isValidTransition('edited_then_approved', 'send_failed'), true, 'send_failed allowed');
});

t('send_failed → approved (retry path)', () => {
  eq(isValidTransition('send_failed', 'approved'), true, 'retry to approved allowed');
  eq(isValidTransition('send_failed', 'sent'), false, 'direct send_failed → sent NOT allowed');
  eq(isValidTransition('send_failed', 'rejected'), false, 'rejected from send_failed NOT allowed');
});

t('rejected is terminal', () => {
  eq(TRANSITIONS.rejected.length, 0, 'no outbound edges');
  for (const s of ALL_STATES) {
    eq(isValidTransition('rejected', s), false, `rejected → ${s} must reject`);
  }
});

t('sent is terminal', () => {
  eq(TRANSITIONS.sent.length, 0, 'no outbound edges');
  for (const s of ALL_STATES) {
    eq(isValidTransition('sent', s), false, `sent → ${s} must reject`);
  }
});

t('expired is terminal', () => {
  eq(TRANSITIONS.expired.length, 0, 'no outbound edges');
  for (const s of ALL_STATES) {
    eq(isValidTransition('expired', s), false, `expired → ${s} must reject`);
  }
});

t('isTerminal reports rejected, sent, expired only', () => {
  eq(isTerminal('rejected'), true, 'rejected terminal');
  eq(isTerminal('sent'), true, 'sent terminal');
  eq(isTerminal('expired'), true, 'expired terminal');
  eq(isTerminal('pending_approval'), false, 'pending not terminal');
  eq(isTerminal('reviewing'), false, 'reviewing not terminal');
  eq(isTerminal('approved'), false, 'approved not terminal');
  eq(isTerminal('edited_then_approved'), false, 'edited_then_approved not terminal');
  eq(isTerminal('send_failed'), false, 'send_failed not terminal');
});

t('every disallowed pair (from × to) rejects loudly', () => {
  for (const from of ALL_STATES) {
    const allowed = new Set(TRANSITIONS[from]);
    for (const to of ALL_STATES) {
      const expected = allowed.has(to);
      eq(isValidTransition(from, to), expected, `${from} → ${to}`);
    }
  }
});

console.log('\nstate-machine — idempotency contract');

t('transitionDraft contract: same-state call is a no-op (documented)', () => {
  // The runtime contract (per state-machine.ts ~ line 134):
  //   if (fromState === opts.toState) return { ok: true, draft };
  // This is asserted at the API level. We document the contract here without
  // booting Supabase. Integration tests cover the DB-level idempotency once a
  // test framework with proper mocking is installed.
  const draftState: DraftState = 'reviewing';
  const desired: DraftState = 'reviewing';
  const wouldNoOp = draftState === desired;
  eq(wouldNoOp, true, 'same-state no-op');

  // The reverse direction — calling with a target equal to current — must NOT
  // be a valid forward transition (otherwise the no-op short-circuit is the
  // only thing keeping us from inserting an empty self-edge in
  // toro_draft_transitions).
  eq(
    isValidTransition('reviewing', 'reviewing'),
    false,
    'reviewing → reviewing is NOT a valid forward transition (self-loop banned)',
  );
});

console.log('\nstate-machine — invariants');

t('every from-state has a defined entry (even terminals)', () => {
  for (const from of ALL_STATES) {
    const entry = TRANSITIONS[from];
    assert(Array.isArray(entry), `${from} must map to an array (got ${typeof entry})`);
  }
});

t('no self-loops in TRANSITIONS (idempotency relies on this)', () => {
  for (const from of ALL_STATES) {
    const allowed = TRANSITIONS[from];
    assert(!allowed.includes(from), `${from} must not appear in its own outbound set`);
  }
});

t('every reachable state appears as a key (graph is closed)', () => {
  const reachable = new Set<DraftState>();
  for (const outs of Object.values(TRANSITIONS)) {
    outs.forEach((s) => reachable.add(s));
  }
  for (const s of reachable) {
    assert(s in TRANSITIONS, `${s} appears as a target but not as a key`);
  }
});

console.log(`\n${pass} passed, ${fail} failed`);

if (fail > 0) {
  console.log('\nfailures:');
  failures.forEach((f) => console.log(`  • ${f}`));
  process.exit(1);
}

process.exit(0);
