'use client';

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { CheckCircle2, FileCheck2, Search, Send, ShieldCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { TeReo } from './TeReo';

const PHASES = [
  {
    number: '01',
    title: 'Hunt',
    body: 'The fleet scans the live operating surface: inbox, calendar, register, supplier folder, and the rules that govern the work. It surfaces the next permit, lead, renewal, or risk before the operator has to ask.',
  },
  {
    number: '02',
    title: 'Pitch',
    body: 'A specialist agent drafts the quote, email, or pathway note in your approved voice. Citations sit in the margin so the reviewer can see which rule or source shaped the recommendation.',
  },
  {
    number: '03',
    title: 'Execution',
    body: 'Tasks move through the operating loop: routed, checked, assigned, and held for human approval where consequence or uncertainty rises.',
  },
  {
    number: '04',
    title: 'Ledger',
    body: 'The work becomes a record. Decisions, citations, timestamps, reviewer notes, and source documents are bundled into the evidence pack.',
  },
  {
    number: '05',
    title: 'Iho + Signal',
    body: 'Governance stays visible. Iho routes the work and Signal watches privacy, security, and rule drift. Named reviewers remain in the trail.',
  },
] as const;

function DemoPanel({ phase }: { phase: number }) {
  const Icon = [Search, Send, CheckCircle2, FileCheck2, ShieldCheck][phase];
  const content = [
    ['Permit lead surfaced', 'Building consent renewal due in 12 days', 'Matched to Waihanga / Whakaaē'],
    ['Draft ready for review', 'Email to council with two citations attached', 'Reviewer: Kate Hudson'],
    ['Workflow checklist', 'Scope confirmed · Product evidence attached · RFI response queued', '3 of 5 steps complete'],
    ['Evidence pack preview', '18 pages · 2.4 MB · Mana seal pending', 'Workflow ID ASB-WHG-0428'],
    ['Governance trail', '09:14 Iho routed · 09:16 Signal checked · 09:22 Kate approved', 'No privacy escalation'],
  ][phase];

  return (
    <motion.div
      key={phase}
      initial={{ opacity: 0.6, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[8px] border border-[rgba(35,33,31,0.16)] bg-[#1f211f] p-5 text-[#FFF7EC] shadow-[0_28px_80px_rgba(35,33,31,0.22)]"
    >
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 font-mono text-[12px] uppercase tracking-[0.08em] text-white/60">
        <span className="h-2 w-2 rounded-full bg-[#C79B1F]" />
        assembl run terminal
      </div>
      <div className="mt-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3A3832]">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-white/55">Phase {String(phase + 1).padStart(2, '0')}</p>
          <h3 className="mt-1 font-display text-3xl leading-none text-[#FFF7EC]">{content[0]}</h3>
        </div>
      </div>
      <div className="mt-8 space-y-3 font-mono text-[12px] leading-relaxed">
        <p className="rounded-[6px] bg-white/8 p-3">{content[1]}</p>
        <p className="rounded-[6px] bg-white/8 p-3 text-[#C79B1F]">{content[2]}</p>
      </div>
      <div className="mt-8 rounded-[6px] border border-white/10 bg-[#FFF7EC] p-4 text-[#23211F]">
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-[#6F6158]">Visible output</p>
        <div className="mt-4 h-28 border-l-4 border-[#3A3832] bg-white p-4">
          <p className="font-display text-2xl leading-none">{content[0]}</p>
          <p className="mt-3 text-sm leading-relaxed text-[#6F6158]">{content[1]}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function PipelineStickyScroll() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const active = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 1, 2, 3, 4, 4]);

  return (
    <section ref={ref} className="border-y border-[rgba(199,155,31,0.36)] bg-[color:var(--assembl-paper)]">
      <div className="container py-24 lg:grid lg:grid-cols-2 lg:gap-16 lg:py-32">
        <div className="space-y-8 lg:space-y-0">
          {PHASES.map((phase, index) => (
            <article key={phase.number} className="flex min-h-screen flex-col justify-center py-16">
              <p className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">
                Phase {phase.number}
              </p>
              <h2 className="mt-5 font-display text-display-md font-light text-[color:var(--text-primary)]">
                {phase.title === 'Iho + Signal' ? (
                  <>
                    <TeReo title="core">Iho</TeReo> + Signal
                  </>
                ) : (
                  phase.title
                )}
              </h2>
              <p className="mt-6 max-w-xl text-body-lg text-[color:var(--text-body)]">{phase.body}</p>
              <div className="mt-8 lg:hidden">
                <DemoPanel phase={index} />
              </div>
            </article>
          ))}
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-24 py-24">
            <motion.div>
              <motion.div style={{ display: 'none' }}>{active}</motion.div>
              <ActivePanel progress={active} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivePanel({ progress }: { progress: MotionValue<number> }) {
  const [phase, setPhase] = useState(0);
  useMotionValueEvent(progress, 'change', (value) => {
    setPhase(Math.max(0, Math.min(4, Math.round(value))));
  });
  return <DemoPanel phase={phase} />;
}
