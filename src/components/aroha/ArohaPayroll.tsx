import { useState } from "react";
import { Calculator, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { NeonCoin, NeonCheckmark, NeonWarning } from "@/components/NeonIcons";

const AROHA_COLOR = "#FF6F91";

// NZ PAYE tax brackets 2025-2026
const calcPAYE = (annual: number) => {
  if (annual <= 15600) return annual * 0.105;
  if (annual <= 53500) return 15600 * 0.105 + (annual - 15600) * 0.175;
  if (annual <= 78100) return 15600 * 0.105 + (53500 - 15600) * 0.175 + (annual - 53500) * 0.30;
  if (annual <= 180000) return 15600 * 0.105 + (53500 - 15600) * 0.175 + (78100 - 53500) * 0.30 + (annual - 78100) * 0.33;
  return 15600 * 0.105 + (53500 - 15600) * 0.175 + (78100 - 53500) * 0.30 + (180000 - 78100) * 0.33 + (annual - 180000) * 0.39;
};

const PUBLIC_HOLIDAYS_2026 = [
  { date: "1 Jan 2026", name: "New Year's Day", day: "Thursday" },
  { date: "2 Jan 2026", name: "Day After New Year's", day: "Friday" },
  { date: "6 Feb 2026", name: "Waitangi Day", day: "Friday" },
  { date: "3 Apr 2026", name: "Good Friday", day: "Friday" },
  { date: "6 Apr 2026", name: "Easter Monday", day: "Monday" },
  { date: "27 Apr 2026", name: "ANZAC Day (Mondayised)", day: "Monday" },
  { date: "1 Jun 2026", name: "King's Birthday", day: "Monday" },
  { date: "10 Jul 2026", name: "Matariki", day: "Friday" },
  { date: "26 Oct 2026", name: "Labour Day", day: "Monday" },
  { date: "25 Dec 2026", name: "Christmas Day", day: "Friday" },
  { date: "28 Dec 2026", name: "Boxing Day (Mondayised)", day: "Monday" },
];

const PUBLIC_HOLIDAYS_2027 = [
  { date: "1 Jan 2027", name: "New Year's Day", day: "Friday" },
  { date: "4 Jan 2027", name: "Day After New Year's (Mondayised)", day: "Monday" },
  { date: "8 Feb 2027", name: "Waitangi Day (Mondayised)", day: "Monday" },
  { date: "26 Mar 2027", name: "Good Friday", day: "Friday" },
  { date: "29 Mar 2027", name: "Easter Monday", day: "Monday" },
  { date: "26 Apr 2027", name: "ANZAC Day", day: "Monday" },
  { date: "7 Jun 2027", name: "King's Birthday", day: "Monday" },
  { date: "25 Jun 2027", name: "Matariki", day: "Friday" },
  { date: "25 Oct 2027", name: "Labour Day", day: "Monday" },
  { date: "27 Dec 2027", name: "Christmas Day (Mondayised)", day: "Monday" },
  { date: "28 Dec 2027", name: "Boxing Day (Mondayised)", day: "Tuesday" },
];

export default function ArohaPayroll() {
  const [tab, setTab] = useState<"pay" | "leave" | "holidays" | "minwage">("pay");
  const [salaryType, setSalaryType] = useState<"annual" | "hourly">("annual");
  const [salary, setSalary] = useState("65000");
  const [hours, setHours] = useState("40");
  const [ksRate, setKsRate] = useState("3");
  const [hasStudentLoan, setHasStudentLoan] = useState(false);
  const [childSupport, setChildSupport] = useState("0");

  // Leave calc
  const [leaveStart, setLeaveStart] = useState("2025-03-01");
  const [leaveHours, setLeaveHours] = useState("40");
  const [leaveTaken, setLeaveTaken] = useState("0");

  // Min wage
  const [mwHours, setMwHours] = useState("40");
  const [mwPay, setMwPay] = useState("960");
  const [mwPeriod, setMwPeriod] = useState<"weekly" | "fortnightly">("weekly");

  const annualSalary = salaryType === "annual" ? Number(salary) : Number(salary) * Number(hours) * 52;
  const paye = calcPAYE(annualSalary);
  const accLevy = annualSalary * 0.0153; // approx earner levy
  const ksEmployee = annualSalary * (Number(ksRate) / 100);
  const studentLoan = hasStudentLoan ? Math.max(0, (annualSalary - 22828) * 0.12) : 0;
  const childSup = Number(childSupport) * 52;
  const netAnnual = annualSalary - paye - accLevy - ksEmployee - studentLoan - childSup;
  const ksEmployer = annualSalary * 0.03;
  const accEmployer = annualSalary * 0.014; // approx
  const totalCost = annualSalary + ksEmployer + accEmployer;

  // Leave calc
  const weeksEmployed = Math.max(0, Math.floor((Date.now() - new Date(leaveStart).getTime()) / (7 * 86400000)));
  const monthsEmployed = Math.max(0, Math.floor(weeksEmployed / 4.33));
  const annualLeaveEntitled = monthsEmployed >= 12;
  const annualLeaveDays = annualLeaveEntitled ? 20 - Number(leaveTaken) : 0;
  const proposedHours = weeksEmployed * Number(leaveHours) * 0.0769;
  const sickEntitled = monthsEmployed >= 6;
  const sickDays = sickEntitled ? 10 : 0;

  // Min wage check
  const mwTotalPay = Number(mwPay);
  const mwTotalHours = Number(mwHours) * (mwPeriod === "fortnightly" ? 2 : 1);
  const effectiveRate = mwPeriod === "fortnightly" ? mwTotalPay / mwTotalHours : mwTotalPay / Number(mwHours);
  const meetsMinWage = effectiveRate >= 23.95;

  const tabs = [
    { id: "pay" as const, label: "Pay Calculator", icon: <Calculator size={10} /> },
    { id: "leave" as const, label: "Leave Calculator", icon: <Calendar size={10} /> },
    { id: "holidays" as const, label: "Public Holidays", icon: <Calendar size={10} /> },
    { id: "minwage" as const, label: "Min Wage Check", icon: <DollarSign size={10} /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><NeonCoin size={20} color="#FF6F91" /> Payroll & Leave</h2>
      <div className="flex gap-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
            style={{ backgroundColor: tab === t.id ? AROHA_COLOR + "20" : "transparent", color: tab === t.id ? AROHA_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${tab === t.id ? AROHA_COLOR + "40" : "hsl(var(--border))"}` }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "pay" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["annual", "hourly"] as const).map(t => (
              <button key={t} onClick={() => setSalaryType(t)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium capitalize"
                style={{ backgroundColor: salaryType === t ? AROHA_COLOR + "20" : "transparent", color: salaryType === t ? AROHA_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${salaryType === t ? AROHA_COLOR + "40" : "hsl(var(--border))"}` }}>
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-muted-foreground">{salaryType === "annual" ? "Annual Salary ($)" : "Hourly Rate ($)"}</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground" value={salary} onChange={e => setSalary(e.target.value)} /></div>
            <div><label className="text-[10px] text-muted-foreground">Hours/week</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground" value={hours} onChange={e => setHours(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-muted-foreground">KiwiSaver Rate</label>
              <div className="flex gap-1 mt-0.5">{["3","4","6","8","10"].map(r => <button key={r} onClick={() => setKsRate(r)} className="flex-1 py-1.5 rounded-lg text-[10px] font-medium border" style={{ borderColor: ksRate === r ? AROHA_COLOR : "hsl(var(--border))", color: ksRate === r ? AROHA_COLOR : "hsl(var(--muted-foreground))" }}>{r}%</button>)}</div>
            </div>
            <div className="flex flex-col justify-end gap-1">
              <label className="flex items-center gap-1 text-[10px] text-foreground"><input type="checkbox" checked={hasStudentLoan} onChange={e => setHasStudentLoan(e.target.checked)} style={{ accentColor: AROHA_COLOR }} /> Student loan</label>
              <div><label className="text-[10px] text-muted-foreground">Child support ($/week)</label><input className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-border bg-card text-[10px] text-foreground" value={childSupport} onChange={e => setChildSupport(e.target.value)} /></div>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card" style={{ borderColor: AROHA_COLOR + "30" }}>
            <h3 className="text-xs font-bold text-foreground mb-3">Payslip Breakdown</h3>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between font-medium"><span className="text-foreground">Gross Annual</span><span className="text-foreground">${annualSalary.toLocaleString()}</span></div>
              <div className="border-t border-border pt-1 mt-1" />
              <div className="flex justify-between"><span className="text-muted-foreground">PAYE Tax</span><span className="text-foreground">-${Math.round(paye).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ACC Earner Levy (~1.53%)</span><span className="text-foreground">-${Math.round(accLevy).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">KiwiSaver ({ksRate}%)</span><span className="text-foreground">-${Math.round(ksEmployee).toLocaleString()}</span></div>
              {hasStudentLoan && <div className="flex justify-between"><span className="text-muted-foreground">Student Loan (12% over $22,828)</span><span className="text-foreground">-${Math.round(studentLoan).toLocaleString()}</span></div>}
              {Number(childSupport) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Child Support</span><span className="text-foreground">-${Math.round(childSup).toLocaleString()}</span></div>}
              <div className="border-t border-border pt-1 mt-1 flex justify-between text-sm font-bold"><span className="text-foreground">Net Take-Home (annual)</span><span style={{ color: AROHA_COLOR }}>${Math.round(netAnnual).toLocaleString()}</span></div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-[9px] text-center">
              <div className="p-2 rounded-lg bg-muted"><span className="text-muted-foreground">Weekly</span><p className="font-bold text-foreground">${Math.round(netAnnual / 52).toLocaleString()}</p></div>
              <div className="p-2 rounded-lg bg-muted"><span className="text-muted-foreground">Fortnightly</span><p className="font-bold text-foreground">${Math.round(netAnnual / 26).toLocaleString()}</p></div>
              <div className="p-2 rounded-lg bg-muted"><span className="text-muted-foreground">Monthly</span><p className="font-bold text-foreground">${Math.round(netAnnual / 12).toLocaleString()}</p></div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted text-[9px] text-muted-foreground">
            <p className="font-bold text-foreground mb-1">Employer Costs</p>
            <div className="flex justify-between"><span>KiwiSaver employer (3%)</span><span>${Math.round(ksEmployer).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>ACC employer levy (~1.4%)</span><span>${Math.round(accEmployer).toLocaleString()}</span></div>
            <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border mt-1"><span>Total cost of employment</span><span>${Math.round(totalCost).toLocaleString()}/yr</span></div>
          </div>
        </div>
      )}

      {tab === "leave" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-[10px] text-muted-foreground">Start Date</label><input type="date" className="w-full mt-0.5 px-2 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} /></div>
            <div><label className="text-[10px] text-muted-foreground">Hours/week</label><input className="w-full mt-0.5 px-2 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={leaveHours} onChange={e => setLeaveHours(e.target.value)} /></div>
            <div><label className="text-[10px] text-muted-foreground">Leave taken (days)</label><input className="w-full mt-0.5 px-2 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={leaveTaken} onChange={e => setLeaveTaken(e.target.value)} /></div>
          </div>
          <div className="p-4 rounded-xl border bg-card" style={{ borderColor: AROHA_COLOR + "30" }}>
            <p className="text-[10px] text-muted-foreground mb-2">Employed: {monthsEmployed} months ({weeksEmployed} weeks)</p>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-foreground">Annual Leave</h4>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2 rounded-lg bg-muted">
                    <p className="text-[8px] text-muted-foreground">Current Law (Holidays Act 2003)</p>
                    <p className="text-sm font-bold" style={{ color: AROHA_COLOR }}>{annualLeaveEntitled ? `${annualLeaveDays} days remaining` : `Entitled after 12 months (${12 - monthsEmployed}mo to go)`}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted">
                    <p className="text-[8px] text-muted-foreground">Proposed Law (Employment Leave Bill)</p>
                    <p className="text-sm font-bold" style={{ color: AROHA_COLOR }}>{Math.round(proposedHours)} hours accrued</p>
                    <p className="text-[8px] text-muted-foreground">({(proposedHours / Number(leaveHours)).toFixed(1)} weeks)</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Sick Leave</h4>
                <p className="text-sm font-bold" style={{ color: AROHA_COLOR }}>{sickEntitled ? `${sickDays} days (carries over to max 20)` : `Entitled after 6 months (${Math.max(0, 6 - monthsEmployed)}mo to go)`}</p>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted text-[9px] text-muted-foreground">
             The Employment Leave Bill 2026 proposes accrual from day 1. Until enacted, the Holidays Act 2003 applies.
          </div>
        </div>
      )}

      {tab === "holidays" && (
        <div className="space-y-3">
          {[{ year: "2026", holidays: PUBLIC_HOLIDAYS_2026 }, { year: "2027", holidays: PUBLIC_HOLIDAYS_2027 }].map(y => (
            <div key={y.year}>
              <h3 className="text-xs font-bold text-foreground mb-2">NZ Public Holidays {y.year}</h3>
              <div className="space-y-1">
                {y.holidays.map(h => (
                  <div key={h.date} className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
                    <div><p className="text-[10px] font-medium text-foreground">{h.name}</p></div>
                    <div className="text-right"><p className="text-[10px] text-foreground">{h.date}</p><p className="text-[8px] text-muted-foreground">{h.day}</p></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="p-3 rounded-lg bg-muted text-[9px] text-muted-foreground space-y-1">
            <p className="font-bold text-foreground">Mondayisation Rules</p>
            <p>If a public holiday falls on Saturday or Sunday and it's not an otherwise working day for the employee, the holiday is transferred to the following Monday (or Tuesday if Monday is also a holiday).</p>
            <p className="mt-1 font-bold text-foreground">Pay Rules</p>
            <p>If a public holiday falls on a day the employee would otherwise work: time-and-a-half pay PLUS a day in lieu (alternative holiday).</p>
          </div>
        </div>
      )}

      {tab === "minwage" && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl border bg-card" style={{ borderColor: AROHA_COLOR + "30" }}>
            <h3 className="text-xs font-bold text-foreground mb-2">Current Minimum Wages (from 1 April 2026)</h3>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Adult</span><span className="font-bold" style={{ color: AROHA_COLOR }}>$23.95/hour</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Starting-out</span><span className="font-bold text-foreground">$19.16/hour</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Training</span><span className="font-bold text-foreground">$19.16/hour</span></div>
            </div>
          </div>
          <h3 className="text-xs font-bold text-foreground">Compliance Checker</h3>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-[10px] text-muted-foreground">Hours/week</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={mwHours} onChange={e => setMwHours(e.target.value)} /></div>
            <div><label className="text-[10px] text-muted-foreground">Gross pay ($)</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={mwPay} onChange={e => setMwPay(e.target.value)} /></div>
            <div><label className="text-[10px] text-muted-foreground">Period</label>
              <div className="flex gap-1 mt-0.5">{(["weekly", "fortnightly"] as const).map(p => <button key={p} onClick={() => setMwPeriod(p)} className="flex-1 py-2 rounded-lg text-[9px] capitalize border" style={{ borderColor: mwPeriod === p ? AROHA_COLOR : "hsl(var(--border))", color: mwPeriod === p ? AROHA_COLOR : "hsl(var(--muted-foreground))" }}>{p}</button>)}</div>
            </div>
          </div>
          <div className="p-4 rounded-xl border bg-card" style={{ borderColor: meetsMinWage ? "#5AADA030" : AROHA_COLOR + "30" }}>
            <div className="flex items-center gap-2 mb-1">
              {meetsMinWage ? <NeonCheckmark size={18} color="#5AADA0" /> : <AlertCircle size={18} style={{ color: AROHA_COLOR }} />}
              <span className="text-sm font-bold" style={{ color: meetsMinWage ? "#5AADA0" : AROHA_COLOR }}>{meetsMinWage ? "Compliant" : "Below Minimum Wage"}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Effective hourly rate: <strong className="text-foreground">${effectiveRate.toFixed(2)}/hour</strong> (minimum: $23.95/hour)</p>
            {!meetsMinWage && <p className="text-[10px] mt-1" style={{ color: AROHA_COLOR }}>This rate is ${(23.95 - effectiveRate).toFixed(2)}/hour below the adult minimum wage. Increase pay to at least ${(23.95 * Number(mwHours) * (mwPeriod === "fortnightly" ? 2 : 1)).toFixed(2)} gross per {mwPeriod === "fortnightly" ? "fortnight" : "week"}.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
