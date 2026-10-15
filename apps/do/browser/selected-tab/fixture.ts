import type { Adapter, Binding } from './reader';
export type FixtureFacts = { title: string; itemCount: number };
/** Controlled data port only. No DOM, network, cookie or credential API. */
export function fixtureAdapter(read: (binding: Binding, signal: AbortSignal) => Promise<unknown>): Adapter<FixtureFacts> {
  return {
    id: 'controlled-fixture.v1',
    supports: url => url.origin === 'http://127.0.0.1:4198' && url.pathname === '/selected-tab-fixture.html',
    read,
    decode(raw) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid fixture');
      const value = raw as Record<string, unknown>;
      if (Object.keys(value).sort().join(',') !== 'completeness,itemCount,title' ||
          typeof value.title !== 'string' || value.title.length > 160 ||
          !Number.isSafeInteger(value.itemCount) || (value.itemCount as number) < 0 || (value.itemCount as number) > 100 ||
          !['complete', 'partial'].includes(value.completeness as string)) throw new Error('Invalid fixture');
      return { data: { title: value.title, itemCount: value.itemCount as number }, completeness: value.completeness as 'complete' | 'partial' };
    },
  };
}
