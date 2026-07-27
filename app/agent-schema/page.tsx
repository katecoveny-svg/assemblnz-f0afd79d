import type { Metadata } from 'next';
import { AGENT_SCHEMA, AUTHORITY_LADDER, SCHEMA_INVARIANTS } from '@/lib/agent-schema';

export const metadata: Metadata = {
  title: 'The assembl agent schema — six parts of an agentic customer journey',
  description:
    'The canonical structure of an assembl agent: knowledge, signals, ability, boundary, approval and flight log, with a written authority level. The schema behind agentic customer journeys for New Zealand businesses.',
  alternates: { canonical: '/agent-schema' },
};

/**
 * /agent-schema — the six parts, for people and for engines. The JSON twin
 * lives at /agent.schema.json; both render from lib/agent-schema.ts so they
 * cannot drift. Server-rendered, zero client JS: this page exists to be read.
 */
export default function AgentSchemaPage() {
  const parts = AGENT_SCHEMA.properties;
  const partKeys = ['knowledge', 'signals', 'ability', 'boundary', 'approval', 'flightLog'] as const;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: 'assembl agent schema',
    description: AGENT_SCHEMA.description,
    url: 'https://www.assembl.co.nz/agent-schema',
    hasDefinedTerm: partKeys.map((k) => ({
      '@type': 'DefinedTerm',
      name: k,
      description: (parts[k] as { description: string }).description,
    })),
  };
  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '120px 24px 90px', fontFamily: "'Lato', sans-serif", lineHeight: 1.7 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#B8964F' }}>
        assembl · intuitive agentic customer journeys
      </p>
      <h1 style={{ fontWeight: 700, fontSize: 'clamp(1.8rem,4vw,2.8rem)', lineHeight: 1.15 }}>
        The agent schema
      </h1>
      <p>{AGENT_SCHEMA.description}</p>
      <p>
        Machine-readable version: <a href="/agent.schema.json">/agent.schema.json</a>. Walk it in 3D on the{' '}
        <a href="/#showroom">homepage gallery</a>, or <a href="/build-an-agent">assemble one from your own website</a>.
      </p>

      <h2 style={{ fontWeight: 700, marginTop: 44 }}>The six parts</h2>
      <dl>
        {partKeys.map((k) => (
          <div key={k} style={{ margin: '18px 0' }}>
            <dt style={{ fontWeight: 700 }}>{k}</dt>
            <dd style={{ margin: 0 }}>{(parts[k] as { description: string }).description}</dd>
          </div>
        ))}
      </dl>

      <h2 style={{ fontWeight: 700, marginTop: 44 }}>The authority ladder</h2>
      <ul>
        {AUTHORITY_LADDER.map((a) => (
          <li key={a.level}><b>{a.level}</b> — {a.means}</li>
        ))}
      </ul>

      <h2 style={{ fontWeight: 700, marginTop: 44 }}>Invariants</h2>
      <ul>
        {SCHEMA_INVARIANTS.map((s) => <li key={s}>{s}</li>)}
      </ul>
    </main>
  );
}
