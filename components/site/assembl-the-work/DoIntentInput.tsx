'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DO_INPUT } from './copy';

/**
 * DO live input — Spatial Widget C kinship (paper nest + ✦ CTA).
 * DEMO honesty: routes to /do; nothing sends without a human yes.
 */
export function DoIntentInput() {
  const router = useRouter();
  const [value, setValue] = useState('');

  const go = (intent: string) => {
    const trimmed = intent.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set('brief', trimmed);
    params.set('from', 'home-preview');
    const qs = params.toString();
    router.push(qs ? `/do?${qs}` : '/do');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    go(value);
  };

  return (
    <form className="atw-do-form" onSubmit={onSubmit} aria-label="Give DO a job">
      <label className="sr-only" htmlFor="atw-do-intent">
        {DO_INPUT.title}
      </label>
      <div className="atw-do-nest">
        <div className="atw-do-field">
          <input
            id="atw-do-intent"
            name="brief"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={DO_INPUT.placeholder}
            autoComplete="off"
          />
          <button type="submit" className="atw-btn atw-btn-do">
            <span className="atw-btn-star" aria-hidden="true">
              ✦
            </span>
            {DO_INPUT.submit}
          </button>
        </div>
        <p className="atw-do-honesty">{DO_INPUT.honesty}</p>
      </div>
      <div className="atw-do-examples" role="group" aria-label="Example jobs">
        {DO_INPUT.examples.map((example) => (
          <button key={example} type="button" onClick={() => go(example)}>
            {example}
          </button>
        ))}
      </div>
    </form>
  );
}
