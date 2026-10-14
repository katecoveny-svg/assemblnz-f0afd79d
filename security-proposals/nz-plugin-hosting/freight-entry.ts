import { pluginAliasGate } from './policy';
/** Candidate entry for a separate freight-only project. No app imports, env, database,
 * source transport or live tool wiring. Both release and backend gates are OFF.
 */
export const freightProjectProposal = Object.freeze({
  project: 'assembl-nz-freight', hostname: 'nz-freight.assembl.co.nz', region: 'iad1',
  runtime: 'nodejs24', releaseEnabled: false, backendEnabled: false,
});
export async function closedFreightEntry(request: Request): Promise<Response> {
  const gate = pluginAliasGate(request);
  const headers = { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };
  if (new URL(request.url).hostname !== freightProjectProposal.hostname || gate.state === 'ordinary_host') return new Response(null, { status: 404, headers });
  if (gate.state === 'denied') return new Response(null, { status: gate.status, headers });
  return new Response(null, { status: 503, headers });
}
