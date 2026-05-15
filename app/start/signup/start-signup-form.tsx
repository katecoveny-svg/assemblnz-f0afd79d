'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, CreditCard, Link as LinkIcon, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { INDUSTRY_KETES, type KeteSlug } from '@/lib/kete';

type StepId = 'account' | 'business' | 'kete' | 'checkout';
type AccountMode = 'password' | 'magic';

const STEPS: Array<{ id: StepId; label: string }> = [
  { id: 'account', label: 'Account' },
  { id: 'business', label: 'Business' },
  { id: 'kete', label: 'Kete' },
  { id: 'checkout', label: 'Checkout' },
];

const accountSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('password'),
    email: z.email('Enter a valid email.'),
    password: z.string().min(8, 'Use at least 8 characters.'),
  }),
  z.object({
    mode: z.literal('magic'),
    email: z.email('Enter a valid email.'),
    password: z.string().optional(),
  }),
]);

const businessSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name is required.'),
  slug: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens.'),
  contactName: z.string().trim().min(2, 'Contact name is required.'),
  phone: z.string().trim().min(7, 'Phone number is required.'),
});

const keteSchema = z.object({
  kete: z.enum(INDUSTRY_KETES.map((kete) => kete.slug) as [KeteSlug, ...KeteSlug[]]),
});

type FieldErrors = Partial<Record<'email' | 'password' | 'companyName' | 'slug' | 'contactName' | 'phone' | 'kete' | 'form', string>>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 48);
}

export function StartSignupForm({ initialKete }: { initialKete: KeteSlug }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [accountMode, setAccountMode] = useState<AccountMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [kete, setKete] = useState<KeteSlug>(initialKete);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const currentStep = STEPS[stepIndex].id;
  const selectedKete = INDUSTRY_KETES.find((item) => item.slug === kete) ?? INDUSTRY_KETES[0];

  function updateCompanyName(value: string) {
    setCompanyName(value);
    if (!slug || slug === slugify(companyName)) {
      setSlug(slugify(value));
    }
  }

  async function validateAndAdvance() {
    setErrors({});

    if (currentStep === 'account') {
      const parsed = accountSchema.safeParse({ mode: accountMode, email, password });
      if (!parsed.success) return setErrorsFromZod(parsed.error);
      setPending(true);
      try {
        const supabase = createClient();
        if (parsed.data.mode === 'password') {
          const origin = window.location.origin;
          const { error } = await supabase.auth.signUp({
            email: parsed.data.email,
            password: parsed.data.password,
            options: {
              emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent('/start/signup')}`,
              data: { signup_source: 'industry-pack' },
            },
          });
          if (error) return setErrors({ form: error.message });
        } else {
          const origin = window.location.origin;
          const { error } = await supabase.auth.signInWithOtp({
            email: parsed.data.email,
            options: {
              emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent('/start/signup')}`,
            },
          });
          if (error) return setErrors({ form: error.message });
          setMagicSent(true);
          return;
        }
        setStepIndex(1);
      } catch (error) {
        setErrors({
          form: error instanceof Error ? error.message : 'Account setup failed.',
        });
      } finally {
        setPending(false);
      }
      return;
    }

    if (currentStep === 'business') {
      const parsed = businessSchema.safeParse({ companyName, slug, contactName, phone });
      if (!parsed.success) return setErrorsFromZod(parsed.error);
      setStepIndex(2);
      return;
    }

    if (currentStep === 'kete') {
      const parsed = keteSchema.safeParse({ kete });
      if (!parsed.success) return setErrorsFromZod(parsed.error);
      setStepIndex(3);
    }
  }

  async function startCheckout() {
    setErrors({});
    const account = accountSchema.safeParse({ mode: accountMode, email, password });
    const business = businessSchema.safeParse({ companyName, slug, contactName, phone });
    const selected = keteSchema.safeParse({ kete });
    if (!account.success) return setErrorsFromZod(account.error);
    if (!business.success) return setErrorsFromZod(business.error);
    if (!selected.success) return setErrorsFromZod(selected.error);

    setPending(true);
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setErrors({
          form:
            accountMode === 'magic'
              ? 'Open your magic link first, then return here to start checkout.'
              : 'Check your signup email, confirm your account, then return here to start checkout.',
        });
        return;
      }

      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_INDUSTRY_PACK_PRICE_ID,
          kete,
          plan: 'industry-pack',
          companyName: business.data.companyName,
          slug: business.data.slug,
          contactName: business.data.contactName,
          phone: business.data.phone,
          successUrl: `${window.location.origin}/app/${business.data.slug}/onboarding?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/start/signup?kete=${kete}&checkout=cancelled`,
        }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        setErrors({ form: payload.error ?? 'Stripe checkout could not be created.' });
        return;
      }
      window.location.assign(payload.url);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Checkout failed.' });
    } finally {
      setPending(false);
    }
  }

  function setErrorsFromZod(error: z.ZodError) {
    const next: FieldErrors = {};
    for (const issue of error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string') next[key as keyof FieldErrors] = issue.message;
    }
    setErrors(next);
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (currentStep === 'checkout') {
      void startCheckout();
    } else {
      void validateAndAdvance();
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[280px_1fr]" noValidate>
      <aside className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/60 p-4">
        <div className="space-y-2">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={[
                'flex items-center gap-3 rounded-[8px] px-3 py-3',
                index === stepIndex ? 'bg-[color:var(--assembl-pounamu-paper)]' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px]',
                  index < stepIndex
                    ? 'border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu)] text-white'
                    : 'border-[rgba(35,33,31,0.14)] text-[color:var(--text-secondary)]',
                ].join(' ')}
              >
                {index < stepIndex ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em]">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </aside>

      <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5 shadow-[0_14px_46px_rgba(35,33,31,0.06)] md:p-7">
        {currentStep === 'account' ? (
          <AccountStep
            mode={accountMode}
            setMode={setAccountMode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            magicSent={magicSent}
            errors={errors}
          />
        ) : null}

        {currentStep === 'business' ? (
          <BusinessStep
            companyName={companyName}
            setCompanyName={updateCompanyName}
            slug={slug}
            setSlug={(value) => setSlug(slugify(value))}
            contactName={contactName}
            setContactName={setContactName}
            phone={phone}
            setPhone={setPhone}
            errors={errors}
          />
        ) : null}

        {currentStep === 'kete' ? (
          <KeteStep kete={kete} setKete={setKete} errors={errors} />
        ) : null}

        {currentStep === 'checkout' ? (
          <CheckoutStep
            email={email}
            companyName={companyName}
            slug={slug}
            contactName={contactName}
            phone={phone}
            kete={selectedKete}
          />
        ) : null}

        {errors.form ? (
          <p className="mt-5 rounded-[8px] border border-[#A33A2A]/25 bg-[#A33A2A]/10 p-3 text-sm text-[#7A2519]">
            {errors.form}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[rgba(35,33,31,0.08)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
            disabled={stepIndex === 0 || pending}
            className="btn-ghost inline-flex h-11 items-center justify-center px-5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back
          </button>
          <button
            type="submit"
            disabled={pending}
            className="cta-primary inline-flex h-11 items-center justify-center px-6 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {currentStep === 'checkout'
              ? pending
                ? 'Opening Stripe...'
                : 'Continue to Stripe'
              : pending
                ? 'Working...'
                : 'Continue'}
            {currentStep === 'checkout' ? (
              <CreditCard className="ml-2 h-4 w-4" aria-hidden />
            ) : (
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </section>
    </form>
  );
}

function AccountStep({
  mode,
  setMode,
  email,
  setEmail,
  password,
  setPassword,
  magicSent,
  errors,
}: {
  mode: AccountMode;
  setMode: (mode: AccountMode) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  magicSent: boolean;
  errors: FieldErrors;
}) {
  return (
    <div>
      <StepTitle eyebrow="Step 1" title="Create the operator account." />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ModeButton
          active={mode === 'password'}
          icon={LinkIcon}
          label="Email + password"
          onClick={() => setMode('password')}
        />
        <ModeButton
          active={mode === 'magic'}
          icon={Mail}
          label="Magic link"
          onClick={() => setMode('magic')}
        />
      </div>
      <div className="mt-6 grid gap-4">
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          error={errors.email}
        />
        {mode === 'password' ? (
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            error={errors.password}
          />
        ) : null}
      </div>
      {magicSent ? (
        <p className="mt-5 rounded-[8px] border border-[rgba(43,107,87,0.22)] bg-[rgba(43,107,87,0.08)] p-3 text-sm text-[color:var(--assembl-pounamu)]">
          Magic link sent. Open it, then return to finish business details and
          checkout.
        </p>
      ) : null}
    </div>
  );
}

function BusinessStep(props: {
  companyName: string;
  setCompanyName: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
  contactName: string;
  setContactName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  errors: FieldErrors;
}) {
  return (
    <div>
      <StepTitle eyebrow="Step 2" title="Name the tenant." />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TextField
          label="Company name"
          value={props.companyName}
          onChange={props.setCompanyName}
          autoComplete="organization"
          error={props.errors.companyName}
        />
        <TextField
          label="Tenant slug"
          value={props.slug}
          onChange={props.setSlug}
          prefix="assembl.co.nz/app/"
          error={props.errors.slug}
        />
        <TextField
          label="Contact name"
          value={props.contactName}
          onChange={props.setContactName}
          autoComplete="name"
          error={props.errors.contactName}
        />
        <TextField
          label="Phone"
          type="tel"
          value={props.phone}
          onChange={props.setPhone}
          autoComplete="tel"
          error={props.errors.phone}
        />
      </div>
    </div>
  );
}

function KeteStep({
  kete,
  setKete,
  errors,
}: {
  kete: KeteSlug;
  setKete: (value: KeteSlug) => void;
  errors: FieldErrors;
}) {
  return (
    <div>
      <StepTitle eyebrow="Step 3" title="Confirm the first kete." />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {INDUSTRY_KETES.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => setKete(item.slug)}
            className={[
              'rounded-[8px] border bg-[color:var(--assembl-paper)] p-4 text-left transition-colors',
              kete === item.slug
                ? 'border-[color:var(--kete-accent)] bg-white'
                : 'border-[rgba(35,33,31,0.10)] hover:bg-white',
            ].join(' ')}
            style={{ '--kete-accent': item.accent } as CSSProperties}
          >
            <span
              aria-hidden
              className="block h-1 w-10 rounded-full"
              style={{ backgroundColor: item.accent }}
            />
            <span className="mt-4 block font-display text-3xl font-light leading-none">
              {item.name}
            </span>
            <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
              {item.industry}
            </span>
          </button>
        ))}
      </div>
      {errors.kete ? <p className="mt-3 text-sm text-[#7A2519]">{errors.kete}</p> : null}
    </div>
  );
}

function CheckoutStep({
  email,
  companyName,
  slug,
  contactName,
  phone,
  kete,
}: {
  email: string;
  companyName: string;
  slug: string;
  contactName: string;
  phone: string;
  kete: (typeof INDUSTRY_KETES)[number];
}) {
  const rows = [
    ['Email', email],
    ['Company', companyName],
    ['Slug', slug],
    ['Contact', contactName],
    ['Phone', phone],
    ['Kete', `${kete.name} · ${kete.industry}`],
  ];
  return (
    <div>
      <StepTitle eyebrow="Step 4" title="Stripe checkout." />
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
        <dl className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] p-5">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 border-b border-[rgba(35,33,31,0.08)] py-3 last:border-0 md:grid-cols-[130px_1fr]"
            >
              <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                {label}
              </dt>
              <dd className="text-sm text-[color:var(--text-primary)]">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="rounded-[8px] border border-[rgba(43,107,87,0.22)] bg-[rgba(43,107,87,0.08)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
            Monthly subscription
          </p>
          <p className="mt-4 font-display text-5xl font-light leading-none">
            NZ$5,000
          </p>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            + GST · no setup fee · cancel any time
          </p>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-4xl font-light leading-none md:text-5xl">
        {title}
      </h2>
    </div>
  );
}

function ModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Mail;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex h-14 items-center gap-3 rounded-[8px] border px-4 text-left transition-colors',
        active
          ? 'border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu-paper)]'
          : 'border-[rgba(35,33,31,0.12)] bg-[color:var(--assembl-paper)] hover:bg-white',
      ].join(' ')}
    >
      <Icon className="h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
      <span className="font-mono text-[11px] uppercase tracking-[0.14em]">{label}</span>
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  prefix,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  prefix?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        {label}
      </span>
      <span className="mt-2 flex overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white focus-within:border-[color:var(--assembl-pounamu)] focus-within:ring-2 focus-within:ring-[rgba(43,107,87,0.20)]">
        {prefix ? (
          <span className="flex items-center bg-[color:var(--assembl-paper)] px-3 font-mono text-[11px] text-[color:var(--text-secondary)]">
            {prefix}
          </span>
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[color:var(--text-primary)] outline-none"
        />
      </span>
      {error ? <span className="mt-2 block text-sm text-[#7A2519]">{error}</span> : null}
    </label>
  );
}
