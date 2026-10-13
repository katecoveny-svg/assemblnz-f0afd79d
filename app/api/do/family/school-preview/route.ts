import { chatClientIp } from '@/lib/agents/chat-rate-limit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { prepareSchoolBriefing, schoolSelection, type SchoolSource } from '@/apps/do/school/briefing';
import { SCHOOL_DEMO_NOW, SCHOOL_DEMO_OWNER, schoolDemoChildren, schoolDemoPrevious, schoolDemoSources } from '@/apps/do/school/fixtures';
import { extractSchoolPdf } from '@/apps/do/school/pdf';
import { privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { admitDoRequest, readDoJson } from '@/apps/do/shared/http';
export const runtime = 'nodejs';
const requestSchema = schoolSelection.extend({
  senders: z.array(z.enum(['office@harbour.example', 'office@hill.example'])).min(1).max(2),
  confirmed: z.boolean(),
  scenario: z.enum(['revised', 'duplicate', 'conflict', 'missing', 'stale', 'unavailable']),
}).strict();
/** Public synthetic-only recipe. Never accepts private text, files, owner IDs or URLs.
 * No connection lookup, OAuth, model, persistence, calendar or notification call. */
export async function POST(req: Request) {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: privateDoHeaders });
  if (!sameDoOrigin(req)) return json({ message: 'Open the DO preview to compare.' }, 403);
  if (!admitDoRequest(chatClientIp(req.headers))) return json({ message: 'Please wait a minute before comparing again.' }, 429);
  const parsed = requestSchema.safeParse(await readDoJson(req).catch(() => null));
  if (!parsed.success) return json({ message: 'Choose fictional senders and a bounded sample window.' }, 400);
  const { senders, days, scenario, confirmed } = parsed.data;
  async function readFixture(source: SchoolSource): Promise<SchoolSource> {
    if (source.state === 'unavailable') return source;
    // Paths originate only from shipped fixtures, never from the request.
    const filename = path.basename(source.url);
    const extracted = await extractSchoolPdf(new Uint8Array(await readFile(path.join(process.cwd(), 'public/do/school-fixtures', filename))));
    return { ...source, pages: extracted.pages, state: extracted.needsManualReview ? 'partial' : source.state };
  }
  try {
    const previous = await Promise.all(schoolDemoPrevious.map(readFixture));
    const current = await Promise.all(schoolDemoSources(scenario).map(readFixture));
    const brief = prepareSchoolBriefing({ ownerId: SCHOOL_DEMO_OWNER, revision: crypto.randomUUID(), now: SCHOOL_DEMO_NOW,
      selection: { senders, days }, children: schoolDemoChildren.map((c, i) => ({ ...c, confirmedAudiences: confirmed ? [i ? 'Year 7' : 'Year 9'] : [] })), previous, current });
    return json({ brief, synthetic: true, stored: false, externalActions: false });
  } catch { return json({ message: 'The sample PDF could not be read. No complete briefing is available; try again.' }, 503); }
}
