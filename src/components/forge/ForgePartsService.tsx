import { useState } from "react";
import { Copy, Wrench, Package, Bell, MessageSquare, Calendar } from "lucide-react";

const FORGE_COLOR = "#FF4D6A";

const SERVICE_MENU = [
  { category: "Standard Services", items: [
    { name: "Oil & Filter Change", desc: "Includes quality oil, genuine filter, and multi-point check", price: "$149" },
    { name: "WoF Pre-Inspection Check", desc: "Full vehicle check against NZTA WoF requirements", price: "$89" },
    { name: "Major Service (60,000km)", desc: "Comprehensive service including all fluids, filters, spark plugs", price: "$499" },
    { name: "Brake Service (per axle)", desc: "New pads, rotor inspection/machining, fluid check", price: "$349" },
    { name: "Timing Belt Replacement", desc: "Belt, tensioner, water pump — manufacturer spec", price: "$890" },
    { name: "Transmission Service", desc: "Fluid drain, filter, and refill", price: "$289" },
  ]},
  { category: "Seasonal Packages", items: [
    { name: "Winter Check", desc: "Battery test, wipers, lights, tyres, demister, coolant", price: "$149" },
    { name: "Summer Road Trip Prep", desc: "Coolant, AC, tyres, brakes, belts, emergency kit check", price: "$129" },
    { name: "Towing Prep Service", desc: "Tow ball check, lights, brakes, transmission, cooling", price: "$159" },
  ]},
];

const REMINDERS = [
  { type: "Service Due", channel: "Email", template: `Hi [Customer Name],\n\nYour [Year] [Make] [Model] is due for its next service. It's been [X months] since your last visit and your odometer should be approaching [X km].\n\nBook online or call us on [Phone] — we'll have you back on the road in no time.\n\nCheers,\n[Dealership Name]` },
  { type: "Service Due", channel: "SMS", template: `Hi [Name], your [Make] [Model] is due for a service. Book at [link] or call [Phone]. [Dealership]` },
  { type: "WoF Expiry", channel: "Email", template: `Hi [Customer Name],\n\nJust a friendly reminder — the WoF on your [Year] [Make] [Model] (rego [Plate]) expires on [Date].\n\nBook your WoF inspection with us and we'll make sure everything's sorted.\n\nCall [Phone] or book online at [Link].\n\n[Dealership Name]` },
  { type: "WoF Expiry", channel: "SMS", template: `Hi [Name], your WoF expires [Date]. Book at [link] or call [Phone]. [Dealership]` },
  { type: "Recall Notice", channel: "Email", template: `Important: Safety Recall — [Year] [Make] [Model]\n\nDear [Customer Name],\n\n[Manufacturer] has issued a safety recall affecting your vehicle (VIN: [VIN]).\n\nRecall: [Description]\n\nThis work is completed at no cost to you. Please contact us to book: [Phone].\n\nRegards,\n[Dealership Name]` },
  { type: "Service Follow-up", channel: "Email", template: `Hi [Customer Name],\n\nThanks for bringing your [Make] [Model] in for service yesterday. We hope everything's running smoothly!\n\nIf you have any questions about the work completed, don't hesitate to reach out.\n\nWe'd love your feedback — leave us a Google review: [Link]\n\nCheers,\n[Dealership Name]` },
  { type: "Review Request", channel: "Email", template: `Hi [Customer Name],\n\nWe hope you're enjoying your [Year] [Make] [Model]!\n\nYour feedback helps other Kiwi buyers make confident decisions. Would you mind leaving us a quick review?\n\n Google: [Link]\n Marketplace: [Link]\n Facebook: [Link]\n\nThanks for choosing [Dealership Name]!` },
];

const WORKSHOP_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DEMO_JOBS: Record<string, { type: string; time: string; vehicle: string }[]> = {
  Monday: [
    { type: "Service", time: "8:00am", vehicle: "2021 Toyota Hilux" },
    { type: "WoF", time: "9:30am", vehicle: "2019 Mazda CX-5" },
    { type: "Repair", time: "11:00am", vehicle: "2018 Ford Ranger" },
    { type: "Service", time: "1:00pm", vehicle: "2022 Hyundai Tucson" },
  ],
  Tuesday: [
    { type: "WoF", time: "8:00am", vehicle: "2020 Kia Sportage" },
    { type: "Warranty", time: "10:00am", vehicle: "2023 Toyota RAV4" },
    { type: "Service", time: "1:30pm", vehicle: "2021 Mitsubishi Outlander" },
  ],
  Wednesday: [
    { type: "Service", time: "8:30am", vehicle: "2022 EV Sedan" },
    { type: "Repair", time: "10:00am", vehicle: "2017 Ford Ranger" },
  ],
  Thursday: [
    { type: "WoF", time: "8:00am", vehicle: "2019 Suzuki Swift" },
    { type: "Service", time: "9:00am", vehicle: "2021 Toyota Camry" },
    { type: "WoF", time: "11:00am", vehicle: "2020 Mazda3" },
    { type: "Repair", time: "1:00pm", vehicle: "2018 Holden Colorado" },
    { type: "Service", time: "3:00pm", vehicle: "2022 BYD Atto 3" },
  ],
  Friday: [
    { type: "Service", time: "8:00am", vehicle: "2021 Nissan Navara" },
    { type: "WoF", time: "10:00am", vehicle: "2020 Honda Jazz" },
  ],
};

const TYPE_COLORS: Record<string, string> = { Service: "#5AADA0", WoF: "#3A6A9C", Repair: "#3A6A9C", Warranty: "#E040FB" };

export default function ForgePartsService() {
  const [tab, setTab] = useState<"menu" | "parts" | "reminders" | "comms" | "workshop">("menu");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyTemplate = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const tabs = [
    { id: "menu" as const, label: "Service Menu", icon: <Wrench size={10} /> },
    { id: "parts" as const, label: "Parts Helper", icon: <Package size={10} /> },
    { id: "reminders" as const, label: "Reminders", icon: <Bell size={10} /> },
    { id: "comms" as const, label: "Templates", icon: <MessageSquare size={10} /> },
    { id: "workshop" as const, label: "Workshop", icon: <Calendar size={10} /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <h2 className="text-lg font-bold text-foreground">Parts & Service</h2>
      <div className="flex gap-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors"
            style={{ backgroundColor: tab === t.id ? FORGE_COLOR + "20" : "transparent", color: tab === t.id ? FORGE_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${tab === t.id ? FORGE_COLOR + "40" : "hsl(var(--border))"}` }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "menu" && (
        <div className="space-y-4">
          {SERVICE_MENU.map(cat => (
            <div key={cat.category}>
              <h3 className="text-xs font-bold text-foreground mb-2">{cat.category}</h3>
              <div className="space-y-1.5">
                {cat.items.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                    <div><p className="text-xs font-medium text-foreground">{item.name}</p><p className="text-[9px] text-muted-foreground">{item.desc}</p></div>
                    <span className="text-sm font-bold" style={{ color: FORGE_COLOR }}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: FORGE_COLOR, color: "#0A0A14" }}>Export as PDF Menu</button>
        </div>
      )}

      {tab === "parts" && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-xs font-bold text-foreground mb-2">Common Parts Lookup</h3>
            <p className="text-[10px] text-muted-foreground mb-3">Enter make/model to see commonly needed parts and suggested stock levels.</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input className="px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground" placeholder="Make (e.g. Toyota)" />
              <input className="px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground" placeholder="Model (e.g. Hilux)" />
            </div>
            <div className="space-y-1.5">
              {["Oil Filters — Stock 20+", "Brake Pads (front) — Stock 10+", "Air Filters — Stock 15+", "Wiper Blades — Stock 10+", "Spark Plugs (set) — Stock 8+"].map(p => (
                <div key={p} className="text-[10px] text-foreground/80 flex items-center gap-2"><span style={{ color: FORGE_COLOR }}>•</span>{p}</div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-xs font-bold text-foreground mb-2">Genuine vs Aftermarket Comparison</h3>
            <div className="text-[10px] text-muted-foreground space-y-1">
              <p><strong className="text-foreground">Genuine parts:</strong> Manufacturer warranty, exact fitment, higher cost. Recommended for warranty vehicles and safety-critical components.</p>
              <p><strong className="text-foreground">Aftermarket:</strong> Lower cost, good for older vehicles out of warranty. Brands like Ryco, Bosch, Bendix offer reliable alternatives.</p>
            </div>
          </div>
        </div>
      )}

      {tab === "reminders" && (
        <div className="space-y-2">
          {REMINDERS.filter(r => ["Service Due", "WoF Expiry"].includes(r.type)).map((r, i) => (
            <div key={i} className="p-3 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">{r.type}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{r.channel}</span>
              </div>
              <pre className="text-[10px] text-foreground/70 whitespace-pre-wrap font-sans">{r.template}</pre>
              <button onClick={() => copyTemplate(r.template, i)} className="mt-2 flex items-center gap-1 text-[9px] font-medium" style={{ color: FORGE_COLOR }}>
                <Copy size={10} /> {copiedIdx === i ? "Copied!" : "Copy template"}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "comms" && (
        <div className="space-y-2">
          {REMINDERS.map((r, i) => (
            <div key={i} className="p-3 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">{r.type}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{r.channel}</span>
              </div>
              <pre className="text-[10px] text-foreground/70 whitespace-pre-wrap font-sans max-h-32 overflow-y-auto">{r.template}</pre>
              <button onClick={() => copyTemplate(r.template, i + 100)} className="mt-2 flex items-center gap-1 text-[9px] font-medium" style={{ color: FORGE_COLOR }}>
                <Copy size={10} /> {copiedIdx === i + 100 ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "workshop" && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground">Workshop Loading — This Week</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {WORKSHOP_DAYS.map(day => {
              const jobs = DEMO_JOBS[day] || [];
              return (
                <div key={day} className="rounded-xl border border-border bg-card p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-foreground">{day}</span>
                    <span className="text-[9px] text-muted-foreground">{jobs.length} jobs</span>
                  </div>
                  <div className="space-y-1">
                    {jobs.map((j, i) => (
                      <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-lg" style={{ backgroundColor: (TYPE_COLORS[j.type] || "#666") + "10" }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[j.type] }} />
                        <div className="min-w-0">
                          <p className="text-[9px] font-medium text-foreground truncate">{j.vehicle}</p>
                          <p className="text-[8px] text-muted-foreground">{j.time} · {j.type}</p>
                        </div>
                      </div>
                    ))}
                    {jobs.length < 4 && (
                      <div className="text-[8px] text-center py-1 text-muted-foreground">{4 - jobs.length} slots available</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 rounded-xl border border-border bg-card">
            <h4 className="text-[10px] font-bold text-foreground mb-1">Week Summary</h4>
            <div className="flex gap-4 text-[10px] text-muted-foreground">
              <span>Total jobs: {Object.values(DEMO_JOBS).flat().length}</span>
              <span>Services: {Object.values(DEMO_JOBS).flat().filter(j => j.type === "Service").length}</span>
              <span>WoFs: {Object.values(DEMO_JOBS).flat().filter(j => j.type === "WoF").length}</span>
              <span>Repairs: {Object.values(DEMO_JOBS).flat().filter(j => j.type === "Repair").length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
