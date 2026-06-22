'use client';

/**
 * PayoutDestinationPicker — where the consumer's micro-revenue goes.
 *
 *   Reward me → Airpoints / KiwiSaver / Prezzy (no cash-out)
 *   Give it   → SPCA NZ (default) / Trees That Count / Foodbank NZ
 *
 * Revealed only when the opt-in toggle is ON. Fully keyboard-navigable; the
 * segmented control is a radiogroup, the keep-it methods are radio cards, the
 * charities are pressable cards (see CharityCard).
 */
import type { PayoutDestination, SelfMethod } from './types';
import { CHARITIES } from './types';
import { CharityCard } from './CharityCard';
import styles from './DashLoader.module.css';

interface PayoutDestinationPickerProps {
  destination: PayoutDestination;
  onChange: (destination: PayoutDestination) => void;
}

const SELF_METHODS: { method: SelfMethod; emoji: string; label: string }[] = [
  { method: 'airpoints', emoji: '✈️', label: 'Airpoints' },
  { method: 'kiwisaver', emoji: '🌱', label: 'KiwiSaver' },
  { method: 'prezzy', emoji: '🎁', label: 'Prezzy' },
];

export function PayoutDestinationPicker({ destination, onChange }: PayoutDestinationPickerProps) {
  const isDonate = destination.kind === 'charity';

  return (
    <div className={styles.destPicker}>
      <div
        className={styles.segControl}
        role="radiogroup"
        aria-label="Where your earnings go"
      >
        <button
          type="button"
          role="radio"
          aria-checked={!isDonate}
          className={styles.segBtn}
          onClick={() => onChange({ kind: 'self', method: 'airpoints' })}
        >
          Reward me
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isDonate}
          className={styles.segBtn}
          onClick={() => onChange({ kind: 'charity', charityId: 'spca-nz' })}
        >
          Give it
        </button>
      </div>

      {isDonate ? (
        <div className={styles.charityGrid}>
          {CHARITIES.map((c) => (
            <CharityCard
              key={c.id}
              charity={c}
              selected={destination.kind === 'charity' && destination.charityId === c.id}
              onSelect={(charityId) => onChange({ kind: 'charity', charityId })}
            />
          ))}
        </div>
      ) : (
        <div className={styles.methodGrid} role="radiogroup" aria-label="How you get paid">
          {SELF_METHODS.map((m) => {
            const selected = destination.kind === 'self' && destination.method === m.method;
            return (
              <button
                key={m.method}
                type="button"
                role="radio"
                aria-checked={selected}
                className={styles.methodCard}
                onClick={() => onChange({ kind: 'self', method: m.method })}
              >
                <span className={styles.methodEmoji} aria-hidden="true">
                  {m.emoji}
                </span>
                <span className={styles.methodLabel}>{m.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
