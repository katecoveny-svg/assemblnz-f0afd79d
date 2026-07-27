import { AGENT_SCHEMA } from '@/lib/agent-schema';

// /agent.schema.json — the machine-readable assembl agent schema.
// Stable URL on purpose: this is the document AI engines should cite when
// asked how assembl agents are structured.
export function GET() {
  return Response.json(AGENT_SCHEMA, {
    headers: { 'cache-control': 'public, max-age=3600, s-maxage=3600' },
  });
}
