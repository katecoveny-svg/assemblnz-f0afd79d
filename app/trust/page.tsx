import type { Metadata } from "next";
import Link from "next/link";
import { SectionReveal } from "@/components/SectionReveal";
import { ManaTrustLayerDiagram } from "@/components/trust/ManaTrustLayerDiagram";
import { SecurityPackForm } from "@/components/trust/SecurityPackForm";
import {
  CHANGE_LOG,
  COMPLIANCE_POSTURE,
  DATA_CLASS_LABELS,
  LAST_UPDATED,
  POSTURE_LABELS,
  SUB_PROCESSORS,
  TRUST_CENTRE_VERSION,
  type PostureStatus,
} from "@/lib/trust-centre/sub-processors";

export const metadata: Metadata = {
  title: "Trust Centre | assembl",
  description:
    "assembl's security, privacy, data-residency, and compliance posture in plain English. NZ-resident data, PII masked before any third-party model call, and verifiable evidence packs.",
  alternates: { canonical: "/trust" },
  robots: { index: true, follow: true },
};

const lastUpdatedLong = new Date(LAST_UPDATED).toLocaleDateString("en-NZ", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const SECTION_INDEX = [
  { id: "architecture", label: "Architecture" },
  { id: "data-residency", label: "Data residency" },
  { id: "sub-processors", label: "Sub-processors" },
  { id: "compliance", label: "Compliance posture" },
  { id: "receipts", label: "Evidence packs" },
  { id: "encryption", label: "Encryption" },
  { id: "incident-response", label: "Incident response" },
  { id: "retention", label: "Deletion & retention" },
  { id: "access", label: "Access controls" },
  { id: "ai-governance", label: "AI governance" },
  { id: "change-log", label: "Change log" },
  { id: "request", label: "Request the pack" },
];

function LastUpdated() {
  return (
    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--assembl-sand)]">
      Last updated {lastUpdatedLong}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  id,
}: {
  eyebrow: string;
  title: string;
  id: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
        {eyebrow}
      </p>
      <h2
        id={`${id}-heading`}
        className="mt-3 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-light leading-[1.05] text-[color:var(--text-primary)]"
      >
        {title}
      </h2>
      <LastUpdated />
    </div>
  );
}

const POSTURE_STYLES: Record<PostureStatus, string> = {
  live: "border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu-paper)] text-[color:var(--assembl-pounamu-deep)]",
  "in-progress": "border-[color:var(--assembl-gold-thread)] bg-[#FBF3E2] text-[#8A6516]",
  planned: "border-[color:var(--assembl-cloud)] bg-white text-[color:var(--text-secondary)]",
};

function PostureBadge({ status }: { status: PostureStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] ${POSTURE_STYLES[status]}`}
    >
      {POSTURE_LABELS[status]}
    </span>
  );
}

const sectionClass = "border-t border-[color:var(--assembl-cloud)] py-16 md:py-20";

export default function TrustCentrePage() {
  return (
    <main className="bg-[color:var(--assembl-paper)]">
      {/* ── Headline panel ─────────────────────────────────────────────── */}
      <section className="container pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-4xl">
          <SectionReveal>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
              Trust Centre · {TRUST_CENTRE_VERSION}
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.1rem,6.2vw,5.25rem)] font-light leading-[0.98] text-[color:var(--text-primary)]">
              Sovereign by default. Evidence-ready by design.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--text-secondary)]">
              assembl is built for Aotearoa New Zealand regulators and the teams who answer
              to them. This page lays out where your data lives, who touches it, what we can
              prove today, and how to get the full security pack — in plain English.
            </p>
            <LastUpdated />
          </SectionReveal>

          {/* Three counter-positioning points */}
          <SectionReveal delay={0.05}>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  head: "NZ data residency",
                  body: "An NZ-resident storage option is in progress. Your data is tenant-scoped, and only masked content ever reaches an offshore model — never raw PII.",
                },
                {
                  head: "PII never leaves unmasked",
                  body: "Personal information is masked before any third-party model call. Models see masked content, not raw PII.",
                },
                {
                  head: "Verifiable evidence",
                  body: "Every output ends in an evidence pack — a downloadable bundle anyone can independently verify.",
                },
              ].map((item) => (
                <li
                  key={item.head}
                  className="rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-5"
                >
                  <p className="font-display text-lg font-medium text-[color:var(--text-primary)]">
                    {item.head}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </SectionReveal>

          {/* Quick index — find anything in under 60 seconds */}
          <SectionReveal delay={0.1}>
            <nav aria-label="Trust Centre sections" className="mt-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                On this page
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2">
                {SECTION_INDEX.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="inline-flex rounded-full border border-[color:var(--assembl-cloud)] bg-white px-3.5 py-1.5 text-sm text-[color:var(--text-primary)] transition-colors hover:border-[color:var(--assembl-pounamu)] hover:text-[color:var(--assembl-pounamu)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--assembl-paper)]"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </SectionReveal>
        </div>
      </section>

      <div className="container">
        <div className="mx-auto max-w-4xl">
          {/* ── Architecture summary ─────────────────────────────────────── */}
          <section id="architecture" aria-labelledby="architecture-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Architecture" title="The Mana Trust Layer" id="architecture" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                Every output runs through one governance pipeline: Kahu → Iho → Tā → Mahara →
                Mana. Kahu captures the request and masks personal information before anything
                else happens. Iho routes the work to the right specialist agent and model. Tā
                drafts the work with every source cited inline. Mahara is where a named human
                in your team reviews, edits, or rejects. Mana captures the sign-off and seals
                the evidence pack. <strong className="font-medium text-[color:var(--text-primary)]">
                Personal information is masked before any third-party model call</strong> — model
                vendors receive masked content, not raw PII.
              </p>
              <div className="mt-8 overflow-x-auto rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-5 md:p-8">
                <div className="min-w-[640px]">
                  <ManaTrustLayerDiagram />
                </div>
              </div>
            </SectionReveal>
          </section>

          {/* ── Data residency ───────────────────────────────────────────── */}
          <section id="data-residency" aria-labelledby="data-residency-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Where your data lives" title="Data residency" id="data-residency" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                assembl is standing up a New Zealand–resident option for customer data. Our
                primary database, authentication, and file storage run on Supabase, and we are
                confirming an NZ-resident hosting region with our infrastructure team. Model
                inference may call providers based offshore, but personal information is masked
                before it reaches them — never raw PII.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu-paper)] p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu-deep)]">
                    assembl
                  </p>
                  <p className="mt-3 font-display text-xl font-light text-[color:var(--text-primary)]">
                    Built to keep your data in-region.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                    An NZ-resident storage option is in progress. Your data is tenant-scoped,
                    and masked content is the only thing that ever reaches an offshore model.
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                    The implicit alternative
                  </p>
                  <p className="mt-3 font-display text-xl font-light text-[color:var(--text-primary)]">
                    Routed offshore by default.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                    Most AI tools store and process your data overseas with no NZ-resident
                    option and no masking before the model sees it.
                  </p>
                </div>
              </div>
            </SectionReveal>
          </section>

          {/* ── Sub-processor list ───────────────────────────────────────── */}
          <section id="sub-processors" aria-labelledby="sub-processors-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Who touches your data" title="Sub-processors" id="sub-processors" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                Every third party that can touch customer data, with its location, purpose, and
                data-processing agreement. We review this list weekly and version-stamp every
                change in the log below.
              </p>
              <div className="mt-8 overflow-x-auto rounded-2xl border border-[color:var(--assembl-cloud)] bg-white">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                  <caption className="sr-only">
                    assembl sub-processors and their data-processing agreements
                  </caption>
                  <thead>
                    <tr className="border-b border-[color:var(--assembl-cloud)] text-[color:var(--text-secondary)]">
                      <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em]">Provider</th>
                      <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em]">Location</th>
                      <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em]">Purpose</th>
                      <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em]">Data</th>
                      <th scope="col" className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em]">DPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUB_PROCESSORS.map((p) => (
                      <tr key={p.name} className="border-b border-[color:var(--assembl-cloud)] last:border-0 align-top">
                        <th scope="row" className="px-4 py-4 font-medium text-[color:var(--text-primary)]">
                          {p.name}
                          {p.receivesMaskedPiiOnly ? (
                            <span className="mt-1 block font-mono text-[10px] font-normal uppercase tracking-[0.1em] text-[color:var(--assembl-pounamu)]">
                              Masked content only
                            </span>
                          ) : null}
                        </th>
                        <td className="px-4 py-4 text-[color:var(--text-secondary)]">{p.country}</td>
                        <td className="px-4 py-4 text-[color:var(--text-secondary)]">{p.purpose}</td>
                        <td className="px-4 py-4 text-[color:var(--text-secondary)]">
                          {p.dataClasses.map((c) => DATA_CLASS_LABELS[c]).join(", ")}
                        </td>
                        <td className="px-4 py-4">
                          <a
                            href={p.dpaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-sm text-[color:var(--assembl-pounamu)] underline underline-offset-2 hover:text-[color:var(--assembl-pounamu-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)]"
                          >
                            View DPA
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionReveal>
          </section>

          {/* ── Compliance posture ───────────────────────────────────────── */}
          <section id="compliance" aria-labelledby="compliance-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="What we can prove today" title="Compliance posture" id="compliance" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                Current state, not aspiration. Where a certification is on the roadmap we say
                so plainly — we will not claim an attestation we do not hold.
              </p>
              <ul className="mt-8 space-y-4">
                {COMPLIANCE_POSTURE.map((item) => (
                  <li
                    key={item.framework}
                    className="rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-5 md:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-display text-xl font-light text-[color:var(--text-primary)]">
                        {item.framework}
                      </h3>
                      <PostureBadge status={item.status} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                      {item.detail}
                    </p>
                    {item.target ? (
                      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--assembl-sand)]">
                        {item.target}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </section>

          {/* ── Evidence packs / Mana Receipts ───────────────────────────── */}
          <section id="receipts" aria-labelledby="receipts-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Verifiable by anyone" title="Evidence packs" id="receipts" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                Every output ends in an evidence pack — a downloadable bundle of PDFs and files
                you can show a regulator, an auditor, or a client. It records the sources, the
                decisions, the reviewer, and the timestamps, so the work can be checked without
                taking anyone&rsquo;s word for it.
              </p>
              <p className="mt-4 text-base leading-7 text-[color:var(--text-secondary)]">
                Underneath, we call this a Mana Receipt — Ed25519-signed and cryptographically
                tamper-evident. A regulator can paste a receipt into our public verifier and
                confirm it hasn&rsquo;t been altered.
              </p>
              <div className="mt-6">
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--assembl-pounamu)] px-6 py-2.5 text-sm font-medium text-[color:var(--assembl-pounamu)] transition-colors hover:bg-[color:var(--assembl-pounamu)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--assembl-paper)]"
                >
                  Verify a receipt
                </Link>
              </div>
            </SectionReveal>
          </section>

          {/* ── Encryption posture ───────────────────────────────────────── */}
          <section id="encryption" aria-labelledby="encryption-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="How it's protected" title="Encryption" id="encryption" />
              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { head: "At rest", body: "Customer data is encrypted at rest with AES-256." },
                  { head: "In transit", body: "All traffic is encrypted in transit with TLS 1.3." },
                  {
                    head: "Key management",
                    body: "Encryption keys are managed by our infrastructure providers, separated from the data they protect, and never exposed to application code.",
                  },
                ].map((item) => (
                  <li key={item.head} className="rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                      {item.head}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{item.body}</p>
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </section>

          {/* ── Incident response ────────────────────────────────────────── */}
          <section id="incident-response" aria-labelledby="incident-response-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="When something goes wrong" title="Incident response" id="incident-response" />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { head: "Detect", body: "Operational logging and audit trails let us spot anomalous access and surface it for review." },
                  { head: "Contain", body: "Affected credentials and access paths are revoked, and the scope is established before anything else." },
                  { head: "Notify", body: "We notify affected customers and, where required, the Office of the Privacy Commissioner." },
                ].map((item) => (
                  <div key={item.head} className="rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                      {item.head}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{item.body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 rounded-2xl border border-[color:var(--assembl-gold-thread)] bg-[#FBF3E2] p-5 text-sm leading-6 text-[color:var(--text-primary)]">
                <strong className="font-medium">72-hour commitment.</strong> The Privacy Act
                2020 requires notifiable breaches to be reported as soon as practicable. We
                hold ourselves to a tighter bar: notifying affected people and the Privacy
                Commissioner within 72 hours of becoming aware.
              </p>
            </SectionReveal>
          </section>

          {/* ── Data deletion + retention ────────────────────────────────── */}
          <section id="retention" aria-labelledby="retention-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Your data, your terms" title="Deletion & retention" id="retention" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                Retention is customer-configurable. By default, evidence packs are retained for
                the period agreed in your contract — typically aligned to your own tax, audit, or
                regulatory record-keeping obligations. Deletion requests are honoured unless
                another law requires us to retain a record.
              </p>
              <ul className="mt-6 space-y-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                <li>• <strong className="font-medium text-[color:var(--text-primary)]">Default retention:</strong> aligned to contract and regulatory record-keeping.</li>
                <li>• <strong className="font-medium text-[color:var(--text-primary)]">Configurable:</strong> set a shorter or longer window per workspace.</li>
                <li>• <strong className="font-medium text-[color:var(--text-primary)]">Deletion:</strong> request removal of your data; we confirm once complete.</li>
              </ul>
            </SectionReveal>
          </section>

          {/* ── Access controls ──────────────────────────────────────────── */}
          <section id="access" aria-labelledby="access-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Who can see what" title="Access controls" id="access" />
              <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { head: "Row-level security", body: "Supabase row-level security scopes every record to its tenant. One customer can never read another's data." },
                  { head: "Role-based access", body: "Access inside a workspace is role-based, so people only see what their role allows." },
                  { head: "Founder allowlist", body: "High-stakes outputs sit behind a founder allowlist — a named human gate before anything sensitive ships." },
                ].map((item) => (
                  <li key={item.head} className="rounded-2xl border border-[color:var(--assembl-cloud)] bg-white p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                      {item.head}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{item.body}</p>
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </section>

          {/* ── AI governance ────────────────────────────────────────────── */}
          <section id="ai-governance" aria-labelledby="ai-governance-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="How the agents are governed" title="AI governance" id="ai-governance" />
              <p className="mt-6 text-base leading-7 text-[color:var(--text-secondary)]">
                assembl&rsquo;s agents draft; people decide. Te Tiriti commitments and tikanga
                values shape how the agents are built and how they handle data.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Draft-only autonomy. No agent takes an external action on its own.",
                  "Human-in-the-loop. A named reviewer accepts, edits, or rejects before anything ships.",
                  "No auto-send. Nothing leaves your workspace until a person signs it off.",
                  "No training on customer data. We never use your workflow content to train public models.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-base leading-7 text-[color:var(--text-secondary)]">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--assembl-pounamu)]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </section>

          {/* ── Sub-processor change log ─────────────────────────────────── */}
          <section id="change-log" aria-labelledby="change-log-heading" className={sectionClass}>
            <SectionReveal>
              <SectionHeading eyebrow="Last 12 months" title="Change log" id="change-log" />
              <ul className="mt-8 space-y-3">
                {CHANGE_LOG.map((entry) => (
                  <li
                    key={`${entry.date}-${entry.summary}`}
                    className="flex flex-col gap-1 rounded-xl border border-[color:var(--assembl-cloud)] bg-white p-4 sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)]">
                      {new Date(entry.date).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="text-sm leading-6 text-[color:var(--text-secondary)]">{entry.summary}</span>
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </section>

          {/* ── Security pack request form ───────────────────────────────── */}
          <section id="request" aria-labelledby="request-heading" className={`${sectionClass} pb-24 md:pb-32`}>
            <SectionReveal>
              <SectionHeading eyebrow="Get the full pack" title="Request the security pack" id="request" />
              <p className="mt-6 max-w-2xl text-base leading-7 text-[color:var(--text-secondary)]">
                Need the full set of artefacts for a vendor review? Tell us a little about your
                request and our security team will reply from security@assembl.co.nz.
              </p>
              <div className="mt-8 rounded-3xl border border-[color:var(--assembl-cloud)] bg-white p-6 md:p-8">
                <SecurityPackForm />
              </div>
              <p className="mt-8 text-sm leading-6 text-[color:var(--text-secondary)]">
                This Trust Centre is reviewed and signed off by Kate Hudson, founder, Aotearoa.
                Spotted something that needs correcting? Email{" "}
                <a
                  href="mailto:security@assembl.co.nz"
                  className="rounded-sm text-[color:var(--assembl-pounamu)] underline underline-offset-2 hover:text-[color:var(--assembl-pounamu-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)]"
                >
                  security@assembl.co.nz
                </a>
                .
              </p>
            </SectionReveal>
          </section>
        </div>
      </div>
    </main>
  );
}
