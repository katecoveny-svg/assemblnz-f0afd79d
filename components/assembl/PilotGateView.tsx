'use client';

import { useActionState } from 'react';
import {
  ASSEMBL_GOLD,
  ASSEMBL_INK,
  ASSEMBL_PAPER,
  ASSEMBL_WARM_GREY,
  AssemblMotto,
  AssemblWordmark,
  ParticulateBackdrop,
} from '@/components/assembl/chrome';

type GateState = { status: 'idle' } | { status: 'error'; message: string };

const initial: GateState = { status: 'idle' };

const serif = "var(--font-display), 'Cormorant Garamond', Georgia, serif";

/**
 * Shared passphrase-gate UI for the customer pilot workspaces. Pure assembl
 * chrome (it sits in front of the branded tenant surfaces), so it follows
 * DIRECTION-LOCKED-2026-07-01: paper white, the particulate landscape,
 * lowercase Cormorant display, tracked micro-labels.
 *
 * Each gated subtree passes its own scoped server action (they resolve
 * different default destinations after the code checks out).
 */
export function PilotGateView({
  action,
  next,
}: {
  action: (prev: GateState, formData: FormData) => Promise<GateState>;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: ASSEMBL_PAPER,
        color: ASSEMBL_INK,
        padding: '24px',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          insetInline: 0,
          bottom: 0,
          height: '58%',
          pointerEvents: 'none',
        }}
      >
        <ParticulateBackdrop />
      </div>

      <div style={{ width: '100%', maxWidth: 430, position: 'relative' }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: ASSEMBL_WARM_GREY,
            marginBottom: 20,
          }}
        >
          <span style={{ textTransform: 'lowercase' }}>assembl</span> · private
          pilot <span style={{ color: ASSEMBL_GOLD }}>·</span>
        </div>
        <h1
          style={{
            fontFamily: serif,
            fontWeight: 500,
            fontSize: 40,
            lineHeight: 1.08,
            letterSpacing: '0.01em',
            textTransform: 'lowercase',
            margin: '0 0 12px',
          }}
        >
          this workspace is invite-only
          <span style={{ color: ASSEMBL_GOLD }}>.</span>
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.55,
            color: ASSEMBL_WARM_GREY,
            margin: '0 0 28px',
          }}
        >
          A concept pilot for a named partner. Enter the access code you were
          sent.
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
              border: '1px solid #D8D6CE',
              background: '#FFFFFF',
              color: ASSEMBL_INK,
              fontSize: 16,
              outline: 'none',
            }}
          />
          {state.status === 'error' ? (
            <p
              style={{
                color: '#B3261E',
                fontSize: 13,
                margin: '10px 2px 0',
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
              background: ASSEMBL_INK,
              color: ASSEMBL_PAPER,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'lowercase',
              cursor: pending ? 'wait' : 'pointer',
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? 'checking…' : 'enter the workspace'}
          </button>
        </form>

        <div
          style={{
            marginTop: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            textAlign: 'center',
          }}
        >
          <AssemblMotto />
          <span style={{ fontSize: 12, color: ASSEMBL_WARM_GREY }}>
            built by <AssemblWordmark /> · Aotearoa
          </span>
        </div>
      </div>
    </div>
  );
}
