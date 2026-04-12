// Industry kete data for split-screen race videos

export interface KeteRaceData {
  slug: string;
  name: string;
  tagline: string;
  accent: string;
  accentLight: string;
  icon: string; // emoji fallback
  humanSteps: { label: string; durationSec: number }[];
  aiSteps: { label: string; durationSec: number }[];
  stat: string; // e.g. "47 min → 3 min"
}

export const KETE_DATA: KeteRaceData[] = [
  {
    slug: "pikau",
    name: "PIKAU",
    tagline: "Freight & Customs",
    accent: "#00B4D8",
    accentLight: "#90E0EF",
    icon: "📦",
    humanSteps: [
      { label: "Look up HS code manually", durationSec: 12 },
      { label: "Cross-check tariff schedule", durationSec: 8 },
      { label: "Fill customs declaration", durationSec: 15 },
      { label: "Check MPI biosecurity rules", durationSec: 10 },
      { label: "Email broker for review", durationSec: 5 },
    ],
    aiSteps: [
      { label: "Auto-classify HS code", durationSec: 2 },
      { label: "Calculate duties & tariffs", durationSec: 1 },
      { label: "Generate declaration", durationSec: 2 },
      { label: "Biosecurity compliance check", durationSec: 1 },
      { label: "Export-ready PDF", durationSec: 1 },
    ],
    stat: "50 min → 7 min",
  },
  {
    slug: "manaaki",
    name: "MANAAKI",
    tagline: "Hospitality",
    accent: "#E07A5F",
    accentLight: "#F2CC8F",
    icon: "🍷",
    humanSteps: [
      { label: "Check guest preferences", durationSec: 8 },
      { label: "Update food safety log", durationSec: 12 },
      { label: "Prepare staff briefing", durationSec: 10 },
      { label: "Review alcohol licence compliance", durationSec: 15 },
      { label: "Write guest welcome note", durationSec: 5 },
    ],
    aiSteps: [
      { label: "Pull guest profile & prefs", durationSec: 1 },
      { label: "Auto-log food safety checks", durationSec: 2 },
      { label: "Generate staff briefing", durationSec: 2 },
      { label: "Compliance audit in seconds", durationSec: 1 },
      { label: "Personalised welcome ready", durationSec: 1 },
    ],
    stat: "50 min → 7 min",
  },
  {
    slug: "arataki",
    name: "ARATAKI",
    tagline: "Automotive",
    accent: "#E63946",
    accentLight: "#FF8FA3",
    icon: "🚗",
    humanSteps: [
      { label: "Process customer enquiry", durationSec: 10 },
      { label: "Build finance deal structure", durationSec: 15 },
      { label: "Check MVSA compliance", durationSec: 8 },
      { label: "Prepare delivery docs", durationSec: 12 },
      { label: "Schedule follow-up service", durationSec: 5 },
    ],
    aiSteps: [
      { label: "Qualify & route lead", durationSec: 1 },
      { label: "Structure deal instantly", durationSec: 2 },
      { label: "MVSA compliance verified", durationSec: 1 },
      { label: "Delivery pack generated", durationSec: 2 },
      { label: "Service booked automatically", durationSec: 1 },
    ],
    stat: "50 min → 7 min",
  },
  {
    slug: "auaha",
    name: "AUAHA",
    tagline: "Creative Studio",
    accent: "#7B2FF7",
    accentLight: "#C084FC",
    icon: "🎨",
    humanSteps: [
      { label: "Research brand guidelines", durationSec: 15 },
      { label: "Draft social media copy", durationSec: 12 },
      { label: "Design ad creative", durationSec: 20 },
      { label: "Review brand compliance", durationSec: 8 },
      { label: "Schedule across platforms", durationSec: 5 },
    ],
    aiSteps: [
      { label: "Scan & extract brand DNA", durationSec: 2 },
      { label: "Generate platform copy", durationSec: 2 },
      { label: "AI creative production", durationSec: 3 },
      { label: "Brand compliance auto-check", durationSec: 1 },
      { label: "Multi-platform publish", durationSec: 1 },
    ],
    stat: "60 min → 9 min",
  },
  {
    slug: "waihanga",
    name: "WAIHANGA",
    tagline: "Construction",
    accent: "#F59E0B",
    accentLight: "#FCD34D",
    icon: "🏗️",
    humanSteps: [
      { label: "Review building consent docs", durationSec: 15 },
      { label: "Process payment claim", durationSec: 12 },
      { label: "Update site safety induction", durationSec: 10 },
      { label: "Check CCA compliance", durationSec: 8 },
      { label: "Generate progress report", durationSec: 10 },
    ],
    aiSteps: [
      { label: "Parse consent documents", durationSec: 2 },
      { label: "Auto-generate payment claim", durationSec: 2 },
      { label: "Induction checklist created", durationSec: 1 },
      { label: "CCA compliance verified", durationSec: 1 },
      { label: "Progress report ready", durationSec: 2 },
    ],
    stat: "55 min → 8 min",
  },
  {
    slug: "haven",
    name: "HAVEN",
    tagline: "Property Management",
    accent: "#D4A843",
    accentLight: "#F5D98B",
    icon: "🏠",
    humanSteps: [
      { label: "Draft tenancy agreement", durationSec: 20 },
      { label: "Schedule property inspection", durationSec: 8 },
      { label: "Process maintenance request", durationSec: 10 },
      { label: "Check RTA compliance", durationSec: 12 },
      { label: "Generate owner report", durationSec: 10 },
    ],
    aiSteps: [
      { label: "Generate tenancy agreement", durationSec: 2 },
      { label: "Auto-schedule inspection", durationSec: 1 },
      { label: "Triage & assign maintenance", durationSec: 2 },
      { label: "RTA compliance checked", durationSec: 1 },
      { label: "Owner report published", durationSec: 2 },
    ],
    stat: "60 min → 8 min",
  },
  {
    slug: "toroa",
    name: "TOROA",
    tagline: "Family Navigator",
    accent: "#06B6D4",
    accentLight: "#67E8F9",
    icon: "🦅",
    humanSteps: [
      { label: "Research school enrolment", durationSec: 15 },
      { label: "Calculate tax credits", durationSec: 12 },
      { label: "Plan weekly meal schedule", durationSec: 10 },
      { label: "Organise school transport", durationSec: 8 },
      { label: "Track family budget", durationSec: 10 },
    ],
    aiSteps: [
      { label: "School options surfaced", durationSec: 2 },
      { label: "Tax credits calculated", durationSec: 1 },
      { label: "Meal plan generated", durationSec: 2 },
      { label: "Transport route optimised", durationSec: 1 },
      { label: "Budget dashboard ready", durationSec: 1 },
    ],
    stat: "55 min → 7 min",
  },
  {
    slug: "helm",
    name: "HELM",
    tagline: "Business Operations",
    accent: "#3A7D6E",
    accentLight: "#6EE7B7",
    icon: "⚙️",
    humanSteps: [
      { label: "Prepare board papers", durationSec: 20 },
      { label: "Process compliance audit", durationSec: 15 },
      { label: "Draft privacy impact assessment", durationSec: 12 },
      { label: "Reconcile accounts", durationSec: 10 },
      { label: "Generate monthly KPI report", durationSec: 8 },
    ],
    aiSteps: [
      { label: "Board papers auto-generated", durationSec: 3 },
      { label: "Compliance audit complete", durationSec: 2 },
      { label: "PIA drafted & reviewed", durationSec: 2 },
      { label: "Accounts reconciled", durationSec: 1 },
      { label: "KPI dashboard published", durationSec: 1 },
    ],
    stat: "65 min → 9 min",
  },
];
