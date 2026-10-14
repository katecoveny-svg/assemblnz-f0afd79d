import 'server-only';
import { collectFamilyMail } from '../services/family-server';

/** Existing integration dependency is retained for the future reviewed pilot.
 * No env flag or caller boolean can activate ingestion before isolation is proven.
 * Do not register this with routes, cron, model tools or the action executor. */
export async function collectSchoolPilotMail(
  _owner: string, _senders: string[], _days: 7 | 14 | 30,
  _reader: typeof collectFamilyMail = collectFamilyMail,
): Promise<never> {
  throw new Error('School pilot closed: verify DO Gmail scopes, specific processing consent and isolated persistence before ingestion.');
}
