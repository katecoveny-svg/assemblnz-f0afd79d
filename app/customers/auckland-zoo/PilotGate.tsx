'use client';

import { useActionState } from 'react';
import { submitPilotGate, type PilotGateState } from './gate-action';

const initial: PilotGateState = { status: 'idle' };

/**
 * Passphrase gate for the Auckland Zoo × Keeper pilot workspace. Uses the shared
 * customer-pilot access model (lib/customers/access.ts) so the whole /customers
 * subtree unlocks with one code. Lightly branded to the Auckland Zoo palette so
 * it reads as continuous with the workspace behind it.
 */
export function PilotGate({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(submitPilotGate, initial);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F7F3E9',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <span
            style={{
              display: 'flex',
              height: 44,
              width: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              background: '#1F5132',
              color: '#fff',
              fontFamily: 'Georgia, serif',
              fontSize: 18,
              fontWeight: 600,
            }}
            aria-hidden
          >
            AZ
          </span>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#22271F' }}>Auckland Zoo × Keeper</div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5E655A' }}>
              Concept · pending — private preview
            </div>
          </div>
        </div>

        <div style={{ borderRadius: 18, border: '1px solid #E1DCCB', background: '#fff', padding: 24 }}>
          <h1 style={{ fontSize: 17, fontWeight: 600, color: '#22271F', margin: '0 0 6px' }}>
            This workspace is invite-only
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: '#5E655A', margin: '0 0 20px' }}>
            A design mockup of what an animal-first Keeper ops console could look like for Auckland Zoo. Enter the
            access code to look around.
          </p>

          <form action={formAction}>
            <input type="hidden" name="next" value={next ?? '/customers/auckland-zoo/keeper'} />
            <label htmlFor="passphrase" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
              Access code
            </label>
            <input
              id="passphrase"
              name="passphrase"
              type="password"
              autoComplete="off"
              autoFocus
              placeholder="Access code"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: 12,
                border: '1px solid #E1DCCB',
                background: '#F7F3E9',
                padding: '12px 16px',
                fontSize: 15,
                color: '#22271F',
                outline: 'none',
              }}
            />
            {state.status === 'error' ? (
              <p style={{ marginTop: 8, fontSize: 12.5, color: '#9A2B2B' }}>{state.message}</p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              style={{
                marginTop: 12,
                width: '100%',
                borderRadius: 12,
                border: 'none',
                background: '#1F5132',
                padding: '12px 16px',
                fontSize: 15,
                fontWeight: 500,
                color: '#fff',
                cursor: pending ? 'default' : 'pointer',
                opacity: pending ? 0.6 : 1,
              }}
            >
              {pending ? 'Checking…' : 'Enter the preview'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#5E655A' }}>
          Built by assembl · Aotearoa. Not affiliated with or endorsed by Auckland Zoo.
        </p>
      </div>
    </div>
  );
}
