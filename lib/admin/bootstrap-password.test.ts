import { describe, expect, it } from 'vitest';
import { FOUNDER_ADMIN_EMAILS, isFounderAdminEmail } from '@/lib/admin/ensureAdmin';
import { BOOTSTRAP_MIN_PASSWORD, BOOTSTRAP_SECRET_ENV } from '@/lib/admin/bootstrap-password-types';

describe('founder admin allowlist', () => {
  it('locks to assembl@ and kate@ only', () => {
    expect([...FOUNDER_ADMIN_EMAILS]).toEqual(['assembl@assembl.co.nz', 'kate@assembl.co.nz']);
    expect(isFounderAdminEmail('assembl@assembl.co.nz')).toBe(true);
    expect(isFounderAdminEmail('Kate@assembl.co.nz')).toBe(true);
    expect(isFounderAdminEmail('other@assembl.co.nz')).toBe(false);
  });
});

describe('bootstrap password constants', () => {
  it('keeps the env name and min length stable', () => {
    expect(BOOTSTRAP_SECRET_ENV).toBe('OPERATOR_BOOTSTRAP_SECRET');
    expect(BOOTSTRAP_MIN_PASSWORD).toBeGreaterThanOrEqual(10);
  });
});
