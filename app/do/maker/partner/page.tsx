import type { Metadata } from 'next';
import Link from 'next/link';
import { PARTNER_SKINS, PARTNER_SLUGS, partnerAliasHref, partnerMakerHref } from '@/lib/studio/task-do-maker';

export const metadata: Metadata = {
  title: { absolute: 'Partner DO Maker · assembl' },
  description: 'Partner-facing white-label Task DO maker demos — rewarded wait, drafts-only, offline skins.',
  alternates: { canonical: '/do/maker/partner' },
};

export default function PartnerDoMakerIndexPage() {
  return (
    <main style={{ minHeight: '100svh', padding: '48px 24px', background: '#FFFDFB', color: '#240B21', fontFamily: 'var(--font-body), Instrument Sans, sans-serif' }}>
      <p style={{ margin: 0, fontFamily: 'var(--font-mono), IBM Plex Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#916A70' }}>
        Mode B · partner-facing
      </p>
      <h1 style={{ margin: '12px 0 8px', fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', letterSpacing: '-0.06em', fontWeight: 400 }}>
        Partner DO maker
      </h1>
      <p style={{ maxWidth: 520, color: '#654A4E', lineHeight: 1.55 }}>
        Offline demo skins for a customer-facing Task DO. Same maker core as Pursuit Studio — partner chrome first, assembl credit small, drafts-only.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0', display: 'grid', gap: 12, maxWidth: 560 }}>
        {PARTNER_SLUGS.map((slug) => {
          const skin = PARTNER_SKINS[slug];
          return (
            <li key={slug}>
              <Link
                href={partnerAliasHref(slug)}
                style={{
                  display: 'block',
                  padding: '18px 20px',
                  borderRadius: 16,
                  border: '1px solid rgba(36,11,33,0.1)',
                  background: '#fff',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <strong style={{ display: 'block', fontSize: 18, fontWeight: 500 }}>{skin.productName}</strong>
                <span style={{ display: 'block', marginTop: 4, color: '#654A4E', fontSize: 13 }}>{skin.railLabel}</span>
                <span style={{ display: 'block', marginTop: 8, color: '#916A70', fontSize: 11 }}>{skin.honesty}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p style={{ color: '#916A70', fontSize: 12 }}>
        Canonical route: <Link href={partnerMakerHref('bp')}>/studio/do-maker?mode=partner</Link>
      </p>
    </main>
  );
}
