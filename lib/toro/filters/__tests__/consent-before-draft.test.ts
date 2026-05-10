import { describe, it, expect, vi, beforeEach } from 'vitest';
import { consentBeforeDraft } from '../consent-before-draft';
import { makeCtx } from './test-helpers';
import type { ConsentGrant } from '../types';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

const ACTIVE_GRANT = (entityType: string, skill: string): ConsentGrant => ({
  entity_type: entityType,
  entity_id: 'entity-1',
  skill_slug: skill,
  granted_at: '2026-05-01T00:00:00Z',
  revoked_at: null,
  expires_at: null,
});

describe('consent_before_draft', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes when ctx.consentGrants covers every required entity_type', async () => {
    const ctx = makeCtx({
      skillSlug: 'household-coordination',
      consentGrants: [
        ACTIVE_GRANT('child_profile', 'household-coordination'),
        ACTIVE_GRANT('calendar', 'household-coordination'),
      ],
    });
    const r = await consentBeforeDraft.run(ctx);
    expect(r.pass).toBe(true);
    expect(r.receiptAddition).toMatchObject({
      consent_before: { status: 'all_granted' },
    });
  });

  it('fails fast on the first missing entity_type with a parseable reason', async () => {
    const ctx = makeCtx({
      skillSlug: 'household-coordination',
      consentGrants: [ACTIVE_GRANT('child_profile', 'household-coordination')],
    });
    const r = await consentBeforeDraft.run(ctx);
    expect(r.pass).toBe(false);
    expect(r.reason).toBe('consent_missing: calendar');
  });

  it('treats revoked grants as missing', async () => {
    const revoked: ConsentGrant = {
      ...ACTIVE_GRANT('child_profile', 'household-coordination'),
      revoked_at: '2026-05-10T00:00:00Z',
    };
    const ctx = makeCtx({
      skillSlug: 'household-coordination',
      consentGrants: [revoked, ACTIVE_GRANT('calendar', 'household-coordination')],
    });
    const r = await consentBeforeDraft.run(ctx);
    expect(r.pass).toBe(false);
    expect(r.reason).toBe('consent_missing: child_profile');
  });

  it('treats expired grants as missing', async () => {
    const expired: ConsentGrant = {
      ...ACTIVE_GRANT('calendar', 'household-coordination'),
      expires_at: '2020-01-01T00:00:00Z',
    };
    const ctx = makeCtx({
      skillSlug: 'household-coordination',
      consentGrants: [
        ACTIVE_GRANT('child_profile', 'household-coordination'),
        expired,
      ],
    });
    const r = await consentBeforeDraft.run(ctx);
    expect(r.pass).toBe(false);
    expect(r.reason).toBe('consent_missing: calendar');
  });

  it('falls back to the Supabase query when ctx.consentGrants is empty', async () => {
    const queryResult = {
      data: [
        ACTIVE_GRANT('child_profile', 'household-coordination'),
        ACTIVE_GRANT('calendar', 'household-coordination'),
      ],
      error: null,
    };
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockResolvedValue(queryResult),
    };
    const supabase = { from: vi.fn().mockReturnValue(builder) };
    const { createClient } = await import('@/lib/supabase/server');
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(supabase);

    const ctx = makeCtx({ skillSlug: 'household-coordination', consentGrants: [] });
    const r = await consentBeforeDraft.run(ctx);
    expect(r.pass).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('toro_consent_grants');
    expect(builder.eq).toHaveBeenCalledWith('skill_slug', 'household-coordination');
  });
});
