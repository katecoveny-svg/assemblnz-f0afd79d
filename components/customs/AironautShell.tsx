'use client';

import { useState } from 'react';
import { AironautSidebar } from './AironautSidebar';

export function AironautShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="aironaut-root">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <AironautSidebar />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-[rgba(7,27,51,0.5)]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-64" onClick={() => setDrawerOpen(false)}>
            <AironautSidebar />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[color:var(--air-line)] bg-[rgba(247,245,241,0.85)] px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-md border border-[color:var(--air-line)] p-2 text-[color:var(--air-navy)] lg:hidden"
              aria-label="Open navigation"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="air-eyebrow hidden sm:inline">Aironaut × Pīkau · customs workspace</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="air-pill air-pill-brass">Pilot · draft mode</span>
            <a
              href="tel:+6493098814"
              className="hidden text-xs text-[color:var(--air-slate)] hover:text-[color:var(--air-navy)] sm:inline"
            >
              +64 9 309 8814
            </a>
          </div>
        </header>

        {/* Honest concept banner */}
        <div className="border-b border-[color:var(--air-line-soft)] bg-[color:var(--air-mist)] px-4 py-2 text-center text-[0.75rem] text-[color:var(--air-slate)] sm:px-6">
          Concept pilot for Aironaut Customs Brokers — <strong className="text-[color:var(--air-navy)]">draft only</strong>. Nothing here is lodged with the New Zealand Customs Service. Demo data.
        </div>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <footer className="mt-10 border-t border-[color:var(--air-line)] px-4 py-8 text-center text-xs text-[color:var(--air-slate)] sm:px-6">
          <p className="mb-1">
            Aironaut Customs Brokers · Level 4, 156 Parnell Road, Parnell, Auckland
          </p>
          <p>
            Powered by{' '}
            <a href="https://assembl.co.nz" className="font-semibold text-[color:var(--air-navy)]">
              assembl
            </a>{' '}
            — mahi that earns its proof. Every decision here carries a Mana Receipt.
          </p>
        </footer>
      </div>
    </div>
  );
}
