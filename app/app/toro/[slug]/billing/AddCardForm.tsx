'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { loadStripe, type Stripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { createSetupIntentAction } from './actions';

interface Props {
  slug: string;
}

export function AddCardForm({ slug }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const publishableKey =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY : undefined;

  const stripePromise = useMemo<Promise<Stripe | null> | null>(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  const startSetup = () => {
    setError(null);
    startTransition(async () => {
      const r = await createSetupIntentAction(slug);
      if (!r.ok) setError(r.reason ?? 'could not start card setup');
      else setClientSecret(r.clientSecret);
    });
  };

  if (!publishableKey) {
    return (
      <div className="rounded-[2px] border border-dashed border-[color:var(--assembl-gold-thread)] bg-white p-4">
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--assembl-gold-thread)]">
          stripe not configured
        </p>
        <p className="mt-1 font-mono text-[12px] text-[color:var(--text-primary)]">
          set <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in Vercel env to
          enable the card form.
        </p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div>
        <button
          type="button"
          onClick={startSetup}
          disabled={isPending}
          className="inline-flex h-11 items-center rounded-[2px] bg-[color:var(--text-primary)] px-6 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)] hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'starting…' : 'add / update card'}
        </button>
        {error ? (
          <p className="mt-3 font-mono text-[12px] text-[color:#b3261e]">· {error}</p>
        ) : null}
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'flat',
      variables: {
        colorPrimary: '#23211F',
        colorBackground: '#FAF7F2',
        colorText: '#23211F',
        colorDanger: '#b3261e',
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        spacingUnit: '4px',
        borderRadius: '2px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CardCollection slug={slug} clientSecret={clientSecret} onReset={() => setClientSecret(null)} />
    </Elements>
  );
}

function CardCollection({
  slug,
  clientSecret,
  onReset,
}: {
  slug: string;
  clientSecret: string;
  onReset: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (completed) {
      const t = setTimeout(onReset, 2_500);
      return () => clearTimeout(t);
    }
  }, [completed, onReset]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: confirmError } = await stripe.confirmSetup({
      elements,
      clientSecret,
      confirmParams: { return_url: `${window.location.origin}/app/toro/${slug}/billing` },
      redirect: 'if_required',
    });
    setSubmitting(false);
    if (confirmError) {
      setError(confirmError.message ?? 'card setup failed');
      return;
    }
    setCompleted(true);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting || completed}
          className="inline-flex h-11 items-center rounded-[2px] bg-[color:var(--text-primary)] px-6 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)] hover:opacity-90 disabled:opacity-50"
        >
          {completed ? '✓ saved' : submitting ? 'saving…' : 'save card'}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={submitting}
          className="inline-flex h-11 items-center rounded-[2px] border border-[color:var(--assembl-cloud)] px-6 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] disabled:opacity-50"
        >
          cancel
        </button>
      </div>
      {error ? (
        <p className="font-mono text-[12px] text-[color:#b3261e]">· {error}</p>
      ) : null}
    </form>
  );
}
