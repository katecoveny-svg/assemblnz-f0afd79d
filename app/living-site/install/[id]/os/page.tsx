import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OsDashboard } from '@/components/os/OsDashboard';
import styles from '@/components/os/os.module.css';
import { getRecentEnquiries } from '@/lib/customers/auckland-dog-trainer/genome-store';
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
  const enquiries = await getRecentEnquiries(20, tenant);
  const services = facts.filter((f) => f.section === 'services').length;
  const siteHref = `/living-site/install/${id}`;

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
          { label: 'facts in your genome', value: String(facts.length), hint: 'written by you' },
          { label: 'services live', value: String(services), hint: 'priced once, shown everywhere' },
          { label: 'improvement ready', value: '1', hint: 'waiting for your yes' },
        ]}
        actions={[
          {
            text:
              enquiries.length > 0
                ? `${enquiries.length} enquir${enquiries.length === 1 ? 'y' : 'ies'} captured from the website — send another test`
                : 'Send yourself a test enquiry from the website',
            impact: 'high' as const,
            href: `${siteHref}#book`,
          },
          {
            text: 'Every fact on the website reads from the genome you just wrote',
            impact: 'medium',
            href: siteHref,
          },
          {
            text: 'See how the ripple works on the genome tour',
            impact: 'medium',
            href: '/living-site',
          },
        ]}
        orbImage="/brand/genome/sphere-genome-alpha.png"
        orbInitial={v.businessName.charAt(0)}
        orbSurfaces={ORB_SURFACES}
        genomeHref="/living-site"
        assistantLede={`I've been reading ${v.businessName}'s answers — there are a couple of things worth your yes.`}
        assistantCta="show me"
        assistantHref={siteHref}
        insightName={facts.find((f) => f.section === 'services')?.label ?? 'Top service'}
        insightDelta="↑ steady"
        insightPoints={[18, 26, 24, 38, 34, 46, 42, 58, 55, 70]}
        quietLinks={[
          { label: 'the website', href: siteHref },
          { label: 'the genome tour', href: '/living-site' },
          { label: 'the assembl OS', href: '/os' },
          { label: 'install another', href: '/install' },
        ]}
      />
    </div>
  );
}
