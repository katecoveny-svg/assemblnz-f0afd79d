'use client';

/**
 * ════════════════════════════════════════════════════════════════════════
 *  DashLoader — dash by assembl · three-mode opt-in loader
 * ════════════════════════════════════════════════════════════════════════
 *
 *  PRIVACY POSTURE — NON-NEGOTIABLE
 *  --------------------------------
 *  This component does NOT read page content, user prompts, files, code, or
 *  any user data under any circumstance. It renders a wait-state animation
 *  and (in ad modes) a sponsor line fetched by mode + geo only. The only
 *  data leaving the browser is impression telemetry (duration + advertiser
 *  id) and, in consumer mode, the user's own opt-in settings. IP is used by
 *  the backend solely for NZ geo-confirmation. Privacy Act 2020 IPP 3A: the
 *  user must acknowledge the disclosure before consumer opt-in can save.
 *
 *  Three modes share the dog, the segment fill, the gold shine, the cycling
 *  messages and the ASA "Sponsored" pill (ad modes only):
 *    consumer   — end-user opt-in; keep or donate the micro-revenue
 *    whitelabel — customer mascot + internal messages; no ads, no payout
 *    publisher  — assembl-fill ads; rev-share to the publisher
 *
 *  Phase 0: all three modes work against stubbed backends.
 * ════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  type ConsumerSettings,
  type DashLoaderProps,
  type PayoutDestination,
  CHARITIES,
  DEFAULT_DISPLAY_MESSAGES,
} from './types';
import {
  canSaveOptIn,
  impressionEndpoint,
  nextMessageIndex,
  serializeSettings,
  showsSponsoredLabel,
} from './logic';
import { LOCALSTORAGE_KEY } from './types';
import { Dog } from './Dog';
import { SponsorLine } from './SponsorLine';
import { PayoutDestinationPicker } from './PayoutDestinationPicker';
import { HowItWorksModal } from './HowItWorksModal';
import styles from './DashLoader.module.css';

const MESSAGE_INTERVAL_MS = 3000;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

/** Crossfading message cycler. Static (index 0) when reduced motion is on. */
function useMessageCycle(messages: string[], active: boolean, reducedMotion: boolean): string {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(0);
    if (!active || reducedMotion || messages.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => nextMessageIndex(i, messages.length)),
      MESSAGE_INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [active, reducedMotion, messages.length]);
  return messages[Math.min(index, Math.max(0, messages.length - 1))] ?? '';
}

function destinationLabel(destination: PayoutDestination): string {
  if (destination.kind === 'charity') {
    return CHARITIES.find((c) => c.id === destination.charityId)?.name ?? 'a charity';
  }
  const labels = { prezzy: 'Prezzy', airpoints: 'Airpoints', 'stripe-connect': 'your bank' };
  return labels[destination.method];
}

export function DashLoader(props: DashLoaderProps) {
  const { mode, status, errorMessage, sponsorLine, hideOptInSurface } = props;
  const reducedMotion = useReducedMotion();

  // ── consumer opt-in draft state ───────────────────────────────
  const consumer = mode.kind === 'consumer' ? mode.userSettings : null;
  const [draft, setDraft] = useState<ConsumerSettings | null>(consumer);
  const [editing, setEditing] = useState(false);
  // Keep the draft in sync if the parent swaps settings underneath us.
  useEffect(() => {
    if (consumer) setDraft(consumer);
  }, [consumer?.optedIn, consumer?.destination, consumer?.hasConsentedToDisclosure]); // eslint-disable-line react-hooks/exhaustive-deps

  const showOptIn =
    mode.kind === 'consumer' &&
    !hideOptInSurface &&
    (!mode.userSettings.optedIn || editing);

  // ── messages ──────────────────────────────────────────────────
  const belowMessages =
    mode.kind === 'whitelabel'
      ? [] // whitelabel cycles inside the body, not below
      : props.displayMessages?.length
        ? props.displayMessages
        : DEFAULT_DISPLAY_MESSAGES;
  const bodyMessages = mode.kind === 'whitelabel' ? mode.brandConfig.internalMessages : [];

  const processing = status === 'processing';
  const belowMessage = useMessageCycle(belowMessages, processing, reducedMotion);
  const bodyMessage = useMessageCycle(bodyMessages, processing, reducedMotion);

  // ── telemetry: fire one impression when a wait completes ──────
  const startRef = useRef<number | null>(null);
  const prevStatus = useRef(status);
  useEffect(() => {
    if (status === 'processing' && prevStatus.current !== 'processing') {
      startRef.current = Date.now();
    }
    if (status === 'success' && prevStatus.current === 'processing') {
      const durationMs = startRef.current ? Date.now() - startRef.current : 0;
      postImpression(props, durationMs);
    }
    prevStatus.current = status;
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── save consumer settings ────────────────────────────────────
  const saveSettings = useCallback(() => {
    if (!draft || !canSaveOptIn(draft)) return;
    try {
      window.localStorage.setItem(LOCALSTORAGE_KEY, serializeSettings(draft));
    } catch {
      /* private mode / storage disabled — settings still flow to the parent */
    }
    props.onSettingsChange?.(draft);
    setEditing(false);
  }, [draft, props]);

  // ── render ────────────────────────────────────────────────────
  if (showOptIn && draft) {
    return (
      <OptInSurface
        draft={draft}
        setDraft={setDraft}
        onSave={saveSettings}
        canSave={canSaveOptIn(draft)}
      />
    );
  }

  const sponsored = showsSponsoredLabel(mode);
  const whitelabel = mode.kind === 'whitelabel';
  const bodyColour = whitelabel ? mode.brandConfig.brandColour : undefined;
  const dogStyle = bodyColour
    ? ({ ['--dog-body' as string]: bodyColour } as CSSProperties)
    : undefined;

  // Status copy announced to assistive tech.
  const liveCopy =
    status === 'processing'
      ? belowMessage || bodyMessage || 'Loading'
      : status === 'success'
        ? 'Done'
        : status === 'error'
          ? errorMessage || 'Something went wrong'
          : 'Ready';

  return (
    <div
      className={styles.loader}
      data-dash=""
      data-status={status}
      data-reduced={reducedMotion ? 'true' : undefined}
      role="status"
      aria-live="polite"
    >
      {/* SR-only running narration */}
      <span className={styles.srOnly}>{liveCopy}</span>

      {/* destination chip (consumer only) */}
      {mode.kind === 'consumer' && mode.userSettings.optedIn && status !== 'error' && (
        <button
          type="button"
          className={styles.destChip}
          onClick={() => setEditing(true)}
          aria-label={`Earnings go to ${destinationLabel(mode.userSettings.destination)}. Change destination.`}
        >
          → {destinationLabel(mode.userSettings.destination)}
        </button>
      )}

      <div className={styles.stage}>
        {whitelabel && mode.brandConfig.customerLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.customerLogo}
            src={mode.brandConfig.customerLogo.src}
            alt={mode.brandConfig.customerLogo.alt}
          />
        )}

        <div className={styles.dogWrap} style={dogStyle}>
          {whitelabel && mode.brandConfig.customSvg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.dog}
              src={mode.brandConfig.customSvg}
              alt=""
              aria-hidden="true"
            />
          ) : (
            <Dog />
          )}

          {/* gold shine sweep (suppressed under reduced motion via CSS) */}
          {processing && <span className={styles.shine} aria-hidden="true" />}

          {/* in-body block: sponsor (ad modes) or brand message (whitelabel) */}
          {processing && sponsored && mode.kind !== 'whitelabel' && (
            <SponsorLine
              sponsor={sponsorLine}
              mode={mode.kind}
              publisherId={mode.kind === 'publisher' ? mode.publisherId : undefined}
            />
          )}
          {processing && whitelabel && bodyMessage && (
            <div className={styles.brandBlock} role="note">
              <span key={bodyMessage} className={styles.fadeText}>
                {bodyMessage}
              </span>
            </div>
          )}
        </div>

        {/* below-dog cycling message (ad modes) */}
        {!whitelabel && (
          <div className={styles.belowMsg} aria-hidden="true">
            {status === 'error' ? (
              <span className={styles.errMsg}>{errorMessage ?? 'Something went wrong.'}</span>
            ) : status === 'success' ? (
              <span>Done — thanks for waiting.</span>
            ) : processing ? (
              <span key={belowMessage} className={styles.fadeText}>
                {belowMessage}
              </span>
            ) : (
              <span>Ready when you are.</span>
            )}
          </div>
        )}
      </div>

      {/* success micro-toast (consumer only) */}
      {status === 'success' && mode.kind === 'consumer' && mode.userSettings.optedIn && (
        <SuccessToast destination={destinationLabel(mode.userSettings.destination)} />
      )}
    </div>
  );
}

// ── opt-in surface ────────────────────────────────────────────────

function OptInSurface({
  draft,
  setDraft,
  onSave,
  canSave,
}: {
  draft: ConsumerSettings;
  setDraft: (s: ConsumerSettings) => void;
  onSave: () => void;
  canSave: boolean;
}) {
  return (
    <div className={styles.optIn} data-dash="" role="group" aria-label="Dash Loader settings">
      <h2 className={styles.optInTitle}>Swap your loader. Fund something good.</h2>
      <p className={styles.optInBody}>
        Replace your default spinner with Dash. While you wait, a small NZ-brand line earns
        revenue. You choose where it goes.
      </p>

      <div className={styles.swapRow}>
        <Switch
          checked={draft.optedIn}
          onChange={(optedIn) => setDraft({ ...draft, optedIn })}
          label="Use Dash Loader"
        />
        <span className={styles.swapLabel}>Use Dash Loader</span>
      </div>

      {draft.optedIn && (
        <>
          <PayoutDestinationPicker
            destination={draft.destination}
            onChange={(destination) => setDraft({ ...draft, destination })}
          />

          <p className={styles.disclosure}>
            Sponsored content shown during processing. Privacy Act 2020 IPP 3A compliant. No
            content, prompts, files or code are read. IP used only for NZ geo-confirmation.
          </p>

          <label className={styles.consentRow}>
            <input
              type="checkbox"
              className={styles.consentBox}
              checked={draft.hasConsentedToDisclosure}
              onChange={(e) =>
                setDraft({ ...draft, hasConsentedToDisclosure: e.target.checked })
              }
            />
            <span>
              I understand a sponsored NZ-brand line shows while I wait, and that no content is
              read.
            </span>
          </label>
        </>
      )}

      <div className={styles.optInCtas}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onSave}
          disabled={!canSave}
          aria-disabled={!canSave}
        >
          Save settings
        </button>
        <HowItWorksModal
          trigger={
            <button type="button" className={styles.textBtn}>
              How it works →
            </button>
          }
        />
      </div>
    </div>
  );
}

// ── accessible switch (native button, role=switch) ───────────────
// react-switch isn't in the dep set; this is the Radix-equivalent a11y
// pattern (used verbatim in the design handoff): button[role=switch] with
// aria-checked, keyboard-operable, gold focus ring from the tokens.
function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={styles.switch}
      onClick={() => onChange(!checked)}
    />
  );
}

function SuccessToast({ destination }: { destination: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(id);
  }, []);
  if (!visible) return null;
  return (
    <div className={styles.toast} role="status">
      5 sec earned for {destination} ✓
    </div>
  );
}

// ── telemetry (fire-and-forget, no content) ──────────────────────
function postImpression(props: DashLoaderProps, durationMs: number) {
  const { mode, sponsorLine } = props;
  const endpoint = impressionEndpoint(mode);
  let body: Record<string, unknown>;
  if (mode.kind === 'whitelabel') {
    body = {
      publisherId: mode.brandConfig.customerLogo?.alt ?? 'whitelabel',
      durationMs,
    };
  } else if (mode.kind === 'publisher') {
    body = {
      mode: 'publisher',
      publisherId: mode.publisherId,
      revShareTier: mode.revShareTier,
      durationMs,
      advertiserId: sponsorLine?.advertiserId,
      sponsorLine: sponsorLine?.text,
    };
  } else {
    body = {
      mode: 'consumer',
      settings: mode.userSettings,
      durationMs,
      advertiserId: sponsorLine?.advertiserId,
      sponsorLine: sponsorLine?.text,
    };
  }
  try {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never block the UI on telemetry */
  }
}
