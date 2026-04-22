import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Home, Users, PawPrint, GraduationCap, Shirt, Clock, ShoppingCart,
  BookOpen, MessageSquare, Settings, ChevronLeft, Menu, X, Wifi, Compass, Sparkles,
} from "lucide-react";
import toroaLogo from "@/assets/brand/toroa-logo.svg";
import KeteBrainChat from "@/components/KeteBrainChat";
import KeteDocUpload from "@/components/shared/KeteDocUpload";
import KeteEvidencePackPanel from "@/components/shared/KeteEvidencePackPanel";

// Modules
import FamilyOverview from "./modules/FamilyOverview";
import TodayDigest, { type DigestItem } from "./modules/TodayDigest";
import PetModule from "./modules/PetModule";
import SchoolModule from "./modules/SchoolModule";
import UniformTracker from "./modules/UniformTracker";
import AppointmentsModule, { type Appointment } from "./modules/AppointmentsModule";
import ShoppingModule from "./modules/ShoppingModule";
import HomeworkHelp from "./modules/HomeworkHelp";

// Locked Brand Bible v2.0 — light Mārama palette
const ACCENT = "#9D8C7D";        // Taupe — primary accent (replaces teal)
const POUNAMU = "#6F6158";       // Twilight Taupe — text/headings (NEVER #000)
const SPARKLE = "#D9BC7A";       // Soft Gold — sparkle accent only
const BONE = "#F7F3EE";          // Mist canvas
const BG = "#F7F3EE";            // Mist — light canvas
const INK = "#6F6158";           // All text/headlines
const MUTED = "#9D8C7D";         // Wordmark / secondary text
const SOFT_BORDER = "rgba(142,129,119,0.14)";
const TEAL_ACCENT = ACCENT;      // Legacy alias retargeted to Taupe

type ModuleKey = "today" | "family" | "pets" | "school" | "uniforms" | "appointments" | "shopping" | "homework";

const NAV_ITEMS: { key: ModuleKey; label: string; icon: React.ElementType }[] = [
  { key: "today", label: "Today", icon: Home },
  { key: "family", label: "Household", icon: Users },
  { key: "pets", label: "Pets", icon: PawPrint },
  { key: "school", label: "School", icon: GraduationCap },
  { key: "uniforms", label: "Uniforms", icon: Shirt },
  { key: "appointments", label: "Appointments", icon: Clock },
  { key: "shopping", label: "Shopping", icon: ShoppingCart },
  { key: "homework", label: "Homework", icon: BookOpen },
];

// ── DEMO DATA ──
const DEMO_FAMILY = {
  members: [
    { name: "Sarah", role: "Parent" },
    { name: "James", role: "Parent" },
  ],
  children: [
    { name: "Mia", school: "Ponsonby Primary", year: "5" },
    { name: "Ethan", school: "Ponsonby Primary", year: "3" },
  ],
  pets: [
    { name: "Buddy", species: "dog", breed: "Labrador" },
    { name: "Whiskers", species: "cat", breed: "Domestic Shorthair" },
  ],
};

const DEMO_DIGEST: DigestItem[] = [
  { type: "alert", text: "Permission slip — camp (due Friday)", urgent: true },
  { type: "event", text: "Mia — netball Saturday 9am (Western Springs)", time: "09:00" },
  { type: "reminder", text: "WoF due 15 April" },
  { type: "event", text: "Piano lesson — Wednesday 3:30pm", time: "15:30" },
  { type: "task", text: "Buddy — vet checkup next Tuesday" },
];

const DEMO_PETS = [
  {
    id: "1", name: "Buddy", species: "dog", breed: "Labrador", weight_kg: 32, vet_clinic: "Grey Lynn Vet", vet_phone: "09 376 1234", microchip_number: "NZ-9001234567",
    vaccinations: [
      { name: "C5 Vaccination", date: "2025-09-15", next_due: "2026-09-15" },
      { name: "Kennel Cough", date: "2025-06-01", next_due: "2026-06-01" },
      { name: "Rabies", date: "2024-12-01", next_due: "2025-12-01" },
    ],
    medications: [
      { name: "Nexgard", dosage: "68mg", frequency: "Monthly" },
    ],
  },
  {
    id: "2", name: "Whiskers", species: "cat", breed: "Domestic Shorthair", weight_kg: 4.5, vet_clinic: "Grey Lynn Vet", vet_phone: "09 376 1234",
    vaccinations: [
      { name: "F3 Vaccination", date: "2025-11-01", next_due: "2026-11-01" },
    ],
    medications: [],
  },
];

const DEMO_SCHOOL_CHILDREN = [
  { name: "Mia", school: "Ponsonby Primary", year_level: "5", teacher: "Mrs Williams", upcoming: ["Camp form due 18 Apr", "Photo day 22 Apr", "Maths test Fri"], newsletters: [{ title: "Week 10 Newsletter", date: "11 Apr" }, { title: "Camp Information Pack", date: "8 Apr" }] },
  { name: "Ethan", school: "Ponsonby Primary", year_level: "3", teacher: "Mr Thompson", upcoming: ["Book Week starts Mon"], newsletters: [{ title: "Week 10 Newsletter", date: "11 Apr" }] },
];

const DEMO_TERM_DATES = [
  { term: "Term 1", start: "3 Feb", end: "11 Apr", current: false },
  { term: "Term 2", start: "28 Apr", end: "3 Jul", current: true },
  { term: "Term 3", start: "21 Jul", end: "26 Sep", current: false },
  { term: "Term 4", start: "13 Oct", end: "12 Dec", current: false },
];

const DEMO_UNIFORMS = [
  { item_type: "Polo shirt", size: "8", quantity: 3, condition: "good" as const, child_name: "Mia" },
  { item_type: "Skort", size: "8", quantity: 2, condition: "fair" as const, child_name: "Mia" },
  { item_type: "Jumper", size: "8", quantity: 1, condition: "replace" as const, child_name: "Mia" },
  { item_type: "Polo shirt", size: "6", quantity: 2, condition: "good" as const, child_name: "Ethan" },
  { item_type: "Shorts", size: "6", quantity: 2, condition: "good" as const, child_name: "Ethan" },
  { item_type: "Hat", size: "S", quantity: 1, condition: "fair" as const, child_name: "Ethan" },
];

const DEMO_APPOINTMENTS: Appointment[] = [
  { id: "1", title: "Buddy — vet checkup", appointment_at: "2026-04-15T10:00:00", location: "Grey Lynn Vet", category: "vet", status: "upcoming", member_name: "Buddy" },
  { id: "2", title: "Mia — dentist", appointment_at: "2026-04-18T14:30:00", location: "Ponsonby Dental", category: "dental", status: "upcoming", member_name: "Mia" },
  { id: "3", title: "WoF inspection", appointment_at: "2026-04-10T09:00:00", location: "AA Ponsonby", category: "general", status: "overdue", is_overdue: true },
  { id: "4", title: "Ethan — GP checkup", appointment_at: "2026-04-22T11:00:00", location: "Ponsonby Medical", category: "medical", status: "upcoming", member_name: "Ethan" },
];

const DEMO_SHOPPING = [
  { id: "1", item: "Milk (2L)", quantity: 2, category: "groceries", estimated_cost_cents: 640, purchased: false },
  { id: "2", item: "Bread — Vogels", quantity: 1, category: "groceries", estimated_cost_cents: 580, purchased: false },
  { id: "3", item: "Chicken thighs", quantity: 1, category: "groceries", estimated_cost_cents: 1200, purchased: false },
  { id: "4", item: "Bananas", quantity: 1, category: "groceries", estimated_cost_cents: 350, purchased: true },
  { id: "5", item: "Broccoli", quantity: 1, category: "groceries", estimated_cost_cents: 300, purchased: false },
  { id: "6", item: "Dishwashing liquid", quantity: 1, category: "household", estimated_cost_cents: 450, purchased: false },
  { id: "7", item: "Glue stick (Mia)", quantity: 2, category: "school", estimated_cost_cents: 400, purchased: false },
];

const DEMO_HW_CHILDREN = [
  { name: "Mia", year_level: "5", subjects: [
    { name: "Mathematics", icon: "maths", nzcLevel: "3" },
    { name: "English", icon: "english", nzcLevel: "3" },
    { name: "Science", icon: "science", nzcLevel: "3" },
    { name: "Te Reo Māori", icon: "te_reo", nzcLevel: "2" },
  ]},
  { name: "Ethan", year_level: "3", subjects: [
    { name: "Mathematics", icon: "maths", nzcLevel: "2" },
    { name: "English", icon: "english", nzcLevel: "2" },
  ]},
];

export default function ToroaDashboard() {
  const [active, setActive] = useState<ModuleKey>("today");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);

  // Editable state — every list is now CRUD'able from the UI
  const [digest, setDigest] = useState(DEMO_DIGEST);
  const [appointments, setAppointments] = useState(DEMO_APPOINTMENTS);
  const [shoppingItems, setShoppingItems] = useState(DEMO_SHOPPING);
  const [familyMembers, setFamilyMembers] = useState<{ name: string; role: string }[]>(DEMO_FAMILY.members);
  const [familyChildren, setFamilyChildren] = useState<{ name: string; school?: string; year?: string }[]>(DEMO_FAMILY.children);
  const [familyPets, setFamilyPets] = useState<{ name: string; species: string; breed?: string }[]>(DEMO_FAMILY.pets);

  const toggleShopping = (id: string) => {
    setShoppingItems(prev => prev.map(i => i.id === id ? { ...i, purchased: !i.purchased } : i));
  };
  const addShopping = (item: string) => {
    setShoppingItems(prev => [...prev, { id: Date.now().toString(), item, quantity: 1, category: "groceries", estimated_cost_cents: 0, purchased: false }]);
  };
  const deleteShopping = (id: string) => {
    setShoppingItems(prev => prev.filter(i => i.id !== id));
  };

  const renderModule = () => {
    switch (active) {
      case "today":
        return <TodayDigest items={digest} greeting="Kia ora, Sarah" onChange={setDigest} />;
      case "family":
        return (
          <FamilyOverview
            members={familyMembers}
            pets={familyPets}
            children={familyChildren}
            onAddMember={(m) => setFamilyMembers(prev => [...prev, m])}
            onRemoveMember={(i) => setFamilyMembers(prev => prev.filter((_, idx) => idx !== i))}
            onAddChild={(c) => setFamilyChildren(prev => [...prev, c])}
            onRemoveChild={(i) => setFamilyChildren(prev => prev.filter((_, idx) => idx !== i))}
            onAddPet={(p) => setFamilyPets(prev => [...prev, p])}
            onRemovePet={(i) => setFamilyPets(prev => prev.filter((_, idx) => idx !== i))}
          />
        );
      case "pets":
        return <PetModule pets={DEMO_PETS} />;
      case "school":
        return <SchoolModule children={DEMO_SCHOOL_CHILDREN} termDates={DEMO_TERM_DATES} />;
      case "uniforms":
        return <UniformTracker items={DEMO_UNIFORMS} children={["Mia", "Ethan"]} />;
      case "appointments":
        return <AppointmentsModule appointments={appointments} onChange={setAppointments} />;
      case "shopping":
        return <ShoppingModule items={shoppingItems} weeklyBudget={25000} spent={16300} onToggle={toggleShopping} onAdd={addShopping} onDelete={deleteShopping} />;
      case "homework":
        return <HomeworkHelp children={DEMO_HW_CHILDREN} />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: BG }}>
      {/* ── SIDEBAR (desktop) ── */}
      <aside className="hidden md:flex w-64 flex-col fixed top-0 left-0 bottom-0 z-40" style={{
        background: "rgba(247,243,238,0.95)",
        borderRight: `1px solid ${ACCENT}10`,
        backdropFilter: "blur(20px)",
      }}>
        {/* Logo */}
        <div className="p-5 flex items-center gap-3" style={{ borderBottom: `1px solid ${ACCENT}08` }}>
          <img loading="lazy" decoding="async" src={toroaLogo} alt="Tōro" className="w-8 h-8" style={{ filter: `drop-shadow(0 0 8px ${ACCENT}30)` }} />
          <div>
            <h1 className="font-display text-sm uppercase tracking-[0.15em]" style={{ fontWeight: 300, color: INK }}>Tōro</h1>
            <p className="font-body text-[9px]" style={{ color: MUTED }}>Whānau Navigator</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all relative"
                style={{
                  background: isActive ? `${ACCENT}12` : "transparent",
                  color: isActive ? ACCENT : MUTED,
                }}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: ACCENT }} />}
                <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                <span className="font-body text-xs">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* WhatsApp toggle */}
        <div className="p-4" style={{ borderTop: `1px solid ${ACCENT}08` }}>
          <button
            onClick={() => setWhatsappConnected(!whatsappConnected)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
            style={{
              background: whatsappConnected ? `${POUNAMU}12` : "rgba(255,255,255,0.5)",
              border: `1px solid ${whatsappConnected ? `${POUNAMU}30` : "rgba(255,255,255,0.6)"}`,
            }}
          >
            <div className="flex items-center gap-2">
              <Wifi size={14} style={{ color: whatsappConnected ? POUNAMU : MUTED }} />
              <span className="font-body text-xs" style={{ color: whatsappConnected ? POUNAMU : MUTED }}>WhatsApp</span>
            </div>
            <div
              className="w-8 h-4 rounded-full relative transition-all"
              style={{ background: whatsappConnected ? `${POUNAMU}40` : "rgba(156,163,175,0.45)" }}
            >
              <div
                className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                style={{
                  left: whatsappConnected ? "calc(100% - 14px)" : "2px",
                  background: whatsappConnected ? POUNAMU : MUTED,
                }}
              />
            </div>
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden flex items-center justify-between px-4 h-14" style={{
        background: "rgba(247,243,238,0.92)",
        borderBottom: `1px solid ${ACCENT}10`,
        backdropFilter: "blur(20px)",
      }}>
        <div className="flex items-center gap-2">
          <img loading="lazy" decoding="async" src={toroaLogo} alt="Tōro" className="w-6 h-6" />
          <span className="font-display text-xs uppercase tracking-[0.15em]" style={{ fontWeight: 300, color: INK }}>Tōro</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={20} style={{ color: MUTED }} /> : <Menu size={20} style={{ color: MUTED }} />}
        </button>
      </header>

      {/* Mobile slide-out nav */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: "rgba(247,243,238,0.97)", backdropFilter: "blur(20px)" }}
          >
            <div className="pt-16 px-4 space-y-1">
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setActive(key); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                  style={{
                    background: active === key ? `${ACCENT}12` : "transparent",
                    color: active === key ? ACCENT : MUTED,
                  }}
                >
                  <Icon size={18} />
                  <span className="font-body text-sm">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 pb-20 md:pb-8">
        {/* Gold accent line */}
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}40, transparent)` }} />

        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
          {/* ── Voyage launcher tile ── */}
          <Link
            to="/voyage/plan"
            className="block rounded-2xl p-4 transition-all hover:scale-[1.01] group"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}12, ${POUNAMU}10)`,
              border: `1px solid ${ACCENT}25`,
              backdropFilter: "blur(14px)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}30` }}>
                <Compass size={18} style={{ color: ACCENT }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={10} style={{ color: ACCENT }} />
                  <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Voyage Agent</p>
                </div>
                <p className="text-xs mt-0.5" style={{ color: INK, fontWeight: 500 }}>Plan a multi-family trip</p>
                <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>Describe it in plain English — get destinations, days, convoys & a live map.</p>
              </div>
              <ChevronLeft size={14} className="rotate-180 group-hover:translate-x-0.5 transition-transform" style={{ color: ACCENT }} />
            </div>
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {renderModule()}
            </motion.div>
          </AnimatePresence>

          {/* Chat + Doc upload always visible */}
          <div className="space-y-4 pt-4" style={{ borderTop: `1px solid ${ACCENT}08` }}>
            <KeteEvidencePackPanel
              keteSlug="toroa"
              keteName="Tōro — Family Navigator"
              accentColor={ACCENT}
              agentId="toroa"
              agentName="TŌRO"
              packTemplates={[
                { label: "Family Safety Pack", description: "Emergency contacts, medical & allergy records", packType: "family-safety-pack", complianceChecks: [
                  { check: "Privacy Act 2020 — family data governed", status: "pass" },
                  { check: "Emergency contacts current", status: "pass" },
                  { check: "Medical records documented", status: "pass" },
                ]},
                { label: "School Compliance Pack", description: "Permission slips, enrolment & attendance", packType: "school-compliance-pack", complianceChecks: [
                  { check: "Education Act 1989 — enrolment verified", status: "pass" },
                  { check: "Permission slips tracked", status: "pass" },
                  { check: "Attendance records current", status: "pass" },
                ]},
              ]}
            />
            <KeteDocUpload
              keteSlug="toroa"
              keteColor={ACCENT}
              keteName="Tōro — Family Navigator"
              docContext="Expect school newsletters, permission slips, medical forms, invoices, bills, and family schedules. Extract events, deadlines, costs, and required actions."
            />
            <KeteBrainChat keteId="toroa" keteName="Tōro" keteNameEn="Family Navigator" accentColor={ACCENT} />
          </div>
        </div>
      </main>

      {/* ── MOBILE BOTTOM TABS ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{
        background: "rgba(247,243,238,0.92)",
        borderTop: `1px solid ${ACCENT}10`,
        backdropFilter: "blur(24px) saturate(1.5)",
      }}>
        <div className="flex items-stretch justify-around h-14 max-w-lg mx-auto">
          {NAV_ITEMS.slice(0, 5).map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors relative"
                style={{ color: isActive ? ACCENT : MUTED }}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[9px] font-body">{label}</span>
                {isActive && (
                  <span className="absolute top-0 w-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}80, transparent)` }} />
                )}
              </button>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" style={{ background: "rgba(247,243,238,0.92)" }} />
      </nav>
    </div>
  );
}
