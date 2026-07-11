import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OsDashboard } from '@/components/os/OsDashboard';
import styles from '@/components/os/os.module.css';
import {
  getGenomeFactsFor,
  getRecentEnquiries,
} from '@/lib/customers/auckland-dog-trainer/genome-store';
import { verticalBySlug } from '@/lib/living-site/verticals';

export const dynamic = 'force-dynamic';

type Params = { vertical: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const v = verticalBySlug((await params).vertical);
  if (!v) return {};
  return {
    title: `${v.businessName} — the operating system behind the site (sample)`,
    description: `${v.owner}'s assembl OS: today's summary, priority actions, and the Business Genome powering ${v.businessName}. Fictional sample business, live system.`,
    robots: { index: false, follow: false },
  };
}

/** Every surface the genome powers — short labels for the orbit. */
const ORB_SURFACES = [
  'website',
  'crm',
  'knowledge',
  'bookings',
  'voice',
  'email',
  'automations',
  'marketing',
];

/**
 * The business's actual dashboard — the assembl OS running on this sample
 * vertical's genome. Same pearl language as /os; the orb holds the business.
 */
export default async function VerticalOsPage({ params }: { params: Promise<Params> }) {
  const v = verticalBySlug((await params).vertical);
  if (!v) notFound();

  const [{ facts, live }, enquiries] = await Promise.all([
    getGenomeFactsFor(v.tenant, v.fallbackFacts),
    getRecentEnquiries(20, v.tenant),
  ]);
  const services = facts.filter((f) => f.section === 'services').length;
  const siteHref = `/living-site/${v.slug}`;

  return (
    <div className={styles.shell}>
      <div className={styles.demoStrip}>
        <p style={{ margin: 0 }}>
          {v.businessName} on the assembl operating system · sample business, fictional details
          {live ? ' · reading live from the database' : ''}
        </p>
        <Link href={siteHref} className={styles.demoStripLink}>
          see the website it powers →
        </Link>
      </div>

      <OsDashboard
        greeting={`Mōrena, ${v.owner}.`}
        greetingSub="Here's what's happening in your business today."
        askHref={siteHref}
        tiles={[
          {
            label: 'new enquiries',
            value: String(enquiries.length),
            hint: enquiries.length > 0 ? 'replies drafted' : 'the desk is quiet',
          },
          { label: 'facts in your genome', value: String(facts.length), hint: live ? 'live' : 'sample' },
          { label: 'services live', value: String(services), hint: 'priced once, shown everywhere' },
          { label: 'improvement ready', value: '1', hint: 'waiting for your yes' },
        ]}
        actions={[
          // The flagship has a real triage tab behind the demo gate; the other
          // verticals' enquiries live only in the database, so their action
          // stays on the website and says exactly what it does.
          v.slug === 'dog-training' && enquiries.length > 0
            ? {
                text: `Reply to ${enquiries.length} new enquir${enquiries.length === 1 ? 'y' : 'ies'} — drafts are ready`,
                impact: 'high' as const,
                href: '/customers/auckland-dog-trainer/ops?tab=leads',
              }
            : {
                text:
                  enquiries.length > 0
                    ? `${enquiries.length} enquir${enquiries.length === 1 ? 'y' : 'ies'} captured from the website — send another test`
                    : 'Send yourself a test enquiry from the website',
                impact: 'high' as const,
                href: `${siteHref}#book`,
              },
          {
            text: 'Update a price once — the website follows on the next load',
            impact: 'medium',
            href: '/living-site',
          },
          v.chat
            ? {
                text: 'Ask the desk agent anything on the site',
                impact: 'medium' as const,
                href: siteHref,
              }
            : {
                text: 'Visit your website — every fact on it reads from the genome',
                impact: 'medium' as const,
                href: siteHref,
              },
        ]}
        orbInitial={v.businessName.charAt(0)}
        orbSurfaces={ORB_SURFACES}
        genomeHref="/living-site"
        assistantLede={`I've been watching ${v.businessName}'s week — there are a couple of things worth your yes.`}
        assistantCta="show me"
        assistantHref={siteHref}
        insightName={facts.find((f) => f.section === 'services')?.label ?? 'Top service'}
        insightDelta="↑ steady"
        insightPoints={[18, 26, 24, 38, 34, 46, 42, 58, 55, 70]}
        quietLinks={[
          { label: 'the website', href: siteHref },
          { label: 'the genome tour', href: '/living-site' },
          { label: 'the assembl OS', href: '/os' },
          { label: 'install your own', href: '/install' },
        ]}
      />
    </div>
  );
}
