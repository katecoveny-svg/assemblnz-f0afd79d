import type { Metadata } from 'next';
import Link from 'next/link';
import { OsDashboard } from '@/components/os/OsDashboard';
import styles from '@/components/os/os.module.css';
import {
  getLiveGenomeFacts,
  getRecentEnquiries,
} from '@/lib/customers/auckland-dog-trainer/genome-store';
import { GENOME_SURFACES } from '@/lib/customers/auckland-dog-trainer/genome';
import { AGENT_MESH, LEADS, WEEK_BLOCKS } from '@/lib/customers/auckland-dog-trainer/demo-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'the assembl operating system — live demo',
  description:
    'One screen: today’s summary, priority actions, the Business Genome, and an assistant — the calmest business operating system, running on a sample business.',
  robots: { index: false, follow: true },
};

/**
 * The assembl OS — the pearl direction, running on the flagship sample
 * business (Harbourside Dog Training · Sam, fictional). Genome facts and the
 * enquiry count read live from the database.
 */
export default async function AssemblOsPage() {
  const [{ facts, live }, enquiries] = await Promise.all([
    getLiveGenomeFacts(),
    getRecentEnquiries(20),
  ]);
  const services = facts.filter((f) => f.section === 'services').length;

  return (
    <div className={styles.shell}>
      <div className={styles.demoStrip}>
        <p style={{ margin: 0 }}>
          the assembl operating system · sample business, fictional details
          {live ? ' · reading live from the database' : ''}
        </p>
        <Link href="/living-site" className={styles.demoStripLink}>
          see how it works →
        </Link>
      </div>

      <OsDashboard
        greeting="Mōrena, Sam."
        greetingSub="Here's what's happening in your business today."
        askHref="/living-site/dog-training"
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
          {
            text:
              enquiries.length > 0
                ? `Reply to ${enquiries.length} new enquir${enquiries.length === 1 ? 'y' : 'ies'} — drafts are ready`
                : 'Send yourself a test enquiry from the website',
            impact: 'high',
            href:
              enquiries.length > 0
                ? '/customers/auckland-dog-trainer/ops?tab=leads'
                : '/living-site/dog-training#book',
          },
          {
            text: 'Review the page rebuild assembl prepared overnight',
            impact: 'high',
            href: '/customers/auckland-dog-trainer/ops?tab=brief',
          },
          {
            text: 'Update a price once — every surface follows',
            impact: 'medium',
            href: '/customers/auckland-dog-trainer/ops?tab=genome',
          },
        ]}
        orbImage="/brand/genome/sphere-genome-alpha.png"
        orbInitial="a"
        orbSurfaces={GENOME_SURFACES.slice(0, 10).map((s) =>
          s.name.toLowerCase().replace('public ', '').replace(' & chat agent', '').replace(' assistant', ''),
        )}
        genomeHref="/customers/auckland-dog-trainer/ops?tab=genome"
        assistantLede="I've found a few opportunities to bring in more bookings this week. Want to see them?"
        assistantCta="show me"
        assistantHref="/living-site/dog-training"
        insightName="Top performing service"
        insightDelta="↑ steady"
        insightPoints={[22, 30, 26, 44, 38, 52, 47, 64, 58, 76]}
        quietLinks={[
          { label: 'website', href: '/living-site/dog-training' },
          { label: 'genome', href: '/customers/auckland-dog-trainer/ops?tab=genome' },
          { label: 'morning brief', href: '/customers/auckland-dog-trainer/ops?tab=brief' },
          { label: 'crm', href: '/customers/auckland-dog-trainer/ops?tab=dogs' },
          { label: 'knowledge', href: '/customers/auckland-dog-trainer/ops?tab=support' },
          { label: 'bookings', href: '/customers/auckland-dog-trainer/ops?tab=time' },
          { label: 'the living site tour', href: '/living-site' },
        ]}
        // The team of agents, the drafts waiting on Sam's yes, and the
        // activity trace — all read from the existing (approved) sample data
        // so /os is finally an agent operating system, not a static dashboard.
        agents={AGENT_MESH.map((a) => ({ name: a.name, job: a.job, status: a.status }))}
        approvals={LEADS.filter((l) => l.draftReply).map((l) => ({
          who: `${l.owner} · ${l.dog}`,
          summary: l.triage,
          draft: l.draftReply as string,
        }))}
        activity={WEEK_BLOCKS.map((w) => ({
          when: w.when,
          title: w.title,
          meta: `${w.mins} min`,
        }))}
      />
    </div>
  );
}
