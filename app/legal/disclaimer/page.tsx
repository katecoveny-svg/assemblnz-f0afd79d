import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionReveal } from '@/components/SectionReveal';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description:
    "assembl produces drafts and evidence packs reviewed by a named person on your team. We do not provide legal, tax, medical, or financial advice.",
};

const LAST_REVIEWED = '27 May 2026';

export default function DisclaimerPage() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
      <div className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <SectionReveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              Legal · Disclaimer
            </p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1
              className="mt-6 font-display leading-[0.98] tracking-tight"
              style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
            >
              Disclaimer.
            </h1>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Last reviewed · {LAST_REVIEWED}
            </p>
          </SectionReveal>

          <div className="mt-12 space-y-10 text-base leading-relaxed text-[color:var(--text-body)] md:text-[17px]">
            <SectionReveal delay={0.2}>
              <h2 className="font-display text-2xl font-light md:text-3xl">What assembl is.</h2>
              <p className="mt-3">
                assembl is a fleet of specialist agents that handle the admin-heavy, repetitive work your team is already doing manually — drafts, reports, comparisons, follow-ups. Every output is a draft. Nothing leaves assembl until a named human on your team has reviewed it and signed off.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.25}>
              <h2 className="font-display text-2xl font-light md:text-3xl">What assembl is not.</h2>
              <p className="mt-3">
                We do not provide legal advice, tax advice, medical advice, financial advice, structural-engineering judgments, or any other professional service that requires a qualified, licensed practitioner in Aotearoa New Zealand. Where outputs reference legislation (the Privacy Act 2020, the Construction Contracts Act 2002, the Food Act 2014, the Consumer Guarantees Act 1993, and so on), those references are summary-only and must be verified by a qualified person before relying on them.
              </p>
              <p className="mt-3">
                We do not generate karakia, whaikōrero, mihimihi, pepeha, or waiata. Some forms of mātauranga Māori are not ours to generate. Where cultural sign-off matters, we defer to mana whenua, kaumātua, and Te Hiku frameworks.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.3}>
              <h2 className="font-display text-2xl font-light md:text-3xl">How outputs are produced.</h2>
              <p className="mt-3">
                Every workflow runs through the same five-stage pipeline: Kahu (intake), Iho (router), Tā (drafting), Mahara (named human review), Mana (sealed in an evidence pack). The agents that draft work cite their sources inline. Drafts that reach a customer have been seen and signed off by a named person on your team.
              </p>
              <p className="mt-3">
                Outputs from the public chat at <Link href="/c/waihanga" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">/c/[kete]</Link> and the public workflow marketplace at <Link href="/workflows" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">/workflows</Link> are demonstration drafts intended for evaluation. They are not customer-facing, signed-off work — that pathway begins at the Pilot Sprint stage.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.35}>
              <h2 className="font-display text-2xl font-light md:text-3xl">Reviewer responsibility.</h2>
              <p className="mt-3">
                When your team uses assembl in production, you nominate the named human(s) who will review and accept each draft before it leaves your organisation. That reviewer carries professional responsibility for the output. assembl provides the draft, the citations, and the trail — your reviewer provides the judgement. Reviewer sign-offs are recorded in the evidence pack with timestamp, reasoning, and hash-chain entry.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.4}>
              <h2 className="font-display text-2xl font-light md:text-3xl">Accuracy and limitations.</h2>
              <p className="mt-3">
                assembl uses third-party language models (Google Gemini, Anthropic Claude) to draft work. These models can make mistakes, hallucinate citations, and produce text that sounds confident but is wrong. We mitigate by citing sources inline, requiring named-human review, and sealing outputs with a hash chain — but we do not guarantee accuracy, completeness, or fitness for any specific legal, regulatory, or professional purpose. If accuracy is critical, your reviewer is the safeguard.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.45}>
              <h2 className="font-display text-2xl font-light md:text-3xl">No professional relationship created.</h2>
              <p className="mt-3">
                Using assembl, the public chat, the HAPAI tools, or the workflow marketplace does not create a lawyer-client, accountant-client, doctor-patient, financial-adviser-client, or any other professional relationship between you and assembl, between you and Kate Hudson, or between you and any agent in the assembl fleet. For matters requiring a regulated professional, engage one.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.5}>
              <h2 className="font-display text-2xl font-light md:text-3xl">Indemnity.</h2>
              <p className="mt-3">
                To the maximum extent permitted by law, you agree to indemnify assembl Ltd and its directors, employees, and contractors against any loss, claim, or liability arising from your use of the platform, including any reliance on a draft that was not properly reviewed by a qualified human in your team before action was taken.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.55}>
              <h2 className="font-display text-2xl font-light md:text-3xl">Updates to this disclaimer.</h2>
              <p className="mt-3">
                We may update this page as the platform matures. Substantive changes are recorded with a new &quot;last reviewed&quot; date at the top. Material changes that affect your obligations under an active contract will be communicated to you in writing.
              </p>
            </SectionReveal>

            <SectionReveal delay={0.6}>
              <h2 className="font-display text-2xl font-light md:text-3xl">Questions.</h2>
              <p className="mt-3">
                If anything here is unclear, or you believe a draft we produced was wrong in a way that mattered, write to{' '}
                <a
                  href="mailto:hello@assembl.co.nz"
                  className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline"
                >
                  hello@assembl.co.nz
                </a>{' '}
                or via the <Link href="/contact" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">contact page</Link>.
              </p>
              <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
                See also: <Link href="/legal/privacy" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">Privacy Policy</Link> · <Link href="/legal/terms" className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline">Terms of Use</Link>
              </p>
            </SectionReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
