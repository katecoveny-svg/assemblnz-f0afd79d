import { BODY, C, Card, Eyebrow, Grid, LinkPill, MONO, PageHeader, SectionTitle } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

type Surface = {
  title: string;
  blurb: string;
  view?: string;
  source: string;
};

const SURFACES: { group: string; items: Surface[] }[] = [
  {
    group: 'Marketing',
    items: [
      { title: 'Homepage', blurb: 'Hero, orb scene and the marketplace grid.', view: '/', source: 'app/page.tsx' },
      { title: 'Marketplace', blurb: 'The /agents catalogue and detail pages.', view: '/agents', source: 'app/agents' },
      { title: 'Pricing', blurb: 'Per-agent ladder and bundles.', view: '/pricing', source: 'app/pricing' },
      { title: 'Trust / About', blurb: 'Residency, oversight, Te Tiriti.', view: '/trust', source: 'app/trust' },
    ],
  },
  {
    group: 'Editorial',
    items: [
      { title: 'Blog', blurb: 'Posts and updates.', view: '/blog', source: 'app/blog' },
      { title: 'HAPAI tools', blurb: 'Free, no-install utilities.', view: '/hapai', source: 'app/hapai' },
    ],
  },
  {
    group: 'Email templates',
    items: [
      { title: 'Magic-link email', blurb: 'Sign-in link (Supabase auth-email-hook).', source: 'supabase/functions/auth-email-hook' },
      { title: 'Lead / welcome', blurb: 'Brevo list + transactional sends.', source: 'lib/email · Brevo' },
    ],
  },
];

export default async function ContentPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operator hub · Content"
        title="Content"
        lede="The surfaces customers read. Open one to view it live; copy ships through a PR so every change is reviewed and recorded."
      />

      <Card tone="cream" style={{ marginBottom: 8, padding: '14px 18px' }}>
        <span style={{ fontFamily: BODY, color: C.body, fontSize: 13.5 }}>
          Pages are code-managed for a reliable, reviewable history. Each card links to the live surface and names its
          source — edit there, open a PR, and it deploys.
        </span>
      </Card>

      {SURFACES.map((g) => (
        <div key={g.group}>
          <SectionTitle>{g.group}</SectionTitle>
          <Grid min={260}>
            {g.items.map((s) => (
              <Card key={s.title}>
                <div
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontSize: 22,
                    fontWeight: 600,
                    color: C.ink,
                  }}
                >
                  {s.title}
                </div>
                <p style={{ fontFamily: BODY, color: C.body, fontSize: 13.5, margin: '6px 0 12px' }}>{s.blurb}</p>
                <Eyebrow style={{ marginBottom: 10 }}>{s.source}</Eyebrow>
                {s.view && <LinkPill href={s.view}>View live →</LinkPill>}
              </Card>
            ))}
          </Grid>
        </div>
      ))}
    </>
  );
}
