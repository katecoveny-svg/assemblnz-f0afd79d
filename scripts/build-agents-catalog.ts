/**
 * Generates public/agents-catalog.json from the canonical V4 marketplace
 * registry (lib/marketplace/agents.ts + lib/marketplace/bundles.ts).
 *
 * The old generator read the pre-pivot kete registry (lib/agents.ts), so the
 * public file advertised 82 agents in 9 kete long after the V4 cull locked
 * the roster at 8 bundles + Visa. Nothing in-app consumes this file today,
 * but it is a public URL (and AI crawlers read it) — keep it truthful. Run:
 *
 *   pnpm tsx scripts/build-agents-catalog.ts
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MARKETPLACE_AGENTS } from '../lib/marketplace/agents';
import { orderedBundles } from '../lib/marketplace/bundles';

type CatalogAgent = {
  slug: string;
  name: string;
  oneLiner: string;
  status: 'live' | 'coming_soon';
  chatHref: string | null;
};

type CatalogBundle = {
  slug: string;
  name: string;
  category: string;
  subtitle: string;
  standalone: boolean;
  agents: CatalogAgent[];
};

function build() {
  const bundles: CatalogBundle[] = orderedBundles().map((bundle) => {
    const agents: CatalogAgent[] = MARKETPLACE_AGENTS.filter((a) => a.bundle === bundle.slug)
      .map((a) => ({
        slug: a.slug,
        name: a.name,
        oneLiner: a.description,
        status: a.status,
        chatHref: a.status === 'live' ? `/agents/${a.slug}` : null,
      }))
      // Stable order: live first, then by name.
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'live' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return {
      slug: bundle.slug,
      name: bundle.name,
      category: bundle.category,
      subtitle: bundle.subtitle,
      standalone: Boolean(bundle.standalone),
      agents,
    };
  });

  // Agents outside any bundle (start-here concierge etc.) still belong in the
  // public catalog — group them under a pseudo-collection at the end.
  const bundled = new Set(bundles.flatMap((b) => b.agents.map((a) => a.slug)));
  const unbundled: CatalogAgent[] = MARKETPLACE_AGENTS.filter((a) => !bundled.has(a.slug))
    .map((a) => ({
      slug: a.slug,
      name: a.name,
      oneLiner: a.description,
      status: a.status,
      chatHref: a.status === 'live' ? `/agents/${a.slug}` : null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (unbundled.length > 0) {
    bundles.push({
      slug: 'marketplace',
      name: 'Marketplace',
      category: 'general',
      subtitle: 'Agents available individually, outside the collections.',
      standalone: false,
      agents: unbundled,
    });
  }

  const totalAgents = bundles.reduce((sum, b) => sum + b.agents.length, 0);
  const liveAgents = bundles.reduce(
    (sum, b) => sum + b.agents.filter((a) => a.status === 'live').length,
    0,
  );

  const catalog = {
    generatedAt: new Date().toISOString(),
    source: 'lib/marketplace/agents.ts',
    totalBundles: bundles.length,
    totalAgents,
    liveAgents,
    bundles,
  };

  const outPath = join(process.cwd(), 'public', 'agents-catalog.json');
  writeFileSync(outPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  // eslint-disable-next-line no-console
  console.log(
    `Wrote ${outPath} — ${bundles.length} collections, ${totalAgents} agents (${liveAgents} live).`,
  );
}

build();
