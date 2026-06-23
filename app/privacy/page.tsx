import type { Metadata } from "next";
import Link from "next/link";
import { SectionReveal } from "@/components/SectionReveal";

export const metadata: Metadata = {
  title: "Privacy Statement | assembl",
  description:
    "How assembl collects, uses, stores, and protects personal information under the Privacy Act 2020, including IPP 3A.",
};

const sections = [
  {
    title: "What we collect",
    body:
      "We collect the minimum information needed to run assembl: account details, organisation details, workflow inputs, uploaded files, generated drafts, review decisions, audit metadata, support messages, billing status, and security logs. Workflow inputs can include personal information where a user chooses to provide it.",
  },
  {
    title: "Why we use it",
    body:
      "We use this information to provide draft-only agent workflows, retrieve relevant knowledge, maintain audit logs, support customers, prevent abuse, bill correctly, and improve the product using aggregated or de-identified usage signals. We do not sell personal information and we do not use customer workflow data to train public models.",
  },
  {
    title: "Indirect collection and IPP 3A",
    body:
      "The Privacy Amendment Act 2025 added Information Privacy Principle 3A, in force from 1 May 2026. Where assembl receives personal information about a person from someone else, we design workflows so users can notify affected people when required and record the source, purpose, and reviewer responsible for that notice.",
  },
  {
    title: "Storage, retention, and security",
    body:
      "Customer records are stored in tenant-scoped systems with row-level security, encrypted transport, encrypted storage, restricted service credentials, and audit logging. Evidence packs are retained for the period agreed with the customer, typically aligned to contract, tax, or regulatory record-keeping requirements. Deletion requests are honoured unless another law requires retention.",
  },
  {
    title: "Model and vendor disclosure",
    body:
      "Draft generation may call Anthropic, Google Gemini, OpenAI, Supabase, Vercel, Stripe, Twilio, or other named infrastructure providers depending on the workflow. Sensitive workflows mask or minimise personal information before retrieval or model calls wherever practicable.",
  },
  {
    title: "Access, correction, and complaints",
    body:
      "People can request access to or correction of personal information held by assembl. If we cannot resolve a privacy concern directly, the Office of the Privacy Commissioner provides the independent complaints channel for New Zealand privacy matters.",
  },
];

export default function PrivacyStatementPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)]">
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <SectionReveal>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
              Compliance · Privacy
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(3rem,7vw,6rem)] font-light leading-[0.92] text-[color:var(--text-primary)]">
              Privacy Statement.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[color:var(--text-secondary)]">
              assembl is built for review-first work. We treat personal information as
              something entrusted to a named human, not something a system gets to move
              around on its own.
            </p>
          </SectionReveal>

          <div className="mt-14 grid gap-5">
            {sections.map((section, index) => (
              <SectionReveal key={section.title} delay={0.05 * index}>
                <article className="border-t border-[rgba(157,140,125,0.22)] py-7">
                  <h2 className="font-display text-2xl font-light text-[color:var(--text-primary)] md:text-3xl">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-base leading-8 text-[color:var(--text-secondary)]">
                    {section.body}
                  </p>
                </article>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal delay={0.35}>
            <div className="mt-10 border-l-2 border-[color:var(--assembl-pounamu)] bg-[rgba(58,56,50,0.06)] p-5 text-sm leading-7 text-[color:var(--text-secondary)]">
              Contact:{" "}
              <a className="underline-offset-2 hover:underline" href="mailto:assembl@assembl.co.nz">
                assembl@assembl.co.nz
              </a>
              . Independent privacy complaints can be raised with the{" "}
              <a
                className="underline-offset-2 hover:underline"
                href="https://www.privacy.org.nz/your-rights/complaint-or-privacy-breach/"
                rel="noreferrer"
                target="_blank"
              >
                Office of the Privacy Commissioner
              </a>
              . See the Privacy Act principles at{" "}
              <a
                className="underline-offset-2 hover:underline"
                href="https://www.privacy.org.nz/privacy-act-2020/privacy-principles/"
                rel="noreferrer"
                target="_blank"
              >
                privacy.org.nz
              </a>
              .
            </div>
            <p className="mt-6 text-sm text-[color:var(--text-secondary)]">
              Related: <Link className="underline-offset-2 hover:underline" href="/ai-use">AI use disclosure</Link>{" "}
              · <Link className="underline-offset-2 hover:underline" href="/te-tiriti">Te Tiriti statement</Link>
            </p>
          </SectionReveal>
        </div>
      </section>
    </main>
  );
}
