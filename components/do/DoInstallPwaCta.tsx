'use client';

import { useEffect, useState } from 'react';
import { DO_CRAFT } from '@/lib/do/craft-canon';
import '@/app/do/do-craft.css';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

type Props = {
  className?: string;
  /** Compact inline for portable sheets. */
  compact?: boolean;
};

/** Visible Install DO PWA CTA for /do and portable surfaces (Spatial C). */
export function DoInstallPwaCta({ className, compact = false }: Props) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandalone());
  const [iosHint, setIosHint] = useState(() => isIosBrowser() && !isStandalone());

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setPromptEvent(null);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) {
      setIosHint(true);
      return;
    }
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setPromptEvent(null);
  }

  if (installed) {
    return (
      <p
        className={['do-craft-mono', className].filter(Boolean).join(' ')}
        style={{ margin: 0, fontSize: 11, color: 'var(--do-muted)' }}
      >
        DO installed on this device
      </p>
    );
  }

  return (
    <div className={['do-craft', className].filter(Boolean).join(' ')}>
      <button type="button" className={DO_CRAFT.cta.primary} onClick={() => void install()}>
        Install DO
      </button>
      {!compact && iosHint ? (
        <p
          className="do-craft-mono"
          style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--do-muted)', lineHeight: 1.45 }}
        >
          On iPhone or iPad: Share → Add to Home Screen. Elsewhere, use your browser’s install prompt when offered.
        </p>
      ) : null}
    </div>
  );
}
