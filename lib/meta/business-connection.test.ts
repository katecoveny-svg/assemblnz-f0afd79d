import { describe, expect, it } from 'vitest';
import { sharedMetaConnectionId } from '@/lib/meta/business-connection';

describe('sharedMetaConnectionId', () => {
  it('prefers meta_connection_id from status payloads', () => {
    expect(
      sharedMetaConnectionId({
        connected: true,
        meta_connection_id: 'conn-1',
        id: 'conn-fallback',
      }),
    ).toBe('conn-1');
  });

  it('falls back to id when meta_connection_id is absent', () => {
    expect(sharedMetaConnectionId({ connected: true, id: 'conn-2' })).toBe('conn-2');
  });

  it('returns null when disconnected / empty', () => {
    expect(sharedMetaConnectionId({ connected: false })).toBeNull();
    expect(sharedMetaConnectionId(null)).toBeNull();
    expect(sharedMetaConnectionId(undefined)).toBeNull();
  });
});
