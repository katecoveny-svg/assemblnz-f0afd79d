'use client';

import { useFormStatus } from 'react-dom';

/**
 * Submit button for the Connect onboarding form. Uses useFormStatus so it shows
 * a pending state while the server action creates the Stripe account + link and
 * redirects. Must be a descendant of the <form> whose action it triggers.
 */
export function ConnectButton({ label }: { label: string }): React.ReactElement {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.85rem 1.6rem',
        borderRadius: '999px',
        border: 'none',
        background: pending ? '#3a5c45' : '#163A23',
        color: '#F2EFE6',
        fontWeight: 600,
        fontSize: '1rem',
        cursor: pending ? 'wait' : 'pointer',
        transition: 'background 120ms ease',
      }}
    >
      {pending ? 'Opening Stripe…' : label}
    </button>
  );
}
