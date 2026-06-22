import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { loadPayoutAccountByUserId } from '@/lib/stripe/connect';
import { startConnectOnboarding } from './actions';
import { ConnectButton } from './ConnectButton';

export const metadata: Metadata = {
  title: 'Connect payouts',
  description: 'Connect a Stripe account to receive agent revenue payouts.',
  robots: { index: false, follow: false },
};

// Reads the Supabase session + live Stripe status per-request — never prerender.
export const dynamic = 'force-dynamic';

const PALETTE = {
  cream: '#F2EFE6',
  forest: '#163A23',
  sage: '#A6BA9E',
  gold: '#E0B16E',
  ink: '#14301A',
};

type StatusCopy = { badge: string; tone: string; line: string };

function statusCopy(status: string | null, payoutsEnabled: boolean): StatusCopy {
  switch (status) {
    case 'active':
      return {
        badge: 'Active',
        tone: PALETTE.forest,
        line: 'Your account is connected and payouts are enabled. You are all set to receive revenue.',
      };
    case 'restricted':
      return {
        badge: 'Action needed',
        tone: PALETTE.gold,
        line: 'Stripe still needs a few details before it can pay you out. Resume onboarding to finish.',
      };
    case 'onboarding':
      return {
        badge: 'In progress',
        tone: PALETTE.gold,
        line: payoutsEnabled
          ? 'Almost there — payouts are on, but Stripe is still verifying some details.'
          : 'You have started onboarding but not finished. Pick up where you left off.',
      };
    default:
      return {
        badge: 'Not started',
        tone: PALETTE.sage,
        line: 'Connect a Stripe account to start receiving payouts for your agent revenue.',
      };
  }
}

export default async function ConnectOnboardingPage(): Promise<React.ReactElement> {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!envConfigured) {
    redirect('/login?redirect=/onboarding/connect');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/onboarding/connect');
  }

  const account = await loadPayoutAccountByUserId(user.id);
  const copy = statusCopy(account?.onboarding_status ?? null, account?.payouts_enabled ?? false);
  const isActive = account?.onboarding_status === 'active';
  const ctaLabel = account ? 'Resume Stripe onboarding' : 'Connect with Stripe';

  return (
    <main
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        color: PALETTE.ink,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '36rem',
          background: '#fff',
          borderRadius: '1.25rem',
          padding: '2.25rem',
          boxShadow: '0 1px 3px rgba(20,48,26,0.08), 0 10px 40px rgba(20,48,26,0.06)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.78rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: PALETTE.sage,
            fontWeight: 600,
          }}
        >
          Payouts · Stripe Connect
        </p>
        <h1 style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', lineHeight: 1.2 }}>
          Get paid for your agents
        </h1>
        <p style={{ margin: '0.85rem 0 1.5rem', color: '#46584c', lineHeight: 1.55 }}>
          assembl pays agent revenue out through Stripe Connect. Connect a Stripe Express account —
          set up for a New Zealand entity — and we will route your share straight to your bank.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: PALETTE.cream,
            marginBottom: '1.5rem',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: copy.tone,
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            {copy.badge}
          </span>
          <span style={{ fontSize: '0.92rem', color: '#46584c', lineHeight: 1.45 }}>{copy.line}</span>
        </div>

        {!isActive && (
          <form action={startConnectOnboarding}>
            <ConnectButton label={ctaLabel} />
          </form>
        )}

        {isActive && (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.4rem' }}>
            <li style={{ color: '#46584c' }}>✓ Charges enabled: {account?.charges_enabled ? 'yes' : 'no'}</li>
            <li style={{ color: '#46584c' }}>✓ Payouts enabled: {account?.payouts_enabled ? 'yes' : 'no'}</li>
            <li style={{ color: '#46584c' }}>✓ Details submitted: {account?.details_submitted ? 'yes' : 'no'}</li>
          </ul>
        )}

        <p style={{ margin: '1.5rem 0 0', fontSize: '0.8rem', color: '#7a8a80', lineHeight: 1.5 }}>
          Onboarding is handled securely by Stripe. assembl never sees your bank details. You can
          return to this page any time to check your status.
        </p>
      </section>
    </main>
  );
}
