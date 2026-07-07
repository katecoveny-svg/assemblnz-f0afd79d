import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionReveal } from '@/components/SectionReveal';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'The terms governing use of assembl.co.nz, app.assembl.co.nz, the SPARK tools, the workflow marketplace, and any embedded assembl widget.',
};

const LAST_REVIEWED = '27 May 2026';

export default function TermsPage() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
      <div className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <SectionReveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              Legal · Terms of Use
            </p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1
              className="mt-6 font-display leading-[0.98] tracking-tight"
              style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
            >
              Terms of Use.
            </h1>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Last reviewed · {LAST_REVIEWED}
            </p>
          </SectionReveal>

          <div className="mt-12 space-y-10 text-base leading-relaxed text-[color:var(--text-body)] md:text-[17px]">
            <SectionReveal delay={0.2}>
              <p>
                These terms (&quot;Terms&quot;) govern your use of assembl.co.nz, app.assembl.co.nz, the SPARK tools, the workflow marketplace, the embed widgets, the kete chats, and any other surface operated by assembl Ltd (&quot;assembl&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By using any of them you agree to these Terms. If you do not agree, stop using the service.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.22}>
              <div className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-6 md:p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">In plain English</p>
                <ul className="mt-4 space-y-2 text-[color:var(--text-body)]">
                  <li>Use assembl to draft work and build evidence packs — the public chats and SPARK tools are free to try.</li>
                  <li>Outputs are drafts: a named human on your team reviews and signs off before anything leaves your organisation.</li>
                  <li>Be fair — stay inside the rate limits, don&apos;t misuse the service, and we can suspend accounts that do.</li>
                </ul>
              </div>
            </SectionReveal>

            <SectionReveal delay={0.25}>
              <h2 className="font-display text-2xl font-light md:text-3xl">1. Who we are.</h2>
              <p className="mt-3">
                assembl Ltd is a New Zealand limited liability company, registered and operating in Tāmaki Makaurau (Auckland), Aotearoa New Zealand. These Terms are governed by New Zealand law and any dispute is subject to the exclusive jurisdiction of the New Zealand courts.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.3}>
              <h2 className="font-display text-2xl font-light md:text-3xl">2. What you can use it for.</h2>
              <p className="mt-3">You may use assembl to:</p>
              <ul className="mt-3 space-y-2 pl-5">
                <li className="list-disc">Try the public chats at <Link href="/c/waihanga" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">/c/[kete]</Link> and the SPARK tools at <Link href="/hapai" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">/hapai</Link> without signup, for personal evaluation.</li>
                <li className="list-disc">Run workflows from the marketplace at <Link href="/workflows" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">/workflows</Link>, share workflow links, and embed workflow widgets on your own website, subject to the rate limits in clause 4.</li>
                <li className="list-disc">Subscribe to an agent (or All-Access), or book a Pilot Sprint, to run real workflows against your team&apos;s data.</li>
                <li className="list-disc">Use the outputs as drafts. Every draft must be reviewed and signed off by a named human in your team before it leaves your organisation (see <Link href="/legal/disclaimer" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">Disclaimer</Link>).</li>
              </ul>
            </SectionReveal>

            <SectionReveal delay={0.35}>
              <h2 className="font-display text-2xl font-light md:text-3xl">3. What you can&apos;t use it for.</h2>
              <p className="mt-3">You may not use assembl to:</p>
              <ul className="mt-3 space-y-2 pl-5">
                <li className="list-disc">Generate content that you then claim was authored by a human, where the authorship matters legally or professionally (e.g. signed affidavits, regulated professional advice).</li>
                <li className="list-disc">Strip the visible assembl branding from outputs. Every workflow output carries a watermark and the embed widget displays the assembl wordmark — you may not remove, hide, or obscure either.</li>
                <li className="list-disc">Resell assembl access or embed our widgets on a site that masks the assembl provenance.</li>
                <li className="list-disc">Submit personal information about identifiable third parties without a lawful basis under the Privacy Act 2020, including the IPP 3A indirect-collection notification duties where they apply.</li>
                <li className="list-disc">Generate content that defames, harasses, threatens, or discriminates against any person or group, or that is unlawful under New Zealand law.</li>
                <li className="list-disc">Attempt to extract our model weights, reverse-engineer the platform, or use the platform to train a competing product.</li>
                <li className="list-disc">Generate karakia, whaikōrero, mihimihi, pepeha, or waiata — these are matters for human cultural sign-off, not for our agents.</li>
                <li className="list-disc">Scrape or automate use beyond the rate limits in clause 4 without a written agreement.</li>
              </ul>
            </SectionReveal>

            <SectionReveal delay={0.4}>
              <h2 className="font-display text-2xl font-light md:text-3xl">4. Rate limits and fair use.</h2>
              <p className="mt-3">
                The public marketplace and SPARK tools are free to evaluate. Default limits: <strong>3 runs per IP per workflow per hour</strong> for anonymous users; <strong>100 runs per tenant per day</strong> for signed-in tenants. Higher limits come with a paid agent subscription, All-Access, or a custom contract.
              </p>
              <p className="mt-3">
                We may throttle or temporarily suspend access if usage looks abusive or appears designed to bypass these limits. We&apos;ll tell you why before doing so where reasonably possible.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.45}>
              <h2 className="font-display text-2xl font-light md:text-3xl">5. Pricing.</h2>
              <ul className="mt-3 space-y-2 pl-5">
                <li className="list-disc"><strong>Free</strong> — the utility agents stay free, and every paid agent gives you 3 free messages before the paywall. No card to start.</li>
                <li className="list-disc"><strong>Everyday agent</strong> — NZ$9.99 per month per agent, GST inclusive. Monthly billing via Stripe. Cancel any time.</li>
                <li className="list-disc"><strong>Specialist agent</strong> — NZ$199 per month per agent, GST inclusive. Monthly billing via Stripe. Cancel any time.</li>
                <li className="list-disc"><strong>All-Access</strong> — NZ$250 per month, GST inclusive. Every agent we make, now and as we add them. Monthly billing via Stripe. Cancel any time.</li>
                <li className="list-disc"><strong>Pilot Sprint</strong> — a fixed-scope professional-services engagement, priced per the signed Statement of Work. Refundable until day one.</li>
              </ul>
              <p className="mt-3">
                Prices can change. If we change the price of a service you&apos;re using, we&apos;ll give you at least 30 days&apos; written notice before the new price applies.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.5}>
              <h2 className="font-display text-2xl font-light md:text-3xl">6. Intellectual property.</h2>
              <p className="mt-3">
                The assembl platform, the brand, the kete naming, the design language, the agent system prompts, the workflow registry, the evidence-pack format, and the underlying code are owned by assembl Ltd. You may not copy, reproduce, or redistribute them without our written permission.
              </p>
              <p className="mt-3">
                Outputs generated for you from your inputs are yours, subject to the visible assembl watermark and the third-party-rights of the underlying language-model providers. You retain copyright in the inputs you submit. You grant assembl a limited licence to process those inputs for the purpose of generating your output — no broader licence is granted, and your inputs are not used to train models.
              </p>
              <p className="mt-3">
                Te reo Māori names (kete names, agent names) are used with care and may engage cultural-IP considerations. We do not claim ownership of te reo or mātauranga Māori — we use these terms with the intent of building under tikanga, and we welcome correction from mana whenua.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.55}>
              <h2 className="font-display text-2xl font-light md:text-3xl">7. Copyright complaints.</h2>
              <p className="mt-3">
                If you believe an assembl output infringes your copyright, email{' '}
                <a href="mailto:copyright@assembl.co.nz" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">copyright@assembl.co.nz</a>{' '}
                with: (a) the work you believe is infringed, (b) the assembl output you believe is infringing, (c) your contact details, and (d) a statement that you are the copyright owner or authorised to act for them. We&apos;ll investigate within 10 working days.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.6}>
              <h2 className="font-display text-2xl font-light md:text-3xl">8. Privacy.</h2>
              <p className="mt-3">
                Our handling of personal information is governed by the <Link href="/privacy" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">Privacy Statement</Link> and <Link href="/legal/privacy" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">Privacy Policy</Link>, which are incorporated into these Terms by reference. By using assembl you confirm you have read and accept them.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.65}>
              <h2 className="font-display text-2xl font-light md:text-3xl">9. No warranties beyond the law.</h2>
              <p className="mt-3">
                The Consumer Guarantees Act 1993 and Fair Trading Act 1986 may apply to consumers under New Zealand law. Where those Acts apply, nothing in these Terms limits your statutory rights.
              </p>
              <p className="mt-3">
                Outside those statutory protections, assembl is provided &quot;as is&quot;. We do not warrant that outputs will be accurate, complete, fit for any particular purpose, or free of errors. We do not warrant uninterrupted service. Your reviewer is the safeguard, per the <Link href="/legal/disclaimer" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">Disclaimer</Link>.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.7}>
              <h2 className="font-display text-2xl font-light md:text-3xl">10. Liability.</h2>
              <p className="mt-3">
                To the maximum extent permitted by law, assembl&apos;s aggregate liability to you arising out of or relating to these Terms is limited to the fees you have paid us in the 12 months immediately preceding the event giving rise to the claim. We are not liable for indirect, consequential, or punitive damages, including loss of profit, loss of opportunity, or loss of goodwill.
              </p>
              <p className="mt-3">
                Nothing in this clause limits liability that cannot be limited under New Zealand law (including for fraud or wilful misconduct).
              </p>
            </SectionReveal>

            <SectionReveal delay={0.75}>
              <h2 className="font-display text-2xl font-light md:text-3xl">11. Termination.</h2>
              <p className="mt-3">
                You can cancel a subscription at any time from your account settings, or by emailing{' '}
                <a href="mailto:hello@assembl.co.nz" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">hello@assembl.co.nz</a>.
              </p>
              <p className="mt-3">
                We may suspend or terminate your access if you materially breach these Terms. Where reasonably possible we will notify you first and give you a chance to remedy. If we terminate, we will provide an export of your data on request.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.8}>
              <h2 className="font-display text-2xl font-light md:text-3xl">12. Changes.</h2>
              <p className="mt-3">
                We&apos;ll update this page as the platform matures. Substantive changes get a new &quot;last reviewed&quot; date at the top. Material changes that affect your obligations under an active contract will be communicated in writing at least 14 days before they take effect.
              </p>
              <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
                See also: <Link href="/legal/privacy" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">Privacy Policy</Link> · <Link href="/legal/disclaimer" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">Disclaimer</Link>
              </p>
            </SectionReveal>

            <SectionReveal delay={0.85}>
              <h2 className="font-display text-2xl font-light md:text-3xl">13. Contact.</h2>
              <p className="mt-3">
                General: <a href="mailto:hello@assembl.co.nz" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">hello@assembl.co.nz</a><br />
                Privacy: <a href="mailto:privacy@assembl.co.nz" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">privacy@assembl.co.nz</a><br />
                Copyright: <a href="mailto:copyright@assembl.co.nz" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">copyright@assembl.co.nz</a>
              </p>
            </SectionReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
