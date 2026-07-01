'use client';

import { useActionState } from 'react';
import { submitPilotGate, type PilotGateState } from './gate-action';

const initial: PilotGateState = { status: 'idle' };

/**
 * Passphrase gate for the customer pilot workspaces. Neutral assembl styling —
 * it sits in front of the branded tenant chrome, so it stays brand-agnostic.
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
        background: '#12100e',
        padding: '24px',
        fontFamily: 'var(--edr-mono, ui-monospace), monospace',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div
          style={{
            fontFamily: 'var(--edr-mono, ui-monospace), monospace',
            fontSize: 11,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#C79B1F',
            marginBottom: 20,
          }}
        >
          assembl · private pilot
        </div>
        <h1
          style={{
            fontFamily: 'var(--edr-display, Georgia), serif',
            fontWeight: 500,
            fontSize: 34,
            lineHeight: 1.1,
            color: '#FFF7EC',
            margin: '0 0 12px',
          }}
        >
          This workspace is invite-only
        </h1>
        <p
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 15,
            lineHeight: 1.55,
            color: 'rgba(255,247,236,0.66)',
            margin: '0 0 28px',
          }}
        >
          A concept pilot prepared for a named partner. Enter the access code you
          were sent to view it.
        </p>
        <form action={formAction}>
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <input
            type="password"
            name="passphrase"
            autoComplete="off"
            autoFocus
            placeholder="access code"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid rgba(255,247,236,0.18)',
              background: 'rgba(255,247,236,0.04)',
              color: '#FFF7EC',
              fontSize: 16,
              fontFamily: 'system-ui, sans-serif',
              outline: 'none',
            }}
          />
          {state.status === 'error' ? (
            <p
              style={{
                color: '#ff8a80',
                fontSize: 13,
                margin: '10px 2px 0',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {state.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            style={{
              width: '100%',
              marginTop: 16,
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              background: '#FFD42A',
              color: '#12100e',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: pending ? 'wait' : 'pointer',
              fontFamily: 'system-ui, sans-serif',
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? 'Checking…' : 'Enter workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
