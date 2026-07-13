import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OsDashboard } from '@/components/os/OsDashboard';
import styles from '@/components/os/os.module.css';
import { getRecentEnquiries } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { getBookingStatusCount, getRecentBookings } from '@/lib/living-site/booking-store';
import { getInstall } from '@/lib/living-site/install-store';

export const dynamic = 'force-dynamic';

type Params = { id: string };

export const metadata: Metadata = {
  title: 'your operating system — a generated install · assembl',
  description:
    'The assembl OS running on a visitor-generated Business Genome: today’s summary, priority actions, and the genome behind the generated site.',
  robots: { index: false, follow: false },
};

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
 * The dashboard behind a generated install — the same pearl OS as the
 * sample businesses, running on the genome the visitor just wrote.
 */
export default async function InstallOsPage({ params }: { params: Promise<Params> }) {
  const install = await getInstall((await params).id);
  if (!install) notFound();

  const { v, facts, id, tenant } = install;
  const [enquiries, bookings, requestedCount] = await Promise.all([
    getRecentEnquiries(20, tenant),
    getRecentBookings(tenant, 20),
    getBookingStatusCount(tenant, 'requested'),
  ]);
  const services = facts.filter((f) => f.section === 'services').length;
  const siteHref = `/living-site/install/${id}`;
  const osHref = `/living-site/install/${id}/os`;
  const requestedBookings = requestedCount ?? bookings.filter((item) => item.status === 'requested').length;

  return (
    <div className={styles.shell}>
      <div className={styles.demoStrip}>
        <p style={{ margin: 0 }}>
          {v.businessName} on the assembl operating system · generated from your ten answers ·
          reading live from the database
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
            hint: enquiries.length === 0 ? 'the desk is quiet' : 'captured from the website',
          },
          { label: 'booking requests', value: String(requestedBookings), hint: requestedBookings ? 'need your confirmation' : 'the diary is clear' },
          { label: 'facts in your genome', value: String(facts.length), hint: 'written by you' },
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
            text: 'Create a GST-calculated proposal or invoice from your service pricing',
            impact: 'medium',
            href: `${osHref}/documents`,
          },
          {
            text: 'Draft a campaign from your services and brand voice',
            impact: 'medium',
            href: `${osHref}/studio`,
          },
        ]}
        orbImage="/brand/genome/sphere-genome-alpha.png"
        orbInitial={v.businessName.charAt(0)}
        orbSurfaces={ORB_SURFACES}
        genomeHref="/living-site"
        assistantLede={`I've been reading ${v.businessName}'s answers — there are a couple of things worth your yes.`}
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
          { label: 'install another', href: '/install' },
        ]}
      />
    </div>
  );
}
