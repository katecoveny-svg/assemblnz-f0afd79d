import type { Metadata } from 'next';
import './dash.css';

export const metadata: Metadata = {
  title: 'Dash — get paid to wait',
  description:
    'Dash by assembl is the in-product attention network for Aotearoa. It renders NZ-brand creative inside the wait states of NZ digital services and shares the revenue with the publisher.',
  openGraph: {
    title: 'Dash by assembl — get paid to wait',
    description:
      'Monetize the wait. The in-product attention network for Aotearoa — NZ-brand creative in the seconds your app spends loading.',
    type: 'website',
    locale: 'en_NZ',
    url: 'https://assembl.co.nz/dash',
    siteName: 'assembl',
    images: [{ url: '/dash/og-image.png', width: 1200, height: 630, alt: 'Dash by assembl — get paid to wait.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dash by assembl — get paid to wait',
    description: 'Monetize the wait. The in-product attention network for Aotearoa.',
    images: ['/dash/og-image.png'],
  },
  alternates: { canonical: '/dash' },
};

export default function DashLayout({ children }: { children: React.ReactNode }) {
  // Everything Dash is namespaced under `.dash-scope` so the sub-brand tokens
  // (cream / forest / sage / gold) never leak into the wider assembl site.
  return <div className="dash-scope">{children}</div>;
}
