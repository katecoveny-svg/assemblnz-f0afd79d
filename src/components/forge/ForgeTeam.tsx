import { useState } from "react";
import { Copy, Users, GraduationCap, MessageSquare, Trophy, BarChart3 } from "lucide-react";

const FORGE_COLOR = "#FF4D6A";

interface TeamMember {
  id: string; name: string; role: string; department: string;
  phone: string; email: string; specialties: string[];
  years: number; certifications: string[];
  unitsSold: number; grossProfit: number; testDrives: number;
  conversionRate: number; satisfaction: number; photo?: string;
}

const DEMO_TEAM: TeamMember[] = [
  { id: "1", name: "James Kowalski", role: "Senior Sales Executive", department: "Sales", phone: "021 555 0101", email: "james@forge.co.nz", specialties: ["Toyota", "Finance", "Fleet"], years: 8, certifications: ["Toyota Certified", "Finance & Insurance"], unitsSold: 6, grossProfit: 42000, testDrives: 14, conversionRate: 43, satisfaction: 96 },
  { id: "2", name: "Tane Rangihau", role: "Sales Executive", department: "Sales", phone: "022 555 0202", email: "tane@forge.co.nz", specialties: ["Mazda", "EV Specialist"], years: 3, certifications: ["EV Specialist", "CRM Advanced"], unitsSold: 4, grossProfit: 26000, testDrives: 11, conversionRate: 36, satisfaction: 94 },
  { id: "3", name: "Sam Williams", role: "Sales Executive", department: "Sales", phone: "027 555 0303", email: "sam@forge.co.nz", specialties: ["Hyundai", "Used Vehicles"], years: 5, certifications: ["Hyundai Certified"], unitsSold: 5, grossProfit: 32500, testDrives: 12, conversionRate: 42, satisfaction: 91 },
  { id: "4", name: "Maria Santos", role: "Service Advisor", department: "Service", phone: "021 555 0404", email: "maria@forge.co.nz", specialties: ["Customer experience", "Warranty"], years: 6, certifications: ["Toyota Service Certified"], unitsSold: 0, grossProfit: 0, testDrives: 0, conversionRate: 0, satisfaction: 98 },
  { id: "5", name: "Dave McGregor", role: "Workshop Foreman", department: "Service", phone: "027 555 0505", email: "dave@forge.co.nz", specialties: ["Diagnostics", "EV systems", "H&S"], years: 15, certifications: ["Master Technician", "EV Level 3", "First Aid"], unitsSold: 0, grossProfit: 0, testDrives: 0, conversionRate: 0, satisfaction: 95 },
  { id: "6", name: "Ngaio Te Pania", role: "Parts Manager", department: "Parts", phone: "021 555 0606", email: "ngaio@forge.co.nz", specialties: ["Inventory", "Warranty claims"], years: 7, certifications: ["Parts Management"], unitsSold: 0, grossProfit: 0, testDrives: 0, conversionRate: 0, satisfaction: 93 },
];

const DEPT_COLORS: Record<string, string> = { Sales: FORGE_COLOR, Service: "#3A6A9C", Parts: "#3A6A9C", Admin: "#3A7D6E", Management: "#5AADA0" };

const generateBio = (m: TeamMember, format: "website" | "email" | "social" | "trademe") => {
  switch (format) {
    case "website": return `Born and raised in Aotearoa, ${m.name} brings ${m.years} years of automotive expertise to the team. Specialising in ${m.specialties.join(", ")}, ${m.name.split(" ")[0]} is passionate about finding the perfect vehicle for every customer. ${m.certifications.length > 0 ? `Certified in ${m.certifications.join(" and ")}.` : ""} Whether you're buying your first car or upgrading the family fleet, ${m.name.split(" ")[0]}'s knowledge and genuine approach make the process easy and enjoyable.`;
    case "email": return `${m.name} | ${m.role} | ${m.specialties[0]} Specialist\n${m.phone} | ${m.email}`;
    case "social": return `${m.name.split(" ")[0]} — ${m.role}  ${m.years} years in automotive. ${m.specialties[0]} specialist. Making car buying easy for Kiwi families.`;
    case "trademe": return `${m.name} — ${m.role} with ${m.years} years experience. ${m.certifications.join(", ")}. Specialising in ${m.specialties.join(", ")}. Contact: ${m.phone}`;
    default: return "";
  }
};

export default function ForgeTeam() {
  const [tab, setTab] = useState<"directory" | "bios" | "training" | "comms" | "kpi">("directory");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [bioFormat, setBioFormat] = useState<"website" | "email" | "social" | "trademe">("website");
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const member = DEMO_TEAM.find(m => m.id === selectedMember);
  const salesTeam = DEMO_TEAM.filter(m => m.department === "Sales").sort((a, b) => b.unitsSold - a.unitsSold);

  const tabs = [
    { id: "directory" as const, label: "Directory", icon: <Users size={10} /> },
    { id: "bios" as const, label: "Bio Generator", icon: <Copy size={10} /> },
    { id: "training" as const, label: "Training", icon: <GraduationCap size={10} /> },
    { id: "comms" as const, label: "Comms Tools", icon: <MessageSquare size={10} /> },
    { id: "kpi" as const, label: "KPI Dashboard", icon: <BarChart3 size={10} /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h2 className="text-lg font-bold text-foreground">Team</h2>
      <div className="flex gap-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
            style={{ backgroundColor: tab === t.id ? FORGE_COLOR + "20" : "transparent", color: tab === t.id ? FORGE_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${tab === t.id ? FORGE_COLOR + "40" : "hsl(var(--border))"}` }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "directory" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {DEMO_TEAM.map(m => (
            <div key={m.id} className="p-3 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-foreground" style={{ backgroundColor: DEPT_COLORS[m.department] || "#666" }}>
                  {m.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-foreground">{m.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{m.role} · {m.department}</p>
                  <p className="text-[9px] text-muted-foreground">{m.phone} · {m.years}y exp</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {m.specialties.map(s => <span key={s} className="text-[8px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>)}
                {m.certifications.map(c => <span key={c} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: FORGE_COLOR + "15", color: FORGE_COLOR }}>{c}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "bios" && (
        <div className="space-y-3">
          <div className="flex gap-1 flex-wrap">
            {DEMO_TEAM.map(m => (
              <button key={m.id} onClick={() => setSelectedMember(m.id)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                style={{ backgroundColor: selectedMember === m.id ? FORGE_COLOR + "20" : "transparent", color: selectedMember === m.id ? FORGE_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${selectedMember === m.id ? FORGE_COLOR + "40" : "hsl(var(--border))"}` }}>
                {m.name.split(" ")[0]}
              </button>
            ))}
          </div>
          {member && (
            <>
              <div className="flex gap-1">
                {(["website", "email", "social", "trademe"] as const).map(f => (
                  <button key={f} onClick={() => setBioFormat(f)} className="px-2 py-1 rounded text-[9px] capitalize"
                    style={{ backgroundColor: bioFormat === f ? FORGE_COLOR + "20" : "transparent", color: bioFormat === f ? FORGE_COLOR : "hsl(var(--muted-foreground))" }}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <pre className="whitespace-pre-wrap text-[10px] text-foreground/80 font-sans">{generateBio(member, bioFormat)}</pre>
              </div>
              <button onClick={() => copy(generateBio(member, bioFormat))} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ backgroundColor: FORGE_COLOR, color: "#0A0A14" }}>
                <Copy size={12} /> {copied ? "Copied!" : "Copy Bio"}
              </button>
            </>
          )}
        </div>
      )}

      {tab === "training" && (
        <div className="space-y-3">
          {[
            { role: "Sales Executive", modules: ["Product knowledge — all brands", "Objection handling workshop", "Finance & insurance process", "CRM system training", "Customer experience excellence", "Clean Car Standard update"] },
            { role: "Service Advisor", modules: ["Customer communication skills", "Upselling service items", "Warranty process & claims", "Booking system management", "Safety recall procedures"] },
            { role: "Technician", modules: ["Manufacturer certification renewal", "Health & safety refresher", "New model familiarisation", "EV systems training", "Diagnostic software update"] },
            { role: "Parts Team", modules: ["Inventory management best practice", "Customer service at the counter", "Warranty parts claiming", "Stock level optimisation"] },
          ].map(r => (
            <div key={r.role} className="p-3 rounded-xl border border-border bg-card">
              <h4 className="text-xs font-bold text-foreground mb-2">{r.role}</h4>
              {r.modules.map(m => (
                <label key={m} className="flex items-center gap-2 py-1 text-[10px] text-foreground/80 cursor-pointer">
                  <input type="checkbox" className="rounded" style={{ accentColor: FORGE_COLOR }} />
                  {m}
                </label>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === "comms" && (
        <div className="space-y-3">
          {[
            { title: " Morning Huddle (5 min)", content: "Yesterday's wins:\n• [List sales/deliveries]\n\nToday's focus:\n• [Priority callbacks]\n• [Arriving stock]\n• [Scheduled test drives]\n\nStock alerts:\n• [Ageing units to push]\n• [Incoming units]\n\nCustomer callbacks:\n• [Name — vehicle — action required]" },
            { title: " Weekly Sales Meeting", content: "1. Stock review — current vs target\n2. Pipeline walkthrough per salesperson\n3. Performance: units, GP, test drives, conversion\n4. Upcoming deliveries\n5. Marketing update\n6. Training focus this week\n7. Action items" },
            { title: " Monthly Business Review", content: "1. Financial performance (units, gross, net)\n2. Stock analysis (age, mix, turn rate)\n3. People (performance, training, recognition)\n4. Customer satisfaction scores\n5. Marketing ROI\n6. Competitor activity\n7. Next month focus" },
            { title: " Staff Recognition", content: " Congratulations to [Name]!\n\n[Name] has been recognised for [achievement].\n\n[Details of what they did and why it matters]\n\nThank you for going above and beyond.\n\n— The [Dealership] Team" },
          ].map((t, i) => (
            <div key={i} className="p-3 rounded-xl border border-border bg-card">
              <h4 className="text-xs font-bold text-foreground mb-2">{t.title}</h4>
              <pre className="whitespace-pre-wrap text-[9px] text-foreground/70 font-sans">{t.content}</pre>
              <button onClick={() => copy(t.content)} className="mt-2 flex items-center gap-1 text-[9px] font-medium" style={{ color: FORGE_COLOR }}>
                <Copy size={10} /> Copy
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "kpi" && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground">Sales Leaderboard — This Month</h3>
          {salesTeam.map((m, i) => (
            <div key={m.id} className="p-3 rounded-xl border bg-card" style={{ borderColor: i === 0 ? FORGE_COLOR + "40" : "hsl(var(--border))" }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-black" style={{ color: i === 0 ? FORGE_COLOR : "hsl(var(--muted-foreground))" }}>#{i + 1}</span>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-foreground">{m.name}</h4>
                  <p className="text-[9px] text-muted-foreground">{m.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-[9px]">
                <div><span className="text-muted-foreground">Units</span><p className="text-sm font-bold" style={{ color: FORGE_COLOR }}>{m.unitsSold}</p></div>
                <div><span className="text-muted-foreground">Gross</span><p className="text-sm font-bold text-foreground">${(m.grossProfit / 1000).toFixed(0)}k</p></div>
                <div><span className="text-muted-foreground">Test Drives</span><p className="text-sm font-bold text-foreground">{m.testDrives}</p></div>
                <div><span className="text-muted-foreground">Conversion</span><p className="text-sm font-bold text-foreground">{m.conversionRate}%</p></div>
                <div><span className="text-muted-foreground">Satisfaction</span><p className="text-sm font-bold text-foreground">{m.satisfaction}%</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
