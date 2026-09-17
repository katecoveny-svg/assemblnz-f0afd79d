'use client';

import Link from 'next/link';
import { CineFooter } from './CineFooter';
import { PilotSprintCheckout } from '@/components/billing/PilotSprintCheckout';
import {
  PRICE_INSTALL,
  PRICE_INSTALL_SUFFIX,
  PRICE_OUTCOME,
  PRICE_RUNNING,
  PRICE_RUNNING_SUFFIX,
  PRICE_TEAM,
  PRICE_TEAM_SUFFIX,
  PRICING_NOTE,
} from '@/lib/registry/pricing';

/**
 * /pricing — current public install-and-run offer.
 * Prices remain sourced from the registry; this component only frames them.
 */
export function CinematicPricing({ checkoutConfigured }: { checkoutConfigured: boolean }) {
  return (
    <div className="cine" style={{ cursor: 'auto' }}>
      <div className="content">
        <nav className="nav">
          <Link className="wordmark" href="/">assembl</Link>
          <div className="nav-links">
            <Link href="/pursuit">Pursuit</Link>
            <Link href="/do">DO</Link>
            <Link href="/creative-studio">Studio</Link>
          </div>
          <Link className="nav-cta" href="/">← home</Link>
        </nav>

        <header className="page-header">
          <div className="kicker">current install offer</div>
          <h1>Start with one useful job.<br /><span className="accent">Add more when it earns its place.</span></h1>
          <p className="lede" style={{ marginTop: 16 }}>
            {PRICE_INSTALL} gets one bounded job running in about two weeks, with the context,
            permissions and review points written down around it. After that it&rsquo;s {PRICE_RUNNING}
            {' '}a month to keep the installed work running and current.
          </p>
          <p className="lede" style={{ marginTop: 10, opacity: 0.72 }}>
            This is the current public install-and-run offer. Larger outcomes can be scoped separately below.
          </p>
        </header>

        <div className="page-body">
          <div className="pricing-grid">
            <div className="price-card featured">
              <div className="price-badge">start here</div>
              <div className="price-tier">the install</div>
              <div className="price-amount">{PRICE_INSTALL}<span>{PRICE_INSTALL_SUFFIX}</span></div>
              <div className="price-desc">
                Two weeks to turn one real job into a working, reviewable flow with clear boundaries.
              </div>
              <ul className="price-list">
                <li><b>A written working context</b> — the facts, rules, terminology and sign-off points the job depends on.</li>
                <li><b>One DO on one real job</b> — preparing useful work with the required tools and permissions around it.</li>
                <li><b>One complete flow</b> — enough to see the input, prepared work, approval boundary and result end to end.</li>
                <li>First month of running included</li>
                <li>Data handling and hosting agreed for the engagement</li>
              </ul>
              <PilotSprintCheckout configured={checkoutConfigured} />
            </div>
            <div className="price-card">
              <div className="price-badge">after that</div>
              <div className="price-tier">keep it running</div>
              <div className="price-amount">{PRICE_RUNNING}<span>{PRICE_RUNNING_SUFFIX}</span></div>
              <div className="price-desc">
                Keep the installed job available and current as the business context changes.
              </div>
              <ul className="price-list">
                <li>Hosting and running costs</li>
                <li>Working context kept current</li>
                <li>The installed job re-checked as relevant facts or rules change</li>
                <li>Cancel any time — the written context remains yours</li>
              </ul>
              <Link className="btn btn-solid" href="/contact?product=do">talk about the job</Link>
            </div>
          </div>

          <div className="founding" style={{ marginTop: 44 }}>
            <h2>When the work <span className="accent">grows</span></h2>
            <p style={{ marginBottom: 24 }}>
              Add more only when the first job proves useful. The same context and permissions can support a wider team or a larger outcome without starting from zero.
            </p>
            <div className="pricing-grid">
              <div className="price-card">
                <div className="price-tier">team</div>
                <div className="price-amount">{PRICE_TEAM}<span>{PRICE_TEAM_SUFFIX}</span></div>
                <div className="price-desc">Several bounded jobs or agents working from the same agreed context.</div>
                <ul className="price-list">
                  <li>Everything in keep it running</li>
                  <li>Several agents or jobs, each with explicit limits</li>
                  <li>Shared context and review points</li>
                  <li>Work your team can inspect before the next consequential step</li>
                </ul>
                <Link className="btn btn-ghost" href="/contact?product=do">talk about the team</Link>
              </div>
              <div className="price-card">
                <div className="price-tier">outcome</div>
                <div className="price-amount">{PRICE_OUTCOME}</div>
                <div className="price-desc">
                  For work that is better scoped around a result than a monthly agent count.
                </div>
                <ul className="price-list">
                  <li>Scoped against a result you name</li>
                  <li>A scorecard agreed before we start</li>
                  <li>Can combine Pursuit, DO and Studio when the work needs the full loop</li>
                </ul>
                <Link className="btn btn-ghost" href="/contact?product=system">scope the outcome</Link>
              </div>
            </div>
          </div>

          <div className="founding" style={{ marginTop: 44 }}>
            <h2>What the two weeks <span className="accent">look like</span></h2>
            <p>
              <b>Week one</b> — agree the job, context, tools, boundaries and what a useful result looks like.<br />
              <b>Week two</b> — run it against real work, review the outputs and fix what does not hold up.<br />
              <b>At the end</b> — one working job, its review points and enough evidence to decide whether it should continue.
            </p>
          </div>

          <div className="founding" style={{ marginTop: 44 }}>
            <h2>See the system <span className="accent">before you scope it</span></h2>
            <p>
              <b>Pursuit</b> shows how signals become an opportunity.<br />
              <b>DO</b> shows the action layer and the permission boundary around useful work.<br />
              <b>Studio</b> shows how a brief, opportunity or completed job becomes something people can see and try.
            </p>
            <p style={{ marginTop: 16 }}>
              <Link href="/pursuit" style={{ textDecoration: 'underline' }}>Explore Pursuit</Link>
              {' · '}
              <Link href="/do" style={{ textDecoration: 'underline' }}>Meet DO</Link>
              {' · '}
              <Link href="/creative-studio" style={{ textDecoration: 'underline' }}>Explore Studio</Link>
            </p>
          </div>

          <p style={{ marginTop: 34, fontSize: 13, opacity: 0.6 }}>{PRICING_NOTE}</p>
        </div>

        <CineFooter />
      </div>
    </div>
  );
}
