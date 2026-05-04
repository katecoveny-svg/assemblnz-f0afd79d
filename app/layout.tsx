import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter, IBM_Plex_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'assembl — quiet intelligence for Aotearoa',
    template: '%s · assembl',
  },
  description:
    'Purpose-built AI agents that work alongside your team — citing NZ legislation, producing evidence packs, and waiting for your approval before anything ships. Built in Aotearoa.',
  metadataBase: new URL('https://assembl.co.nz'),
  openGraph: {
    title: 'assembl — less noise, more time',
    description:
      'AI agents that draft, check, and document — so your team gets time back.',
    type: 'website',
    locale: 'en_NZ',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'assembl — quiet intelligence for Aotearoa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'assembl — less noise, more time',
    description:
      'AI agents that draft, check, and document — so your team gets time back.',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" className={`${cormorant.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="relative z-10 flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
