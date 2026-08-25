'use client';

import { useActionState } from 'react';
import { unlockAironaut } from './actions';
import { AironautMark } from '@/components/customs/AironautMark';

export function AironautGate() {
  const [state, formAction, pending] = useActionState(unlockAironaut, {});

  return (
    <div className="aironaut-root flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="air-card px-8 py-10 shadow-[0_20px_60px_rgba(11,42,74,0.14)]">
          <div className="mb-6 flex items-center gap-3">
            <AironautMark size={40} />
            <div>
              <div className="air-display text-2xl leading-none">Aironaut</div>
              <div className="text-[0.75rem] uppercase tracking-[0.18em] text-[color:var(--air-slate)]">
                Customs Brokers · workspace
              </div>
            </div>
          </div>
          <p className="air-eyebrow mb-2">Private pilot · draft mode</p>
          <h1 className="air-display mb-2 text-xl">This workspace is password-protected.</h1>
          <p className="mb-6 text-sm text-[color:var(--air-slate)]">
            An Aironaut × assembl pilot. Enter the password Kate shared to take a look.
          </p>
          <form action={formAction} className="space-y-3">
            <input
              type="password"
              name="password"
              autoFocus
              autoComplete="current-password"
              placeholder="Password"
              className="w-full rounded-lg border border-[color:var(--air-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--air-brass)] focus:ring-2 focus:ring-[color:rgba(201,163,78,0.25)]"
            />
            {state?.error ? (
              <p className="text-sm text-[color:var(--air-hold)]">{state.error}</p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-[color:var(--air-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--air-navy-deep)] disabled:opacity-60"
            >
              {pending ? 'Checking…' : 'Enter workspace'}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-[0.75rem] text-[color:var(--air-slate)]">
          Powered by assembl · concept pilot, not a live customs system
        </p>
      </div>
    </div>
  );
}
