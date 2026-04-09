import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed, HardHat, Palette, Car, Package, Bird,
} from "lucide-react";

/**
 * Canonical Assembl Kete registry.
 *
 * Locked to the 5 industry Kete + Tōro whānau Kete per the
 * PackGrid homepage contract (see src/components/landing/PackGrid.tsx
 * and PRICING-LOCKED.md). Retired Kete — Hanga, Pakihi, Waka,
 * Hangarau, Hauora, Te Kāhui Reo — are intentionally absent so
 * legacy references cannot leak back into the UI.
 *
 * The canonical Māori rebrand names (Waihanga, Manaaki, Pikau,
 * Auaha, Arataki, Tōro) are the source of truth for every
 * downstream component that renders or links to a Kete.
 */
export interface KeteDefinition {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  icon: LucideIcon;
  agentCount: number;
  description: string;
  wananga: string;
  route: string;
  group: "business" | "specialist" | "whanau";
  smsStatus: "active" | "coming-soon";
  whatsappStatus: "active" | "coming-soon";
}

export const KETE_CONFIG: KeteDefinition[] = [
  {
    id: "manaaki", name: "Manaaki", nameEn: "Hospitality & Tourism",
    color: "#D4A843", icon: UtensilsCrossed, agentCount: 9, group: "business",
    description: "Fewer missed checks. Cleaner compliance. Guests looked after without the paperwork pile-up.",
    wananga: "Te Kete Aronui — the basket of love and care for people",
    route: "/manaaki", smsStatus: "active", whatsappStatus: "coming-soon",
  },
  {
    id: "waihanga", name: "Waihanga", nameEn: "Construction",
    color: "#3A7D6E", icon: HardHat, agentCount: 9, group: "business",
    description: "Site safety, schedule risks surfaced earlier, cleaner audit trails, approvals that don't stall.",
    wananga: "Te Kete Tuauri — the basket of the physical world",
    route: "/waihanga", smsStatus: "active", whatsappStatus: "coming-soon",
  },
  {
    id: "auaha", name: "Auaha", nameEn: "Creative & Media",
    color: "#F0D078", icon: Palette, agentCount: 9, group: "business",
    description: "Brief to published with fewer handoffs. Content that stays on-brand and on-deadline.",
    wananga: "Te Kete Aronui — the basket of human expression",
    route: "/auaha", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "arataki", name: "Arataki", nameEn: "Automotive",
    color: "#C65D4E", icon: Car, agentCount: 6, group: "business",
    description: "Dealership compliance, customer enquiry response, finance disclosure — the showroom back office handled.",
    wananga: "Te Kete Tuauri — the basket of guidance and movement",
    route: "/arataki", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "pikau", name: "Pikau", nameEn: "Freight & Customs",
    color: "#5AADA0", icon: Package, agentCount: 7, group: "business",
    description: "Customs entries, freight quotes, dangerous goods checks — border compliance without the scramble.",
    wananga: "Te Kete Tuauri — the basket of movement and trade",
    route: "/pikau", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "toro", name: "Tōro", nameEn: "Whānau Family Navigator",
    color: "#D4A843", icon: Bird, agentCount: 1, group: "whanau",
    description: "SMS-first. No app, no login. Just text. School notices, meals, budgets, reminders, learning.",
    wananga: "Te Kete Aronui — caring for whānau",
    route: "/toroa/dashboard", smsStatus: "active", whatsappStatus: "active",
  },
];

export const KETE_BY_GROUP = {
  business: KETE_CONFIG.filter(k => k.group === "business"),
  specialist: KETE_CONFIG.filter(k => k.group === "specialist"),
  whanau: KETE_CONFIG.filter(k => k.group === "whanau"),
};

/**
 * Legacy alias map — any code still referring to retired or
 * pre-rebrand Kete ids can use this to resolve the canonical id.
 * Retired ids (pakihi, waka, hangarau, hauora, te-kahui-reo)
 * intentionally have no mapping and will return undefined.
 */
export const KETE_LEGACY_ALIAS: Record<string, string> = {
  hanga: "waihanga",
  toroa: "toro",
};

/** Resolve any id (new or legacy) to its canonical Kete, or undefined. */
export function resolveKete(id: string): KeteDefinition | undefined {
  const canonical = KETE_LEGACY_ALIAS[id] ?? id;
  return KETE_CONFIG.find((k) => k.id === canonical);
}
