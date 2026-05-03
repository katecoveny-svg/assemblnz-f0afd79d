import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Anchor, Handshake, ShieldCheck, Sprout } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Built in Aotearoa. Compliance-grounded. Te Tiriti principles in the architecture, not the marketing. Provenance watermarked into every output.",
};

const PRINCIPLES = [
  {
    icon: Anchor,
    title: "NZ-built, NZ-grounded",
    body:
      "Designed in Aotearoa for the regulators, councils, and customers our customers actually deal with. Outputs cite the relevant Act and section, not a generic global standard.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance is the product",
    body:
      "Every kete is built around the legislation it has to live within. Building Act, Food Act, Customs Act, Sale of Alcohol Act, Land Transport Rule. The kete is only useful if the output is auditor-defensible — that's the bar.",
  },
  {
    icon: Handshake,
    title: "Te Tiriti in the architecture",
    body:
      "Tino rangatiratanga over your data: it stays in your account, in NZ where you choose, and your customers' records aren't training fuel for somebody else's model. Te reo Māori is a first-class option, not a checkbox.",
  },
  {
    icon: Sprout,
    title: "Quiet by design",
    body:
      "We don't believe in dashboards full of red dots. The right amount of agent attention is the amount you don't notice — until the moment it matters, then it surfaces with the evidence already prepared.",
  },
];

const PROVENANCE_FACTS = [
  {
    label: "Cryptographic signature",
    body:
      "Every evidence pack carries a SHA-256 signature of its inputs, the model and prompt version that produced it, and the time it was generated. Tampering is detectable, not hidden.",
  },
  {
    label: "Visible watermark",
    body:
      "Documents include a human-visible provenance footer — kete, agent, and pack ID — so an auditor or regulator can verify the trail without specialist tools.",
  },
  {
    label: "Verifiable record",
    body:
      "We keep a hash of every output for the lifetime of your account. If the document you're holding in court doesn't match, we'll say so on the record.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(217, 188, 122, 0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(201, 216, 208, 0.20) 0%, transparent 50%)",
          }}
        />
        <div className="container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-sage inline-flex">About Assembl</span>
            <h1 className="mt-6 font-display text-5xl md:text-6xl">
              <span className="text-gradient-hero">Quiet intelligence,</span>
              <br />
              <span className="text-[color:var(--text-primary)]">
                built in Aotearoa.
              </span>
            </h1>
            <p className="mt-6 text-lg text-[color:var(--text-body)]">
              We make autonomous AI agents for NZ businesses — kete that cite
              the legislation they work under, produce evidence packs that hold
              up to auditor scrutiny, and stay quietly out of the way until
              they're needed.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              How we build
            </span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Four principles. No more.
            </h2>
            <p className="mt-4 text-[color:var(--text-body)]">
              We've kept this short on purpose. If it can't fit on this page,
              it's probably not load-bearing.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <article key={p.title} className="glass-card relative p-7">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(217, 188, 122, 0.12)",
                      border: "1px solid rgba(217, 188, 122, 0.25)",
                    }}
                  >
                    <p.icon
                      className="h-5 w-5 text-[color:var(--assembl-soft-gold)]"
                      aria-hidden
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-[color:var(--text-primary)]">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                      {p.body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Te Tiriti */}
      <section className="relative">
        <div className="container py-16">
          <div className="glass-card-elevated mx-auto max-w-4xl p-8 md:p-12">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Te Tiriti o Waitangi
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Principles in the system, not the brochure.
            </h2>

            <div className="mt-8 grid gap-8 md:grid-cols-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-soft-gold)]">
                  Tino rangatiratanga
                </p>
                <p className="mt-2 text-sm text-[color:var(--text-body)]">
                  Your data, your account. We don't train shared models on it.
                  Export and delete are real, fast, and audited.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-soft-gold)]">
                  Kāwanatanga
                </p>
                <p className="mt-2 text-sm text-[color:var(--text-body)]">
                  We work with NZ-resident data hosting and NZ legal
                  jurisdiction by default. Our terms aren't drafted to favour
                  an offshore arbitrator.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-soft-gold)]">
                  Ōritetanga
                </p>
                <p className="mt-2 text-sm text-[color:var(--text-body)]">
                  Te reo Māori is a first-class output language. Tikanga
                  reviews are available on creative work, with kaupapa-led
                  partners — not an internal "AI ethics" team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Provenance */}
      <section className="relative">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Provenance watermark
            </span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Defensible by default.
            </h2>
            <p className="mt-4 text-[color:var(--text-body)]">
              Every meaningful output Assembl produces is signed, timestamped,
              and carries a visible provenance trail. If the document you're
              holding has been altered, it stops matching the record. That's
              the point.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PROVENANCE_FACTS.map((f) => (
              <div key={f.label} className="glass-card p-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--assembl-soft-gold)]">
                  {f.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative">
        <div className="container pb-20 pt-8">
          <div className="glass-card-elevated mx-auto max-w-4xl p-8 text-center md:p-12">
            <h2 className="font-display text-3xl md:text-4xl">
              See it work in your own data.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[color:var(--text-body)]">
              The fastest way to make sense of Assembl is to watch it produce
              a real evidence pack on a real workflow you already have.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                Book a demo
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/pricing"
                className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
