'use client';

/**
 * ConsumerDemo — a live, end-to-end consumer-mode demo.
 *
 * Wraps <DashLoader> in <DashLoaderProvider> so the opt-in decision persists to
 * localStorage and survives reloads. Flip the switch, pick a destination, save,
 * then "Run a wait" to watch the dog earn for your cause.
 *
 * NOTE: the brief asks for this consumer demo to live ON the /dash landing
 * (app/dash/page.tsx). That path is owned by the in-flight Beat→Dash rename
 * (PR #424), so the live demo ships here at /dash/loader to avoid clobbering
 * that landing. Drop-in snippet to embed it into the real landing is in
 * components/dash/README.md.
 */
import { useState } from 'react';
import {
  DashLoader,
  DashLoaderProvider,
  useDashLoaderSettings,
  type DashStatus,
} from '@/components/dash';
import demo from './loader.module.css';

function Inner() {
  const { settings, setSettings, hydrated } = useDashLoaderSettings();
  const [status, setStatus] = useState<DashStatus>('idle');

  function runWait() {
    setStatus('processing');
    window.setTimeout(() => setStatus('success'), 4200);
    window.setTimeout(() => setStatus('idle'), 8000);
  }

  return (
    <div className={demo.col}>
      <div className={demo.stage}>
        {/* Until localStorage is read, render nothing to avoid an opt-in flash. */}
        {hydrated && (
          <DashLoader
            mode={{ kind: 'consumer', userSettings: settings }}
            status={status}
            onSettingsChange={setSettings}
            displayMessages={[
              'Crunching the numbers…',
              'Fetching your matches…',
              'Almost there…',
            ]}
            sponsorLine={{ text: 'Comvita', advertiserId: 'comvita' }}
            errorMessage="Something went wrong. Your wait still counted."
          />
        )}
      </div>

      {settings.optedIn && (
        <button
          type="button"
          className={demo.runBtn}
          onClick={runWait}
          disabled={status === 'processing'}
        >
          {status === 'processing' ? 'Waiting…' : 'Run a wait →'}
        </button>
      )}
    </div>
  );
}

export function ConsumerDemo() {
  return (
    <DashLoaderProvider>
      <Inner />
    </DashLoaderProvider>
  );
}
