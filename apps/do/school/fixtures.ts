import type { SchoolSource, SchoolChild } from './briefing';
// Entirely fictional. Do not replace these with pilot emails or household data.
export const SCHOOL_DEMO_NOW = '2026-10-13T01:00:00.000Z';
export const SCHOOL_DEMO_OWNER = 'fictional-adult-session';
export const schoolDemoChildren: SchoolChild[] = [
  { id: 'child-a', displayName: 'Alex (fictional)', role: 'child', schoolId: 'harbour', confirmedAudiences: [] },
  { id: 'child-b', displayName: 'Robin (fictional)', role: 'child', schoolId: 'hill', confirmedAudiences: [] },
];
function source(id: string, schoolId: string, text: string, previous = false, kind: SchoolSource['kind'] = 'email'): SchoolSource {
  return { id, ownerId: SCHOOL_DEMO_OWNER, schoolId, sender: `office@${schoolId}.example`, title: `Fictional ${schoolId} ${previous ? 'original' : 'revised'} notice`,
    receivedAt: previous ? '2026-10-01T01:00:00.000Z' : '2026-10-12T01:00:00.000Z', checkedAt: SCHOOL_DEMO_NOW, state: 'available', kind,
    url: `/do/school-fixtures/${id}.pdf`, pages: [{ number: 1, text }] };
}
export const schoolDemoPrevious = [
  source('harbour-original', 'harbour', 'Mathematics exam | Year 9 | 20/10/2026 | 09:00 | Hall A | scheduled', true, 'pdf'),
  source('hill-original', 'hill', 'Science visit | Year 7 | 21/10/2026 | 10:00 | Science centre | scheduled', true),
];
export const schoolDemoCurrent = [
  source('harbour-revised', 'harbour', 'Mathematics exam | Year 9 | 22/10/2026 | 13:00 | Hall B | scheduled', false, 'pdf'),
  source('hill-revised', 'hill', 'Science visit | Year 7 | 21/10/2026 | 10:00 | Science centre | cancelled'),
];
export function schoolDemoSources(scenario: string): SchoolSource[] {
  const sources = structuredClone(schoolDemoCurrent);
  if (scenario === 'conflict') sources.push({ ...sources[0], id: 'harbour-conflict', url: '/do/school-fixtures/harbour-conflict.pdf', pages: [{ number: 1, text: sources[0].pages[0].text.replace('22/10/2026', '23/10/2026') }] });
  if (scenario === 'stale') sources[0].checkedAt = '2026-10-10T01:00:00.000Z';
  if (scenario === 'unavailable') { sources[0].state = 'unavailable'; sources[0].pages = []; }
  if (scenario === 'missing') { sources[0].id = 'harbour-missing'; sources[0].url = '/do/school-fixtures/harbour-missing.pdf'; sources[0].pages[0].text = sources[0].pages[0].text.replace('22/10/2026', '?'); }
  if (scenario === 'duplicate') sources.push({ ...structuredClone(sources[0]), id: 'forwarded-copy', title: 'Fictional forwarded duplicate' });
  return sources;
}
