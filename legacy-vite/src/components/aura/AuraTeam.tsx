import { useState } from "react";
import { NeonTeam, NeonCheckmark, NeonStar, NeonDocument } from "@/components/NeonIcons";

const color = "#5AADA0";

const TRAINING_MODULES = [
  { title: "Food Act 2014 Compliance", category: "Kitchen", priority: "Required" },
  { title: "Liquor Licensing (SSAA 2012)", category: "F&B", priority: "Required" },
  { title: "Health & Safety Induction", category: "All Staff", priority: "Required" },
  { title: "Fire Safety & Evacuation", category: "All Staff", priority: "Required" },
  { title: "Guest Service Excellence", category: "Front of House", priority: "Core" },
  { title: "Wine Knowledge & Pairings", category: "F&B", priority: "Core" },
  { title: "Allergen & Dietary Awareness", category: "Kitchen & F&B", priority: "Required" },
  { title: "Privacy Act — Guest Data", category: "All Staff", priority: "Core" },
  { title: "Cultural Competency (Te Ao Māori)", category: "All Staff", priority: "Recommended" },
  { title: "Luxury Guest Communication", category: "Front of House", priority: "Core" },
  { title: "First Aid Certificate", category: "All Staff", priority: "Required" },
  { title: "Seasonal Staff Onboarding", category: "New Staff", priority: "Required" },
];

const LUXURY_TRAINING = [
  "The art of anticipation (reading guests without being intrusive)",
  "Personal name usage (when and how to use guest names naturally)",
  "Handling complaints — LEARN method (Listen, Empathise, Apologise, Resolve, Notify)",
  "Wine & beverage knowledge for front-of-house",
  "Food knowledge & allergen awareness",
  "Activity guiding standards (safety + storytelling + hospitality)",
  "Cultural competency (international guests — norms, dietary laws, communication)",
  "Te reo Māori pronunciation for place names & greetings",
  "Photography assistance (helping guests capture great photos)",
  "Vehicle & transfer protocol (luxury standards)",
  "Telephone & email etiquette for luxury properties",
  "Social media discretion (guest privacy policy)",
];

const ONBOARDING_PROGRAMME = [
  "Pre-arrival information pack for seasonal staff",
  "Day 1-3 induction programme",
  "Property knowledge test (rooms, experiences, dining, local area)",
  "Guest interaction standards training",
  "H&S induction specific to the property",
  "Buddy system setup (pair new with experienced)",
];

const CAREER_PATHS = [
  { from: "Housekeeper", to: "Head Housekeeper → Operations Manager", support: "Cross-training in F&B" },
  { from: "F&B Staff", to: "Restaurant Supervisor → F&B Manager", support: "Wine cert, NZQA hospitality" },
  { from: "Front Desk", to: "Guest Experience Manager → Asst GM", support: "Revenue mgmt training" },
  { from: "Kitchen Staff", to: "Sous Chef → Head Chef", support: "Food Act cert, menu design" },
  { from: "Activities Guide", to: "Head Guide → Experiences Manager", support: "First aid, DOC concessions" },
];

interface Props { onGenerate?: (prompt: string) => void; }

const AuraTeam = ({ onGenerate }: Props) => {
  const gen = (prompt: string) => onGenerate?.(prompt);
  const [section, setSection] = useState<"roster" | "training" | "luxury" | "onboarding" | "careers" | "recognition">("roster");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: "roster" as const, label: "Roster" },
          { id: "training" as const, label: "Training" },
          { id: "luxury" as const, label: "Luxury Service" },
          { id: "onboarding" as const, label: "Onboarding" },
          { id: "careers" as const, label: "Careers" },
          { id: "recognition" as const, label: "Recognition" },
        ]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{ background: section === s.id ? color + "20" : "transparent", color: section === s.id ? color : "hsl(var(--muted-foreground))", border: `1px solid ${section === s.id ? color + "40" : "hsl(var(--border))"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "roster" && (
        <div className="space-y-3">
          {[
            { title: "Team Roster Manager", desc: "Weekly roster builder with role assignments" },
            { title: "Shift Briefing Generator", desc: "Pre-shift briefing with guest info, VIPs, dietary, activities" },
            { title: "Staff Contact Directory", desc: "Emergency contacts and roles" },
          ].map(t => (
            <div key={t.title} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-foreground flex items-center gap-2"><NeonTeam size={14} /> {t.title}</div>
                <div className="text-[10px] text-muted-foreground ml-5">{t.desc}</div>
              </div>
              <button className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
            </div>
          ))}
        </div>
      )}

      {section === "training" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonCheckmark size={16} /> Compliance Training Tracker</h3>
          <div className="space-y-2">
            {TRAINING_MODULES.map(m => (
              <div key={m.title} className="p-2.5 rounded-lg border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">{m.title}</div>
                  <div className="text-[10px] text-muted-foreground">{m.category} · <span className={m.priority === "Required" ? "text-destructive" : ""}>{m.priority}</span></div>
                </div>
                <button className="px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Train</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "luxury" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonStar size={16} /> Luxury Service Training</h3>
          <p className="text-[10px] text-muted-foreground mb-3">Bespoke training modules for world-class guest service.</p>
          <div className="space-y-2">
            {LUXURY_TRAINING.map(t => (
              <div key={t} className="p-2.5 rounded-lg border border-border flex items-center justify-between">
                <span className="text-[11px] text-foreground/80">{t}</span>
                <button className="px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "onboarding" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonDocument size={16} color={color} /> Seasonal Staff Onboarding</h3>
          <p className="text-[10px] text-muted-foreground mb-3">Complete programme for seasonal workers — lodges rely on them heavily.</p>
          <div className="space-y-2">
            {ONBOARDING_PROGRAMME.map(item => (
              <div key={item} className="p-2.5 rounded-lg border border-border flex items-center justify-between">
                <span className="text-[11px] text-foreground/80">{item}</span>
                <button className="px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-2 rounded-lg text-xs font-medium" style={{ background: color, color: "#0A0A14" }}>Generate Full Onboarding Pack</button>
        </div>
      )}

      {section === "careers" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonStar size={16} /> Career Development Pathways</h3>
          <p className="text-[10px] text-muted-foreground mb-3">Retain great staff with clear progression, cross-training, and qualifications.</p>
          <div className="space-y-2">
            {CAREER_PATHS.map(p => (
              <div key={p.from} className="p-3 rounded-lg border border-border">
                <div className="text-xs font-medium text-foreground">{p.from} → {p.to}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Support: {p.support}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 text-[10px] text-foreground/70">
            <div className="p-2 rounded-lg border border-border">Cross-training opportunities across departments</div>
            <div className="p-2 rounded-lg border border-border">NZQA hospitality & ServiceIQ qualifications</div>
            <div className="p-2 rounded-lg border border-border">Secondment between group properties (Lindis ↔ Paroa Bay ↔ Mt Isthmus)</div>
          </div>
        </div>
      )}

      {section === "recognition" && (
        <div className="space-y-3">
          {[
            { title: "Staff Recognition Programme", desc: "Peer nominations, monthly awards, guest feedback highlights" },
            { title: "Guest Feedback — Staff Attribution", desc: "Link guest praise to specific team members" },
            { title: "Performance Review Template", desc: "Quarterly review tailored for hospitality roles" },
            { title: "Long Service Awards", desc: "1, 3, 5, 10 year milestones" },
          ].map(t => (
            <div key={t.title} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-foreground flex items-center gap-2"><NeonStar size={14} /> {t.title}</div>
                <div className="text-[10px] text-muted-foreground ml-5">{t.desc}</div>
              </div>
              <button className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuraTeam;
