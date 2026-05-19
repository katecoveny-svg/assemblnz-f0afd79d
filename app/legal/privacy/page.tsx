import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionReveal } from '@/components/SectionReveal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    "How assembl collects, uses, stores, and discloses personal information under the New Zealand Privacy Act 2020, including the new IPP 3A (effective 1 May 2026).",
};

const LAST_REVIEWED = '19 May 2026';

export default function PrivacyPage() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
      <div className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <SectionReveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              Legal · Privacy Policy
            </p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1
              className="mt-6 font-display leading-[0.98] tracking-tight"
              style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
            >
              Privacy Policy.
            </h1>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Last reviewed · {LAST_REVIEWED} · Privacy Act 2020 (incl. IPP 3A from 1 May 2026)
            </p>
          </SectionReveal>

          <div className="mt-12 space-y-10 text-base leading-relaxed text-[color:var(--text-body)] md:text-[17px]">
            <SectionReveal delay={0.2}>
              <p>
                assembl Ltd ("assembl", "we", "us", "our") is a New Zealand company that operates the platform at assembl.co.nz and the app at app.assembl.co.nz. We handle personal information in accordance with the Privacy Act 2020 and the thirteen Information Privacy Principles (IPPs), including IPP 3A (indirect collection notification) which came into force on 1 May 2026.
              </p>
              <p className="mt-3">
                Our nominated Privacy Officer is the assembl founder, Kate Hudson. You can reach the Privacy Officer at{' '}
                <a href="mailto:privacy@assembl.co.nz" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">
                  privacy@assembl.co.nz
                </a>.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.25}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">What we collect <span className="text-base text-[color:var(--text-secondary)]">(IPP 1, IPP 2)</span></h2>
              <p className="mt-3">We collect the minimum personal information needed to run the platform:</p>
              <ul className="mt-3 space-y-2 pl-5">
                <li className="list-disc"><strong>Account details</strong> — your name, work email, organisation name when you sign up or book a Pilot Sprint.</li>
                <li className="list-disc"><strong>Usage data</strong> — which workflows you run, which kete chats you open, when, from what IP (hashed before storage). Used for rate-limiting and product analytics.</li>
                <li className="list-disc"><strong>Workflow inputs</strong> — the text and files you submit to a workflow. This is the substance of the work. Stored against your tenant; deleted on your request.</li>
                <li className="list-disc"><strong>Workflow outputs</strong> — drafts produced by our agents, paired with reviewer sign-offs, sealed in evidence packs.</li>
                <li className="list-disc"><strong>Payment details</strong> — collected by our payment processor Stripe, not by assembl directly. We see your subscription status, not your card number.</li>
                <li className="list-disc"><strong>Communications</strong> — emails, support messages, contact-form submissions.</li>
              </ul>
              <p className="mt-3">
                We do not collect special categories of information (health, biometric, children&apos;s data) unless your specific Industry Pack requires it and you have given explicit consent. The Tōro family kete may collect information about tamariki — that data is scoped to your whānau tenant and never surfaced outside it.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.3}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">Why we collect it <span className="text-base text-[color:var(--text-secondary)]">(IPP 1)</span></h2>
              <ul className="mt-3 space-y-2 pl-5">
                <li className="list-disc">To provide the agents, workflows, evidence packs, and dashboards you are paying for.</li>
                <li className="list-disc">To bill you correctly and process payments.</li>
                <li className="list-disc">To comply with our own legal obligations (tax records, anti-money-laundering checks).</li>
                <li className="list-disc">To improve the platform — analysing aggregated, de-identified usage patterns.</li>
                <li className="list-disc">To respond to your support requests and contact-form messages.</li>
              </ul>
              <p className="mt-3">
                We do not sell your data. We do not use your workflow inputs to train models. We do not surface one tenant&apos;s data inside another tenant&apos;s view.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.35}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">How you&apos;re told about collection <span className="text-base text-[color:var(--text-secondary)]">(IPP 3, IPP 3A)</span></h2>
              <p className="mt-3">
                When you give us information directly — through a signup form, a Pilot Sprint enquiry, a workflow submission — we tell you what we&apos;re collecting and why, at the point of collection. That&apos;s IPP 3.
              </p>
              <p className="mt-3">
                Under <strong>IPP 3A</strong>, which came into force on 1 May 2026, when we collect personal information about you from someone else (for example, a teammate adds you to their assembl tenant, or your accountant Xero shares your details so we can issue invoices), we will notify you as soon as practicable — usually by email — that we&apos;ve received your information, what we&apos;re using it for, and how you can correct it.
              </p>
              <p className="mt-3">
                Exceptions: we don&apos;t send an IPP 3A notification when the information comes from a regulator (Inland Revenue, WorkSafe, the Privacy Commissioner) or when notification would prejudice the maintenance of the law.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.4}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">How we protect it <span className="text-base text-[color:var(--text-secondary)]">(IPP 5)</span></h2>
              <ul className="mt-3 space-y-2 pl-5">
                <li className="list-disc">All data is stored in Supabase (Postgres) in the ap-southeast-2 region (Sydney). Backups remain within Australia/New Zealand.</li>
                <li className="list-disc">All connections are encrypted in transit with TLS 1.3.</li>
                <li className="list-disc">All data is encrypted at rest using AES-256.</li>
                <li className="list-disc">Row-level security policies enforce tenant isolation at the database level.</li>
                <li className="list-disc">Service-role credentials are rotated, scoped to specific edge functions, and never exposed to the browser.</li>
                <li className="list-disc">Access to production data is restricted to assembl Ltd directors. We log every read.</li>
              </ul>
            </SectionReveal>

            <SectionReveal delay={0.45}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">Who we share it with <span className="text-base text-[color:var(--text-secondary)]">(IPP 11, IPP 12)</span></h2>
              <p className="mt-3">We share personal information only with the providers we need to run the platform:</p>
              <ul className="mt-3 space-y-2 pl-5">
                <li className="list-disc"><strong>Supabase</strong> (Australia / United States) — database and authentication.</li>
                <li className="list-disc"><strong>Vercel</strong> (United States) — hosting and content delivery.</li>
                <li className="list-disc"><strong>Google Cloud / Anthropic</strong> (United States) — the language-model inference for agents. Your inputs are sent to these providers transiently to generate the draft, and are not retained for training.</li>
                <li className="list-disc"><strong>Stripe</strong> (United States) — payment processing.</li>
                <li className="list-disc"><strong>Brevo</strong> (European Union) — transactional email delivery.</li>
                <li className="list-disc"><strong>Cloudflare</strong> (United States) — DNS and DDoS protection.</li>
              </ul>
              <p className="mt-3">
                Under IPP 12 (cross-border disclosure), we have taken reasonable steps to ensure each of the above provides comparable safeguards to the Privacy Act 2020 — through their published data-processing agreements, ISO 27001 certifications, and Privacy Shield / Standard Contractual Clauses where applicable.
              </p>
              <p className="mt-3">
                We do not share personal information with marketers, data brokers, advertisers, or any third party that has not been listed above. If we needed to add a new provider, this page would be updated and material changes communicated to active tenants.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.5}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">How long we keep it <span className="text-base text-[color:var(--text-secondary)]">(IPP 9)</span></h2>
              <ul className="mt-3 space-y-2 pl-5">
                <li className="list-disc"><strong>Account details</strong> — for the life of your tenant, plus 7 years after closure (Inland Revenue requirement).</li>
                <li className="list-disc"><strong>Workflow inputs and outputs</strong> — for the life of your tenant, plus the retention period specified in your contract. On request we will delete them sooner where lawfully possible.</li>
                <li className="list-disc"><strong>Evidence packs</strong> — by default 7 years, to support audit and contract trails. Configurable per tenant.</li>
                <li className="list-disc"><strong>Hashed IP addresses</strong> — 90 days, for rate-limiting and abuse detection.</li>
                <li className="list-disc"><strong>Unsuccessful Pilot Sprint enquiries</strong> — 12 months, then deleted.</li>
              </ul>
            </SectionReveal>

            <SectionReveal delay={0.55}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">Your rights <span className="text-base text-[color:var(--text-secondary)]">(IPP 6, IPP 7)</span></h2>
              <p className="mt-3">
                You have the right to ask for a copy of your personal information (IPP 6), and to correct it if it&apos;s wrong (IPP 7). Email{' '}
                <a href="mailto:privacy@assembl.co.nz" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">privacy@assembl.co.nz</a>{' '}
                with your request. We will respond within 20 working days and ordinarily provide your data within that window without charge.
              </p>
              <p className="mt-3">
                You can also ask us to delete your data outside the retention rules above. We will action your request unless we are legally required to hold the data (for example, IRD tax records). If we cannot delete, we will explain why.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.6}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">If something goes wrong</h2>
              <p className="mt-3">
                If we experience a notifiable privacy breach — one likely to cause serious harm — we will notify the Office of the Privacy Commissioner and affected individuals as soon as practicable, per the Privacy Act 2020. We keep a written log of every breach, including small ones, with date, scope, and remediation steps.
              </p>
              <p className="mt-3">
                If you believe we have mishandled your personal information, please tell us first at{' '}
                <a href="mailto:privacy@assembl.co.nz" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">privacy@assembl.co.nz</a>{' '}
                so we can investigate. If you remain unsatisfied, you can complain to the Office of the Privacy Commissioner:
              </p>
              <ul className="mt-3 space-y-1 pl-5">
                <li className="list-disc">Web: privacy.org.nz</li>
                <li className="list-disc">Phone: 0800 803 909</li>
                <li className="list-disc">Email: enquiries@privacy.org.nz</li>
              </ul>
            </SectionReveal>

            <SectionReveal delay={0.65}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">Cookies and analytics</h2>
              <p className="mt-3">
                assembl.co.nz uses essential cookies for authentication and session management. We do not use third-party advertising cookies. We do not run Facebook Pixel or Google Analytics 4 tracking on the public marketing site. Logged-in app analytics (which workflows you ran, what your reviewer accepted) are recorded against your tenant and visible to you in your admin dashboard.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.7}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">Changes to this policy</h2>
              <p className="mt-3">
                We&apos;ll update this page as the platform changes. Substantive changes get a new "last reviewed" date at the top. Material changes that affect your obligations under an active contract will be communicated to you in writing at least 14 days before they take effect.
              </p>
              <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
                See also: <Link href="/legal/disclaimer" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">Disclaimer</Link> · <Link href="/legal/terms" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">Terms of Use</Link>
              </p>
            </SectionReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
