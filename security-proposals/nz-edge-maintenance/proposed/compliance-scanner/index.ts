// UNAPPLIED maintenance replacement. No imports, env reads, parsing, provider calls or writes.
// Explicit deployment approval is required. Preserve verify_jwt=false for this response only.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
};
Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  return new Response(JSON.stringify({ error: 'temporarily_unavailable', source: 'compliance-scanner' }), {
    status: 503, headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
