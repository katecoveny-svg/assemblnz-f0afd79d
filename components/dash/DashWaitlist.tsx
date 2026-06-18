'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

/**
 * Waitlist signup — recreated from `Dash Launch Campaign.html`.
 *
 * Three personas (publisher / advertiser / earner). Native `required`
 * validation; on valid submit we preventDefault, swap the form for a success
 * panel, and persist `{persona, email, at}` to localStorage under
 * `dash_waitlist_v1`. In production this should also POST to the real
 * waitlist API/CRM.
 */
const PERSONAS = [
  {
    id: 'publisher',
    label: 'Publisher',
    blurb: 'You run an NZ app or service with load time to monetise. Keep 55% via Stripe Connect.',
    cta: 'Monetise our wait states',
  },
  {
    id: 'advertiser',
    label: 'Advertiser',
    blurb: 'You want NZ-only, brand-safe attention in the moments people actually look. CPM NZ$45–80.',
    cta: 'Reach NZ audiences',
  },
  {
    id: 'earner',
    label: 'Earner',
    blurb: 'You want a cut of the attention you already give. Watch. Wait. Earn.',
    cta: 'Get on the list',
  },
] as const;

type PersonaId = (typeof PERSONAS)[number]['id'];

export function DashWaitlist() {
  const [persona, setPersona] = useState<PersonaId>('publisher');
  const [done, setDone] = useState<Record<PersonaId, boolean>>({
    publisher: false,
    advertiser: false,
    earner: false,
  });

  const active = PERSONAS.find((p) => p.id === persona)!;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (new FormData(form).get('email') as string)?.trim();
    if (!email) return;
    try {
      const key = 'dash_waitlist_v1';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      prev.push({ persona, email, at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(prev));
    } catch {
      /* localStorage unavailable — still show success */
    }
    setDone((d) => ({ ...d, [persona]: true }));
  }

  return (
    <div className="mx-auto w-full max-w-[560px]">
      {/* persona switch */}
      <div
        className="mb-6 grid grid-cols-3 gap-1.5 rounded-[var(--r-pill)] p-1.5"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
        role="tablist"
        aria-label="Choose who you are"
      >
        {PERSONAS.map((p) => {
          const selected = p.id === persona;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setPersona(p.id)}
              className="rounded-[var(--r-pill)] px-3 py-2.5 text-[14px] font-semibold transition-colors"
              style={{
                background: selected ? 'var(--accent)' : 'transparent',
                color: selected ? 'var(--on-accent)' : 'var(--muted)',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="d-card p-7">
        <p className="d-body" style={{ color: 'var(--fg)' }}>
          {active.blurb}
        </p>

        {done[persona] ? (
          <div
            className="mt-6 flex items-start gap-3 rounded-[var(--r-md)] p-4"
            style={{ background: 'var(--sage-pale)' }}
          >
            <span className="d-icon-badge" style={{ width: 40, height: 40 }} aria-hidden>
              <Check className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold" style={{ color: 'var(--fg)' }}>
                You&rsquo;re on the list.
              </p>
              <p className="d-body text-[14px]">
                We&rsquo;ll be in touch as {active.label.toLowerCase()} access opens. Kia ora.
              </p>
            </div>
          </div>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate={false}>
            <div className="d-field-group">
              <label className="d-field-label" htmlFor="dash-email">
                Work email
              </label>
              <input
                id="dash-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@yourcompany.co.nz"
                className="d-field"
              />
              <span className="d-field-hint">
                NZ-only inventory · Privacy Act 2020 native. We&rsquo;ll never share your email.
              </span>
            </div>
            <button type="submit" className="d-btn d-btn--primary d-btn--lg w-full justify-center">
              {active.cta} <ArrowRight aria-hidden />
            </button>
          </form>
        )}

        <p className="mt-4 text-center" style={{ fontFamily: 'var(--ff-sans)', fontSize: 14, color: 'var(--muted)' }}>
          Or email{' '}
          <a
            href={`mailto:assembl@assembl.co.nz?subject=${encodeURIComponent(`Dash waitlist — ${active.label.toLowerCase()}`)}`}
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            assembl@assembl.co.nz
          </a>
        </p>
      </div>
    </div>
  );
}
