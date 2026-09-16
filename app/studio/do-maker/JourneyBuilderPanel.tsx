'use client';

import type { PursuitJourney, JourneyStep } from '@/lib/studio/pursuit-journey';
import {
  addCustomJourneyStep,
  moveJourneyStep,
  readFileAsDataUrl,
} from '@/lib/studio/pursuit-journey';
import styles from './do-maker.module.css';

type Props = {
  journey: PursuitJourney;
  onChange: (next: PursuitJourney) => void;
};

export function JourneyBuilderPanel({ journey, onChange }: Props) {
  const updateStep = (index: number, patch: Partial<JourneyStep>) => {
    const steps = journey.steps.map((step, i) => (i === index ? { ...step, ...patch } : step));
    onChange({ ...journey, steps });
  };

  const onImagery = async (file: File | null, field: 'imageryDataUrl' | 'markDataUrl') => {
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file, field === 'imageryDataUrl' ? 180_000 : 90_000);
      onChange({
        ...journey,
        assets: { ...journey.assets, [field]: dataUrl },
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not use that image.');
    }
  };

  return (
    <section className={styles.panel} aria-labelledby="journey-title">
      <div className={styles.sectionHead}>
        <span>02b</span>
        <div>
          <strong id="journey-title">Journey builder</strong>
          <p>
            Freeform brief and editable steps. Starter chips are optional — not a dropdown lock.
          </p>
        </div>
      </div>

      <div className={styles.fields}>
        <label>
          Journey title
          <input
            value={journey.title}
            onChange={(event) => onChange({ ...journey, title: event.target.value })}
            maxLength={100}
            placeholder="e.g. BP Loyalty Moment Concierge"
          />
        </label>
        <label>
          Opportunity / journey brief
          <textarea
            value={journey.brief}
            onChange={(event) => onChange({ ...journey, brief: event.target.value })}
            maxLength={800}
            rows={4}
            placeholder="Describe the client moment in plain English — not limited to preset verticals."
          />
        </label>
      </div>

      <div className={styles.assetRow}>
        <label className={styles.fileLabel}>
          Brand imagery
          <input
            type="file"
            accept="image/*"
            onChange={(event) => void onImagery(event.target.files?.[0] ?? null, 'imageryDataUrl')}
          />
          <span>{journey.assets.imageryDataUrl ? 'Image attached (browser draft)' : 'Upload image · max ~180KB'}</span>
        </label>
        <label className={styles.fileLabel}>
          Mark / lockup
          <input
            type="file"
            accept="image/*"
            onChange={(event) => void onImagery(event.target.files?.[0] ?? null, 'markDataUrl')}
          />
          <span>{journey.assets.markDataUrl ? 'Mark attached' : 'Optional mark · max ~90KB'}</span>
        </label>
        {(journey.assets.imageryDataUrl || journey.assets.markDataUrl) && (
          <div className={styles.assetPreview} aria-label="Uploaded brand assets">
            {journey.assets.imageryDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={journey.assets.imageryDataUrl} alt="" />
            ) : null}
            {journey.assets.markDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={journey.assets.markDataUrl} alt="" />
            ) : null}
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() =>
                onChange({
                  ...journey,
                  assets: { imageryDataUrl: '', markDataUrl: '' },
                })
              }
            >
              Clear images
            </button>
          </div>
        )}
      </div>

      <ol className={styles.journeySteps}>
        {journey.steps.map((step, index) => (
          <li key={step.id} data-enabled={step.enabled}>
            <div className={styles.stepToolbar}>
              <label className={styles.stepEnable}>
                <input
                  type="checkbox"
                  checked={step.enabled}
                  onChange={(event) => updateStep(index, { enabled: event.target.checked })}
                />
                <span>{String(index + 1).padStart(2, '0')}</span>
              </label>
              <input
                className={styles.stepLabel}
                value={step.label}
                onChange={(event) => updateStep(index, { label: event.target.value })}
                maxLength={80}
                aria-label={`Step ${index + 1} label`}
              />
              <div className={styles.stepMove}>
                <button
                  type="button"
                  aria-label="Move step up"
                  disabled={index === 0}
                  onClick={() => onChange({ ...journey, steps: moveJourneyStep(journey.steps, index, index - 1) })}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Move step down"
                  disabled={index === journey.steps.length - 1}
                  onClick={() => onChange({ ...journey, steps: moveJourneyStep(journey.steps, index, index + 1) })}
                >
                  ↓
                </button>
              </div>
            </div>
            <textarea
              value={step.brief}
              onChange={(event) => updateStep(index, { brief: event.target.value })}
              maxLength={600}
              rows={2}
              aria-label={`${step.label} brief`}
            />
          </li>
        ))}
      </ol>
      <button
        type="button"
        className={styles.ghostBtn}
        onClick={() => onChange({ ...journey, steps: addCustomJourneyStep(journey.steps) })}
      >
        Add custom step
      </button>
    </section>
  );
}
