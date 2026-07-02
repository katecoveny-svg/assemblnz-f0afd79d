import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { palette, typography } from '@assembl/canvas/tokens';
import { MicroLabel, RightRail } from '@assembl/canvas';
import { HeroArt } from '@/components/v2/HeroArt';
import { MottoStrip } from '@/components/v2/V2Chrome';
import { BundleChatPreview } from '@/components/v2/BundleChatPreview';
import { bundleBySlug, BUNDLES, type BundleMeta } from '@/lib/marketplace/bundles';
import { marketplaceAgentBySlug } from '@/lib/marketplace/agents';
import styles from '@/components/v2/v2.module.css';

/**
 * /bundles/[slug] — the per-bundle detail from DIRECTION-LOCKED-2026-07-01:
 * right-rail collection pattern, member agents, one capability sentence, and
 * a LIVE chat preview with the bundle's lead agent (existing chat stack —
 * prompts stay in code, the assembling… loader is the thinking state).
 *
 * Kaitiaki keeps its bespoke landing at /bundles/kaitiaki.
 */

const HANDLED_ELSEWHERE = new Set(['kaitiaki']);

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return Object.keys(BUNDLES)
    .filter((slug) => !HANDLED_ELSEWHERE.has(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bundle = bundleBySlug(slug);
  if (!bundle || HANDLED_ELSEWHERE.has(slug)) {
    return { title: 'bundle — assembl' };
  }
  return {
    title: `${bundle.name.toLowerCase()} — ${bundle.category} collection — assembl`,
    description: bundle.subtitle,
    alternates: { canonical: `/bundles/${slug}` },
  };
}

/** One capability sentence — the first sentence of the locked subtitle. */
function capabilitySentence(bundle: BundleMeta): string {
  const first = bundle.subtitle.split(/(?<=\.)\s/)[0] ?? bundle.subtitle;
  return first.charAt(0).toLowerCase() + first.slice(1);
}

export default async function BundlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (HANDLED_ELSEWHERE.has(slug)) notFound();
  const bundle = bundleBySlug(slug);
  if (!bundle) notFound();

  const lead = marketplaceAgentBySlug(bundle.leadSlug);
  const leadLive = lead?.status === 'live';

  const body: React.CSSProperties = {
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    lineHeight: typography.body.lineHeight,
    color: palette.bodyGrey,
  };

  // Member rows straight off the registry groups — real status or "in build".
  const groups = bundle.groups.map((g) => ({
    ...g,
    members: g.slugs.map((s) => {
      const a = marketplaceAgentBySlug(s);
      return a
        ? { slug: s, name: a.name, description: a.description, live: a.status === 'live' }
        : { slug: s, name: s.replace(/-/g, ' '), description: '', live: false };
    }),
  }));
  const liveMembers = groups.flatMap((g) => g.members).filter((m) => m.live);

  return (
    <div className={styles.page}>
      {/* quiet landscape band behind the header block */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
          <HeroArt constellation={false} />
        </div>

        <div className={styles.section} style={{ position: 'relative', paddingBottom: 40 }}>
          <div className={`${styles.inner} ${styles.detail}`}>
            {/* ── main column ─────────────────────────────────────── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                  •
                </span>
                <MicroLabel>collection · {bundle.category}</MicroLabel>
              </div>
              <h1 className={styles.h1} style={{ marginTop: 18 }}>
                {bundle.name.toLowerCase()}
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </h1>
              <p style={{ ...body, marginTop: 18, maxWidth: 520 }}>{capabilitySentence(bundle)}</p>

              {liveMembers.length > 0 ? (
                <p style={{ ...body, fontSize: 13, marginTop: 10 }}>
                  {liveMembers.length} agent{liveMembers.length === 1 ? '' : 's'} live in this
                  collection today.
                </p>
              ) : null}

              {/* member groups */}
              <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 36 }}>
                {groups.map((g) => (
                  <div key={g.label} className="rise">
                    <MicroLabel as="h2">{g.label.toLowerCase()}</MicroLabel>
                    <p style={{ ...body, fontSize: 13.5, marginTop: 8, maxWidth: 560 }}>{g.blurb}</p>
                    {g.members.length > 0 ? (
                      <ul
                        style={{
                          listStyle: 'none',
                          margin: '16px 0 0',
                          padding: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        {g.members.map((m) => (
                          <li key={m.slug}>
                            {m.live ? (
                              <Link
                                href={`/agents/${m.slug}`}
                                style={{
                                  display: 'flex',
                                  alignItems: 'baseline',
                                  gap: 12,
                                  textDecoration: 'none',
                                  padding: '12px 16px',
                                  borderRadius: 12,
                                  border: `1px solid ${palette.hairline}`,
                                  background: 'rgba(255,255,255,0.9)',
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: typography.display.fontFamily,
                                    fontWeight: typography.display.fontWeight,
                                    fontSize: 19,
                                    textTransform: 'lowercase',
                                    color: palette.ink,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {m.name}
                                </span>
                                <span style={{ ...body, fontSize: 12.5 }}>{m.description}</span>
                                <MicroLabel style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                                  live{' '}
                                  <span aria-hidden style={{ color: palette.accentGold }}>
                                    •
                                  </span>
                                </MicroLabel>
                              </Link>
                            ) : (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'baseline',
                                  gap: 12,
                                  padding: '12px 16px',
                                  borderRadius: 12,
                                  border: `1px dashed ${palette.hairline}`,
                                  opacity: 0.65,
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: typography.display.fontFamily,
                                    fontWeight: typography.display.fontWeight,
                                    fontSize: 19,
                                    textTransform: 'lowercase',
                                    color: palette.ink,
                                  }}
                                >
                                  {m.name}
                                </span>
                                <MicroLabel style={{ marginLeft: 'auto' }}>coming soon</MicroLabel>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* real registry pricing, quietly */}
              <p style={{ ...body, fontSize: 13, marginTop: 40 }}>
                {bundle.standalone
                  ? `pack-priced from $${bundle.monthlyNzd} nzd.`
                  : `bundle $${bundle.monthlyNzd}/mo · single seat $${bundle.seatNzd}/mo · every agent free to try.`}{' '}
                <Link href="/pricing" style={{ color: palette.ink }}>
                  see pricing
                </Link>
              </p>
            </div>

            {/* ── right rail ──────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <RightRail
                eyebrow="collection"
                title={bundle.name.toLowerCase()}
                subtitle={bundle.category}
                style={{ maxWidth: 'none' }}
                footer={
                  lead ? (
                    <Link href={`/agents/${lead.slug}`} style={{ color: palette.ink }}>
                      meet {lead.name.toLowerCase()}, the lead agent →
                    </Link>
                  ) : (
                    <span>the lead agent for this collection is in build.</span>
                  )
                }
              >
                <p style={{ ...body, fontSize: 13, margin: 0 }}>{capabilitySentence(bundle)}</p>
                {liveMembers.slice(0, 5).map((m) => (
                  <div
                    key={m.slug}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: `1px solid ${palette.hairline}`,
                    }}
                  >
                    <span aria-hidden style={{ color: palette.accentGold, fontSize: 10, lineHeight: 1 }}>
                      •
                    </span>
                    <span
                      style={{
                        ...body,
                        fontSize: 13,
                        color: palette.ink,
                        textTransform: 'lowercase',
                      }}
                    >
                      {m.name}
                    </span>
                    <MicroLabel style={{ marginLeft: 'auto' }}>live</MicroLabel>
                  </div>
                ))}
              </RightRail>

              {lead && leadLive ? (
                <BundleChatPreview
                  agentSlug={lead.slug}
                  agentName={lead.name}
                  greeting={lead.greeting}
                  starters={lead.starters}
                />
              ) : (
                <div
                  style={{
                    ...body,
                    fontSize: 13,
                    border: `1px dashed ${palette.hairline}`,
                    borderRadius: 16,
                    padding: '18px 20px',
                  }}
                >
                  the live chat preview arrives with this collection&apos;s lead agent.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <MottoStrip />
    </div>
  );
}
