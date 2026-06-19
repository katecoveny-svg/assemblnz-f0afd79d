'use client';

/**
 * DashDemoLab — all three modes side-by-side, each cycling idle → processing →
 * success → error. Doubles as the brief's "Storybook-or-demo-route" deliverable.
 * Pure presentation; no backend required (APIs are stubbed).
 */
import { useEffect, useState, type ReactNode } from 'react';
import { DashLoader } from '@/components/dash';
import type { ConsumerSettings, DashStatus } from '@/components/dash';
import demo from './demo.module.css';

const STATUSES: DashStatus[] = ['idle', 'processing', 'success', 'error'];

const consumerSettings: ConsumerSettings = {
  optedIn: true,
  destination: { kind: 'charity', charityId: 'spca-nz' },
  hasConsentedToDisclosure: true,
};

const optedOutSettings: ConsumerSettings = {
  optedIn: false,
  destination: { kind: 'charity', charityId: 'spca-nz' },
  hasConsentedToDisclosure: false,
};

export function DashDemoLab() {
  const [status, setStatus] = useState<DashStatus>('processing');
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      setStatus((s) => STATUSES[(STATUSES.indexOf(s) + 1) % STATUSES.length]);
    }, 3500);
    return () => clearInterval(id);
  }, [auto]);

  return (
    <div className={demo.lab}>
      <div className={demo.controls} role="group" aria-label="Demo status">
        <div className={demo.segCtl}>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={!auto && status === s}
              className={demo.segCtlBtn}
              onClick={() => {
                setAuto(false);
                setStatus(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={demo.autoBtn}
          aria-pressed={auto}
          onClick={() => setAuto((a) => !a)}
        >
          {auto ? '⏸ Pause auto-cycle' : '▶ Auto-cycle'}
        </button>
      </div>

      <div className={demo.grid}>
        <Panel
          title="1 · Consumer opt-in"
          note="The real opt-in surface. Off by default — no dark patterns."
        >
          <DashLoader
            mode={{ kind: 'consumer', userSettings: optedOutSettings }}
            status="idle"
          />
        </Panel>

        <Panel
          title="2 · Consumer (opted in)"
          note="Dog + sponsor line + destination chip. Donating to SPCA NZ."
        >
          <DashLoader
            mode={{ kind: 'consumer', userSettings: consumerSettings }}
            status={status}
            displayMessages={['Crunching the numbers…', 'Fetching your matches…', 'Almost there…']}
            sponsorLine={{ text: 'Westpac Small Biz', advertiserId: 'westpac-small-biz' }}
            errorMessage="Something went wrong. Your wait still counted."
          />
        </Panel>

        <Panel
          title="3 · Whitelabel"
          note="Customer-tinted mascot + internal messages. No ads, no payout, no Sponsored label."
        >
          <DashLoader
            mode={{
              kind: 'whitelabel',
              brandConfig: {
                brandColour: '#8FB8D6',
                internalMessages: [
                  'Tip: ⌘K opens search',
                  'New: bulk export is live',
                  'Did you know? Drafts auto-save',
                ],
                customerLogo: { src: '/images/dash/dash-dog.svg', alt: 'Acme' },
              },
            }}
            status={status}
            errorMessage="Couldn’t finish — try again."
          />
        </Panel>

        <Panel
          title="4 · Publisher (anchor)"
          note="assembl-fill ads, Sponsored label, 60% anchor rev-share. No opt-in surface."
        >
          <DashLoader
            mode={{ kind: 'publisher', publisherId: 'archipro', revShareTier: 'anchor' }}
            status={status}
            displayMessages={['loading.', 'loading..', 'loading...']}
            sponsorLine={{ text: 'Air NZ', advertiserId: 'air-nz' }}
            errorMessage="Something went wrong. Your wait still counted."
          />
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section className={demo.panel}>
      <header className={demo.panelHead}>
        <h2 className={demo.panelTitle}>{title}</h2>
        <p className={demo.panelNote}>{note}</p>
      </header>
      <div className={demo.panelStage}>{children}</div>
    </section>
  );
}
