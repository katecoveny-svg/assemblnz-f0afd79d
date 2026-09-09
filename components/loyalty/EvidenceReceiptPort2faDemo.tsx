'use client';

/**
 * Evidence receipt DEMO — wait_type=port_2fa.
 * Dark plum field · Generative Studio + Operator chrome · Lenis + GSAP scroll.
 * status=DEMO always. Auth path stays clear. No te reo product labels.
 */

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  ASSEMBL_CANON,
  EVIDENCE_RECEIPT_DEMO_DISCLAIMER,
  EVIDENCE_RECEIPT_DEMO_HEADLINE,
  EVIDENCE_RECEIPT_DEMO_KICKER,
  EVIDENCE_RECEIPT_DEMO_SPINE,
  EVIDENCE_RECEIPT_NAV,
  PORT_2FA_EVIDENCE_RECEIPT_DEMO,
  formatSampleCredit,
  type EvidenceReceiptDemoV0,
} from '@/lib/loyalty/evidence-receipt-demo';
import './evidence-receipt-port-2fa.css';

const THEME = {
  '--erd-plum': ASSEMBL_CANON.plum,
  '--erd-mulberry': ASSEMBL_CANON.mulberry,
  '--erd-heather': ASSEMBL_CANON.heather,
  '--erd-chalk': ASSEMBL_CANON.chalk,
  '--erd-paper': ASSEMBL_CANON.paper,
} as CSSProperties;

/** Heavy ease for Lenis — settles hard after a long coast. */
function heavyEase(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function PhoneReceipt({ receipt }: { receipt: EvidenceReceiptDemoV0 }) {
  const stamp = formatSampleCredit(receipt.earn.sample_stamp_nzd);
  const [clock, setClock] = useState('9:41');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`);
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="erd-phone" aria-label="Phone preview of Evidence receipt DEMO">
      <div className="erd-phone-shell">
        <div className="erd-phone-island" aria-hidden="true" />
        <div className="erd-phone-status">
          <span>{clock}</span>
          <span className="erd-phone-status-right" aria-hidden="true">
            <i />
            <i />
            <b />
          </span>
        </div>

        <div className="erd-phone-app">
          <div className="erd-phone-appbar">
            <strong>assembl</strong>
            <em>evidence receipt</em>
          </div>

          <span className="erd-phone-demo">status · DEMO</span>

          <p className="erd-phone-kicker">
            {receipt.wait_type} · {receipt.wait.window}
          </p>
          <h2>{receipt.wait.moment}</h2>

          <p className="erd-auth-clear">
            <strong>Auth path clear.</strong> 2FA keeps moving. Earn sits beside
            the wait.
          </p>

          <div className="erd-pulse" aria-hidden="true">
            <i />
          </div>

          <article className="erd-phone-receipt" aria-label="Evidence receipt DEMO summary">
            <header>
              <span>assembl</span>
              <strong>Evidence receipt</strong>
            </header>
            <dl>
              <div>
                <dt>status</dt>
                <dd>DEMO</dd>
              </div>
              <div>
                <dt>wait</dt>
                <dd>
                  {receipt.wait.label} · {receipt.wait.window}
                </dd>
              </div>
              <div>
                <dt>sample earn</dt>
                <dd>+{stamp} (sample)</dd>
              </div>
              <div>
                <dt>permission</dt>
                <dd>{receipt.earn.permission}</dd>
              </div>
              <div>
                <dt>named human</dt>
                <dd>
                  {receipt.named_human.name} · {receipt.named_human.role}
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="erd-homebar" aria-hidden="true" />
      </div>
    </div>
  );
}

function DetailLedger({ receipt }: { receipt: EvidenceReceiptDemoV0 }) {
  const rows: { label: string; value: string }[] = [
    { label: 'schema', value: receipt.schema_version },
    { label: 'status', value: receipt.status },
    { label: 'wait_type', value: receipt.wait_type },
    { label: 'receipt_id', value: receipt.receipt_id },
    { label: 'issued_at', value: receipt.issued_at },
    {
      label: 'auth_path',
      value: `${receipt.wait.auth_path} — never slows 2FA`,
    },
    { label: 'context_hash', value: receipt.context_hash },
    { label: 'rules_hash', value: receipt.rules_hash },
    {
      label: 'sample stamp',
      value: `${formatSampleCredit(receipt.earn.sample_stamp_nzd)} → ${receipt.earn.destination_label}`,
    },
    {
      label: 'permission',
      value: `opted in ${receipt.permission.opted_in ? 'yes' : 'no'} · reversible ${receipt.permission.reversible ? 'yes' : 'no'}`,
    },
    { label: 'currency owner', value: receipt.ownership.currency_owner },
    { label: 'evidence owner', value: receipt.ownership.evidence_owner },
    {
      label: 'named human',
      value: `${receipt.named_human.name} · ${receipt.named_human.role}`,
    },
  ];

  return (
    <section className="erd-detail" aria-labelledby="erd-detail-title" data-erd-reveal>
      <div className="erd-detail-head">
        <div>
          <h2 id="erd-detail-title">Evidence receipt · detail</h2>
          <p>
            What the wait recorded. Sample earn only. Currency stays with the
            carrier.
          </p>
        </div>
        <span className="erd-seal">DEMO</span>
      </div>

      <dl className="erd-grid">
        {rows.map((row) => (
          <div className="erd-row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="erd-note-block">
        <h3>currency_note</h3>
        <p>{receipt.currency_note}</p>
      </div>
    </section>
  );
}

export function EvidenceReceiptPort2faDemo() {
  const receipt = PORT_2FA_EVIDENCE_RECEIPT_DEMO;
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      root.querySelectorAll<HTMLElement>('[data-erd-reveal]').forEach((el) => {
        el.classList.add('erd-reveal');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: heavyEase,
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const revealEls = root.querySelectorAll<HTMLElement>('[data-erd-reveal]');
    revealEls.forEach((el) => el.classList.add('erd-reveal'));

    const ctx = gsap.context(() => {
      gsap.fromTo(
        root.querySelectorAll('[data-erd-reveal]'),
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: root,
            start: 'top 78%',
            once: true,
          },
        },
      );

      const phone = root.querySelector('.erd-phone');
      if (phone) {
        gsap.fromTo(
          phone,
          { opacity: 0, y: 40, rotateY: -10, rotateX: 6 },
          {
            opacity: 1,
            y: 0,
            rotateY: -6,
            rotateX: 3,
            duration: 1.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: phone,
              start: 'top 85%',
              once: true,
            },
          },
        );
      }

      const detail = root.querySelector('.erd-detail');
      if (detail) {
        gsap.fromTo(
          detail,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: detail,
              start: 'top 82%',
              once: true,
            },
          },
        );
      }
    }, root);

    return () => {
      ctx.revert();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="erd" style={THEME} ref={rootRef}>
      <div className="erd-atmosphere" aria-hidden="true" />
      <div className="erd-veil" aria-hidden="true" />

      <header className="erd-header">
        <Link className="erd-wordmark" href="/" aria-label="assembl home">
          assembl<span>·</span>
        </Link>
        <p className="erd-header-tag">proof you can keep.</p>
        <nav className="erd-header-nav" aria-label="assembl tools">
          <a className="erd-studio" href={EVIDENCE_RECEIPT_NAV.studio.href}>
            {EVIDENCE_RECEIPT_NAV.studio.label}
            <i aria-hidden="true">↗</i>
          </a>
          <a
            className="erd-operator"
            href={EVIDENCE_RECEIPT_NAV.operator.href}
            rel="nofollow"
          >
            {EVIDENCE_RECEIPT_NAV.operator.label}
            <i aria-hidden="true">↗</i>
          </a>
        </nav>
      </header>

      <main className="erd-shell">
        <div className="erd-top" data-erd-reveal>
          <div className="erd-brand">
            <strong>assembl</strong>
            <span>journeys · evidence receipt</span>
          </div>
          <span className="erd-demo-pill" role="status">
            <i aria-hidden="true" />
            status = DEMO
          </span>
        </div>

        <section className="erd-hero" aria-labelledby="erd-hero-title">
          <div className="erd-copy" data-erd-reveal>
            <p className="erd-kicker">{EVIDENCE_RECEIPT_DEMO_KICKER}</p>
            <h1 id="erd-hero-title">{EVIDENCE_RECEIPT_DEMO_HEADLINE}</h1>
            <p className="erd-lede">{EVIDENCE_RECEIPT_DEMO_SPINE}</p>

            <div className="erd-boundary" aria-label="Ownership boundary">
              <p>
                <span>currency</span>
                <strong>{receipt.ownership.currency_owner}</strong>
              </p>
              <p>
                <span>evidence</span>
                <strong>{receipt.ownership.evidence_owner}</strong>
              </p>
            </div>

            <p className="erd-disclaimer">{EVIDENCE_RECEIPT_DEMO_DISCLAIMER}</p>
          </div>

          <div className="erd-phone-wrap" data-erd-reveal>
            <PhoneReceipt receipt={receipt} />
            <div className="erd-plinth" aria-hidden="true" />
          </div>
        </section>

        <DetailLedger receipt={receipt} />

        <p className="erd-foot" data-erd-reveal>
          Schema v0 · mock hashes · /journeys/evidence-receipt · DEMO only
        </p>
      </main>
    </div>
  );
}
