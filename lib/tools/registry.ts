/**
 * Agent-facing registry of assembl paid tools.
 * Skills-style index: one job, when to use, endpoint, sandbox key behaviour.
 */

export type ToolRegistryEntry = {
  slug: string;
  oneJob: string;
  useWhen: string;
  endpoint: string;
  docs: string;
  skillDoc: string;
  sandboxPrefix: 'test_';
  status: 'live' | 'sandbox_first';
  /** Honest note about live adapters */
  liveNote: string;
};

export const AGENT_PAID_TOOLS: ToolRegistryEntry[] = [
  {
    slug: 'nz-who-runs-it',
    oneJob:
      'Resolve who publicly runs a New Zealand company from a name or NZBN.',
    useWhen:
      'Before outreach or light diligence when you need legal name, NZBN, and published directors from public registers.',
    endpoint: 'POST /api/tools/nz-who-runs-it',
    docs: '/tools/nz-who-runs-it',
    skillDoc: 'docs/tools/nz-who-runs-it.skill.md',
    sandboxPrefix: 'test_',
    status: 'live',
    liveNote:
      'Live requires NZBN_API_KEY. Optional COMPANIES_OFFICE_API_KEY for director enrichment. test_ keys never hit live registers.',
  },
  {
    slug: 'nz-trade-finder',
    oneJob:
      'Find owner-led New Zealand businesses in a city for a given trade, with register-only contact hints.',
    useWhen:
      'You need a shortlist of local owner-operated trades (e.g. Wellington plumbers) for outreach — not a generic web scrape.',
    endpoint: 'POST /api/tools/nz-trade-finder',
    docs: '/tools/nz-trade-finder',
    skillDoc: 'docs/tools/nz-trade-finder.skill.md',
    sandboxPrefix: 'test_',
    status: 'sandbox_first',
    liveNote:
      'Sandbox fixtures work now. Live NZBN / Companies Office city+trade search is stubbed — returns 503 until wired. No email scrape.',
  },
  {
    slug: 'meeting-enhance',
    oneJob:
      'Turn a meeting transcript into Granola-class structured notes: decisions, actions, follow-ups.',
    useWhen:
      'You have a transcript (or pasted notes) and need structured actions/decisions for review — complements Meeting DO, does not send anything.',
    endpoint: 'POST /api/tools/meeting-enhance',
    docs: '/tools/meeting-enhance',
    skillDoc: 'docs/tools/meeting-enhance.skill.md',
    sandboxPrefix: 'test_',
    status: 'sandbox_first',
    liveNote:
      'Sandbox returns deterministic structured notes. Live can call DO meeting-notes preparation when a model ladder is configured; otherwise 503 with an honest fix.',
  },
  {
    slug: 'nz-compliance-ping',
    oneJob:
      'Ping public NZ register compliance signals for a company or NZBN (status, entity type, GST/register hints).',
    useWhen:
      'You need a fast public-register health check before treating an NZ entity as active — not legal advice or AML.',
    endpoint: 'POST /api/tools/nz-compliance-ping',
    docs: '/tools/nz-compliance-ping',
    skillDoc: 'docs/tools/nz-compliance-ping.skill.md',
    sandboxPrefix: 'test_',
    status: 'sandbox_first',
    liveNote:
      'Sandbox fixtures work now. Live reuses NZBN entity status when NZBN_API_KEY is set; otherwise 503. Not a substitute for professional compliance advice.',
  },
];

export function getToolRegistryEntry(slug: string): ToolRegistryEntry | undefined {
  return AGENT_PAID_TOOLS.find((t) => t.slug === slug);
}
