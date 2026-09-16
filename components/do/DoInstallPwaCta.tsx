'use client';

import { useEffect, useState } from 'react';
import { DO_CRAFT } from '@/lib/do/craft-canon';
import '@/app/do/do-craft.css';
import styles from './do-install-pwa.module.css';

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
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return (iOS || iPadOs) && !(window as Window & { MSStream?: unknown }).MSStream;
}

function isAndroidBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

type Props = {
  className?: string;
  /** Compact inline for portable sheets. */
  compact?: boolean;
  /** Big phone-friendly Install / Add to Home Screen. */
  prominent?: boolean;
  /** Phone landing: always show iOS/Android steps. */
  phone?: boolean;
};

/** Visible Install DO PWA CTA for /do and portable surfaces (Spatial C). */
export function DoInstallPwaCta({
  className,
  compact = false,
  prominent = false,
  phone = false,
}: Props) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);
  const [showSteps, setShowSteps] = useState(phone);

  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIosBrowser() && !isStandalone());
    setAndroid(isAndroidBrowser() && !isStandalone());
    if (phone || isIosBrowser()) setShowSteps(true);

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
  }, [phone]);

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
      setPromptEvent(null);
      return;
    }
    setShowSteps(true);
  }

  if (installed) {
    return (
      <p
        className={['do-craft-mono', styles.installed, className].filter(Boolean).join(' ')}
      >
        DO installed on this device
      </p>
    );
  }

  const big = prominent || phone;
  const label = ios
    ? 'Add to Home Screen'
    : promptEvent
      ? 'Install DO'
      : android
        ? 'Install DO'
        : 'Install DO / Add to Home Screen';

  return (
    <div
      className={[
        'do-craft',
        styles.root,
        big ? styles.prominent : null,
        phone ? styles.phone : null,
        compact ? styles.compact : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className={big ? 'do-cta do-cta--install' : DO_CRAFT.cta.primary}
        onClick={() => void install()}
        aria-expanded={showSteps}
      >
        {label}
      </button>

      {!compact || phone || showSteps ? (
        <div className={styles.steps} hidden={!showSteps && compact && !phone}>
          {ios || (!promptEvent && !android) ? (
            <ol className={styles.list} aria-label="iPhone install steps">
              <li>
                Tap <strong>Share</strong>
                <span className={styles.glyph} aria-hidden="true">
                  ⎋
                </span>
                in Safari
              </li>
              <li>
                Scroll and tap <strong>Add to Home Screen</strong>
              </li>
              <li>
                Tap <strong>Add</strong> — then open <strong>DO</strong> from your home screen
              </li>
            </ol>
          ) : null}
          {android || promptEvent ? (
            <p className={styles.androidHint}>
              {promptEvent
                ? 'Tap Install DO above — Chrome will add the app to your home screen.'
                : 'Android: open the browser menu (⋮) → Install app / Add to Home screen.'}
            </p>
          ) : null}
          {!ios && !android && !promptEvent && !phone ? (
            <p className={styles.androidHint}>
              On iPhone: Share → Add to Home Screen. On Android: use Install app when offered.
            </p>
          ) : null}
        </div>
      ) : null}

      {compact && !phone && !showSteps ? (
        <button
          type="button"
          className={styles.how}
          onClick={() => setShowSteps(true)}
        >
          How to install
        </button>
      ) : null}
    </div>
  );
}
