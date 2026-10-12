'use client';

import { useActionState } from 'react';
import { submitDemosGate } from './gate-action';
import { GlassIdentity } from '@/components/brand/GlassIdentity';
import type { DemosGateState } from './gate-shared';

/**
 * The /demos front door. One word, styled in the page's own dark chrome so it
 * reads as part of the fleet index rather than a login wall.
 */
export function DemosGate() {
  const [state, action, pending] = useActionState<DemosGateState, FormData>(
    submitDemosGate,
    { status: 'idle' }
  );

  return (
    <div className="dm">
      <div className="dm-wrap" style={{ maxWidth: 560 }}>
        <header className="dm-head" style={{ marginBottom: 28 }}>
          <GlassIdentity kind="assembl" size={48} /><p className="dm-kick">assembl · internal · not indexed</p>
          <h1>
            The concept fleet.<br />
            <span className="dm-metal">One word to enter.</span>
          </h1>
          <p className="dm-lede">
            This index is the studio&rsquo;s playbook &mdash; wedges, cautions, superseded links.
            Each destination has its own access rules; this list remains behind the word.
          </p>
        </header>
        <form action={action} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="password"
            name="passphrase"
            placeholder="the studio's name"
            autoComplete="current-password"
            autoFocus
            style={{
              flex: '1 1 220px',
              font: 'inherit',
              fontSize: 15,
              padding: '13px 16px',
              borderRadius: 12,
              border: '1px solid #916A70',
              background: '#FFFDFB',
              color: 'inherit',

            }}
          />
          <button
            type="submit"
            disabled={pending}
            style={{
              font: 'inherit',
              fontSize: 15,
              fontWeight: 700,
              padding: '13px 22px',
              borderRadius: 12,
              border: 0,
              cursor: 'pointer',
              background: '#240B21',
              color: '#FFFDFB',
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending ? 'checking…' : 'enter'}
          </button>
        </form>
        {state.status === 'error' && (
          <p style={{ marginTop: 14, fontSize: 14, color: '#492B3E' }}>{state.message}</p>
        )}
      </div>
    </div>
  );
}
