// ═══════════════════════════════════════════════════════════════
// Aroha — Overview / landing within the Aroha kete layout
//
// Shown at /aroha (index). Summarises the 7 capability modules
// and surfaces the AAAIP employment-advice guard notice.
// ═══════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";
import {
  Heart,
  FileText,
  UserPlus,
  DollarSign,
  Users,
  Building2,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

const ACCENT = "#FF6F91";

const MODULES = [
  {
    to: "/aroha/recruitment",
    icon: UserPlus,
    label: "Recruitment",
    desc: "Job ads, shortlisting, interview guides, offer letters.",
  },
  {
    to: "/aroha/contracts",
    icon: FileText,
    label: "Contracts & Agreements",
    desc:
      "Employment agreements (permanent, part-time, fixed-term, casual), contractor services agreements, variations, PIPs, warnings, redundancy letters.",
  },
  {
    to: "/aroha/onboarding",
    icon: Users,
    label: "Onboarding",
    desc: "Day-one checklists, IRD forms, KiwiSaver enrolment, induction scheduling.",
  },
  {
    to: "/aroha/payroll",
    icon: DollarSign,
    label: "Payroll & Wages",
    desc:
      "PAYE calculator, KiwiSaver contributions, public holiday schedule (2026/2027), leave balance tracking.",
  },
  {
    to: "/aroha/people",
    icon: Heart,
    label: "People & Culture",
    desc:
      "Holidays Act leave entitlements, sick leave, disciplinary process, personal grievance guidance, wellness initiatives.",
  },
  {
    to: "/aroha/setup",
    icon: Building2,
    label: "Company Setup",
    desc: "Employer obligations checklist, ACC levies, employment relations framework, wage theft prevention.",
  },
  {
    to: "/aroha/retention",
    icon: TrendingUp,
    label: "Retention",
    desc: "Stay interviews, engagement surveys, redundancy process, exit interviews.",
  },
];

export default function ArohaOverviewPage() {
  return (
    <div className="p-6 sm:p-10 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}44` }}
          >
            <Heart className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <p
            className="text-[11px] uppercase tracking-[5px] font-bold"
            style={{ color: ACCENT, fontFamily: "Lato, sans-serif" }}
          >
            AROHA — HR & EMPLOYMENT LAW
          </p>
        </div>
        <h1
          className="text-2xl sm:text-3xl text-white mb-3"
          style={{ fontFamily: "Lato, sans-serif", fontWeight: 300, letterSpacing: "-0.01em" }}
        >
          People operations for NZ businesses
        </h1>
        <p className="text-white/50 text-sm leading-relaxed">
          Aroha covers the full employee lifecycle — from writing job ads through to redundancy
          processes. All guidance is grounded in current NZ employment law: Employment Relations
          Act 2000, Holidays Act 2003, Minimum Wage Act 1983, KiwiSaver Act 2006, and relevant
          2026 amendments.
        </p>
      </div>

      {/* AAAIP policy notice */}
      <div
        className="flex items-start gap-3 rounded-xl p-4 mb-8 text-sm"
        style={{
          background: `${ACCENT}08`,
          border: `1px solid ${ACCENT}25`,
        }}
      >
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ACCENT }} />
        <div>
          <p className="text-white/80 font-medium mb-1">AAAIP Employment Advice Guard active</p>
          <p className="text-white/40 text-xs leading-relaxed">
            Three policies run on every Aroha output: <strong className="text-white/60">legal_advice_disclaimer</strong> (all
            documents carry an ERA review notice), <strong className="text-white/60">high_risk_document_flag</strong> (warnings,
            termination letters, and PGs escalate to human review), and{" "}
            <strong className="text-white/60">pg_escalation</strong> (personal grievance situations always defer to a
            qualified employment lawyer). Aroha provides guidance — not legal advice.
          </p>
        </div>
      </div>

      {/* Module grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {MODULES.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="group rounded-xl p-4 transition-all hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${ACCENT}15` }}
              >
                <m.icon className="w-3.5 h-3.5" style={{ color: ACCENT }} />
              </div>
              <span
                className="text-white text-sm font-medium group-hover:text-white transition-colors"
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                {m.label}
              </span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">{m.desc}</p>
          </Link>
        ))}
      </div>

      {/* Legal notice */}
      <div className="mt-8 flex items-start gap-2 text-xs text-white/25">
        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
        <p>
          Aroha generates guidance based on publicly available NZ employment legislation. It is not
          a substitute for advice from a qualified employment lawyer or HR professional. For
          personal grievances, disciplinary matters, or terminations, always engage legal counsel.
        </p>
      </div>
    </div>
  );
}
