/**
 * Generates public/agents-catalog.json from the canonical fleet registry
 * (lib/agents.ts) + kete catalog (lib/kete.ts).
 *
 * The "Pick your crew" picker reads this generated catalog rather than the
 * TypeScript source, so the picker and the live fleet never drift. Run:
 *
 *   pnpm tsx scripts/build-agents-catalog.ts
 *
 * Live agents get a chatHref into their existing kete chat (/c/<kete>?agent=…),
 * matching the live /c/[slug] convention. Draft agents are listed but have no
 * chat link until their prompts are written and reviewed.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AGENTS } from '../lib/agents';
import { KETES } from '../lib/kete';

type CatalogAgent = {
  slug: string;
  name: string;
  role: string;
  oneLiner: string;
  status: 'live' | 'draft';
  phase: string | null;
  chatHref: string | null;
};

type CatalogKete = {
  slug: string;
  name: string;
  industry: string;
  accent: string;
  type: 'industry' | 'whanau';
  status: string;
  agents: CatalogAgent[];
};

function build() {
  const ketes: CatalogKete[] = KETES.map((kete) => {
    const agents: CatalogAgent[] = AGENTS.filter((agent) => agent.kete === kete.slug)
      .map((agent) => {
        const status = agent.status ?? 'draft';
        return {
          slug: agent.slug,
          name: agent.name,
          role: agent.role,
          oneLiner: agent.oneLiner,
          status,
          phase: agent.phase ?? null,
          chatHref: status === 'live' ? `/c/${kete.slug}?agent=${agent.slug}` : null,
        };
      })
      // Stable order: live first, then by name.
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'live' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return {
      slug: kete.slug,
      name: kete.name,
      industry: kete.industry,
      accent: kete.accent,
      type: kete.type,
      status: kete.status,
      agents,
    };
  }).filter((kete) => kete.agents.length > 0);

  const totalAgents = ketes.reduce((sum, kete) => sum + kete.agents.length, 0);
  const liveAgents = ketes.reduce(
    (sum, kete) => sum + kete.agents.filter((agent) => agent.status === 'live').length,
    0,
  );

  const catalog = {
    generatedAt: new Date().toISOString(),
    source: 'lib/agents.ts',
    totalKete: ketes.length,
    totalAgents,
    liveAgents,
    ketes,
  };

  const outPath = join(process.cwd(), 'public', 'agents-catalog.json');
  writeFileSync(outPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  // eslint-disable-next-line no-console
  console.log(
    `Wrote ${outPath} — ${ketes.length} kete, ${totalAgents} agents (${liveAgents} live).`,
  );
}

build();
