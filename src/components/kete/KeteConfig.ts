import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed, HardHat, Palette, Car, Package, Bird, ShoppingBag, Baby,
} from "lucide-react";

/**
 * Canonical Assembl Kete registry.
 *
 * 7 industry Kete (Manaaki, Waihanga, Auaha, Arataki, Pikau, Hoko, Ako)
 * + Tōro whānau Kete. HOKO and AKO were added 2026-04 as the V2
 * expansion kete (see /docs/v2-expansion.md and
 * mem://features/v2-kete-expansion.md). Retired Kete — Hanga,
 * Pakihi, Waka, Hangarau, Hauora, Te Kāhui Reo — are intentionally
 * absent so legacy references cannot leak back into the UI.
 *
 * The canonical Māori names (Waihanga, Manaaki, Pikau, Auaha,
 * Arataki, Hoko, Tōro) are the source of truth for every
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
    color: "#4AA5A8", icon: UtensilsCrossed, agentCount: 10, group: "business",
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
    color: "#A8DDDB", icon: Palette, agentCount: 9, group: "business",
    description: "Strategy, content, brand voice, design, campaigns, lead formation, analytics — one coordinated studio, not six tools and a freelancer.",
    wananga: "Te Kete Aronui — the basket of human expression",
    route: "/auaha", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "arataki", name: "Arataki", nameEn: "Automotive",
    color: "#E8E8E8", icon: Car, agentCount: 2, group: "business",
    description: "Enquiry → test drive → sale → delivery → service → loyalty. No handoff dropped.",
    wananga: "Te Kete Tuauri — the basket of guidance and protection",
    route: "/arataki", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "pikau", name: "Pikau", nameEn: "Freight & Customs",
    color: "#5AADA0", icon: Package, agentCount: 4, group: "business",
    description: "Customs entries, freight quotes, dangerous goods checks — border compliance without the scramble.",
    wananga: "Te Kete Tuauri — the basket of movement and trade",
    route: "/pikau", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "hoko", name: "Hoko", nameEn: "Retail",
    color: "#C66B5C", icon: ShoppingBag, agentCount: 4, group: "business",
    description: "Pricing intelligence vs Temu/Amazon, POS-driven re-orders, FTA/CGA compliance lint, unified customer view — for the $92.3bn NZ retail sector.",
    wananga: "Te Kete Tuatea — the basket of trade and exchange",
    route: "/hoko", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "ako", name: "Ako", nameEn: "Early Childhood Education",
    color: "#7BA7C7", icon: Baby, agentCount: 3, group: "business",
    description: "Licensing criteria matcher, transparency pack generator, graduated enforcement readiness — built for the 20 April 2026 ECE wedge moment.",
    wananga: "Te Kete Aronui — the basket of human knowledge and learning",
    route: "/ako", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "toro", name: "Toro", nameEn: "Whānau Family Navigator",
    color: "#4AA5A8", icon: Bird, agentCount: 1, group: "whanau",
    description: "SMS-first. No app, no login. Just text. School notices, meals, budgets, reminders, learning.",
    wananga: "Te Kete Aronui — caring for whānau",
    route: "/toro/dashboard", smsStatus: "active", whatsappStatus: "active",
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
