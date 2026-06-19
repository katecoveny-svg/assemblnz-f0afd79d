'use client';

import { Clock, Coins, ShieldCheck, MapPin, ArrowRight, Eye } from 'lucide-react';
import { DashHero } from './DashHero';
import { DashWaitState } from './DashWaitState';
import { DashWaitlist } from './DashWaitlist';

const HOW_STEPS = [
  {
    icon: Clock,
    n: 'i',
    title: 'The wait happens anyway',
    body: 'Every NZ app spends seconds loading, generating, syncing. Today those seconds are dead air.',
  },
  {
    icon: Eye,
    n: 'ii',
    title: 'Dash fills the gap',
    body: 'In that moment, Dash renders a brand-safe, NZ-made piece of creative — the dog fills as it loads.',
  },
  {
    icon: Coins,
    n: 'iii',
    title: 'Everyone gets paid',
    body: 'The publisher keeps 55% via Stripe Connect. The wait becomes revenue instead of friction.',
  },
] as const;

const FACTS = [
  { icon: Coins, stat: '55%', label: 'Publishers keep it, via Stripe Connect' },
  { icon: Eye, stat: 'NZ$45–80', label: 'Premium AI / SaaS CPM' },
  { icon: MapPin, stat: 'NZ-only', label: 'Inventory — Aotearoa audiences' },
  { icon: ShieldCheck, stat: 'Privacy Act', label: '2020 native, incl. IPP 3A' },
] as const;

export function DashLanding() {
  return (
    <>
      {/* sub-brand strip (sits under the global assembl header) */}
      <div className="border-b" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
        <div className="container flex items-center justify-between py-4">
          <span className="d-wordmark">
            <b>
              dash<i>.</i>
            </b>
            <span>by assembl</span>
          </span>
          <a href="#waitlist" className="d-btn d-btn--primary d-btn--sm">
            Join the waitlist <ArrowRight aria-hidden />
          </a>
        </div>
      </div>

      <DashHero />

      {/* Monetize the wait — value prop + animated ad unit */}
      <section id="how" className="container grid items-center gap-12 py-24 lg:grid-cols-2 lg:py-32">
        <div>
          <span className="d-eyebrow">Monetize the wait</span>
          <h2 className="d-display mt-5" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)' }}>
            The seconds between click and result are worth something.
          </h2>
          <p className="d-lead mt-6" style={{ color: 'var(--muted)' }}>
            Dash is the in-product attention network for Aotearoa. It turns the wait states of NZ
            digital services into a brand-safe, revenue-sharing moment — measured, consented, and
            built for local audiences.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="d-pill">Watch.</span>
            <span className="d-pill">Wait.</span>
            <span className="d-pill d-pill--gold">Earn.</span>
          </div>
        </div>
        <DashWaitState />
      </section>

      {/* How it works */}
      <section className="py-10 lg:py-14" style={{ background: 'var(--surface-2)' }}>
        <div className="container">
          <div className="mb-12 max-w-2xl">
            <span className="d-eyebrow">How it works</span>
            <h2 className="d-display mt-5" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)' }}>
              Sit. Stay. Get paid.
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {HOW_STEPS.map(({ icon: Icon, n, title, body }) => (
              <article key={title} className="d-card flex h-full flex-col p-7">
                <div className="flex items-center justify-between">
                  <span className="d-icon-badge" aria-hidden>
                    <Icon />
                  </span>
                  <span className="d-serif text-4xl font-light" style={{ color: 'var(--sage)' }}>
                    {n}
                  </span>
                </div>
                <h3 className="d-serif mt-6 text-2xl font-medium" style={{ color: 'var(--fg)' }}>
                  {title}
                </h3>
                <p className="d-body mt-3">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Business facts — forest band */}
      <section className="dash-forest py-24 lg:py-28" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
        <div className="container">
          <div className="mb-12 max-w-2xl">
            <span className="d-eyebrow" style={{ color: 'var(--gold)' }}>
              The model
            </span>
            <h2 className="d-display mt-5" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)' }}>
              Time as a gift, not a resource.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FACTS.map(({ icon: Icon, stat, label }) => (
              <div key={stat} className="d-card p-6" style={{ background: 'var(--surface)' }}>
                <span className="d-icon-badge" aria-hidden>
                  <Icon />
                </span>
                <p className="d-serif mt-5 text-4xl font-medium" style={{ color: 'var(--fg)' }}>
                  {stat}
                </p>
                <p className="d-body mt-2 text-[14px]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="container py-24 lg:py-32">
        <div className="mb-10 text-center">
          <span className="d-eyebrow">Join the waitlist</span>
          <h2 className="d-display mx-auto mt-5 max-w-3xl" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)' }}>
            Own the space between click and result.
          </h2>
          <p className="d-lead mx-auto mt-6 max-w-xl" style={{ color: 'var(--muted)' }}>
            Dash is launching in Aotearoa. Tell us who you are and we&rsquo;ll bring you in as access
            opens.
          </p>
        </div>
        <DashWaitlist />
      </section>

      {/* Footer note */}
      <footer className="border-t py-10" style={{ borderColor: 'var(--line)' }}>
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="d-wordmark">
            <b>
              dash<i>.</i>
            </b>
            <span>by assembl</span>
          </span>
          <p className="d-body text-[13px]">
            Made in Aotearoa · Private by design · Hosted in AWS Sydney
          </p>
        </div>
      </footer>
    </>
  );
}
