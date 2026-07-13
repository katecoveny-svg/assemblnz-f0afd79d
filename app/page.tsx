import type { Metadata } from 'next';
import Link from 'next/link';
import { V2Nav } from '@/components/v2/V2Chrome';
import { HomeHero } from '@/components/v2/home/HomeHero';
import { GENOME_FACTS, GENOME_SURFACES } from '@/lib/customers/auckland-dog-trainer/genome';

export const metadata: Metadata = {
  title: 'assembl — less admin. more mahi. The Living Business Operating System.',
  description:
    'One connected dashboard for the website, customer desk, knowledge, bookings and workflows — powered by a shared Business Genome and kept under human review. Built in Aotearoa.',
  alternates: { canonical: '/' },
};

/**
 * Dashboard-first front door. The interactive workspace carries the company
 * story; the full interactive Business Genome remains available at /genome.
 */
export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f3f0ea', color: '#26312d' }}>
      <V2Nav />
      <HomeHero genomeFacts={GENOME_FACTS.length} surfaces={GENOME_SURFACES.length} />
      <footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          padding: '24px clamp(18px, 4vw, 58px) 34px',
          borderTop: '1px solid rgba(35, 62, 53, 0.1)',
          fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
        }}
      >
        <div>
          <p style={{ margin: 0, fontFamily: 'var(--font-display), Georgia, serif', fontSize: 19 }}>
            assembl
          </p>
          <p style={{ margin: '4px 0 0', color: '#68766f', fontSize: 10, letterSpacing: '0.08em' }}>
            Mahi that earns its proof. Built in Aotearoa.
          </p>
        </div>
        <nav aria-label="assembl footer" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px' }}>
          {[
            ['/living-site', 'Living Sites'],
            ['/genome', 'Business Genome'],
            ['/os', 'Operating system'],
            ['/install', 'Install'],
            ['/trust', 'Trust'],
            ['/contact', 'Contact'],
            ['/legal/privacy', 'Privacy'],
          ].map(([href, label]) => (
            <Link key={href} href={href} style={{ color: '#53645d', fontSize: 11, textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
