import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Scale,
  GraduationCap,
  HeartHandshake,
  Wallet,
  Users,
  Compass,
  RadioTower,
  Sparkles,
  Gavel,
} from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { PRICING_NOTE } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Hybrid Services — Operator-as-platform',
  description:
    'Assembl is the governance infrastructure for the hybrid services economy. Smaller, cheaper, more frequent professional services — delivered by human + agent operators on a sovereign, evidence-ready NZ platform.',
};

const ROLES = [
  {
    icon: Compass,
    label: 'Navigator',
    title: 'Move clients through systems too complex to face alone',
    body:
      'Court, IRD, MSD, immigration, the health system, school enrolment. You read the forms, draft the letters, sit in the meetings. Assembl scans the rules, pre-fills the documents, and keeps the audit trail.',
    fit: 'Ex-government caseworkers, paralegals, community-based social workers.',
  },
  {
    icon: RadioTower,
    label: 'Continuous Support Worker',
    title: 'Ongoing human contact around an agent-monitored signal',
    body:
      'Mental-health peer worker, financial coach, learning coach, care coordinator. Weekly cadence, agent-prepped session briefs, configurable escalation rules — you keep the relationship, Assembl keeps the watch.',
    fit: 'Peer workers, coaches, community health navigators, learning guides.',
  },
  {
    icon: Sparkles,
    label: 'Agent-Augmented Service Operator',
    title: 'Serve 5–10× more clients at a fraction of the unit price',
    body:
      'You are the lawyer, the accountant, the planner. The assembl agents draft the document, cite the legislation, flag the exposure. You judge, sign, and bill. Same expertise, denser surface area.',
    fit: 'Solo professionals, small practices, anyone whose week is bottlenecked at the keyboard.',
  },
] as const;

const ARCHETYPES = [
  {
    icon: Scale,
    domain: 'Preventative legal maintenance',
    accent: '#2B6B57',
    problem:
      'Small businesses and households see a lawyer at crisis — $3,500 once, instead of $99 every month for ongoing legal hygiene.',
    ai: 'Read every new contract the client signs, monitor employment law and tenancy law against their specific exposure, draft variation letters, build a client-specific clause library.',
    human:
      'A junior lawyer or licensed paralegal reviews the agent\'s flags weekly, makes the actionable call, signs the letter.',
    evidence: 'Quarterly Legal Posture pack — every contract scanned, every regulatory change applicable, every action taken.',
    primitives:
      'Operator + compliance-scanner + nz-compliance-autoupdate + esign-* + IKB for the contract library + draft-only autonomy on every letter.',
    example: 'A Whangārei paralegal monitors 40 SME clients at $99/month each.',
  },
  {
    icon: GraduationCap,
    domain: 'Always-on personalised learning with human pathway guidance',
    accent: '#AC5838',
    problem:
      'Tutoring is $60–120/hour and episodic. Most learners need persistence, not content — content is already free.',
    ai: 'Personalised plan, daily prompts, spaced repetition, explanations against the learner\'s specific stuck point, progress dashboard.',
    human:
      'A pathway guide runs a 20-minute weekly check-in. The job is confidence, choice, and persistence — not content.',
    evidence: 'Monthly learner report — what was covered, what stuck, next month\'s plan. Parent- and employer-readable.',
    primitives:
      'Ako kete + memory-recall + te-reo-video-learn pattern + scheduled tick + Unified Channel Gateway (SMS check-ins).',
    example: 'An NCEA tutor runs 60 learners with weekly 20-minute touchpoints instead of $80/hour 1:1s.',
  },
  {
    icon: HeartHandshake,
    domain: 'Mental-health support layer (between nothing and licensed therapy)',
    accent: '#3B7CB5',
    problem:
      'Therapy is $180–250/session and gated by wait times. Most people most of the time need a layer below — peer support, group work, continuous check-ins with a clear escalation path.',
    ai: 'Daily check-in prompts, mood logging, journal prompts, pattern recognition across weeks, crisis-keyword detection, session prep for the human supporter.',
    human:
      'A peer worker or group facilitator (not a licensed therapist) runs weekly groups or 1:1s — with a documented escalation pathway to a clinician.',
    evidence: 'Per-client wellbeing posture — adherence, escalations triggered, referrals made. Funder/insurer-readable.',
    primitives:
      'Operator + Mana Trust Layer PII masking + scheduled tick + compress-conversation + escalation-policy primitive (see below) + draft-only on every message.',
    example: 'A peer support worker runs three weekly groups of 12 with agent-prepped session briefs and crisis flagging.',
  },
  {
    icon: Wallet,
    domain: 'Continuous personal & small-business financial life support',
    accent: '#D4A853',
    problem:
      'Most people see an accountant once a year for tax. Insurance, KiwiSaver, debt, benefits eligibility, cash flow — would be consumed twelve times a year if the unit price was right.',
    ai: 'Bank-feed monitoring (via Xero/Akahu), benefit/credit eligibility scanning, tax-position projection, insurance-gap detection, retirement trajectory, document collation for IRD/MSD.',
    human:
      'A finance navigator reviews the agent\'s flags weekly, calls IRD on the client\'s behalf, judges the KiwiSaver provider switch.',
    evidence: 'Monthly financial-life statement + actions taken + decisions deferred. Annual return falls out as a side-effect.',
    primitives:
      'Operator + xero-sync + IKB document store + flux-monday-briefing pattern + compliance-scanner + esign-send.',
    example: 'A finance navigator does monthly reviews for 80 households at $39/month each.',
  },
  {
    icon: Users,
    domain: 'Family coordination (elder care, childcare, household)',
    accent: '#4AA5A8',
    problem:
      'Care coordination eats unpaid hours every week of every household with a dependent. The trust pieces won\'t be replaced. The coordination layer can be.',
    ai: 'Calendar synthesis, medication reminders, appointment prep, document collation, meal/grocery planning, multi-channel family comms.',
    human:
      'A coordinator handles the relational and trust pieces — interviewing carers, attending the school meeting, sitting in the GP appointment.',
    evidence: 'Care-plan timeline visible to all family members, with audit trail of decisions and consents.',
    primitives:
      'Tōro kete + google-calendar + memory-recall + compress-context + draft-only autonomy on every outbound message.',
    example: 'A care coordinator runs calendars, medications, and family comms for 30 elder-care households.',
  },
  {
    icon: Gavel,
    domain: 'Co-parenting navigator (Family Court-ready)',
    accent: '#6B5B95',
    problem:
      'Separated parents in Aotearoa pay for solicitors, mediators, and Family Court time to manage what is, day to day, a coordination and communication problem. The legal cost is high because the record-keeping is bad — texts go missing, screenshots are easy to dispute, expense receipts get lost, and by the time it reaches Family Dispute Resolution or the Family Court, no one can agree on what was said or paid.',
    ai: 'Hash-chained communication log between co-parents (every message timestamped and tamper-evident — court-admissible), shared expense ledger with receipt capture and child-support reconciliation against IRD assessments, calendar of care and handover log, tone-rewrite of hot messages before they send, deadline tracking against Care of Children Act and Child Support Act timeframes, parenting-plan and court-order document vault.',
    human:
      'A co-parenting navigator (paralegal, ex-FDR mediator, or trained social worker) holds the relationship — runs monthly check-ins with each parent, flags drift in the agreement, prepares the parties for FDR or counsel-led mediation, and is the escalation point when the agent surfaces a safety or compliance concern.',
    evidence: 'Monthly Co-Parenting Posture pack — every communication, every expense, every handover, every flag — exportable as a Family Court-ready bundle with hash-chain integrity proof and cited references to the Care of Children Act 2004, Child Support Act 1991, and any in-force parenting order.',
    primitives:
      'Tōro kete + Mana Trust Layer hash-chained audit log (`logWithHashChain`) + Unified Channel Gateway for asynchronous parent-to-parent messaging + escalation-policy primitive (see below) + esign for the parenting plan + draft-only autonomy on every message and every receipt categorisation. PII masking is mandatory because the case file contains children\'s data.',
    example:
      'A paralegal in Hamilton runs 50 separated families at $59/month each — couples who would otherwise be paying $350/hour for a lawyer to read their text history.',
  },
] as const;

const PRIMITIVES = [
  {
    name: 'Mana Trust Layer',
    body: 'Kahu → Iho → Tā → Mahara → Mana. PII masking, model selection, in-flight stamping, memory recall, post-flight rewrite. Privacy Act 2020-aligned out of the box.',
  },
  {
    name: 'Draft-only autonomy',
    body: 'Every agent action requires a human approval step. The exact human-in-the-loop pattern hybrid services already operate on.',
  },
  {
    name: 'Evidence packs',
    body: 'Every workflow ends with a branded, citable artefact. Maps directly to the deliverable a paying client expects.',
  },
  {
    name: '46 specialist agents + Iho router',
    body: 'Domain prompts, grounded recall, per-agent settings. Pick three to five agents per workflow instead of building from scratch.',
  },
  {
    name: 'AROHA / SIGNAL / SENTINEL',
    body: 'Cross-cutting HR, security, and uptime. The same compliance posture a one-person practice would otherwise have to assemble themselves.',
  },
  {
    name: 'NZ compliance autoupdate',
    body: 'Tracks regulatory changes against your client list. The hybrid-service operator\'s biggest scaling cost is staying current — Assembl does it for you.',
  },
] as const;

export default function HybridServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(74, 165, 168, 0.10) 0%, transparent 65%)',
          }}
        />
        <div className="relative container py-24 md:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <SectionReveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Operator-as-platform · Hybrid services
              </p>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <h1
                className="mt-6 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}
              >
                Smaller, cheaper,
                <br />
                more frequent
                <br />
                <em className="not-italic text-gradient-hero">professional services.</em>
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Historically, professional services were priced for crisis-only engagement. Hybrid
                operators — a person plus Assembl — can deliver continuous legal hygiene,
                financial life support, learning guidance, peer mental-health, and family
                coordination to the people and small businesses that were never agency clients
                before.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)]">
                Assembl is the governance layer underneath. Sovereign, NZ-built, evidence-ready,
                and already priced for a one-person practice.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.4}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  Talk to us about Operator-as-platform
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pilot-sprint"
                  className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
                >
                  Or start with a Pilot Sprint
                </Link>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.5}>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                NZ$1,490 / month + $590 setup · 50 outputs / month · {PRICING_NOTE}
              </p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Role picker */}
      <section className="relative bg-[color:var(--assembl-paper)] py-20 md:py-28">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Pick your operator shape
              </p>
              <h2
                className="mt-4 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                Three role shapes.{' '}
                <em className="not-italic text-gradient-hero">One platform.</em>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Hybrid services don’t fit a vertical kete. They fit a role shape that crosses
                verticals. The platform is the same; the workflow templates differ.
              </p>
            </div>
          </SectionReveal>

          <div className="mx-auto mt-16 grid max-w-7xl gap-6 md:grid-cols-3 md:gap-8">
            {ROLES.map((role, i) => {
              const Icon = role.icon;
              return (
                <SectionReveal key={role.label} delay={i * 0.1}>
                  <article className="glass-card-elevated h-full p-7 md:p-8">
                    <div className="flex items-center gap-3">
                      <Icon
                        className="h-5 w-5 text-[color:var(--assembl-pounamu)]"
                        aria-hidden
                      />
                      <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
                        {role.label}
                      </span>
                    </div>
                    <h3
                      className="mt-5 font-display leading-tight"
                      style={{ fontWeight: 300, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
                    >
                      {role.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                      {role.body}
                    </p>
                    <div className="mt-6 border-t border-[rgba(35,33,31,0.10)] pt-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                        Fits
                      </p>
                      <p className="mt-2 text-sm text-[color:var(--text-body)]">{role.fit}</p>
                    </div>
                  </article>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Five archetypes */}
      <section className="relative bg-[color:var(--assembl-paper)] py-20 md:py-28">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Five hybrid-service archetypes
              </p>
              <h2
                className="mt-4 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                What this looks like{' '}
                <em className="not-italic text-gradient-hero">in practice.</em>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                Each archetype is one underserved business problem, what the agent does, what
                the human does, what the client receives, and which Assembl primitives wire it up.
              </p>
            </div>
          </SectionReveal>

          <div className="mx-auto mt-16 grid max-w-7xl gap-6 md:gap-8">
            {ARCHETYPES.map((a, i) => {
              const Icon = a.icon;
              return (
                <SectionReveal key={a.domain} delay={i * 0.05}>
                  <article
                    className="glass-card relative overflow-hidden p-7 md:p-10"
                    style={{ ['--kete-accent' as string]: a.accent }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" style={{ color: a.accent }} aria-hidden />
                      <span
                        className="font-mono text-[11px] uppercase tracking-[0.22em]"
                        style={{ color: a.accent }}
                      >
                        {a.domain}
                      </span>
                    </div>

                    <p
                      className="mt-5 font-display leading-snug"
                      style={{ fontWeight: 300, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
                    >
                      {a.problem}
                    </p>

                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                          What the agent does
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                          {a.ai}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                          What the human does
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                          {a.human}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                          Evidence pack
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                          {a.evidence}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                          Assembl primitives
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">
                          {a.primitives}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[rgba(35,33,31,0.10)] pt-4">
                      <p className="text-sm italic leading-relaxed text-[color:var(--text-secondary)]">
                        Example — {a.example}
                      </p>
                    </div>
                  </article>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why this works on Assembl */}
      <section className="relative bg-[color:var(--assembl-paper)] py-20 md:py-28">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                Why this works on Assembl
              </p>
              <h2
                className="mt-4 font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
              >
                The governance layer{' '}
                <em className="not-italic text-gradient-hero">is already built.</em>
              </h2>
            </div>
          </SectionReveal>

          <div className="mx-auto mt-16 grid max-w-7xl gap-6 md:grid-cols-2 md:gap-8">
            {PRIMITIVES.map((p, i) => (
              <SectionReveal key={p.name} delay={i * 0.05}>
                <article className="glass-card-elevated h-full p-7 md:p-8">
                  <h3 className="font-display text-2xl leading-tight md:text-3xl">{p.name}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                    {p.body}
                  </p>
                </article>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-[color:var(--assembl-paper)] py-32 md:py-40">
        <div className="container">
          <SectionReveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2
                className="font-display leading-[0.95] tracking-tight"
                style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 5.5vw, 5rem)' }}
              >
                Bring the people.{' '}
                <em className="not-italic text-gradient-hero">We bring the platform.</em>
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
                If you can see your practice in any of the five archetypes above — or if you
                want to run a role shape we haven’t named yet — talk to us. We’ll wire your
                first workflow in a two-week Pilot Sprint.
              </p>
              <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="cta-primary inline-flex h-12 items-center px-8 text-sm md:text-base"
                >
                  Talk to us
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-ghost inline-flex h-12 items-center px-8 text-sm md:text-base"
                >
                  See full pricing
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
