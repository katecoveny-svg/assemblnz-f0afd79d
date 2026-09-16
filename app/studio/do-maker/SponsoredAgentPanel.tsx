'use client';

import { useState } from 'react';
import type { PursuitJourney, SponsoredStage } from '@/lib/studio/pursuit-journey';
import styles from './do-maker.module.css';

type Props = {
  journey: PursuitJourney;
  onChange: (next: PursuitJourney) => void;
};

export function SponsoredAgentPanel({ journey, onChange }: Props) {
  const { sponsored } = journey;
  const [active, setActive] = useState(0);
  const stage = sponsored.stages[Math.min(active, sponsored.stages.length - 1)];

  const updateStage = (index: number, patch: Partial<SponsoredStage>) => {
    const stages = sponsored.stages.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange({ ...journey, sponsored: { ...sponsored, stages } });
  };

  return (
    <section className={styles.panel} aria-labelledby="sponsored-title">
      <div className={styles.sectionHead}>
        <span>02c</span>
        <div>
          <strong id="sponsored-title">Sponsored Agent module</strong>
          <p>
            Assembl Sponsored Journeys — ASA “Sponsored” labelling, provider-neutral, DEMO honesty.
          </p>
        </div>
      </div>

      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={sponsored.enabled}
          onChange={(event) =>
            onChange({
              ...journey,
              sponsored: { ...sponsored, enabled: event.target.checked },
            })
          }
        />
        <span>Include Sponsored Agent flow in this journey</span>
      </label>

      {sponsored.enabled ? (
        <>
          <div className={styles.fields}>
            <label>
              Sponsor name
              <input
                value={sponsored.sponsorName}
                onChange={(event) =>
                  onChange({
                    ...journey,
                    sponsored: { ...sponsored, sponsorName: event.target.value },
                  })
                }
                maxLength={80}
              />
            </label>
            <label>
              Unpaid path note
              <input
                value={sponsored.unpaidPathNote}
                onChange={(event) =>
                  onChange({
                    ...journey,
                    sponsored: { ...sponsored, unpaidPathNote: event.target.value },
                  })
                }
                maxLength={280}
              />
            </label>
          </div>

          <div className={styles.sponsoredWalk} aria-label="Sponsored agent stages">
            <div className={styles.sponsoredRail} role="tablist" aria-label="Stages">
              {sponsored.stages.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active === index}
                  onClick={() => setActive(index)}
                >
                  {String(index + 1).padStart(2, '0')} {item.label}
                </button>
              ))}
            </div>

            {stage ? (
              <div className={styles.sponsoredCard} role="tabpanel">
                <div className={styles.sponsoredMeta}>
                  {stage.showSponsoredLabel ? (
                    <span className={styles.sponsoredPill} title="ASA disclosure">
                      {sponsored.asaLabel}
                    </span>
                  ) : (
                    <span className={styles.demoPill}>Helper</span>
                  )}
                  {stage.demoOnly ? <span className={styles.demoPill}>DEMO</span> : null}
                </div>
                <label>
                  Stage label
                  <input
                    value={stage.label}
                    onChange={(event) => updateStage(active, { label: event.target.value })}
                    maxLength={80}
                  />
                </label>
                <label>
                  Stage copy
                  <textarea
                    value={stage.copy}
                    onChange={(event) => updateStage(active, { copy: event.target.value })}
                    maxLength={500}
                    rows={4}
                  />
                </label>
                <p className={styles.skinNote}>{sponsored.honesty}</p>
                <p className={styles.skinNote}>{sponsored.unpaidPathNote}</p>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <p className={styles.skinNote}>
          Off by default for unpaid Pursuit pitches. Turn on for loyalty / ad-moment demos.
        </p>
      )}
    </section>
  );
}
