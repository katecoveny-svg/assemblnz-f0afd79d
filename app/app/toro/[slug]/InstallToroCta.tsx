'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const IOS_HINT_KEY = 'toro-ios-install-hint-seen';

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isIosSafari() {
  const ua = window.navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const isWebKit = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
  return isIos && isWebKit;
}

export function InstallToroCta() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setShowIosHint(false);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setShowIosHint(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    if (isIosSafari() && window.localStorage.getItem(IOS_HINT_KEY) !== '1') {
      setShowIosHint(true);
      window.localStorage.setItem(IOS_HINT_KEY, '1');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }
    setPromptEvent(null);
  }

  if (promptEvent) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 rounded-[4px] bg-[color:var(--assembl-pounamu)] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition hover:bg-[color:var(--assembl-pounamu-deep)]"
      >
        <Download className="h-4 w-4" aria-hidden />
        Install Tōro
      </button>
    );
  }

  if (showIosHint) {
    return (
      <div className="flex max-w-[320px] items-start gap-3 rounded-[6px] border border-[color:var(--assembl-cloud)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
        <p className="text-sm leading-snug text-[color:var(--text-primary)]">
          Tap Share → Add to Home Screen to install Tōro.
        </p>
        <button
          type="button"
          aria-label="Dismiss install hint"
          onClick={() => setShowIosHint(false)}
          className="mt-0.5 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  return null;
}
