'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  Landmark,
  PiggyBank,
  Bell,
  EyeOff,
  Database,
  Plug,
} from 'lucide-react';
import { BillsAdvisor } from './BillsAdvisor';
import { WordMark } from './HeroFx';

const NAV = [
  { href: '/bills/app', label: 'Overview', Icon: LayoutDashboard },
  { href: '/bills/app/bills', label: 'Bills', Icon: ReceiptText },
  { href: '/bills/app/bank', label: 'Bank', Icon: Landmark },
  { href: '/bills/app/savings', label: 'Savings', Icon: PiggyBank },
  { href: '/bills/app/alerts', label: 'Alerts', Icon: Bell },
  { href: '/bills/app/hidden-costs', label: 'Hidden costs', Icon: EyeOff },
  { href: '/bills/app/providers', label: 'Provider DB', Icon: Database },
  { href: '/bills/app/connections', label: 'Connections', Icon: Plug },
];

export function BillsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/bills/app' ? pathname === href : pathname.startsWith(href));

  return (
    <div className="min-h-screen">
      {/* Demo ribbon */}
      <div
        className="flex items-center justify-center gap-2 px-4 py-1.5 text-[12px] font-medium"
        style={{ background: 'rgba(43,107,87,0.08)', color: 'var(--b-muted)', borderBottom: '1px solid var(--b-line)' }}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--b-teal)', boxShadow: '0 0 8px rgba(43,107,87,0.9)' }} />
        Live console · sample household — real bill parsing, real provider prices, no real accounts connected
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-5 sm:px-6">
        {/* Sidebar — desktop */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-5">
            <WordMark size={16} />
            <nav className="mt-6 space-y-1">
              {NAV.map(({ href, label, Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition"
                    style={
                      active
                        ? { background: 'var(--b-teal-soft)', color: 'var(--b-teal)', border: '1px solid var(--b-teal-line)', boxShadow: 'inset 0 0 20px -8px rgba(43,107,87,0.6)' }
                        : { color: 'var(--b-muted)', border: '1px solid transparent' }
                    }
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <ViewLanding />
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 pb-16">
          <div className="lg:hidden">
            <div className="flex items-center justify-between">
              <WordMark size={15} />
              <Link href="/bills" className="text-xs font-semibold" style={{ color: 'var(--b-teal)' }}>Landing →</Link>
            </div>
            <nav className="mt-4 -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
              {NAV.map(({ href, label, Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition"
                    style={
                      active
                        ? { background: 'var(--b-teal-soft)', color: 'var(--b-teal)', border: '1px solid var(--b-teal-line)' }
                        : { background: 'rgba(26,25,24,0.04)', color: 'var(--b-muted)', border: '1px solid var(--b-line)' }
                    }
                  >
                    <Icon size={14} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-5 lg:mt-0">{children}</div>
        </main>
      </div>

      <BillsAdvisor />
    </div>
  );
}

function ViewLanding() {
  return (
    <div className="mt-8 rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid var(--b-line)', backdropFilter: 'blur(8px)' }}>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--b-muted)' }}>
        The household console. See the product story and join the waitlist on the landing page.
      </p>
      <Link href="/bills" className="mt-2 inline-block text-xs font-semibold" style={{ color: 'var(--b-teal)' }}>
        View landing →
      </Link>
    </div>
  );
}
