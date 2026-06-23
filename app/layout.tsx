import type { Metadata } from 'next';
import { Lato, Space_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { CommandPalette } from '@/components/site/CommandPalette';
import { KeteAccentProvider } from '@/components/KeteAccentContext';
import { PwaRegister } from '@/components/site/PwaRegister';
import './globals.css';

// Next 16/Turbopack currently trips a prerender workStore invariant across
// unrelated static routes in this app. Keep this branch on the dynamic path so
// deploys stay reliable while the public-site rebuild is in flight.
export const dynamic = 'force-dynamic';

// Site type system (canary brand): Lato (display 900/700 + body 400) and
// Space Mono (labels/eyebrows). Exposed as the --font-* tokens so the whole
// token-driven site adopts them at once. Mirrors the /agents marketplace
// (which sets --mk-display/--mk-mono to the same faces).
const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-display',
  display: 'swap',
});

const latoBody = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'assembl — mahi that earns its proof',
    template: '%s · assembl',
  },
  description:
    'assembl is a fleet of specialist agents for the admin work that drains your team. Built in Aotearoa, reviewed by your people, and sealed with a record of how the work was made.',
  metadataBase: new URL('https://assembl.co.nz'),
  openGraph: {
    title: 'assembl — mahi that earns its proof',
    description:
      'Specialist agents for the admin work that drains your team.',
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz',
    siteName: 'assembl',
    images: [
      {
        url: '/og/og-assembl.png',
        width: 1200,
        height: 630,
        alt: 'assembl — Mahi that earns its proof. Practical assistants for the admin work that drains your team.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'assembl — mahi that earns its proof',
    description: 'Specialist agents for the admin work that drains your team.',
    images: ['/og/og-assembl.png'],
  },
  icons: {
    icon: [
      { url: '/icons/assembl-icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/assembl-icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/assembl-icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/assembl-icon-180x180.png',
    shortcut: '/icons/favicon.ico',
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" className={`${lato.variable} ${latoBody.variable} ${spaceMono.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[color:var(--assembl-pounamu)] focus:px-6 focus:py-3 focus:text-sm focus:font-medium focus:text-[#FFF7EC] focus:shadow-brand focus:outline-none focus:ring-2 focus:ring-[color:var(--assembl-pounamu)] focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <KeteAccentProvider>
          <ScrollProgress />
          <CommandPalette />
          <PwaRegister />
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main-content" className="relative z-10 flex-1 outline-none" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </div>
        </KeteAccentProvider>
      </body>
    </html>
  );
}
