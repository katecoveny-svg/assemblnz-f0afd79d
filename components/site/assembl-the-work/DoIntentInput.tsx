'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DO_INPUT } from './copy';
import { HOME_BRIEF_MAX_LENGTH, saveHomeBrief } from '@/apps/do/shared/home-handoff';

/** Carries a draft to the DO demonstration without submitting or compiling it. */
export function DoIntentInput({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const go = (intent: string) => {
    const trimmed = intent.trim();
    if (!trimmed) {
      setError('Describe the outcome you want, or choose an example.');
      return;
    }
    try {
      const destination = saveHomeBrief(window.sessionStorage, trimmed);
      setError(null);
      router.push(destination);
    } catch {
      setError('Your browser could not carry this draft to DO. Keep a copy and open DO directly.');
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    go(value);
  };

  return (
    <form className={`atw-do-form ${compact ? "is-compact" : ""}`} onSubmit={onSubmit} aria-label="Open public DO">
      {!compact && <label className="sr-only" htmlFor="atw-do-intent">
        {DO_INPUT.title}
      </label>}
      <div className="atw-do-field">
        {compact && <label className="atw-job-label" htmlFor="atw-do-intent">What do you need done?</label>}
        <input
          id="atw-do-intent"
          name="brief"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          placeholder={DO_INPUT.placeholder}
          autoComplete="off"
          required
          maxLength={HOME_BRIEF_MAX_LENGTH}
          aria-describedby="atw-do-honesty"
        />
        <button type="submit" className="atw-btn atw-btn-rose">
          {compact ? <span aria-label="Open DO">→</span> : DO_INPUT.submit}
        </button>
      </div>
      <p className="atw-do-honesty" id="atw-do-honesty">{DO_INPUT.honesty}</p>
      {error && <p className="atw-do-error" role="alert">{error} <Link href="/do">Open DO →</Link></p>}
      {!compact && <div className="atw-do-examples" role="group" aria-label="Example jobs">
        {DO_INPUT.examples.map((example) => (
          <button key={example} type="button" onClick={() => {
            setValue(example);
            setError(null);
            document.getElementById('atw-do-intent')?.focus();
          }}>
            {example}
          </button>
        ))}
      </div>}
    </form>
  );
}
