import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  BarChart3,
  FileCheck2,
  Images,
  Inbox,
  MessageCircle,
  Network,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Admin hub',
  description: 'Operator links for assembl chat, evidence, metrics, Tōro drafts, and imagery.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const ALLOWED_EMAILS = new Set<string>([
  'assembl@assembl.co.nz',
  'kate@assembl.co.nz',
]);

const ADMIN_LINKS = [
  {
    href: '/app/chat',
    title: 'Talk to an agent',
    body: 'Choose a kete, choose a specialist, and send a message through Iho.',
    icon: MessageCircle,
    label: 'product',
  },
  {
    href: '/app/admin/dashboard',
    title: 'Live admin dashboard',
    body: 'Agent prompts, Tōro drafts, routing log, edge function health, and paperwork.',
    icon: ShieldCheck,
    label: 'operator',
  },
  {
    href: '/app/admin/metrics',
    title: 'Evidence metrics',
    body: 'Citation coverage, approval coverage, reversal rate, cycle time, and volume.',
    icon: BarChart3,
    label: 'proof',
  },
  {
    href: '/app/admin/fleet',
    title: 'Fleet activation',
    body: 'Activate or pause kete fleets for tenants after purchase.',
    icon: Network,
    label: 'access',
  },
  {
    href: '/app/toro/inbox',
    title: 'Tōro inbox',
    body: 'Review staged whānau drafts before anything is sent or committed.',
    icon: Inbox,
    label: 'tōro',
  },
  {
    href: '/app/admin/evidence/settings',
    title: 'Evidence settings',
    body: 'Configure evidence behaviour and thresholds for the ledger.',
    icon: Settings,
    label: 'settings',
  },
  {
    href: '/app/evidence/export',
    title: 'Export evidence',
    body: 'Download or inspect evidence pack exports where configured.',
    icon: FileCheck2,
    label: 'record',
  },
  {
    href: '/app/admin/imagery',
    title: 'Imagery guide',
    body: 'Find the source of hero images, kete vessels, videos, and the vessel studio.',
    icon: Images,
    label: 'brand',
  },
] as const;

export default async function AdminHubPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect('/login?redirect=/app/admin');
  }

  const email = (user.email ?? '').toLowerCase();
  if (!ALLOWED_EMAILS.has(email)) {
    return <NotAuthorised email={user.email ?? ''} />;
  }

  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] px-6 py-12 text-[color:var(--text-primary)] md:px-10 md:py-16">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
            assembl / admin hub
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.7rem,7vw,6rem)] font-light leading-[0.92]">
            Use the system.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
            This is the operator map. Chat lives here. Evidence lives here. Tōro drafts,
            routing logs, metrics, and imagery tools live here too.
          </p>
          <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            signed in as {email}
          </p>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ADMIN_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-[190px] flex-col rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/60 p-5 shadow-[0_10px_32px_rgba(35,33,31,0.06)] transition-colors hover:border-[color:var(--assembl-pounamu)] hover:bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--assembl-pounamu)] text-[color:var(--assembl-paper)]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                    {item.label}
                  </span>
                </div>
                <h2 className="mt-5 font-display text-3xl font-light leading-none">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                  {item.body}
                </p>
                <span className="mt-auto inline-flex items-center pt-5 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                  Open
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </span>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function NotAuthorised({ email }: { email: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[color:var(--assembl-paper)] px-6">
      <div className="max-w-md rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/60 p-6">
        <p className="font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          not authorised
        </p>
        <h1 className="mt-3 font-display text-4xl font-light leading-none">
          Admin is restricted.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
          {email || 'This account'} is signed in, but it is not on the admin allowlist.
        </p>
      </div>
    </main>
  );
}
