import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OsDashboard } from '@/components/os/OsDashboard';
import styles from '@/components/os/os.module.css';
import {
  getGenomeFactsFor,
  getRecentEnquiries,
} from '@/lib/customers/auckland-dog-trainer/genome-store';
import { getBookingStatusCount, getRecentBookings } from '@/lib/living-site/booking-store';
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

  const [{ facts, live }, enquiries, bookings, requestedCount] = await Promise.all([
    getGenomeFactsFor(v.tenant, v.fallbackFacts),
    getRecentEnquiries(20, v.tenant),
    getRecentBookings(v.tenant, 20),
    getBookingStatusCount(v.tenant, 'requested'),
  ]);
  const services = facts.filter((f) => f.section === 'services').length;
  const siteHref = `/living-site/${v.slug}`;
  const osHref = `/living-site/${v.slug}/os`;
  const requestedBookings = requestedCount ?? bookings.filter((item) => item.status === 'requested').length;

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
            // Only the flagship has a triage surface drafting replies; the
            // other verticals' enquiries are captured rows, so say that.
            hint:
              enquiries.length === 0
                ? 'the desk is quiet'
                : v.slug === 'dog-training'
                  ? 'replies drafted'
                  : 'captured from the website',
          },
          { label: 'booking requests', value: String(requestedBookings), hint: requestedBookings ? 'need your confirmation' : 'the diary is clear' },
          { label: 'facts in your genome', value: String(facts.length), hint: live ? 'live' : 'sample' },
          { label: 'services live', value: String(services), hint: 'priced once, shown everywhere' },
        ]}
        actions={[
          {
            text: enquiries.length || requestedBookings
              ? `Review ${enquiries.length + requestedBookings} customer item${enquiries.length + requestedBookings === 1 ? '' : 's'} in CRM & bookings`
              : 'Open CRM & bookings — then send yourself a test request',
            impact: 'high' as const,
            href: `${osHref}/crm`,
          },
          {
            text: 'Create a GST-calculated proposal or invoice from live service pricing',
            impact: 'medium' as const,
            href: `${osHref}/documents`,
          },
          {
            text: 'Draft a campaign from the same services and brand voice',
            impact: 'medium' as const,
            href: `${osHref}/studio`,
          },
        ]}
        orbImage="/brand/genome/sphere-genome-alpha.png"
        orbInitial={v.businessName.charAt(0)}
        orbSurfaces={ORB_SURFACES}
        genomeHref="/living-site"
        assistantLede={`I've been watching ${v.businessName}'s week — there are a couple of things worth your yes.`}
        assistantCta="open the studio"
        assistantHref={`${osHref}/studio`}
        insightName={facts.find((f) => f.section === 'services')?.label ?? 'Top service'}
        insightDelta="↑ steady"
        insightPoints={[18, 26, 24, 38, 34, 46, 42, 58, 55, 70]}
        quietLinks={[
          { label: 'the website', href: siteHref },
          { label: 'CRM & bookings', href: `${osHref}/crm` },
          { label: 'proposals & invoices', href: `${osHref}/documents` },
          { label: 'marketing studio', href: `${osHref}/studio` },
          { label: 'the genome tour', href: '/living-site' },
          { label: 'the assembl OS', href: '/os' },
          { label: 'install your own', href: '/install' },
        ]}
      />
    </div>
  );
}
