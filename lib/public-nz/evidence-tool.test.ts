import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('./server', () => ({ retrieveVerifiedPublicNzKnowledge: vi.fn() }));
import { retrieveVerifiedPublicNzKnowledge as retrieve } from './server';
import { readPublicNzEvidence, relevantPublicNzTopic } from './evidence-tool';
beforeEach(() => vi.resetAllMocks());
it('selects relevant public scope without treating household bills as Parliament', () => {
  expect(relevantPublicNzTopic('Explain the Parliament bill')).toBe(true);
  expect(relevantPublicNzTopic('Reduce my electricity bill')).toBe(false);
  expect(relevantPublicNzTopic('Weather in Auckland')).toBe(false);
});
it('does not retrieve irrelevant context', async () => {
  expect((await readPublicNzEvidence('parliament', false)).status).toBe('not_relevant');
  expect(retrieve).not.toHaveBeenCalled();
});
it('returns explicit failure without raw errors', async () => {
  vi.mocked(retrieve).mockRejectedValue(new Error('private debug details'));
  const result = await readPublicNzEvidence('parliament');
  expect(result.status).toBe('unavailable'); expect(result.sources).toEqual([]);
  expect(JSON.stringify(result)).not.toContain('private debug');
  expect(retrieve).toHaveBeenCalledWith({query:'parliament',limit:4});
});
it('does not promote discovery links or expired records to fresh evidence', async () => {
  vi.mocked(retrieve).mockResolvedValue({ discovery:{records:[]} , verification:{records:[{state:'verified',verifiedAt:'2020-01-01T00:00:00Z',expiresAt:'2020-01-01T00:05:00Z'}]} } as never);
  const result = await readPublicNzEvidence('parliament');
  expect(result.status).toBe('unavailable');expect(result.sources).toEqual([]);
});
