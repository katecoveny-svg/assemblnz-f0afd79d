import { useState } from "react";
import { Heart, Gift, Calendar, Shield, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { NeonHeart, NeonMuscle, NeonBrain, NeonCoin, NeonHandshake } from "@/components/NeonIcons";

const AROHA_COLOR = "#FF6F91";

type SubTab = "wellness" | "retention" | "social" | "conflict";

const WELLNESS_CATEGORIES = [
  {
    title: "Physical Wellness",
    icon: "muscle" as const,
    items: [
      { name: "Workplace Ergonomic Assessment Checklist", desc: "Comprehensive desk/workstation assessment covering monitor height, chair setup, keyboard position, lighting." },
      { name: "Standing Desk Policy", desc: "Policy for providing sit-stand desks. Includes request process, usage guidelines, and DSE assessment." },
      { name: "Eye Test Subsidy Policy", desc: "For screen-based workers. Typically $50-$100 per year towards eye examinations. Health and Safety at Work Act 2015 — PCBU duty." },
      { name: "Flu Vaccination Programme", desc: "Annual flu jab programme. Typically $25-$35 per employee. Can be on-site or voucher-based." },
      { name: "Fitness Subsidy Policy", desc: "Gym membership contribution ($20-$50/month). Reduces absenteeism, improves morale." },
      { name: "Active Commute Incentive", desc: "Cycle to work, walk to work incentives. Secure bike storage, shower facilities, mileage reimbursement." },
      { name: "Fruit Box / Healthy Snack Policy", desc: "Weekly fruit delivery for the office. Approximately $3-$5 per employee per week." },
    ],
  },
  {
    title: "Mental Wellness",
    icon: "brain" as const,
    items: [
      { name: "Mental Health Policy", desc: "Comprehensive policy covering support, leave, return to work, and manager responsibilities." },
      { name: "EAP Setup Guide", desc: "Employee Assistance Programme setup. Providers: Vitae, EAP Services, Benestar. Typically $40-$60 per employee/year." },
      { name: "Mental Health First Aid Training", desc: "Train designated staff to recognise and respond to mental health issues. 2-day course." },
      { name: "Stress Management Resources Pack", desc: "Resources for employees: techniques, apps (Headspace, Calm), local support services." },
      { name: "Burnout Prevention Checklist for Managers", desc: "Warning signs, workload assessment, conversation guides, boundary-setting framework." },
      { name: "Return to Work Plan (Mental Health)", desc: "Graduated return, modified duties, regular check-ins, ongoing support plan." },
      { name: "Manager Wellbeing Conversation Guide", desc: "How to have supportive conversations. Scripts, dos and don'ts, escalation pathways." },
    ],
  },
  {
    title: "Financial Wellness",
    icon: "coin" as const,
    items: [
      { name: "KiwiSaver Education Resources", desc: "Help staff understand their KiwiSaver options, contribution rates (3%-10%), and employer contributions." },
      { name: "Financial Literacy Workshop Template", desc: "90-minute workshop: budgeting, saving, KiwiSaver, debt management. Partner with Sorted.org.nz." },
      { name: "Salary Advance Policy", desc: "Policy for emergency pay advances. Conditions, repayment terms, limits." },
      { name: "Hardship Support Policy", desc: "Framework for supporting employees in financial difficulty. Includes EAP referral." },
    ],
  },
  {
    title: "Social Wellness",
    icon: "handshake" as const,
    items: [
      { name: "Team Building Activity Ideas (NZ)", desc: "Beach BBQ, bush walk, escape room, lawn bowls, go-karting, volunteer day, waka ama." },
      { name: "Social Committee Setup Guide", desc: "Terms of reference, budget allocation, event planning framework, inclusive practices." },
      { name: "Monthly Social Calendar Template", desc: "12-month rolling calendar with suggested activities, budgets, and planning timelines." },
      { name: "Cultural Celebration Calendar", desc: "Waitangi Day, Chinese New Year, Diwali, Matariki, Pasifika Festival, Christmas, Eid, and more." },
      { name: "Whānau Day Policy", desc: "Bring family to work day. Planning guide, activities, health and safety considerations." },
    ],
  },
];

const RETENTION_IDEAS = [
  { cat: "Recognition", ideas: [
    { name: "Employee of the Month", cost: "$50-$200/month", difficulty: "Easy", impact: "Medium" },
    { name: "Peer Recognition System (Kudos Board)", cost: "Free-$500 setup", difficulty: "Easy", impact: "High" },
    { name: "Annual Awards Ceremony", cost: "$2,000-$10,000", difficulty: "Medium", impact: "High" },
    { name: "Long Service Recognition (5/10/15/20yr)", cost: "$200-$1,000 per milestone", difficulty: "Easy", impact: "High" },
    { name: "Values Champion Awards", cost: "$100-$500/quarter", difficulty: "Easy", impact: "Medium" },
  ]},
  { cat: "Benefits & Perks", ideas: [
    { name: "Additional Annual Leave (5th week)", cost: "~2% of salary", difficulty: "Medium", impact: "High" },
    { name: "Birthday Leave (paid day off)", cost: "1 day/year per employee", difficulty: "Easy", impact: "High" },
    { name: "Volunteer Day (1 paid day/year)", cost: "1 day/year per employee", difficulty: "Easy", impact: "Medium" },
    { name: "Parental Leave Top-Up", cost: "Variable", difficulty: "Medium", impact: "High" },
    { name: "Summer Hours (early Fridays Dec-Feb)", cost: "Minimal", difficulty: "Easy", impact: "High" },
    { name: "Compressed Work Week (4×10)", cost: "Nil", difficulty: "Medium", impact: "High" },
    { name: "Study Leave / PD Budget", cost: "$500-$2,000/employee/year", difficulty: "Medium", impact: "High" },
    { name: "NZ Experiences (Great Walk, local gifts)", cost: "$200-$1,000", difficulty: "Easy", impact: "Medium" },
  ]},
  { cat: "Retention Strategies", ideas: [
    { name: "Stay Interview Template", cost: "Free", difficulty: "Easy", impact: "High" },
    { name: "Exit Interview Template", cost: "Free", difficulty: "Easy", impact: "Medium" },
    { name: "Career Pathway Mapping", cost: "Free", difficulty: "Medium", impact: "High" },
    { name: "Mentoring Programme Setup", cost: "Minimal", difficulty: "Medium", impact: "High" },
    { name: "Engagement Survey (Quarterly Pulse)", cost: "Free-$500", difficulty: "Medium", impact: "High" },
    { name: "Pay Equity Review (Equal Pay Act)", cost: "Time investment", difficulty: "Hard", impact: "High" },
  ]},
];

const SOCIAL_CALENDAR = [
  { month: "January", event: "Summer BBQ / Beach Day", budget: "$15-$30/head", desc: "Outdoor team gathering — BYO or catered, beach games, relaxed vibe." },
  { month: "February", event: "Waitangi Day Acknowledgement", budget: "$5-$15/head", desc: "Morning tea with te reo Māori activity or local speaker." },
  { month: "March", event: "End of Summer Friday Drinks", budget: "$10-$20/head", desc: "Casual after-work gathering to farewell summer." },
  { month: "April", event: "Easter Team Morning Tea", budget: "$5-$10/head", desc: "Hot cross buns, Easter egg hunt, chocolate treats." },
  { month: "May", event: "Autumn Team Building", budget: "$30-$60/head", desc: "Indoor activity: escape room, cooking class, or bowling." },
  { month: "June", event: "Matariki Celebration", budget: "$10-$25/head", desc: "Shared kai, star-gazing (if weather permits), te reo waiata." },
  { month: "July", event: "Mid-Year Team Dinner & Awards", budget: "$40-$80/head", desc: "Restaurant dinner, mid-year recognition awards." },
  { month: "August", event: "NZ Language Week Activity", budget: "$5-$15/head", desc: "Te reo Māori lessons, kupu of the day, cultural quiz." },
  { month: "September", event: "Spring Clean / Charity Drive", budget: "$0-$10/head", desc: "Office clean-out + donation drive for local charity." },
  { month: "October", event: "Mental Health Awareness Week", budget: "$10-$20/head", desc: "Wellness workshop, mindfulness session, free fruit week." },
  { month: "November", event: "Movember Morning Tea", budget: "$5-$15/head", desc: "Fundraiser morning tea, moustache competition, health awareness." },
  { month: "December", event: "Christmas Function", budget: "$50-$120/head", desc: "End of year celebration — venue, catering, entertainment." },
];

const CONFLICT_DOCS = [
  "Conflict Resolution Policy",
  "Step-by-Step Mediation Guide for Managers",
  "Informal Conflict Resolution Conversation Template",
  "Formal Complaint / Grievance Process",
  "Investigation Process Template (Harassment, Bullying, Misconduct)",
  "Bullying & Harassment Response Flowchart",
  "Employment Mediation Service Referral Guide",
  "When to Involve a Lawyer — Checklist",
  "Restorative Practice Guide (Rebuilding Team Dynamics)",
  "Cultural Conflict Considerations (Cross-Cultural NZ Workplaces)",
];

const impactColor = (i: string) => i === "High" ? "#22C55E" : i === "Medium" ? "#F59E0B" : "#94A3B8";

export default function ArohaPeopleCulture() {
  const [tab, setTab] = useState<SubTab>("wellness");
  const [expandedCat, setExpandedCat] = useState<string | null>(WELLNESS_CATEGORIES[0].title);
  const [copied, setCopied] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const tabs: { id: SubTab; label: string; icon: React.ReactNode }[] = [
    { id: "wellness", label: "Wellness Hub", icon: <Heart size={10} /> },
    { id: "retention", label: "Retention", icon: <Gift size={10} /> },
    { id: "social", label: "Social Calendar", icon: <Calendar size={10} /> },
    { id: "conflict", label: "Conflict Resolution", icon: <Shield size={10} /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><NeonHeart size={20} color="#FF6F91" /> People & Culture</h2>
      <div className="flex gap-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
            style={{ backgroundColor: tab === t.id ? AROHA_COLOR + "20" : "transparent", color: tab === t.id ? AROHA_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${tab === t.id ? AROHA_COLOR + "40" : "hsl(var(--border))"}` }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "wellness" && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground">Generate wellness programme documents for your workplace.</p>
          {WELLNESS_CATEGORIES.map(cat => (
            <div key={cat.title} className="rounded-xl border border-border bg-card overflow-hidden">
              <button onClick={() => setExpandedCat(expandedCat === cat.title ? null : cat.title)}
                className="w-full flex items-center justify-between p-3">
                <span className="text-xs font-bold text-foreground">{cat.emoji} {cat.title}</span>
                {expandedCat === cat.title ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />}
              </button>
              {expandedCat === cat.title && (
                <div className="px-3 pb-3 space-y-1.5">
                  {cat.items.map(item => (
                    <div key={item.name} className="p-2.5 rounded-lg bg-muted/50">
                      <p className="text-[10px] font-medium text-foreground">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{item.desc}</p>
                      <button onClick={() => copy(item.name + "\n" + item.desc)} className="mt-1.5 flex items-center gap-1 px-2 py-1 rounded text-[8px] font-medium"
                        style={{ backgroundColor: AROHA_COLOR + "15", color: AROHA_COLOR }}>
                        <Copy size={8} /> Generate Template
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="p-3 rounded-lg bg-muted text-[9px] text-muted-foreground space-y-1">
            <p className="font-bold text-foreground">Crisis Support Lines</p>
            <p>• 1737 — Need to talk? Free call or text</p>
            <p>• Lifeline: 0800 543 354</p>
            <p>• Depression.org.nz • Anxiety NZ</p>
          </div>
        </div>
      )}

      {tab === "retention" && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground">Creative NZ-relevant incentive and retention ideas with cost and impact estimates.</p>
          {RETENTION_IDEAS.map(cat => (
            <div key={cat.cat}>
              <h3 className="text-xs font-bold text-foreground mb-1.5">{cat.cat}</h3>
              <div className="space-y-1">
                {cat.ideas.map(idea => (
                  <div key={idea.name} className="p-3 rounded-xl border border-border bg-card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-[10px] font-medium text-foreground">{idea.name}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Est. cost: {idea.cost}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">{idea.difficulty}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: impactColor(idea.impact) + "20", color: impactColor(idea.impact) }}>
                          {idea.impact} impact
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "social" && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground">12-month social activity calendar for your workplace.</p>
          <div className="space-y-1.5">
            {SOCIAL_CALENDAR.map(item => (
              <div key={item.month} className="p-3 rounded-xl border border-border bg-card flex items-start gap-3">
                <div className="w-14 shrink-0 text-center">
                  <p className="text-[10px] font-bold" style={{ color: AROHA_COLOR }}>{item.month.slice(0, 3)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-foreground">{item.event}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{item.desc}</p>
                  <p className="text-[8px] mt-1" style={{ color: AROHA_COLOR }}>Budget: {item.budget} per person</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "conflict" && (
        <div className="space-y-3">
          <p className="text-[10px] text-muted-foreground">Generate conflict resolution policies and guides aligned with NZ employment law.</p>
          {!selectedConflict ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {CONFLICT_DOCS.map(doc => (
                <button key={doc} onClick={() => setSelectedConflict(doc)}
                  className="text-left px-3 py-2.5 rounded-lg border border-border bg-card hover:border-foreground/10 text-[10px] text-foreground transition-colors">
                  <Shield size={10} className="inline mr-1" style={{ color: AROHA_COLOR }} />{doc}
                </button>
              ))}
            </div>
          ) : (
            <>
              <button onClick={() => setSelectedConflict(null)} className="text-xs text-muted-foreground hover:text-foreground">← Back to templates</button>
              <div className="p-4 rounded-xl border border-border bg-card">
                <h3 className="text-sm font-bold text-foreground mb-2">{selectedConflict}</h3>
                <pre className="whitespace-pre-wrap text-[10px] text-foreground/80 font-sans">
{selectedConflict.includes("Mediation") ? `STEP-BY-STEP MEDIATION GUIDE FOR MANAGERS

1. PREPARATION
- Meet separately with each party to understand their perspective
- Identify the core issue (not just the symptoms)
- Ensure both parties are willing to engage in mediation
- Book a private, neutral meeting space

2. GROUND RULES
- Both parties will speak without interruption
- Use respectful language
- Focus on the issue, not the person
- What is said in mediation stays in mediation

3. OPENING
- State the purpose: "We're here to find a resolution that works for everyone"
- Each party shares their perspective (5 minutes each)
- Summarise what you've heard to confirm understanding

4. EXPLORATION
- Identify common ground
- Ask: "What would a good outcome look like for you?"
- Explore underlying interests (not just positions)

5. RESOLUTION
- Generate options together
- Agree on specific actions, timelines, and follow-up
- Document the agreement

6. FOLLOW-UP
- Check in with both parties within 1 week
- If unresolved, consider Employment Mediation Service referral

Reference: Employment Relations Act 2000, Part 10 — Resolution of Employment Relationship Problems`
: selectedConflict.includes("Policy") && !selectedConflict.includes("Bullying") ? `CONFLICT RESOLUTION POLICY

1. PURPOSE
This policy outlines [Company Name]'s commitment to resolving workplace conflicts promptly, fairly, and in good faith, as required by the Employment Relations Act 2000.

2. SCOPE
This policy applies to all employees, contractors, and workers of [Company Name].

3. PRINCIPLES
- All parties are treated with dignity and respect
- Conflicts are addressed promptly before they escalate
- Good faith (s 4, Employment Relations Act 2000) underpins all interactions
- Natural justice applies — all parties have the right to be heard
- Confidentiality is maintained to the extent possible
- No retaliation against anyone who raises a concern in good faith

4. INFORMAL RESOLUTION (Step 1)
- Direct conversation between the parties
- Manager-facilitated discussion
- Use of 'I' statements and active listening

5. FORMAL PROCESS (Step 2)
- Written complaint submitted to [HR/Manager]
- Investigation if required (see Investigation Process Template)
- Formal meeting with all parties

6. EXTERNAL MEDIATION (Step 3)
- Referral to Employment Mediation Service (free, provided by MBIE)
- Phone: 0800 20 90 20
- Both parties may bring a support person or representative

7. EMPLOYMENT RELATIONS AUTHORITY (Step 4)
- If mediation fails, either party may apply to the ERA
- Legal representation recommended at this stage

DISCLAIMER: This template is for guidance only. Have it reviewed by an employment lawyer before use.`
: `${selectedConflict.toUpperCase()}

[This template will be generated based on your specific requirements. Use the chat to ask AROHA to generate a tailored version with your company details.]

Key NZ legislation references:
• Employment Relations Act 2000 — Part 9 (Personal Grievances) and Part 10 (Problem Resolution)
• Human Rights Act 1993 — Prohibited grounds of discrimination
• Health and Safety at Work Act 2015 — Psychosocial hazards
• Privacy Act 2020 — Handling personal information during investigations

DISCLAIMER: This template is for guidance only. Have it reviewed by an employment lawyer before use.`}
                </pre>
              </div>
              <button onClick={() => copy(selectedConflict)} className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>
                <Copy size={12} /> {copied ? "Copied!" : "Copy Document"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
