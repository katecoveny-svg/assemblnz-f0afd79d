import Link from 'next/link';
import { notFound } from 'next/navigation';
import { KeeperShell, DemoPill } from '../../KeeperShell';
import { DogCrm } from '../../DogCrm';
import { dogBySlug, ROSTER, FRANKLIN_SMS_THREAD, FRANKLIN_EVENTS, type DogEvent } from '@/lib/tenants/happy-tails/data';

export function generateStaticParams() {
  return ROSTER.map((d) => ({ dog: d.slug }));
}

export default async function DogProfile({ params }: { params: Promise<{ dog: string }> }) {
  const { dog: slug } = await params;
  const dog = dogBySlug(slug);
  if (!dog) notFound();

  const base = '/customers/happy-tails/keeper';
  const events: DogEvent[] =
    dog.slug === 'franklin'
      ? FRANKLIN_EVENTS
      : [
          { type: 'booking', actor: 'System', title: 'Weekly recurring booked', detail: dog.weeklySchedule, at: 'Feb 2026' },
          { type: 'welcome_pack', actor: 'Liana', title: 'Welcome Pack sent', detail: `Emailed to ${dog.ownerName}`, at: 'Feb 2026' },
        ];

  return (
    <KeeperShell active="dogs">
      <div className="top" style={{ marginBottom: 12 }}>
        <div className="crumb"><Link href={base}>Dashboard</Link> › Dog profiles › {dog.name}</div>
        <DemoPill />
      </div>

      <DogCrm dog={dog} initialEvents={events} smsThread={FRANKLIN_SMS_THREAD} />

      <div className="nextnav">
        <Link className="prev" href={base}>← Dashboard</Link>
        <Link className="next" href={`${base}/welcome-pack`}>Next: Welcome Pack generator →</Link>
      </div>
      <div className="footattr">concept — happytails × assembl · PII tenant-scoped &amp; RLS-locked · every edit writes a Mana Receipt · demo pending Liana sign-off</div>
    </KeeperShell>
  );
}
