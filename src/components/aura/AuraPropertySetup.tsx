import { useState } from "react";
import { NeonBuilding, NeonCheckmark, NeonDocument, NeonStar, NeonGlobe } from "@/components/NeonIcons";

const PROPERTY_MODES = [
  { id: "luxury_lodge", label: "Luxury Lodge", desc: "Premium, bespoke, high-touch" },
  { id: "boutique_hotel", label: "Boutique Hotel", desc: "Distinctive, curated, intimate" },
  { id: "restaurant_bar", label: "Restaurant / Bar", desc: "Dining-focused operations" },
  { id: "cafe", label: "Café", desc: "Casual dining & hospitality" },
  { id: "accommodation", label: "Accommodation Provider", desc: "B&B, holiday home, farmstay" },
  { id: "catering_events", label: "Catering & Events", desc: "Event-focused hospitality" },
];

const COMPLIANCE_ITEMS = [
  "Food safety plan (Food Act 2014)",
  "Liquor licence current",
  "Health & safety policy (HSWA 2015)",
  "Fire safety & evacuation plan",
  "Building warrant of fitness",
  "Qualmark certification",
  "Insurance policies current",
  "Employment agreements for all staff",
  "Privacy policy (guest data)",
  "Accessibility compliance",
];

const GUEST_PROFILES = [
  "Ultra-high-net-worth", "Honeymooners", "Adventure seekers", "Food & wine lovers",
  "Wellness travellers", "Corporate retreat", "Family (luxury)", "Solo luxury travellers",
];

interface PropertyProfile {
  name: string; location: string; rooms: string; roomTypes: string; rates: string;
  restaurant: string; cuisine: string; dietary: string; experiences: string;
  positioning: string; guestProfiles: string[]; partnerships: string;
  awards: string; website: string; mode: string;
}

const DEFAULT: PropertyProfile = {
  name: "", location: "", rooms: "", roomTypes: "", rates: "",
  restaurant: "", cuisine: "", dietary: "", experiences: "",
  positioning: "", guestProfiles: [], partnerships: "",
  awards: "", website: "", mode: "luxury_lodge",
};

const AuraPropertySetup = () => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<PropertyProfile>(() => {
    const saved = sessionStorage.getItem("aura_property_profile");
    return saved ? JSON.parse(saved) : DEFAULT;
  });
  const [compliance, setCompliance] = useState<boolean[]>(() => {
    const saved = sessionStorage.getItem("aura_compliance");
    return saved ? JSON.parse(saved) : new Array(10).fill(false);
  });
  const [completed, setCompleted] = useState(() => !!sessionStorage.getItem("aura_property_profile_done"));

  const set = (k: keyof PropertyProfile, v: any) => setProfile(p => ({ ...p, [k]: v }));
  const score = compliance.filter(Boolean).length;
  const color = "#E6B422";

  const save = () => {
    sessionStorage.setItem("aura_property_profile", JSON.stringify(profile));
    sessionStorage.setItem("aura_compliance", JSON.stringify(compliance));
    sessionStorage.setItem("aura_property_profile_done", "1");
    setCompleted(true);
    // Notify parent to refresh tabs based on new mode
    window.dispatchEvent(new CustomEvent("aura-mode-changed", { detail: profile.mode }));
  };

  const inputCls = "w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

  if (completed) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "30" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <NeonBuilding size={20} />
              <h2 className="font-bold text-foreground">{profile.name || "Property Profile"}</h2>
            </div>
            <button onClick={() => setCompleted(false)} className="text-xs px-3 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-foreground/70 mb-4">
            <div><span className="text-muted-foreground">Location:</span> {profile.location}</div>
            <div><span className="text-muted-foreground">Rooms:</span> {profile.rooms}</div>
            <div><span className="text-muted-foreground">Mode:</span> {PROPERTY_MODES.find(m => m.id === profile.mode)?.label}</div>
            <div><span className="text-muted-foreground">Restaurant:</span> {profile.restaurant}</div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: color + "10" }}>
            <div className="text-2xl font-bold" style={{ color }}>{score}/10</div>
            <div>
              <div className="text-xs font-medium text-foreground">Compliance Score</div>
              <div className="w-32 h-1.5 bg-muted rounded-full mt-1">
                <div className="h-full rounded-full transition-all" style={{ width: `${score * 10}%`, background: color }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonCheckmark size={16} /> Compliance Checklist</h3>
          <div className="space-y-2">
            {COMPLIANCE_ITEMS.map((item, i) => (
              <label key={i} className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={compliance[i]} onChange={() => {
                  const c = [...compliance]; c[i] = !c[i]; setCompliance(c);
                  sessionStorage.setItem("aura_compliance", JSON.stringify(c));
                }} className="rounded" />
                <span className={compliance[i] ? "text-foreground" : "text-muted-foreground"}>{item}</span>
                <span className="ml-auto">{compliance[i] ? "✅" : "❌"}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    // Step 0: Property Mode
    <div key={0} className="space-y-4">
      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2"><NeonStar size={16} /> Select Property Mode</h3>
      <div className="grid grid-cols-2 gap-2">
        {PROPERTY_MODES.map(m => (
          <button key={m.id} onClick={() => set("mode", m.id)}
            className="text-left p-3 rounded-lg border transition-all text-xs"
            style={{ borderColor: profile.mode === m.id ? color : "hsl(var(--border))", background: profile.mode === m.id ? color + "15" : "transparent" }}>
            <div className="font-medium text-foreground">{m.label}</div>
            <div className="text-muted-foreground mt-0.5">{m.desc}</div>
          </button>
        ))}
      </div>
    </div>,
    // Step 1: Property Basics
    <div key={1} className="space-y-3">
      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2"><NeonBuilding size={16} /> Property Basics</h3>
      <input className={inputCls} placeholder="Property name" value={profile.name} onChange={e => set("name", e.target.value)} />
      <input className={inputCls} placeholder="Location (e.g. Ahuriri Valley, Canterbury)" value={profile.location} onChange={e => set("location", e.target.value)} />
      <input className={inputCls} placeholder="Number of rooms/suites" value={profile.rooms} onChange={e => set("rooms", e.target.value)} />
      <input className={inputCls} placeholder="Room types (e.g. Lodge Suite, Valley View, Premium)" value={profile.roomTypes} onChange={e => set("roomTypes", e.target.value)} />
      <input className={inputCls} placeholder="Nightly rates range (e.g. $1,200 - $3,500)" value={profile.rates} onChange={e => set("rates", e.target.value)} />
    </div>,
    // Step 2: Dining & Experiences
    <div key={2} className="space-y-3">
      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2"><NeonDocument size={16} /> Dining & Experiences</h3>
      <input className={inputCls} placeholder="Restaurant name" value={profile.restaurant} onChange={e => set("restaurant", e.target.value)} />
      <input className={inputCls} placeholder="Cuisine style (e.g. Modern NZ, farm-to-table)" value={profile.cuisine} onChange={e => set("cuisine", e.target.value)} />
      <input className={inputCls} placeholder="Dietary capabilities (vegan, GF, halal, etc.)" value={profile.dietary} onChange={e => set("dietary", e.target.value)} />
      <textarea className={inputCls + " min-h-[80px]"} placeholder="Experiences offered (activities, excursions, spa...)" value={profile.experiences} onChange={e => set("experiences", e.target.value)} />
    </div>,
    // Step 3: Brand & Guests
    <div key={3} className="space-y-3">
      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2"><NeonStar size={16} /> Brand & Target Guests</h3>
      <textarea className={inputCls + " min-h-[60px]"} placeholder="Brand positioning statement" value={profile.positioning} onChange={e => set("positioning", e.target.value)} />
      <div className="text-xs text-muted-foreground">Target guest profile (select all that apply):</div>
      <div className="flex flex-wrap gap-2">
        {GUEST_PROFILES.map(g => (
          <button key={g} onClick={() => set("guestProfiles", profile.guestProfiles.includes(g) ? profile.guestProfiles.filter(x => x !== g) : [...profile.guestProfiles, g])}
            className="px-2.5 py-1 rounded-full text-[11px] border transition-all"
            style={{ borderColor: profile.guestProfiles.includes(g) ? color : "hsl(var(--border))", background: profile.guestProfiles.includes(g) ? color + "20" : "transparent", color: profile.guestProfiles.includes(g) ? color : "hsl(var(--muted-foreground))" }}>
            {g}
          </button>
        ))}
      </div>
      <textarea className={inputCls + " min-h-[60px]"} placeholder="Key partnerships (tour operators, airlines, helicopter companies...)" value={profile.partnerships} onChange={e => set("partnerships", e.target.value)} />
    </div>,
    // Step 4: Awards & Web
    <div key={4} className="space-y-3">
      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2"><NeonGlobe size={16} /> Awards & Online Presence</h3>
      <textarea className={inputCls + " min-h-[60px]"} placeholder="Awards and accolades (e.g. hospitality awards, readers' choice, industry rankings)" value={profile.awards} onChange={e => set("awards", e.target.value)} />
      <input className={inputCls} placeholder="Website URL (AURA extracts brand info)" value={profile.website} onChange={e => set("website", e.target.value)} />
    </div>,
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="rounded-xl border border-border bg-card p-5" style={{ borderColor: color + "30" }}>
        <div className="flex items-center gap-2 mb-4">
          <NeonBuilding size={20} />
          <h2 className="font-bold text-foreground">Property Setup</h2>
          <span className="text-xs text-muted-foreground ml-auto">Step {step + 1} of {steps.length}</span>
        </div>
        <div className="flex gap-1 mb-5">
          {steps.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= step ? color : "hsl(var(--muted))" }} />
          ))}
        </div>
        {steps[step]}
        <div className="flex justify-between mt-5">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="px-4 py-2 rounded-lg text-sm border border-border text-foreground disabled:opacity-30">Back</button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: color, color: "#0A0A14" }}>Next</button>
          ) : (
            <button onClick={save} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: color, color: "#0A0A14" }}>Complete Setup</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuraPropertySetup;
