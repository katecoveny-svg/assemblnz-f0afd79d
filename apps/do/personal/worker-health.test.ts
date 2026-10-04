import { expect, it } from 'vitest';
import { personalWorkerHealth } from './worker-health';
const now = Date.parse('2026-09-30T12:00:00Z');
it('never equates configuration with a verified recent heartbeat', () => {
  for (const lastSeenAt of [null, 'invalid', '2026-09-30T08:00:00Z', '2026-10-01T00:00:00Z']) expect(personalWorkerHealth({ configured: true, lastSeenAt }, now).ready).toBe(false);
  expect(personalWorkerHealth({ configured: false, lastSeenAt: '2026-09-30T11:30:00Z' }, now).ready).toBe(false);
  expect(personalWorkerHealth({ configured: true, lastSeenAt: '2026-09-30T11:30:00Z' }, now).ready).toBe(true);
});
