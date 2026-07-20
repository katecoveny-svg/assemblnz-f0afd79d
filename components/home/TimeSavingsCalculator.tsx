'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, TimerReset } from 'lucide-react';
import { SAVINGS } from '@/lib/copy/homepage';
import styles from './time-savings-calculator.module.css';

const WEEKS_PER_YEAR = 48;
const HOURS_PER_WORKDAY = 8;
const RECOVERABLE_SHARE = 0.5;

function formatHours(value: number) {
  return new Intl.NumberFormat('en-NZ', { maximumFractionDigits: 1 }).format(value);
}

type TimeSavingsCalculatorProps = {
  initialValues: {
    people: number;
    adminHours: number;
    repeatableShare: number;
  };
  /** When embedded under a section that already supplies its own eyebrow +
   *  heading (the /build-an-agent flow), suppress the calculator's own intro
   *  so the "How many hours could you get back?" heading isn't doubled. */
  hideIntro?: boolean;
};

export function TimeSavingsCalculator({ initialValues, hideIntro = false }: TimeSavingsCalculatorProps) {
  const [people, setPeople] = useState(initialValues.people);
  const [adminHours, setAdminHours] = useState(initialValues.adminHours);
  const [repeatableShare, setRepeatableShare] = useState(initialValues.repeatableShare);
  const [shareState, setShareState] = useState<'idle' | 'shared'>('idle');

  const result = useMemo(() => {
    const weekly = Math.round(people * adminHours * (repeatableShare / 100) * RECOVERABLE_SHARE * 10) / 10;
    const yearly = Math.round(weekly * WEEKS_PER_YEAR);
    return { weekly, yearly, days: Math.round(yearly / HOURS_PER_WORKDAY) };
  }, [adminHours, people, repeatableShare]);

  async function shareResult() {
    const url = new URL(window.location.href);
    url.pathname = '/';
    url.search = '';
    url.searchParams.set('team', String(people));
    url.searchParams.set('admin', String(adminHours));
    url.searchParams.set('repeatable', String(repeatableShare));
    url.hash = 'time-savings';

    const text = SAVINGS.shareText(formatHours(result.weekly), result.days);

    try {
      if (navigator.share) {
        await navigator.share({ title: SAVINGS.shareTitle, text, url: url.toString() });
      } else {
        await navigator.clipboard.writeText(`${text} ${url.toString()}`);
      }
      setShareState('shared');
      window.setTimeout(() => setShareState('idle'), 1800);
    } catch {
      setShareState('idle');
    }
  }

  return (
    <section
      id="time-savings"
      className={styles.section}
      aria-labelledby={hideIntro ? undefined : 'time-savings-title'}
      aria-label={hideIntro ? SAVINGS.heading : undefined}
    >
      {!hideIntro && (
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{SAVINGS.eyebrow}</p>
          <h2 id="time-savings-title">{SAVINGS.heading}</h2>
          <p>{SAVINGS.body}</p>
        </div>
      )}

      <div className={styles.calculator}>
        <div className={styles.questions}>
          <label className={styles.rangeQuestion}>
            <span><b>1</b>{SAVINGS.peopleLabel}</span>
            <output>{people}</output>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={people}
              onChange={(event) => setPeople(Number(event.target.value))}
            />
          </label>

          <label className={styles.rangeQuestion}>
            <span><b>2</b>{SAVINGS.hoursLabel}</span>
            <output>{adminHours} {SAVINGS.hoursShort}</output>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={adminHours}
              onChange={(event) => setAdminHours(Number(event.target.value))}
            />
          </label>

          <fieldset className={styles.shareQuestion}>
            <legend><b>3</b>{SAVINGS.repeatableLabel}</legend>
            <div>
              {SAVINGS.repeatableOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={repeatableShare === option.value}
                  onClick={() => setRepeatableShare(option.value)}
                >
                  <strong>{option.value}%</strong>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className={styles.result} aria-live="polite">
          {/* Panel texture — a still from the creative studio (Waves · Silk,
              seed 52449), art-directed by Kate. Layered under the deep-teal
              scrim so the white result text keeps full contrast. */}
          <div className={styles.resultArt} aria-hidden />
          <div className={styles.resultScrim} aria-hidden />
          <div className={styles.resultInner}>
            <TimerReset aria-hidden />
            <p>{SAVINGS.resultLabel}</p>
            <strong>{formatHours(result.weekly)}</strong>
            <h3>{SAVINGS.resultHeading}</h3>
            <div className={styles.resultFacts}>
              <span><b>{result.yearly}</b> {SAVINGS.yearlyHoursLabel}</span>
              <span><b>{result.days}</b> {SAVINGS.workingDaysLabel}</span>
            </div>
            <small>{SAVINGS.planningNote}</small>
            <div className={styles.resultActions}>
              <Link href="/genome">{SAVINGS.liveDemoAction} <ArrowRight aria-hidden /></Link>
              <button type="button" onClick={shareResult}>
                {shareState === 'shared' ? <Check aria-hidden /> : <Copy aria-hidden />}
                {shareState === 'shared' ? SAVINGS.sharedAction : SAVINGS.shareAction}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
