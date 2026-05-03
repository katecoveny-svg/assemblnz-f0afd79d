import { useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, Car, Calculator, FileText, ClipboardList, ArrowRight } from "lucide-react";
import { AgentFunnelChart, AgentPieChart, AgentKPIRow } from "@/components/shared/AgentCharts";

const FORGE_COLOR = "#FF4D6A";

interface Lead {
  id: string; name: string; phone: string; email: string;
  vehicle: string; source: string; salesperson: string;
  stage: string; nextAction: string; notes: string; created: string;
  salePrice?: string; tradeIn?: string; financeProvider?: string;
}

const STAGES = ["New Lead", "Contacted", "Test Drive Booked", "Test Drive Done", "Negotiating", "Finance Submitted", "Sold", "Delivered"];
const SOURCES = ["Walk-in", "TradeMe", "Website", "Phone", "Referral"];

const DEMO_LEADS: Lead[] = [
  { id: "1", name: "Sarah Mitchell", phone: "021 555 0101", email: "sarah@email.com", vehicle: "2022 Toyota RAV4 GXL", source: "TradeMe", salesperson: "James K", stage: "Negotiating", nextAction: "Send finance options", notes: "Very keen, comparing with CX-5", created: "2025-03-15" },
  { id: "2", name: "Mike & Aroha Johnson", phone: "022 555 0202", email: "mike.j@email.com", vehicle: "2023 Tesla Model 3", source: "Website", salesperson: "Tane R", stage: "Test Drive Booked", nextAction: "TD tomorrow 2pm", notes: "Coming from Tauranga, first EV", created: "2025-03-17" },
  { id: "3", name: "David Chen", phone: "027 555 0303", email: "d.chen@email.com", vehicle: "2019 Ford Ranger Wildtrak", source: "Walk-in", salesperson: "James K", stage: "New Lead", nextAction: "Follow up call", notes: "Needs tow rating confirmed", created: "2025-03-18" },
  { id: "4", name: "Lisa Ngata", phone: "021 555 0404", email: "lisa.n@email.com", vehicle: "2021 Mazda CX-5 Limited", source: "Referral", salesperson: "Sam W", stage: "Finance Submitted", nextAction: "Awaiting approval", notes: "Trade-in 2017 CX-3", created: "2025-03-10" },
  { id: "5", name: "Tim Brown", phone: "022 555 0505", email: "tim.b@email.com", vehicle: "2022 Toyota RAV4 GXL", source: "Phone", salesperson: "Tane R", stage: "Sold", nextAction: "Delivery prep", notes: "Cash buyer", created: "2025-03-05", salePrice: "45500" },
];

export default function ForgeSales() {
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [view, setView] = useState<"pipeline" | "dashboard" | "finance" | "tradein" | "meeting">("pipeline");
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  // Finance calc
  const [fPrice, setFPrice] = useState("45000");
  const [fDeposit, setFDeposit] = useState("20");
  const [fTerm, setFTerm] = useState("60");
  const [fRate, setFRate] = useState("8.9");
  const [fBalloon, setFBalloon] = useState(false);

  const price = Number(fPrice) || 0;
  const depositAmt = fDeposit.includes("%") ? price * Number(fDeposit.replace("%","")) / 100 : price * Number(fDeposit) / 100;
  const finAmt = price - depositAmt;
  const mRate = Number(fRate) / 100 / 12;
  const term = Number(fTerm);
  const balloonAmt = fBalloon ? finAmt * 0.3 : 0;
  const adjFinAmt = finAmt - balloonAmt;
  const monthly = mRate > 0 ? adjFinAmt * mRate / (1 - Math.pow(1 + mRate, -term)) : adjFinAmt / term;
  const totalInterest = (monthly * term + balloonAmt) - finAmt;

  // Trade-in
  const [tiMake, setTiMake] = useState(""); const [tiModel, setTiModel] = useState(""); const [tiYear, setTiYear] = useState(""); const [tiKms, setTiKms] = useState(""); const [tiCondition, setTiCondition] = useState("Good");

  const moveStage = (leadId: string, newStage: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
  };

  const soldLeads = leads.filter(l => l.stage === "Sold" || l.stage === "Delivered");
  const pipelineValue = leads.filter(l => l.stage === "Negotiating").length * 40000;
  const testDrives = leads.filter(l => ["Test Drive Booked", "Test Drive Done"].includes(l.stage)).length;

  if (view === "finance") {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Finance Calculator</h2>
          <button onClick={() => setView("pipeline")} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground">← Back</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] text-muted-foreground">Vehicle Price ($)</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground" value={fPrice} onChange={e => setFPrice(e.target.value)} /></div>
          <div><label className="text-[10px] text-muted-foreground">Deposit (%)</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground" value={fDeposit} onChange={e => setFDeposit(e.target.value)} /></div>
          <div><label className="text-[10px] text-muted-foreground">Term (months)</label>
            <div className="flex gap-1 mt-0.5">{["24","36","48","60"].map(t => <button key={t} onClick={() => setFTerm(t)} className="flex-1 py-2 rounded-lg text-xs font-medium border" style={{ borderColor: fTerm === t ? FORGE_COLOR : "hsl(var(--border))", color: fTerm === t ? FORGE_COLOR : "hsl(var(--muted-foreground))", backgroundColor: fTerm === t ? FORGE_COLOR + "10" : "transparent" }}>{t}</button>)}</div>
          </div>
          <div><label className="text-[10px] text-muted-foreground">Interest Rate (%)</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground" value={fRate} onChange={e => setFRate(e.target.value)} /></div>
        </div>
        <label className="flex items-center gap-2 text-xs text-foreground"><input type="checkbox" checked={fBalloon} onChange={e => setFBalloon(e.target.checked)} style={{ accentColor: FORGE_COLOR }} /> Include balloon payment (30%)</label>
        <div className="p-4 rounded-xl border bg-card space-y-2" style={{ borderColor: FORGE_COLOR + "30" }}>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Vehicle price</span><span className="text-foreground">${price.toLocaleString()}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Deposit ({fDeposit}%)</span><span className="text-foreground">-${Math.round(depositAmt).toLocaleString()}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Finance amount</span><span className="text-foreground">${Math.round(finAmt).toLocaleString()}</span></div>
          <div className="border-t border-border pt-2 flex justify-between text-sm font-bold"><span className="text-foreground">Monthly payment</span><span style={{ color: FORGE_COLOR }}>${Math.round(monthly).toLocaleString()}/mo</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total interest</span><span className="text-foreground">${Math.round(totalInterest).toLocaleString()}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total cost</span><span className="text-foreground">${Math.round(monthly * term + depositAmt + balloonAmt).toLocaleString()}</span></div>
          {fBalloon && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Balloon payment (end)</span><span className="text-foreground">${Math.round(balloonAmt).toLocaleString()}</span></div>}
        </div>
        <div className="p-3 rounded-lg bg-muted text-[10px] text-muted-foreground space-y-1">
          <p><strong>NZ Reminders:</strong></p>
          <p>• PPSR check recommended before finance approval</p>
          <p>• Clean Car Fee/Discount may apply — check NZTA calculator</p>
          <p>• All finance subject to credit approval</p>
        </div>
      </div>
    );
  }

  if (view === "tradein") {
    const estLow = tiKms ? Math.max(5000, 25000 - Number(tiKms.replace(/\D/g, "")) * 0.08) : 0;
    const estHigh = estLow * 1.3;
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Trade-In Appraisal</h2>
          <button onClick={() => setView("pipeline")} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground">← Back</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] text-muted-foreground">Make</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground" value={tiMake} onChange={e => setTiMake(e.target.value)} /></div>
          <div><label className="text-[10px] text-muted-foreground">Model</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground" value={tiModel} onChange={e => setTiModel(e.target.value)} /></div>
          <div><label className="text-[10px] text-muted-foreground">Year</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground" value={tiYear} onChange={e => setTiYear(e.target.value)} /></div>
          <div><label className="text-[10px] text-muted-foreground">Kilometres</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground" value={tiKms} onChange={e => setTiKms(e.target.value)} placeholder="e.g. 85000" /></div>
        </div>
        <div><label className="text-[10px] text-muted-foreground">Condition</label>
          <div className="flex gap-1 mt-0.5">{["Excellent","Good","Fair","Poor"].map(c => <button key={c} onClick={() => setTiCondition(c)} className="flex-1 py-2 rounded-lg text-xs font-medium border" style={{ borderColor: tiCondition === c ? FORGE_COLOR : "hsl(var(--border))", color: tiCondition === c ? FORGE_COLOR : "hsl(var(--muted-foreground))" }}>{c}</button>)}</div>
        </div>
        {tiMake && tiKms && (
          <div className="p-4 rounded-xl border bg-card" style={{ borderColor: FORGE_COLOR + "30" }}>
            <h3 className="text-xs font-bold text-foreground mb-2">Estimated Trade-In Range</h3>
            <p className="text-2xl font-black" style={{ color: FORGE_COLOR }}>${Math.round(estLow).toLocaleString()} – ${Math.round(estHigh).toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground mt-1">Estimate only — subject to physical inspection</p>
            <div className="mt-3 space-y-1 text-[10px] text-muted-foreground">
              <p>Key factors affecting value:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Odometer: {tiKms} km ({Number(tiKms.replace(/\D/g, "")) > 100000 ? "higher km reduces value" : "low km adds value"})</li>
                <li>Condition: {tiCondition}</li>
                <li>WoF & Rego status</li>
                <li>Service history completeness</li>
                <li>Market demand for {tiMake} {tiModel}</li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-border text-[10px] text-muted-foreground">
              <p className="font-bold text-foreground mb-1">Trade-In vs Private Sale:</p>
              <p>Private sale estimate: ${Math.round(estHigh * 1.15).toLocaleString()} – ${Math.round(estHigh * 1.35).toLocaleString()}</p>
              <p>Trade-in is faster but typically 15-25% less than private sale.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === "meeting") {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Sales Meeting Agenda</h2>
          <button onClick={() => setView("pipeline")} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground">← Back</button>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
          <h3 className="text-sm font-bold text-foreground">Weekly Sales Meeting — {new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" })}</h3>
          {[
            { title: "1. Stock Review", items: [`${leads.filter(l => !["Sold","Delivered"].includes(l.stage)).length} active units`, "New arrivals this week", "Ageing stock actions required"] },
            { title: "2. Pipeline Review", items: [`${leads.filter(l => l.stage === "New Lead").length} new leads`, `${leads.filter(l => l.stage === "Negotiating").length} in negotiation`, `Pipeline value: ~$${(pipelineValue / 1000).toFixed(0)}k`] },
            { title: "3. Individual Performance", items: ["James K: 2 deals closed, 1 in negotiation", "Tane R: 1 test drive booked, strong pipeline", "Sam W: Finance submitted, awaiting approval"] },
            { title: "4. Upcoming Deliveries", items: leads.filter(l => l.stage === "Sold").map(l => `${l.name} — ${l.vehicle}`) },
            { title: "5. Marketing Update", items: ["TradeMe listing performance", "Website enquiry volume", "Upcoming campaigns"] },
            { title: "6. Action Items", items: ["Follow up aged leads > 7 days", "Update TradeMe listings with fresh photos", "Team training: objection handling refresher"] },
          ].map(s => (
            <div key={s.title}>
              <h4 className="text-xs font-bold text-foreground">{s.title}</h4>
              <ul className="mt-1 space-y-0.5">{s.items.map((item, i) => <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1"><span style={{ color: FORGE_COLOR }}>•</span>{item}</li>)}</ul>
            </div>
          ))}
        </div>
        <button onClick={() => navigator.clipboard.writeText("Sales meeting agenda copied")} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: FORGE_COLOR, color: "#0A0A14" }}>Copy Agenda</button>
      </div>
    );
  }

  // Dashboard stats
  if (view === "dashboard") {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Sales Dashboard</h2>
          <button onClick={() => setView("pipeline")} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground">← Pipeline</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Units Sold MTD", value: soldLeads.length, icon: <Car size={16} /> },
            { label: "Gross Profit MTD", value: `$${(soldLeads.length * 6500).toLocaleString()}`, icon: <DollarSign size={16} /> },
            { label: "Test Drives", value: testDrives, icon: <Users size={16} /> },
            { label: "Pipeline Value", value: `$${(pipelineValue / 1000).toFixed(0)}k`, icon: <TrendingUp size={16} /> },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">{s.icon}<span className="text-[10px]">{s.label}</span></div>
              <p className="text-xl font-bold" style={{ color: FORGE_COLOR }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Sales Funnel & Source Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AgentFunnelChart
            title="Sales Funnel"
            color={FORGE_COLOR}
            stages={STAGES.map(s => ({ name: s, value: leads.filter(l => l.stage === s).length }))}
          />
          <AgentPieChart
            title="Lead Sources"
            data={SOURCES.map(s => ({ name: s, value: leads.filter(l => l.source === s).length })).filter(d => d.value > 0)}
            height={180}
            colors={["#FF4D6A", "#FF6B00", "#5AADA0", "#3A6A9C", "#3A7D6E"]}
          />
        </div>

        <div className="p-3 rounded-xl border border-border bg-card">
          <h3 className="text-xs font-bold text-foreground mb-2">Hottest Leads</h3>
          {leads.filter(l => ["Negotiating", "Finance Submitted"].includes(l.stage)).map(l => (
            <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <div><p className="text-xs font-medium text-foreground">{l.name}</p><p className="text-[9px] text-muted-foreground">{l.vehicle}</p></div>
              <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ backgroundColor: FORGE_COLOR + "20", color: FORGE_COLOR }}>{l.stage}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Pipeline (Kanban)
  return (
    <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-bold text-foreground">Sales Pipeline</h2>
        <div className="flex gap-2">
          <button onClick={() => setView("dashboard")} className="px-3 py-1.5 rounded-lg text-xs border border-border text-foreground"><TrendingUp size={10} className="inline mr-1" />Dashboard</button>
          <button onClick={() => setView("finance")} className="px-3 py-1.5 rounded-lg text-xs border border-border text-foreground"><Calculator size={10} className="inline mr-1" />Finance Calc</button>
          <button onClick={() => setView("tradein")} className="px-3 py-1.5 rounded-lg text-xs border border-border text-foreground"><Car size={10} className="inline mr-1" />Trade-In</button>
          <button onClick={() => setView("meeting")} className="px-3 py-1.5 rounded-lg text-xs border border-border text-foreground"><ClipboardList size={10} className="inline mr-1" />Meeting</button>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-2 min-w-max h-full">
          {STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage);
            return (
              <div key={stage} className="w-56 flex flex-col rounded-xl border border-border bg-card/50 shrink-0"
                onDragOver={e => e.preventDefault()}
                onDrop={() => { if (draggedLead) { moveStage(draggedLead, stage); setDraggedLead(null); } }}>
                <div className="p-2 border-b border-border flex items-center justify-between">
                  <span className="text-[10px] font-bold text-foreground">{stage}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{stageLeads.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
                  {stageLeads.map(l => (
                    <div key={l.id} draggable onDragStart={() => setDraggedLead(l.id)}
                      className="p-2 rounded-lg border border-border bg-card cursor-grab active:cursor-grabbing hover:border-foreground/10 transition-colors">
                      <p className="text-[11px] font-bold text-foreground">{l.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{l.vehicle}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{l.source}</span>
                        <span className="text-[8px] text-muted-foreground">{l.salesperson}</span>
                      </div>
                      {l.nextAction && <p className="text-[8px] mt-1" style={{ color: FORGE_COLOR }}>→ {l.nextAction}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
