import { describe, it, expect, vi } from 'vitest';
import {
  TORO_DEFAULT_PIPELINE,
  runPipeline,
  collectReceiptAdditions,
} from '../registry';
import type { Filter } from '../types';
import { makeCtx } from './test-helpers';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('runPipeline', () => {
  it('runs filters in declaration order, passing modifiedBody forward', async () => {
    const calls: string[] = [];
    const filters: Filter[] = [
      {
        name: 'a',
        phase: 'before_draft',
        run: async (ctx) => {
          calls.push(`a:${ctx.incomingMessage}`);
          return { pass: true, modifiedBody: 'after-a' };
        },
      },
      {
        name: 'b',
        phase: 'before_draft',
        run: async (ctx) => {
          calls.push(`b:${ctx.incomingMessage}`);
          return { pass: true, modifiedBody: 'after-b' };
        },
      },
    ];
    const result = await runPipeline(filters, 'before_draft', makeCtx({ incomingMessage: 'in' }));
    expect(result.pass).toBe(true);
    expect(calls).toEqual(['a:in', 'b:after-a']);
    expect(result.ctx.incomingMessage).toBe('after-b');
  });

  it('skips filters whose phase does not match', async () => {
    const seen: string[] = [];
    const filters: Filter[] = [
      {
        name: 'before',
        phase: 'before_draft',
        run: async () => {
          seen.push('before');
          return { pass: true };
        },
      },
      {
        name: 'after',
        phase: 'after_draft',
        run: async () => {
          seen.push('after');
          return { pass: true };
        },
      },
    ];
    await runPipeline(filters, 'after_draft', makeCtx());
    expect(seen).toEqual(['after']);
  });

  it('returns immediately when a filter returns pass=false', async () => {
    const seen: string[] = [];
    const filters: Filter[] = [
      {
        name: 'a',
        phase: 'before_draft',
        run: async () => {
          seen.push('a');
          return { pass: true };
        },
      },
      {
        name: 'b',
        phase: 'before_draft',
        run: async () => {
          seen.push('b');
          return { pass: false, reason: 'nope' };
        },
      },
      {
        name: 'c',
        phase: 'before_draft',
        run: async () => {
          seen.push('c');
          return { pass: true };
        },
      },
    ];
    const result = await runPipeline(filters, 'before_draft', makeCtx());
    expect(result.pass).toBe(false);
    expect(seen).toEqual(['a', 'b']);
    expect(result.results.at(-1)?.result.reason).toBe('nope');
  });

  it('routes modifiedBody to draftBody for after_draft / before_send phases', async () => {
    const filters: Filter[] = [
      {
        name: 'mut',
        phase: 'after_draft',
        run: async () => ({ pass: true, modifiedBody: 'redacted' }),
      },
    ];
    const ctx = makeCtx({ draftBody: 'original' });
    const result = await runPipeline(filters, 'after_draft', ctx);
    expect(result.ctx.draftBody).toBe('redacted');
    expect(result.ctx.incomingMessage).toBe(ctx.incomingMessage);
  });
});

describe('TORO_DEFAULT_PIPELINE', () => {
  it('contains exactly the six default Phase-1 filters in spec order', () => {
    expect(TORO_DEFAULT_PIPELINE.map((f) => f.name)).toEqual([
      'tikanga_before_draft',
      'privacy_before_draft',
      'consent_before_draft',
      'age_gate_after_draft',
      'tikanga_after_draft',
      'audit_before_send',
    ]);
  });

  it('groups filters into the three canonical phases', () => {
    const phases = new Set(TORO_DEFAULT_PIPELINE.map((f) => f.phase));
    expect(phases).toEqual(new Set(['before_draft', 'after_draft', 'before_send']));
  });
});

describe('collectReceiptAdditions', () => {
  it('merges every receiptAddition into a single object', () => {
    const merged = collectReceiptAdditions([
      { filter: 'a', result: { pass: true, receiptAddition: { tikanga_before: 'passed' } } },
      { filter: 'b', result: { pass: true, receiptAddition: { privacy_before: 'no_redactions' } } },
      { filter: 'c', result: { pass: true } },
    ]);
    expect(merged).toEqual({
      tikanga_before: 'passed',
      privacy_before: 'no_redactions',
    });
  });
});
