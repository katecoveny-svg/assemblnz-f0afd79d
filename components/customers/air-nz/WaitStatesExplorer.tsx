'use client';

/**
 * Six clickable wait-state mockups. Tap a card → the sponsored earn moment
 * mocks up in place (loader + earn panel). concept · demo pending.
 */

import { useState } from 'react';
import styles from '@/app/customers/air-nz/dash/airnz.module.css';
import { WAIT_STATES, apd } from '@/lib/customers/air-nz/data';
import { EarnPill } from './chrome';
import { Loader } from './Loader';

export function WaitStatesExplorer() {
  const [open, setOpen] = useState<string>(WAIT_STATES[0].key);

  return (
    <div className={styles.gridStages}>
      {WAIT_STATES.map((w) => {
        const isOpen = open === w.key;
        return (
          <div key={w.key} className={`${styles.stageCard} ${isOpen ? styles.done : ''}`}>
            <button
              onClick={() => setOpen(isOpen ? '' : w.key)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'block',
                width: '100%',
              }}
              aria-expanded={isOpen}
            >
              <div className={styles.row} style={{ padding: 0, borderBottom: 0 }}>
                <div>
                  <div className={styles.cardTitle}>{w.title}</div>
                  <div className={styles.cardMeta}>{w.where}</div>
                </div>
                <span className={styles.chevron}>{isOpen ? '×' : '›'}</span>
              </div>
              <div className={styles.tagRow}>
                <span className={styles.tag}>Dwell {w.dwell}</span>
                <span className={styles.tag}>CPM NZ${w.cpm}</span>
                <span className={styles.tag}>{apd(w.earn)} earned</span>
              </div>
            </button>

            {isOpen && (
              <div style={{ marginTop: 12 }}>
                <div
                  className={`${styles.card} ${styles.nested}`}
                  style={{ margin: 0, paddingTop: 22, paddingBottom: 22 }}
                >
                  <Loader kind={w.loader} />
                </div>
                <div className={styles.earnPanel} style={{ marginTop: 10 }}>
                  <div className={styles.earnPanelTop}>
                    <div>
                      <div className={styles.statLabel}>Earn moment</div>
                      <div className={styles.earnAmount}>+{apd(w.earn)}</div>
                    </div>
                    <EarnPill />
                  </div>
                  <p className={styles.earnLine}>{w.detail}</p>
                  <p className={styles.earnSponsor}>Sponsored by {w.sponsor}</p>
                  <div className={styles.poweredBy}>
                    Powered by <span className={styles.a}>assembl</span> × Koru
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
