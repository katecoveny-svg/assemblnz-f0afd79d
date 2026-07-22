'use client';

import { useMemo, useState } from 'react';
import type { ScenarioRun } from '@/lib/concepts/woolworths-assembled';
import { journeyAnswers, matchAnswer, type JourneyAnswer } from '@/lib/concepts/ask';
import { Card, Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';

/**
 * "Ask this journey anything" — grounded in the run above (lib/concepts/ask).
 * Answers only from this run's evidence; free text maps to the nearest grounded
 * answer, with an honest fallback rather than a guess.
 */
export function AskThisJourney({ data }: { data: ScenarioRun }) {
  const answers = useMemo(() => journeyAnswers(data), [data]);
  const [active, setActive] = useState<JourneyAnswer | null>(null);
  const [typed, setTyped] = useState('');
  const [miss, setMiss] = useState(false);

  const submit = () => {
    if (!typed.trim()) return;
    const hit = matchAnswer(typed, answers);
    if (hit) {
      setActive(hit);
      setMiss(false);
    } else {
      setActive(null);
      setMiss(true);
    }
  };

  return (
    <div>
      <Eyebrow>Ask this journey anything</Eyebrow>
      <DisplayHeading size={30}>Question the concept you just experienced</DisplayHeading>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: CHARCOAL, maxWidth: 620, margin: '12px 0 22px' }}>
        Not a website chatbot — every answer is drawn from the exact run above: its evidence,
        approvals, disclosures and pilot. Pick a question, or ask your own.
      </p>

      <div className={styles.chipRow} style={{ marginBottom: 18 }}>
        {answers.map((a) => (
          <button
            key={a.id}
            type="button"
            className={styles.chip}
            data-active={active?.id === a.id}
            onClick={() => {
              setActive(a);
              setMiss(false);
            }}
          >
            {a.question}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, maxWidth: 620, marginBottom: 18 }}>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="Ask your own question…"
          aria-label="Ask this journey a question"
          className={styles.field}
          style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(34,48,60,0.16)', fontSize: 14, fontFamily: 'inherit' }}
        />
        <button type="button" className={styles.chip} data-active onClick={submit}>
          Ask
        </button>
      </div>

      {active ? (
        <Card className={styles.assemble} style={{ maxWidth: 720 }} key={active.id}>
          <div style={{ fontWeight: 700, color: NAVY, fontSize: 16, marginBottom: 8 }}>{active.question}</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: CHARCOAL, margin: 0 }}>{active.answer}</p>
        </Card>
      ) : null}

      {miss ? (
        <p style={{ fontSize: 13.5, color: GREY, maxWidth: 620 }}>
          I only answer from this run&rsquo;s evidence — try one of the questions above, or ask
          about why, integration, assumptions, failure, data, human oversight, or the pilot.
        </p>
      ) : null}
    </div>
  );
}
