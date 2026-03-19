import { useState } from "react";
import { Plus, Edit, ExternalLink, Copy, Share2, Search, BarChart3, Car, Clock, DollarSign, TrendingUp, ChevronDown, ChevronUp, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FORGE_COLOR = "#FF4D6A";

interface Vehicle {
  id: string;
  year: string; make: string; model: string; variant: string;
  colour: string; bodyType: string; fuelType: string; transmission: string;
  engineSize: string; kms: string; regoExpiry: string; wofExpiry: string;
  vin: string; stockNumber: string; purchasePrice: string; retailPrice: string;
  driveAwayPrice: string; features: string; conditionNotes: string;
  numberOfOwners: string; serviceHistory: string; photoUrl?: string;
  status: "Available" | "Sold" | "On Hold" | "In Transit";
  addedDate: string;
}

const DEMO_VEHICLES: Vehicle[] = [
  { id: "1", year: "2022", make: "Toyota", model: "RAV4", variant: "GXL Hybrid AWD", colour: "Crystal Pearl", bodyType: "SUV", fuelType: "Hybrid", transmission: "CVT", engineSize: "2.5L", kms: "28,400", regoExpiry: "2025-09-15", wofExpiry: "2025-09-15", vin: "JTMR43FV50D000001", stockNumber: "F001", purchasePrice: "38500", retailPrice: "44990", driveAwayPrice: "46490", features: "Safety Sense 2.5, Adaptive Cruise, Leather, Sunroof", conditionNotes: "Excellent - one owner, full service history", numberOfOwners: "1", serviceHistory: "Full Toyota dealer history", status: "Available", addedDate: "2025-01-15" },
  { id: "2", year: "2021", make: "Mazda", model: "CX-5", variant: "Limited 2.5L AWD", colour: "Soul Red Crystal", bodyType: "SUV", fuelType: "Petrol", transmission: "Automatic", engineSize: "2.5L", kms: "45,200", regoExpiry: "2025-07-20", wofExpiry: "2025-07-20", vin: "JM3KFBDM0M0000001", stockNumber: "F002", purchasePrice: "29500", retailPrice: "35990", driveAwayPrice: "37490", features: "BOSE Audio, Head-up Display, 360 Camera, Heated Seats", conditionNotes: "Very good - minor stone chips on bonnet", numberOfOwners: "2", serviceHistory: "Full dealer history", status: "Available", addedDate: "2025-02-01" },
  { id: "3", year: "2023", make: "Tesla", model: "Model 3", variant: "Long Range AWD", colour: "Pearl White", bodyType: "Sedan", fuelType: "Electric", transmission: "Single-speed", engineSize: "Electric", kms: "12,800", regoExpiry: "2026-03-10", wofExpiry: "2026-03-10", vin: "5YJ3E1EC0PF000001", stockNumber: "F003", purchasePrice: "52000", retailPrice: "59990", driveAwayPrice: "59990", features: "Autopilot, Premium Interior, 19\" Sport Wheels", conditionNotes: "As new", numberOfOwners: "1", serviceHistory: "Tesla service records", status: "On Hold", addedDate: "2025-02-20" },
  { id: "4", year: "2019", make: "Ford", model: "Ranger", variant: "Wildtrak 2.0L Bi-Turbo", colour: "Shadow Black", bodyType: "Ute", fuelType: "Diesel", transmission: "Automatic", engineSize: "2.0L", kms: "87,500", regoExpiry: "2025-06-01", wofExpiry: "2025-06-01", vin: "MNAUMFF50K0000001", stockNumber: "F004", purchasePrice: "32000", retailPrice: "39990", driveAwayPrice: "41490", features: "Sports Bar, Tub Liner, Tow Pack 3500kg, Sat Nav", conditionNotes: "Good - typical work vehicle wear", numberOfOwners: "2", serviceHistory: "Partial dealer, partial independent", status: "Sold", addedDate: "2024-12-05" },
];

const STATUS_COLORS: Record<string, string> = { Available: "#00FF88", Sold: "#FF4D6A", "On Hold": "#FFB800", "In Transit": "#00E5FF" };

const daysInStock = (dateStr: string) => Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);

// Configurator
const MAKES = ["Toyota", "Mazda", "Hyundai", "Ford", "Mitsubishi", "Kia", "Tesla", "BYD"];
const MODELS: Record<string, string[]> = {
  Toyota: ["Corolla", "RAV4", "Hilux", "Camry", "Land Cruiser", "Yaris Cross"],
  Mazda: ["CX-5", "CX-30", "CX-60", "Mazda3", "BT-50", "MX-5"],
  Hyundai: ["Tucson", "Kona", "Santa Fe", "i30", "IONIQ 5", "Staria"],
  Ford: ["Ranger", "Everest", "Puma", "Escape", "Mustang Mach-E"],
  Mitsubishi: ["Outlander", "ASX", "Triton", "Eclipse Cross", "Pajero Sport"],
  Kia: ["Sportage", "Seltos", "Sorento", "EV6", "Niro", "Stonic"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
  BYD: ["Atto 3", "Dolphin", "Seal", "Shark"],
};
const COLOURS = [
  { name: "Crystal White", hex: "#F5F5F5" }, { name: "Midnight Black", hex: "#1a1a2e" },
  { name: "Soul Red", hex: "#9B1B30" }, { name: "Deep Blue", hex: "#1B3A6B" },
  { name: "Silver", hex: "#C0C0C0" }, { name: "Graphite", hex: "#4A4A5A" },
  { name: "Forest Green", hex: "#2D5A3D" }, { name: "Sunset Orange", hex: "#E86833" },
];

export default function ForgeShowroom() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEMO_VEHICLES);
  const [view, setView] = useState<"grid" | "add" | "listing" | "configurator" | "analytics">("grid");
  const [filter, setFilter] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [listingType, setListingType] = useState<"trademe" | "website">("trademe");

  // Configurator state
  const [configStep, setConfigStep] = useState(0);
  const [configMake, setConfigMake] = useState("");
  const [configModel, setConfigModel] = useState("");
  const [configVariant, setConfigVariant] = useState("Standard");
  const [configColour, setConfigColour] = useState(COLOURS[0]);
  const [configInterior, setConfigInterior] = useState("Black Leather");
  const [configAccessories, setConfigAccessories] = useState<string[]>([]);

  // Add vehicle form
  const [form, setForm] = useState<Partial<Vehicle>>({ status: "Available" });

  const filteredVehicles = vehicles.filter(v =>
    `${v.year} ${v.make} ${v.model} ${v.variant} ${v.colour} ${v.status}`.toLowerCase().includes(filter.toLowerCase())
  );

  const totalStock = vehicles.filter(v => v.status !== "Sold").length;
  const avgDays = Math.round(vehicles.filter(v => v.status !== "Sold").reduce((s, v) => s + daysInStock(v.addedDate), 0) / Math.max(totalStock, 1));
  const totalPurchase = vehicles.filter(v => v.status !== "Sold").reduce((s, v) => s + Number(v.purchasePrice), 0);
  const totalRetail = vehicles.filter(v => v.status !== "Sold").reduce((s, v) => s + Number(v.retailPrice), 0);

  const generateTradeMeListing = (v: Vehicle) => {
    return `**${v.year} ${v.make} ${v.model} ${v.variant} — ${v.kms} KMs${v.numberOfOwners === "1" ? ", One Owner" : ""}**

🔑 Key Highlights:
• ${v.fuelType === "Hybrid" || v.fuelType === "Electric" ? "Outstanding fuel efficiency — save at the pump with NZ petrol prices" : `${v.engineSize} ${v.fuelType} engine`}
• ${v.transmission} transmission
• ${v.kms} kilometres
${v.features.split(",").map(f => `• ${f.trim()}`).join("\n")}
${v.numberOfOwners === "1" ? "• One careful owner" : ""}
${v.serviceHistory ? `• ${v.serviceHistory}` : ""}

📋 Vehicle Details:
• Year: ${v.year}
• Make: ${v.make}
• Model: ${v.model} ${v.variant}
• Colour: ${v.colour}
• Body: ${v.bodyType}
• Fuel: ${v.fuelType}
• Transmission: ${v.transmission}
• Odometer: ${v.kms} km
• WoF: Valid until ${v.wofExpiry}
• Rego: Valid until ${v.regoExpiry}

💰 Price: $${Number(v.driveAwayPrice).toLocaleString()} Drive Away (incl. GST)

${v.conditionNotes ? `Condition: ${v.conditionNotes}` : ""}

📸 Recommended Photo Order: Hero 3/4 front shot → Front straight → Rear 3/4 → Side profile → Interior dashboard → Front seats → Rear seats → Boot → Engine bay → Wheels/tyres → Any special features → Odometer

✅ Compliant with TradeMe Motors listing policy — no overlays, genuine photos, NZD pricing incl. GST.

---
For direct API integration with TradeMe DealerBase, contact motorsapi@trademe.co.nz to set up your API access.`;
  };

  const generateWebsiteListing = (v: Vehicle) => {
    return `# ${v.year} ${v.make} ${v.model} ${v.variant}

## $${Number(v.driveAwayPrice).toLocaleString()} Drive Away

**${v.colour} | ${v.kms} km | ${v.transmission} | ${v.fuelType}**

### Why You'll Love This ${v.make}

This ${v.conditionNotes?.toLowerCase().includes("excellent") ? "immaculate" : "well-maintained"} ${v.year} ${v.make} ${v.model} ${v.variant} represents outstanding value in the NZ ${v.bodyType.toLowerCase()} market. ${v.fuelType === "Hybrid" ? "With fuel prices in New Zealand continuing to climb, the hybrid powertrain delivers exceptional fuel economy for your daily commute and weekend adventures." : v.fuelType === "Electric" ? "Zero emissions, zero road user charges (until 2028), and eligible for the Clean Car Discount — this EV is the smart choice for Kiwi drivers." : `The proven ${v.engineSize} ${v.fuelType.toLowerCase()} engine delivers reliable performance for New Zealand conditions.`}

### Specifications
| Spec | Detail |
|------|--------|
| Year | ${v.year} |
| Make/Model | ${v.make} ${v.model} ${v.variant} |
| Colour | ${v.colour} |
| Body Type | ${v.bodyType} |
| Fuel | ${v.fuelType} |
| Engine | ${v.engineSize} |
| Transmission | ${v.transmission} |
| Odometer | ${v.kms} km |
| Owners | ${v.numberOfOwners} |
| WoF | ${v.wofExpiry} |
| Registration | ${v.regoExpiry} |
| Stock No. | ${v.stockNumber} |

### Features
${v.features.split(",").map(f => `- ${f.trim()}`).join("\n")}

### Condition & History
${v.conditionNotes}. ${v.serviceHistory}.

**Finance available from $${Math.round(Number(v.driveAwayPrice) * 0.8 / 60 * 1.089).toLocaleString()}/week** (based on 20% deposit, 8.9% p.a., 60 months)

[Book a Test Drive] [Get Finance Quote] [Trade-In Appraisal]`;
  };

  const accessories = [
    { name: "Tow Bar Kit", price: 1200 }, { name: "Roof Racks", price: 450 },
    { name: "Dash Cam", price: 350 }, { name: "Paint Protection Film", price: 1800 },
    { name: "Window Tinting", price: 400 }, { name: "Mud Flaps", price: 180 },
    { name: "Floor Mats (Premium)", price: 250 }, { name: "Boot Liner", price: 180 },
    { name: "Cargo Barrier", price: 550 }, { name: "Ceramic Coating", price: 1500 },
  ];

  const configBasePrice = 45990;
  const configAccessoryTotal = accessories.filter(a => configAccessories.includes(a.name)).reduce((s, a) => s + a.price, 0);
  const configTotal = configBasePrice + configAccessoryTotal;
  const deposit = configTotal * 0.2;
  const financeAmount = configTotal - deposit;
  const monthlyRate = 0.089 / 12;
  const monthlyPayment = financeAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -60));

  if (view === "analytics") {
    const makeCounts: Record<string, number> = {};
    const bodyTypeCounts: Record<string, number> = {};
    const fuelCounts: Record<string, number> = {};
    vehicles.filter(v => v.status !== "Sold").forEach(v => {
      makeCounts[v.make] = (makeCounts[v.make] || 0) + 1;
      bodyTypeCounts[v.bodyType] = (bodyTypeCounts[v.bodyType] || 0) + 1;
      fuelCounts[v.fuelType] = (fuelCounts[v.fuelType] || 0) + 1;
    });
    const aging60 = vehicles.filter(v => v.status !== "Sold" && daysInStock(v.addedDate) > 60);
    const aging90 = vehicles.filter(v => v.status !== "Sold" && daysInStock(v.addedDate) > 90);

    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Stock Analytics</h2>
          <button onClick={() => setView("grid")} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground">← Back</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Units in Stock", value: totalStock, icon: <Car size={16} /> },
            { label: "Avg Days in Stock", value: avgDays, icon: <Clock size={16} /> },
            { label: "Total Purchase Value", value: `$${totalPurchase.toLocaleString()}`, icon: <DollarSign size={16} /> },
            { label: "Total Asking Price", value: `$${totalRetail.toLocaleString()}`, icon: <TrendingUp size={16} /> },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">{s.icon}<span className="text-[10px]">{s.label}</span></div>
              <p className="text-xl font-bold" style={{ color: FORGE_COLOR }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: "By Make", data: makeCounts },
            { title: "By Body Type", data: bodyTypeCounts },
            { title: "By Fuel Type", data: fuelCounts },
          ].map(chart => (
            <div key={chart.title} className="p-3 rounded-xl border border-border bg-card">
              <h3 className="text-xs font-bold text-foreground mb-2">{chart.title}</h3>
              {Object.entries(chart.data).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-muted-foreground w-20 truncate">{k}</span>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(v / totalStock) * 100}%`, backgroundColor: FORGE_COLOR }} />
                  </div>
                  <span className="text-[10px] font-mono text-foreground">{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {aging60.length > 0 && (
          <div className="p-3 rounded-xl border border-border bg-card">
            <h3 className="text-xs font-bold text-foreground mb-2">⚠️ Ageing Stock Alerts</h3>
            {aging60.map(v => (
              <div key={v.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                <span className="text-xs text-foreground">{v.year} {v.make} {v.model}</span>
                <span className="text-[10px] font-mono" style={{ color: daysInStock(v.addedDate) > 90 ? "#FF4D6A" : "#FFB800" }}>
                  {daysInStock(v.addedDate)} days
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="p-3 rounded-xl border border-border bg-card">
          <h3 className="text-xs font-bold text-foreground mb-1">Potential Gross Profit</h3>
          <p className="text-2xl font-bold" style={{ color: "#00FF88" }}>${(totalRetail - totalPurchase).toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Based on current asking prices vs purchase prices</p>
        </div>
      </div>
    );
  }

  if (view === "configurator") {
    const steps = ["Make", "Model", "Variant", "Colour", "Interior", "Accessories", "Summary"];
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">✨ Build Your Dream Car</h2>
          <button onClick={() => { setView("grid"); setConfigStep(0); }} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground">← Back</button>
        </div>
        {/* Steps indicator */}
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 text-center">
              <div className="h-1 rounded-full mb-1" style={{ backgroundColor: i <= configStep ? FORGE_COLOR : "hsl(var(--border))" }} />
              <span className="text-[9px] text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={configStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            {configStep === 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {MAKES.map(m => (
                  <button key={m} onClick={() => { setConfigMake(m); setConfigStep(1); }}
                    className="p-4 rounded-xl border border-border bg-card hover:border-foreground/20 text-center font-bold text-sm text-foreground transition-all">
                    {m}
                  </button>
                ))}
              </div>
            )}
            {configStep === 1 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(MODELS[configMake] || []).map(m => (
                  <button key={m} onClick={() => { setConfigModel(m); setConfigStep(2); }}
                    className="p-4 rounded-xl border border-border bg-card hover:border-foreground/20 text-center font-bold text-sm text-foreground transition-all">
                    {m}
                  </button>
                ))}
              </div>
            )}
            {configStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {["Standard", "Sport", "Limited / Premium"].map(v => (
                  <button key={v} onClick={() => { setConfigVariant(v); setConfigStep(3); }}
                    className="p-4 rounded-xl border border-border bg-card hover:border-foreground/20 text-left text-foreground transition-all">
                    <span className="font-bold text-sm">{v}</span>
                    <p className="text-[10px] text-muted-foreground mt-1">{v === "Standard" ? "Great value daily driver" : v === "Sport" ? "Enhanced performance & styling" : "Fully loaded luxury"}</p>
                  </button>
                ))}
              </div>
            )}
            {configStep === 3 && (
              <div className="grid grid-cols-4 gap-2">
                {COLOURS.map(c => (
                  <button key={c.name} onClick={() => { setConfigColour(c); setConfigStep(4); }}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border bg-card hover:border-foreground/20 transition-all">
                    <div className="w-10 h-10 rounded-full border-2 border-border" style={{ backgroundColor: c.hex }} />
                    <span className="text-[10px] text-foreground">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
            {configStep === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {["Black Leather", "Tan Leather", "Grey Cloth"].map(i => (
                  <button key={i} onClick={() => { setConfigInterior(i); setConfigStep(5); }}
                    className="p-4 rounded-xl border border-border bg-card hover:border-foreground/20 text-center font-bold text-sm text-foreground transition-all">
                    {i}
                  </button>
                ))}
              </div>
            )}
            {configStep === 5 && (
              <div className="space-y-2">
                {accessories.map(a => (
                  <label key={a.name} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card cursor-pointer hover:border-foreground/10">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={configAccessories.includes(a.name)}
                        onChange={e => setConfigAccessories(prev => e.target.checked ? [...prev, a.name] : prev.filter(x => x !== a.name))}
                        className="rounded" style={{ accentColor: FORGE_COLOR }} />
                      <span className="text-sm text-foreground">{a.name}</span>
                    </div>
                    <span className="text-xs font-mono" style={{ color: FORGE_COLOR }}>+${a.price.toLocaleString()}</span>
                  </label>
                ))}
                <button onClick={() => setConfigStep(6)} className="w-full py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: FORGE_COLOR, color: "#0A0A14" }}>
                  Review Build →
                </button>
              </div>
            )}
            {configStep === 6 && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl border bg-card" style={{ borderColor: FORGE_COLOR + "30" }}>
                  <h3 className="font-bold text-foreground mb-3">Your {configMake} {configModel} Build</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Make:</span> <span className="text-foreground font-medium">{configMake}</span></div>
                    <div><span className="text-muted-foreground">Model:</span> <span className="text-foreground font-medium">{configModel}</span></div>
                    <div><span className="text-muted-foreground">Variant:</span> <span className="text-foreground font-medium">{configVariant}</span></div>
                    <div><span className="text-muted-foreground">Colour:</span> <span className="text-foreground font-medium flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: configColour.hex }} />{configColour.name}</span></div>
                    <div><span className="text-muted-foreground">Interior:</span> <span className="text-foreground font-medium">{configInterior}</span></div>
                    {configAccessories.length > 0 && <div className="col-span-2"><span className="text-muted-foreground">Accessories:</span> <span className="text-foreground font-medium">{configAccessories.join(", ")}</span></div>}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Base price</span><span className="text-foreground">${configBasePrice.toLocaleString()}</span></div>
                    {configAccessoryTotal > 0 && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Accessories</span><span className="text-foreground">+${configAccessoryTotal.toLocaleString()}</span></div>}
                    <div className="flex justify-between text-sm font-bold pt-1 border-t border-border"><span className="text-foreground">Drive-away price</span><span style={{ color: FORGE_COLOR }}>${configTotal.toLocaleString()}</span></div>
                  </div>
                  <div className="mt-3 p-2 rounded-lg bg-muted text-[10px] text-muted-foreground">
                    💰 Estimated finance: <strong className="text-foreground">${Math.round(monthlyPayment).toLocaleString()}/mo</strong> (20% deposit, 8.9% p.a., 60 months)
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2.5 rounded-xl text-xs font-bold border border-border text-foreground">💾 Save Spec</button>
                  <button className="py-2.5 rounded-xl text-xs font-bold border border-border text-foreground">📧 Email to Sales</button>
                  <button className="py-2.5 rounded-xl text-xs font-bold border border-border text-foreground">🚗 Book Test Drive</button>
                  <button className="py-2.5 rounded-xl text-xs font-bold border border-border text-foreground">📄 Download PDF</button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {configStep > 0 && configStep < 6 && (
          <button onClick={() => setConfigStep(s => s - 1)} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
        )}
      </div>
    );
  }

  if (view === "listing" && selectedVehicle) {
    const listing = listingType === "trademe" ? generateTradeMeListing(selectedVehicle) : generateWebsiteListing(selectedVehicle);
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Generate Listing — {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</h2>
          <button onClick={() => { setView("grid"); setSelectedVehicle(null); }} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground">← Back</button>
        </div>
        <div className="flex gap-2">
          {(["trademe", "website"] as const).map(t => (
            <button key={t} onClick={() => setListingType(t)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: listingType === t ? FORGE_COLOR + "20" : "transparent", color: listingType === t ? FORGE_COLOR : "hsl(var(--muted-foreground))", border: `1px solid ${listingType === t ? FORGE_COLOR + "40" : "hsl(var(--border))"}` }}>
              {t === "trademe" ? "TradeMe Motors" : "Website Listing"}
            </button>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <pre className="whitespace-pre-wrap text-xs text-foreground/90 font-sans">{listing}</pre>
        </div>
        <button onClick={() => navigator.clipboard.writeText(listing)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: FORGE_COLOR, color: "#0A0A14" }}>
          <Copy size={14} /> Copy Listing
        </button>
      </div>
    );
  }

  if (view === "add") {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Add Vehicle</h2>
          <button onClick={() => setView("grid")} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground">← Cancel</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {(["year","make","model","variant","colour","bodyType","fuelType","transmission","engineSize","kms","regoExpiry","wofExpiry","vin","stockNumber","purchasePrice","retailPrice","driveAwayPrice","numberOfOwners"] as const).map(field => (
            <div key={field}>
              <label className="text-[10px] text-muted-foreground capitalize">{field.replace(/([A-Z])/g,' $1')}</label>
              <input className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground" value={(form as any)[field] || ""} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">Features (comma separated)</label>
          <textarea className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground h-16" value={form.features || ""} onChange={e => setForm(prev => ({ ...prev, features: e.target.value }))} />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground">Condition Notes</label>
          <textarea className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground h-12" value={form.conditionNotes || ""} onChange={e => setForm(prev => ({ ...prev, conditionNotes: e.target.value }))} />
        </div>
        <button onClick={() => {
          const newV: Vehicle = { ...form as Vehicle, id: crypto.randomUUID(), addedDate: new Date().toISOString().split("T")[0], status: "Available" };
          setVehicles(prev => [newV, ...prev]);
          setView("grid");
          setForm({ status: "Available" });
        }} className="px-4 py-2.5 rounded-lg text-sm font-bold" style={{ backgroundColor: FORGE_COLOR, color: "#0A0A14" }}>
          Add Vehicle
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-bold text-foreground">Showroom</h2>
        <div className="flex gap-2">
          <button onClick={() => setView("configurator")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ backgroundColor: FORGE_COLOR, color: "#0A0A14" }}>
            <Sparkles size={12} /> Build Yours
          </button>
          <button onClick={() => setView("analytics")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-border text-foreground">
            <BarChart3 size={12} /> Analytics
          </button>
          <button onClick={() => setView("add")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-border text-foreground">
            <Plus size={12} /> Add Vehicle
          </button>
        </div>
      </div>
      {/* Quick stats */}
      <div className="flex gap-3 text-[10px] text-muted-foreground">
        <span>{totalStock} units</span>
        <span>Avg {avgDays}d in stock</span>
        <span>Gross potential: ${(totalRetail - totalPurchase).toLocaleString()}</span>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" placeholder="Search stock..." value={filter} onChange={e => setFilter(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredVehicles.map(v => (
          <div key={v.id} className="p-3 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">{v.year} {v.make} {v.model}</h3>
                <p className="text-[10px] text-muted-foreground">{v.variant} · {v.colour} · {v.kms} km · {v.transmission}</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[v.status] + "20", color: STATUS_COLORS[v.status] }}>{v.status}</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-lg font-black" style={{ color: FORGE_COLOR }}>${Number(v.driveAwayPrice).toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">Drive-away · Retail ${Number(v.retailPrice).toLocaleString()}</p>
              </div>
              <span className="text-[9px] text-muted-foreground">{daysInStock(v.addedDate)}d in stock</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] border border-border text-muted-foreground hover:text-foreground"><Edit size={9} /> Edit</button>
              <button onClick={() => { setSelectedVehicle(v); setView("listing"); setListingType("trademe"); }} className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] border border-border text-muted-foreground hover:text-foreground"><ExternalLink size={9} /> TradeMe</button>
              <button onClick={() => { setSelectedVehicle(v); setView("listing"); setListingType("website"); }} className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] border border-border text-muted-foreground hover:text-foreground"><Copy size={9} /> Ad</button>
              <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] border border-border text-muted-foreground hover:text-foreground"><Share2 size={9} /> Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
