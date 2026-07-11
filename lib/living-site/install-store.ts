/**
 * Installer → real genome.
 *
 * When a visitor answers the ten install questions, this store writes an
 * actual Business Genome — real rows in `living_site_genome` under a
 * `install-<industry>-<token>` tenant — and /living-site/install/[id]
 * renders a living site straight from those rows. The generation the
 * installer shows is not simulated: edit a row and the page follows.
 *
 * Abuse posture: unlisted, noindexed, answer lengths capped, a hard cap on
 * install rows written per 24h, and tenants are only mintable in the
 * `install-<known industry>-<8 char token>` shape. Installs are demo data
 * and may be cleared at any time.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { getGenomeFactsFor } from '@/lib/customers/auckland-dog-trainer/genome-store';
import type { GenomeFact, GenomeSection } from '@/lib/customers/auckland-dog-trainer/genome';
import { verticalBySlug, type SampleVertical } from '@/lib/living-site/verticals';

/** `<industry>-<token>` — industry greedy, token exactly 8 [a-z0-9]. */
const INSTALL_ID_RE = /^([a-z][a-z-]{0,40})-([a-z0-9]{8})$/;

export const INSTALL_TENANT_RE = /^install-[a-z][a-z-]{0,40}-[a-z0-9]{8}$/;

const ANSWER_IDS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'] as const;
type AnswerId = (typeof ANSWER_IDS)[number];

/** Hard ceiling on install genome rows written in any rolling 24h window. */
const DAILY_ROW_CAP = 600;

const READ_BY: Record<GenomeSection, string[]> = {
  identity: ['website', 'email', 'voice', 'social'],
  services: ['website', 'booking', 'proposals', 'email', 'voice', 'crm'],
  team: ['website', 'booking', 'crm'],
  knowledge: ['website', 'faq', 'voice', 'support'],
  proof: ['website', 'proposals', 'email', 'social'],
  operations: ['booking', 'email', 'crm', 'voice'],
};

function clean(v: unknown, max = 240): string {
  if (typeof v !== 'string') return '';
  return v
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function sentenceCase(s: string): string {
  const t = s.replace(/[.\s]+$/, '');
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * "Private session $299 + GST · Group class $60" → service cards.
 * Split on ·, ;, newlines, or commas not inside a price; pull a leading
 * price out of each part when there is one.
 */
function parseServices(answer: string): Array<{ label: string; value: string }> {
  const parts = answer
    .split(/[·;\n]|,(?!\s*\d)/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (parts.length === 0) return [{ label: 'What we offer', value: answer }];
  return parts.map((part) => {
    const m = part.match(/^(.*?)[\s—–:-]*(\$\s?[\d,.].*)$/);
    if (m && m[1].trim().length > 1) {
      return { label: sentenceCase(m[1].trim()), value: m[2].trim() };
    }
    return { label: sentenceCase(part), value: 'priced on enquiry' };
  });
}

/** The ten answers become genome facts — same sections the sample sites read. */
function factsFromAnswers(a: Record<AnswerId, string>): GenomeFact[] {
  const facts: Array<{ id: string; section: GenomeSection; label: string; value: string }> = [];
  const push = (id: string, section: GenomeSection, label: string, value: string) => {
    if (value) facts.push({ id, section, label, value });
  };

  push('g-name', 'identity', 'Business', a.q1);
  push('g-voice', 'identity', 'Brand voice', a.q9);
  push('g-area', 'identity', 'Service area', a.q3);
  parseServices(a.q4).forEach((s, i) => push(`g-svc-${i + 1}`, 'services', s.label, s.value));
  push('g-team', 'team', 'The team', a.q2);
  push('g-faq-weekly', 'knowledge', 'Asked every week', a.q5);
  push('g-policy-never', 'knowledge', 'Must never happen', a.q6);
  push('g-testimonials', 'proof', 'Proof', a.q8);
  push('g-booking-rules', 'operations', 'Booking rules', a.q7);
  push('g-approvals', 'operations', 'Waits for your yes', a.q10);

  return facts.map((f) => ({ ...f, readBy: READ_BY[f.section] })) as GenomeFact[];
}

export type InstallResult =
  | { ok: true; id: string }
  | { ok: false; error: 'invalid' | 'capacity' | 'unavailable' };

/**
 * Write a visitor's ten answers as a real genome under a fresh install
 * tenant. Returns the install id for /living-site/install/[id].
 */
export async function createInstall(
  industry: string,
  rawAnswers: Record<string, unknown>,
): Promise<InstallResult> {
  const base = verticalBySlug(clean(industry, 40));
  if (!base) return { ok: false, error: 'invalid' };

  const answers = Object.fromEntries(
    ANSWER_IDS.map((id) => [id, clean(rawAnswers?.[id], id === 'q4' ? 400 : 240)]),
  ) as Record<AnswerId, string>;
  if (!answers.q1) return { ok: false, error: 'invalid' };

  const facts = factsFromAnswers(answers);
  if (facts.length < 3) return { ok: false, error: 'invalid' };

  try {
    const supabase = getServiceClient();

    // Rolling 24h cap on install rows — the whole feature stays bounded.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('living_site_genome')
      .select('*', { count: 'exact', head: true })
      .like('tenant', 'install-%')
      .gte('updated_at', since);
    if (countError) return { ok: false, error: 'unavailable' };
    if ((count ?? 0) + facts.length > DAILY_ROW_CAP) return { ok: false, error: 'capacity' };

    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toLowerCase();
    const id = `${base.slug}-${token}`;
    const tenant = `install-${id}`;

    const { error } = await supabase.from('living_site_genome').insert(
      facts.map((f) => ({
        tenant,
        fact_id: f.id,
        section: f.section,
        label: f.label,
        value: f.value,
        read_by: f.readBy,
      })),
    );
    if (error) return { ok: false, error: 'unavailable' };
    return { ok: true, id };
  } catch {
    return { ok: false, error: 'unavailable' };
  }
}

export type InstallSite = {
  id: string;
  tenant: string;
  /** The base industry template the install was generated from. */
  base: SampleVertical;
  /** The derived, visitor-named vertical the site renders with. */
  v: SampleVertical;
  facts: GenomeFact[];
};

/** First name out of "Sam — owner and head trainer". */
function ownerFrom(team: string | undefined, fallback: string): string {
  const first = (team ?? '').split(/[—–·,(&]/)[0].trim().split(/\s+/)[0] ?? '';
  return /^[A-Za-zĀ-ū'’-]{2,}$/.test(first) ? first : fallback;
}

/**
 * Load a generated install and derive the vertical the site renders with:
 * the industry template's design, the visitor's facts.
 */
export async function getInstall(id: string): Promise<InstallSite | null> {
  const m = INSTALL_ID_RE.exec(id);
  if (!m) return null;
  const base = verticalBySlug(m[1]);
  if (!base) return null;

  const tenant = `install-${id}`;
  const { facts, live } = await getGenomeFactsFor(tenant, []);
  if (!live || facts.length === 0) return null;

  const name = (facts.find((f) => f.id === 'g-name')?.value ?? base.businessName).split(' · ')[0];
  const owner = ownerFrom(facts.find((f) => f.id === 'g-team')?.value, base.owner);

  const v: SampleVertical = {
    ...base,
    businessName: name,
    owner,
    tagline: `${base.industryLabel} · a living site`,
    heroLede:
      'Generated a moment ago from ten answers. Every price, policy and booking rule below reads live from the new Business Genome — change a fact once and the site follows.',
    enquiry: {
      ...base.enquiry,
      heading: `Tell ${owner} what you need`,
      lede: 'Every enquiry lands in the CRM with a reply drafted — nothing sends without a yes.',
    },
    // The streaming chat agent reads the flagship genome, not this one —
    // an install site stays honest by not wearing it.
    chat: undefined,
    fallbackFacts: [],
  };

  return { id, tenant, base, v, facts };
}

/** True when a genome exists for this tenant (used to validate enquiries). */
export async function installTenantExists(tenant: string): Promise<boolean> {
  if (!INSTALL_TENANT_RE.test(tenant)) return false;
  try {
    const supabase = getServiceClient();
    const { count, error } = await supabase
      .from('living_site_genome')
      .select('*', { count: 'exact', head: true })
      .eq('tenant', tenant);
    return !error && (count ?? 0) > 0;
  } catch {
    return false;
  }
}
