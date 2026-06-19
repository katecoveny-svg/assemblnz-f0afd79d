'use client';

/**
 * CharityCard — one selectable NZ charity in the consumer "Donate it" flow.
 * SPCA NZ is the brand-locked default. Uses aria-pressed + aria-current so
 * screen readers announce the active destination.
 */
import type { CharityMeta } from './types';
import styles from './DashLoader.module.css';

interface CharityCardProps {
  charity: CharityMeta;
  selected: boolean;
  onSelect: (id: CharityMeta['id']) => void;
}

export function CharityCard({ charity, selected, onSelect }: CharityCardProps) {
  return (
    <button
      type="button"
      className={styles.charityCard}
      aria-pressed={selected}
      aria-current={selected ? 'true' : undefined}
      onClick={() => onSelect(charity.id)}
    >
      <span className={styles.charityEmoji} aria-hidden="true">
        {charity.emoji}
      </span>
      <span className={styles.charityName}>{charity.name}</span>
      <span className={styles.charitySub}>{charity.sub}</span>
    </button>
  );
}
