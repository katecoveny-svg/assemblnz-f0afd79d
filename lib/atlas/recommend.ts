/**
 * Atlas recommendation engine — semantic-ish search over the agent shelf.
 *
 * v0.1 is a keyword + category scorer (no embeddings yet): it tokenises the
 * user's description of their week and scores every public agent by how well
 * its name, te reo label, blurb, "what it does", NZ knowledge and category
 * match. pgvector embeddings are a documented follow-up; this gets the small
 * 24-agent shelf to a reasonable first pick offline, with no model call, so
 * `/atlas` is useful even when no API key is configured.
 *
 * Isomorphic — safe to import on the server (the chat tool) and the client
 * (the offline fallback in AtlasExperience). It never touches a system prompt.
 */
import {
  PUBLIC_MARKETPLACE_AGENTS,
  priceLabel,
  type MarketplaceCategory,
  type PublicMarketplaceAgent,
  type TileTone,
} from '@/lib/marketplace/agents';

/** Agents Atlas never recommends as a "fit" — it is the coach, not a pick. */
const EXCLUDE = new Set(['atlas', 'pilot']);

/** Cheap English stopwords so "what do I do with the invoices" scores on "invoices". */
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'for', 'with', 'at', 'by',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'is', 'are', 'am', 'be', 'do', 'does',
  'did', 'have', 'has', 'had', 'get', 'got', 'this', 'that', 'these', 'those', 'so', 'too',
  'lot', 'lots', 'really', 'just', 'about', 'what', 'which', 'when', 'where', 'how', 'who',
  'work', 'day', 'days', 'week', 'time', 'thing', 'things', 'stuff', 'need', 'want', 'help',
]);

/** Light synonym map so everyday words reach the shelf's vocabulary. */
const SYNONYMS: Record<string, string[]> = {
  receipt: ['invoice', 'expense', 'gst'],
  receipts: ['invoice', 'expense', 'gst'],
  expenses: ['invoice', 'expense', 'travel', 'mileage'],
  accounts: ['invoice', 'reconcile', 'gst', 'tax'],
  bookkeeping: ['invoice', 'reconcile', 'gst', 'tax'],
  email: ['inbox', 'triage'],
  emails: ['inbox', 'triage'],
  meeting: ['hui', 'minutes', 'notes'],
  meetings: ['hui', 'minutes', 'notes'],
  notes: ['hui', 'minutes', 'transcript'],
  staff: ['roster', 'shift', 'leave'],
  shifts: ['roster', 'shift', 'leave'],
  rostering: ['roster', 'shift', 'availability'],
  kids: ['school', 'tamariki', 'panui', 'notice'],
  children: ['school', 'tamariki', 'panui', 'notice'],
  tamariki: ['school', 'panui', 'notice'],
  school: ['panui', 'notice', 'newsletter'],
  power: ['electricity', 'bill', 'plan'],
  electricity: ['power', 'bill', 'plan'],
  groceries: ['fridge', 'shopping', 'meals'],
  shopping: ['fridge', 'list', 'meals'],
  dinner: ['fridge', 'meals'],
  boat: ['marine', 'tide', 'maritime', 'swell'],
  fishing: ['catch', 'fish', 'marine'],
  fish: ['catch', 'marine'],
  patient: ['clinical', 'care', 'scribe'],
  patients: ['clinical', 'care', 'scribe'],
  clinic: ['clinical', 'care', 'scribe'],
  phone: ['voice', 'calls', 'reception'],
  calls: ['voice', 'reception'],
  import: ['customs', 'freight', 'tariff'],
  importing: ['customs', 'freight', 'tariff'],
  elderly: ['care', 'captain', 'check-in'],
  parents: ['care', 'captain', 'whanau'],
  compliance: ['compliance', 'certs', 'renewals', 'safety'],
  safety: ['compliance', 'health', 'worksafe'],
  social: ['social', 'posts', 'captions'],
  marketing: ['creative', 'auaha', 'copy', 'social'],
  content: ['creative', 'auaha', 'copy'],
  sales: ['crm', 'pipeline', 'leads', 'roster'],
};

export type AgentMatch = {
  slug: string;
  name: string;
  teReo: string;
  description: string;
  category: MarketplaceCategory;
  price: string;
  /** canon avatar key (components/marketplace/AgentIcon). */
  icon: string;
  /** avatar tile tone, so the rail can draw the icon legibly. */
  tile: TileTone;
  /** 0–1 normalised confidence for ordering and display. */
  score: number;
  /** the query tokens that drove the match (for an honest "why"). */
  matched: string[];
};

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9āēīōū\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/** The searchable haystack for one agent, weighted by field importance. */
function haystack(agent: PublicMarketplaceAgent): string {
  return [
    agent.name,
    agent.name, // name weighted twice
    agent.teReo,
    agent.description,
    agent.whatItDoes.join(' '),
    agent.whatYouGet.join(' '),
    agent.nzKnowledge.join(' '),
    agent.category,
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * Rank the shelf against a free-text description of someone's week.
 * Returns up to `limit` matches with a non-zero score, best first.
 */
export function recommendAgents(query: string, limit = 3): AgentMatch[] {
  const tokens = tokenise(query);
  if (tokens.length === 0) return [];

  // Expand each token with its synonyms (kept distinct for the "why").
  const expanded = new Map<string, string[]>();
  for (const t of tokens) {
    expanded.set(t, [t, ...(SYNONYMS[t] ?? [])]);
  }

  const scored = PUBLIC_MARKETPLACE_AGENTS.filter((a) => !EXCLUDE.has(a.slug)).map((agent) => {
    const hay = haystack(agent);
    let raw = 0;
    const matched: string[] = [];
    for (const [original, variants] of expanded) {
      const hit = variants.some((v) => hay.includes(v));
      if (hit) {
        raw += 1;
        matched.push(original);
      }
    }
    return { agent, raw, matched };
  });

  const max = Math.max(1, ...scored.map((s) => s.raw));

  return scored
    .filter((s) => s.raw > 0)
    .sort((a, b) => b.raw - a.raw)
    .slice(0, limit)
    .map(({ agent, raw, matched }) => ({
      slug: agent.slug,
      name: agent.name,
      teReo: agent.teReo,
      description: agent.description,
      category: agent.category,
      price: priceLabel(agent),
      icon: agent.icon,
      tile: agent.tile,
      score: Number((raw / max).toFixed(2)),
      matched,
    }));
}
