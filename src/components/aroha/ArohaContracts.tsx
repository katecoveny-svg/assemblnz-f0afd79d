import { useState } from "react";
import { Copy, FileText, AlertTriangle, Download } from "lucide-react";
import { NeonClipboard } from "@/components/NeonIcons";

const AROHA_COLOR = "#FF6F91";

const CONTRACT_TYPES = [
  { id: "permanent_ft", label: "Permanent Full-Time", desc: "Individual employment agreement — 40hrs/week" },
  { id: "permanent_pt", label: "Permanent Part-Time", desc: "Specified hours with pro-rata calculations" },
  { id: "fixed_term", label: "Fixed-Term", desc: "Project-based, parental leave cover, seasonal" },
  { id: "casual", label: "Casual", desc: "No guaranteed hours, 8% holiday pay loading" },
  { id: "contractor", label: "Independent Contractor", desc: "Services agreement — NOT employment" },
  { id: "intern", label: "Intern / Volunteer", desc: "Unpaid (genuinely voluntary) or paid" },
];

const OTHER_DOCS = [
  "Variation of Employment Agreement", "Redundancy Letter", "Performance Improvement Plan (PIP)",
  "Written Warning (First)", "Written Warning (Second)", "Written Warning (Final)",
  "Termination Letter", "Resignation Acceptance Letter", "Reference Letter (Standard)",
  "Reference Letter (Detailed)", "Confidentiality / NDA", "Restraint of Trade Agreement",
  "Flexible Working Arrangement Agreement",
];

const generateContract = (type: string, company: string) => {
  const date = new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" });
  const ref = `EA-${Date.now().toString(36).toUpperCase()}`;
  const header = `${company || "[Company Name]"}\n${date}\nRef: ${ref}\n\n`;
  const disclaimer = `\n\n---\n⚠️ DISCLAIMER: This template is for guidance only. Have it reviewed by an employment lawyer before use. AROHA provides general information, not legal advice.\n\nThe employee has the right to seek independent advice before signing this agreement (s 63A Employment Relations Act 2000).`;

  switch (type) {
    case "permanent_ft": return `${header}INDIVIDUAL EMPLOYMENT AGREEMENT\n(Permanent Full-Time)\n\n1. PARTIES\nEmployer: ${company || "[Company Name]"} ("the Employer")\nEmployee: [Employee Full Name] ("the Employee")\n\n2. POSITION\nPosition: [Job Title]\nReports to: [Manager Name/Title]\nLocation: [Work Address]\nStart Date: [Date]\n\n3. HOURS OF WORK\nThe Employee's ordinary hours of work are 40 hours per week, Monday to Friday, 8:30am to 5:00pm (with a 30-minute unpaid lunch break), unless otherwise agreed in writing.\n\n4. REMUNERATION\nThe Employee will be paid a gross salary of $[Amount] per annum (before tax), paid [fortnightly/monthly] by direct credit.\n\nNote: The current adult minimum wage is $23.95/hour (from 1 April 2026). This salary must meet or exceed the minimum wage for all hours worked.\n\n5. KIWISAVER\nThe Employer will contribute 3% of the Employee's gross salary to their KiwiSaver account, in addition to the Employee's own contributions (minimum 3%, or as elected by the Employee: 4%, 6%, 8%, or 10%).\n\n6. TRIAL PERIOD (if applicable — employers with fewer than 20 employees ONLY)\nThe first 90 days of employment shall be a trial period in accordance with s 67B of the Employment Relations Act 2000. During this period, the Employer may dismiss the Employee and the Employee is not entitled to bring a personal grievance for unjustified dismissal.\n\nNote: Trial periods are ONLY available for employers with fewer than 20 employees (Employment Relations Amendment Act 2026). For larger employers, consider a probation period instead.\n\n7. PROBATION PERIOD (alternative to trial period)\n[If applicable] The first [3/6] months of employment shall be a probation period. During this time, the Employer will provide support, training, and regular feedback. If the Employee's performance does not meet expectations, the Employer may terminate employment following a fair process.\n\n8. LEAVE ENTITLEMENTS\nAs per the Holidays Act 2003 (current law):\n- Annual Leave: 4 weeks after 12 months of continuous employment\n- Sick Leave: 10 days after 6 months of continuous employment (carries over, max 20 days)\n- Bereavement Leave: 3 days (close family) / 1 day (other)\n- Public Holidays: 11 statutory public holidays\n- Parental Leave: As per the Parental Leave and Employment Protection Act 1987\n- Domestic Violence Leave: 10 days paid leave per year\n\nNote: The Employment Leave Bill 2026 proposes changes to leave accrual. Until enacted, the Holidays Act 2003 applies.\n\n9. TERMINATION AND NOTICE\nEither party may terminate this agreement by giving [4 weeks] written notice.\nThe Employer may terminate without notice in cases of serious misconduct.\n\n10. RESTRAINT OF TRADE\n[If applicable] For a period of [X months] after termination, the Employee shall not [specifics]. This restraint is limited to [geographic area] and [scope of activity]. The Employer acknowledges this clause must be reasonable to be enforceable.\n\n11. CONFIDENTIALITY\nThe Employee shall not disclose any confidential information belonging to the Employer during or after employment.\n\n12. INTELLECTUAL PROPERTY\nAny intellectual property created by the Employee in the course of their employment belongs to the Employer.\n\n13. DISPUTE RESOLUTION\nAny employment relationship problem shall be resolved by:\n1. Good faith discussion between the parties\n2. Mediation through the Employment Mediation Service\n3. Determination by the Employment Relations Authority (ERA)\n\n14. INDEPENDENT ADVICE\nThe Employee is advised to seek independent advice before signing this agreement (s 63A Employment Relations Act 2000).\n\n15. SIGNATURES\n\nEmployer: _________________________ Date: _____________\nName: [Name]\nPosition: [Position]\n\nEmployee: _________________________ Date: _____________\nName: [Employee Name]\n\nWitness: _________________________ Date: _____________\nName: [Witness Name]${disclaimer}`;

    case "permanent_pt": return `${header}INDIVIDUAL EMPLOYMENT AGREEMENT\n(Permanent Part-Time)\n\n1. PARTIES\nEmployer: ${company || "[Company Name]"}\nEmployee: [Employee Full Name]\n\n2. POSITION: [Job Title]\nStart Date: [Date] | Location: [Address]\n\n3. HOURS OF WORK\nThe Employee's regular hours of work are [X] hours per week.\nRegular pattern: [e.g., Monday to Wednesday, 9:00am–3:00pm]\n\nAll leave entitlements are calculated on a pro-rata basis relative to a full-time employee working 40 hours per week.\n\n4. REMUNERATION\nThe Employee will be paid $[Amount] per hour (gross), paid [fortnightly/monthly].\n\nPro-rata annual equivalent: $[Amount × hours × 52]\n\n[Sections 5-15 same as full-time agreement with pro-rata calculations noted]\n\nNote: Part-time employees have the same rights and protections as full-time employees under NZ employment law.${disclaimer}`;

    case "fixed_term": return `${header}FIXED-TERM EMPLOYMENT AGREEMENT\n\n1. PARTIES\nEmployer: ${company || "[Company Name]"}\nEmployee: [Employee Full Name]\n\n2. POSITION: [Job Title]\nStart Date: [Date] | End Date: [Date or Event]\n\n3. GENUINE REASON FOR FIXED TERM (s 66 Employment Relations Act 2000)\nThis is a fixed-term agreement because: [Select one]\n☐ Project-based work: [describe the project]\n☐ Parental leave cover for: [name of employee on leave]\n☐ Seasonal work: [describe the season/period]\n☐ Funding-dependent role: [describe the funding]\n☐ Other genuine reason: [specify]\n\nThe Employee acknowledges that employment will end on [date/event] without the need for notice from the Employer.\n\n4. IMPORTANT\nIf no genuine reason exists, this agreement may be deemed a permanent agreement by the ERA.\n\n[Remaining clauses as per permanent agreement]${disclaimer}`;

    case "casual": return `${header}CASUAL EMPLOYMENT AGREEMENT\n\n1. PARTIES\nEmployer: ${company || "[Company Name]"}\nEmployee: [Employee Full Name]\n\n2. NATURE OF EMPLOYMENT\nThis is a casual employment arrangement. There is:\n- No obligation on the Employer to offer work\n- No obligation on the Employee to accept work\n- No guaranteed minimum hours\n\nEach engagement is a separate period of employment.\n\n3. REMUNERATION\n$[Amount] per hour (gross), which includes 8% holiday pay loading in lieu of annual leave.\n\nNote: The Employment Leave Bill 2026 proposes 12.5% compensation for casuals. Until enacted, 8% applies under the Holidays Act 2003.\n\n4. MINIMUM WAGE\nThe hourly rate must meet or exceed $23.95/hour (adult minimum wage from 1 April 2026).\n\n[Remaining standard clauses]${disclaimer}`;

    case "contractor": return `${header}INDEPENDENT CONTRACTOR AGREEMENT\n(Services Agreement — NOT an Employment Agreement)\n\n⚠️ IMPORTANT WARNING: If this person works set hours at your premises under your direction, they may legally be an employee regardless of what this contract says. The ERA looks at the real nature of the relationship.\n\nThe Employment Relations Amendment Act 2026 introduces a gateway test for contractor vs employee classification. Key factors:\n- Does the contractor control their own work methods?\n- Do they provide their own tools and equipment?\n- Can they subcontract the work?\n- Do they bear business risk (profit/loss)?\n- Do they work for multiple clients?\n\nIf the answer to most of these is "no", this person is likely an employee.\n\n1. PARTIES\nPrincipal: ${company || "[Company Name]"}\nContractor: [Contractor Name / Business Name]\nNZBN/Company Number: [if applicable]\n\n2. SERVICES\nThe Contractor will provide the following services: [describe]\n\n3. TERM\nFrom [Date] to [Date/Ongoing with notice]\n\n4. FEES\n$[Amount] per [hour/project/day] plus GST (if GST registered)\nPayment terms: [e.g., 20th of the month following invoice]\n\n5. RELATIONSHIP\nThe Contractor is an independent contractor, not an employee. The Contractor:\n- Controls their own methods of work\n- Provides their own tools and equipment\n- May subcontract with the Principal's consent\n- Bears their own business risk\n- Is responsible for their own tax obligations (GST, income tax, ACC)\n\n6. NO EMPLOYMENT ENTITLEMENTS\nAs an independent contractor, there are no entitlements to annual leave, sick leave, KiwiSaver employer contributions, or other employment benefits.\n\n[Confidentiality, IP, termination clauses]${disclaimer}`;

    case "intern": return `${header}INTERN / VOLUNTEER AGREEMENT\n\n⚠️ CRITICAL WARNING: If the intern is doing productive work that benefits your business, they are likely legally an employee and must be paid at least minimum wage ($23.95/hr from April 2026).\n\nUnpaid internships are only lawful when:\n- The person is genuinely volunteering (e.g., for a charity/nonprofit)\n- The work is primarily for the intern's benefit (educational)\n- The intern is not doing work that a paid employee would normally do\n\n1. PARTIES\nOrganisation: ${company || "[Organisation Name]"}\nIntern/Volunteer: [Name]\n\n2. PURPOSE\nThis arrangement is for [educational experience / voluntary community service].\n\n3. DURATION\nFrom [Date] to [Date]\nHours: [Approximate hours per week]\n\n4. SUPERVISION\nSupervisor: [Name and role]\n\n5. EXPENSES\n[The Organisation will/will not reimburse reasonable expenses such as travel and meals]\n\n6. NO EMPLOYMENT RELATIONSHIP\nThis arrangement does not create an employment relationship. Either party may end the arrangement at any time.\n\n7. HEALTH AND SAFETY\nThe Organisation's health and safety obligations under the Health and Safety at Work Act 2015 extend to the intern/volunteer while on site.${disclaimer}`;

    default: return "";
  }
};

const generateOtherDoc = (docType: string, company: string) => {
  const date = new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" });
  const ref = `HR-${Date.now().toString(36).toUpperCase()}`;
  const header = `${company || "[Company Name]"}\n${date}\nRef: ${ref}\n\n`;
  const disclaimer = `\n\n---\n⚠️ This template is for guidance only. Have it reviewed by an employment lawyer before use.`;

  if (docType.includes("Warning")) {
    const level = docType.includes("First") ? "First" : docType.includes("Second") ? "Second" : "Final";
    return `${header}${level.toUpperCase()} WRITTEN WARNING\n\nTo: [Employee Name]\nPosition: [Job Title]\nDate: ${date}\n\nDear [Employee Name],\n\nFollowing our meeting on [date], this letter confirms that you are being issued a ${level.toLowerCase()} written warning for:\n\n[Description of conduct/performance issue]\n\nPrevious discussions/warnings:\n[List any previous verbal or written warnings with dates]\n\nExpected standard:\n[Clearly state what is expected going forward]\n\nSupport offered:\n[Any training, mentoring, or resources provided]\n\nTimeframe for improvement: [X weeks/months]\n\nConsequences: Failure to improve may result in [further disciplinary action / termination of employment].\n\nYou have the right to:\n- Seek support from a representative, union delegate, or support person\n- Respond to this warning in writing\n- Raise a personal grievance if you believe this warning is unjustified\n\nSigned: _________________________ (Manager)\nAcknowledged: _________________________ (Employee)\nDate: _____________${disclaimer}`;
  }

  if (docType.includes("PIP")) {
    return `${header}PERFORMANCE IMPROVEMENT PLAN\n\nEmployee: [Name] | Position: [Title] | Manager: [Name]\nPIP Start Date: [Date] | Review Date: [Date — typically 4-8 weeks]\n\n1. AREAS REQUIRING IMPROVEMENT\n[Specific, measurable performance issues]\n\n2. EXPECTED STANDARDS\n[Clear, measurable targets]\n\n3. SUPPORT PROVIDED\n- [Training/coaching offered]\n- [Resources available]\n- [Regular check-in schedule]\n\n4. REVIEW SCHEDULE\n- Week 1: Check-in on [date]\n- Week 2: Check-in on [date]\n- Week 4: Formal review on [date]\n- [Final review date]\n\n5. OUTCOME\nIf performance meets expectations: PIP ends, normal employment continues.\nIf performance does not improve: Further disciplinary action, which may include termination.\n\nEmployee signature: _________ Date: _________\nManager signature: _________ Date: _________${disclaimer}`;
  }

  if (docType.includes("Redundancy")) {
    return `${header}NOTICE OF REDUNDANCY\n\nDear [Employee Name],\n\nI am writing to formally advise that your position of [Job Title] is being made redundant effective [Date].\n\nReason: [Genuine business reason — restructure, financial, role no longer required]\n\nProcess followed:\n☐ Consultation with affected employees\n☐ Genuine consideration of alternatives\n☐ Selection criteria applied fairly\n☐ Adequate notice provided\n\nYour entitlements:\n- Notice period: [X weeks] (as per your employment agreement)\n- Outstanding annual leave: [X days]\n- Redundancy compensation: [if applicable — not legally required unless in agreement]\n\nSupport available:\n- [Outplacement support / career coaching]\n- [EAP services]\n- [Time off for job searching during notice period]\n\nWe acknowledge the impact this has and are committed to supporting you through this transition.\n\nSigned: _________________________\n[Manager Name, Position]${disclaimer}`;
  }

  return `${header}${docType.toUpperCase()}\n\n[Template content for ${docType}]\n\n[This document will be customised based on your specific requirements. Use the chat to ask AROHA to generate a tailored version.]${disclaimer}`;
};

export default function ArohaContracts() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [company, setCompany] = useState("");
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const content = selectedType ? generateContract(selectedType, company) : selectedDoc ? generateOtherDoc(selectedDoc, company) : null;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><NeonClipboard size={20} color="#FF6F91" /> Contracts & Documents</h2>

      <div>
        <label className="text-[10px] text-muted-foreground">Company Name (appears in documents)</label>
        <input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" placeholder="e.g. Kiwi Solutions Ltd" value={company} onChange={e => setCompany(e.target.value)} />
      </div>

      {!content && (
        <>
          <h3 className="text-xs font-bold text-foreground">Employment Agreements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {CONTRACT_TYPES.map(c => (
              <button key={c.id} onClick={() => { setSelectedType(c.id); setSelectedDoc(null); }}
                className="text-left p-3 rounded-xl border border-border bg-card hover:border-foreground/10 transition-colors">
                <p className="text-xs font-medium text-foreground">{c.label}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{c.desc}</p>
                {c.id === "contractor" && <p className="text-[8px] mt-1 flex items-center gap-1" style={{ color: AROHA_COLOR }}><AlertTriangle size={8} /> Includes gateway test warnings</p>}
                {c.id === "intern" && <p className="text-[8px] mt-1 flex items-center gap-1" style={{ color: AROHA_COLOR }}><AlertTriangle size={8} /> Minimum wage warning included</p>}
              </button>
            ))}
          </div>
          <h3 className="text-xs font-bold text-foreground mt-4">Other HR Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {OTHER_DOCS.map(d => (
              <button key={d} onClick={() => { setSelectedDoc(d); setSelectedType(null); }}
                className="text-left px-3 py-2 rounded-lg border border-border bg-card hover:border-foreground/10 text-[10px] text-foreground transition-colors">
                <FileText size={10} className="inline mr-1" style={{ color: AROHA_COLOR }} />{d}
              </button>
            ))}
          </div>
        </>
      )}

      {content && (
        <>
          <button onClick={() => { setSelectedType(null); setSelectedDoc(null); }} className="text-xs text-muted-foreground hover:text-foreground">← Back to templates</button>
          <div className="p-4 rounded-xl border border-border bg-card">
            <pre className="whitespace-pre-wrap text-[10px] text-foreground/80 font-sans">{content}</pre>
          </div>
          <div className="flex gap-2">
            <button onClick={() => copy(content)} className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>
              <Copy size={12} /> {copied ? "Copied!" : "Copy Document"}
            </button>
            <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold border border-border text-foreground">
              <Download size={12} /> Download PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
