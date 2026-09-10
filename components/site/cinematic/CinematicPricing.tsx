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
 * /pricing — Kate's pricing.html prototype, ported 1:1 (copy + tiers hers,
 * 2026-07-24). The shared watch frame supplies the artwork. The pricing
 * registry, copy and checkout component remain unchanged.
 */
export function CinematicPricing({ checkoutConfigured }: { checkoutConfigured: boolean }) {

  return (
    <div className="cine" style={{ cursor: 'auto' }}>
      <div className="content">
        <nav className="nav">
          <Link className="wordmark" href="/">assembl</Link>
          <div className="nav-links">
            <Link href="/agents">agents</Link>
            <Link href="/pricing">pricing</Link>
            <Link href="/assembling">the agentic journey</Link>
          </div>
          <Link className="nav-cta" href="/">← home</Link>
        </nav>

        <header className="page-header">
          <div className="kicker">pricing</div>
          <h1>Agents prepare.<br /><span className="accent">People decide.</span></h1>
          <p className="lede" style={{ marginTop: 16 }}>
            {PRICE_INSTALL} gets one real thing running in your business in about two weeks. Not a demo,
            not a slide deck. After that it&rsquo;s {PRICE_RUNNING} a month to keep it working.
          </p>
          <p className="lede" style={{ marginTop: 10, opacity: 0.72 }}>
            <Link href="/ai-ready" style={{ textDecoration: 'underline' }}>Paste your website first</Link>
            {' '}— it&rsquo;s free, and you&rsquo;ll see what we&rsquo;d be working from.
          </p>
        </header>

        <div className="page-body">
          <div className="pricing-grid">
            <div className="price-card featured">
              <div className="price-badge">the install</div>
              <div className="price-tier">the install</div>
              <div className="price-amount">{PRICE_INSTALL}<span>{PRICE_INSTALL_SUFFIX}</span></div>
              <div className="price-desc">
                Two weeks. At the end you have three things, and honest numbers on whether they helped.
              </div>
              <ul className="price-list">
                <li><b>A written record of how your business works</b> — what you sell, how you talk,
                  what needs your sign-off. A real document you can read and change.</li>
                <li><b>One agent doing one real job</b> — drafting a quote, preparing a booking,
                  pulling a claim together. Not a chatbot.</li>
                <li><b>One customer journey, start to finish</b> — every step recorded, so you can
                  see what it read and what it did.</li>
                <li>First month of running included</li>
                <li>NZ-hosted, NZ Privacy Act compliant</li>
              </ul>
              <PilotSprintCheckout configured={checkoutConfigured} />
            </div>
            <div className="price-card">
              <div className="price-badge">after that</div>
              <div className="price-tier">keep it running</div>
              <div className="price-amount">{PRICE_RUNNING}<span>{PRICE_RUNNING_SUFFIX}</span></div>
              <div className="price-desc">
                Nothing switches off at the end of the install. This keeps it hosted, running and
                accurate when your prices, staff or policies change — which is most of the work.
              </div>
              <ul className="price-list">
                <li>Hosting and running costs</li>
                <li>Your written record kept current</li>
                <li>The agent re-checked against it</li>
                <li>Cancel any time — you keep the written record either way</li>
              </ul>
              <Link className="btn btn-solid" href="/ai-ready">start with your own journey</Link>
            </div>
          </div>

          <div className="founding" style={{ marginTop: 44 }}>
            <h2>As you <span className="accent">grow</span></h2>
            <p style={{ marginBottom: 24 }}>
              More agents when you want them, not before. Most people start with one and add a second
              when a different job starts annoying them — and by then your business is already written
              down, so the second one is quicker to build.
            </p>
            <div className="pricing-grid">
              <div className="price-card">
                <div className="price-tier">team</div>
                <div className="price-amount">{PRICE_TEAM}<span>{PRICE_TEAM_SUFFIX}</span></div>
                <div className="price-desc">A few agents covering one full journey, end to end.</div>
                <ul className="price-list">
                  <li>Everything in keep it running</li>
                  <li>Several agents, each with its own written limits</li>
                  <li>One complete customer journey</li>
                  <li>Shared drafts your team can see</li>
                </ul>
                <Link className="btn btn-ghost" href="/ai-ready">start with your own journey</Link>
              </div>
              <div className="price-card">
                <div className="price-tier">outcome</div>
                <div className="price-amount">{PRICE_OUTCOME}</div>
                <div className="price-desc">
                  Priced on the work delivered rather than on seats — for when the job is bigger than
                  one journey.
                </div>
                <ul className="price-list">
                  <li>Scoped against a result you name</li>
                  <li>A scorecard agreed before we start</li>
                  <li>Fail a line of it and we change the design or stop</li>
                </ul>
                <Link className="btn btn-ghost" href="/ai-ready">start with your own journey</Link>
              </div>
            </div>
          </div>

          <div className="founding" style={{ marginTop: 44 }}>
            <h2>What the two weeks <span className="accent">look like</span></h2>
            <p>
              <b>Week one</b> — we sit down and write your business down properly, then build the
              agent around it.<br />
              <b>Week two</b> — it runs against your real work. You watch it. We fix what&rsquo;s wrong.<br />
              <b>At the end</b> — a working agent, and honest numbers on whether it saved anyone time.
              If it didn&rsquo;t, we&rsquo;ll tell you.
            </p>
          </div>

          <div className="founding" style={{ marginTop: 44 }}>
            <h2>Before you pay <span className="accent">anything</span></h2>
            <p>
              <b>Paste your website.</b> We read one page, build an agent that knows your business,
              and show you the questions your site leaves hanging. About ten seconds, nothing saved.<br />
              <b>Ask the live agent something.</b> It answers from a sample business on the home page.<br />
              <b>The free tools.</b> Meeting notes, a 9am brief, share cards — one task each, no account.
            </p>
          </div>

          <p style={{ marginTop: 34, fontSize: 13, opacity: 0.6 }}>{PRICING_NOTE}</p>
        </div>

        <CineFooter />
      </div>
    </div>
  );
}
