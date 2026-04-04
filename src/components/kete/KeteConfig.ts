import {
  UtensilsCrossed, HardHat, Palette, Briefcase, Cpu, Globe, Bird, Truck, Heart,
} from "lucide-react";

export interface KeteDefinition {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  icon: any;
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
    description: "Your venue runs itself. Food safety, liquor licensing, guest experience, luxury lodging, adventure tourism.",
    wananga: "Te Kete Aronui — the basket of love and care for people",
    route: "/packs/manaaki", smsStatus: "active", whatsappStatus: "coming-soon",
  },
  {
    id: "hanga", name: "Hanga", nameEn: "Construction",
    color: "#3A7D6E", icon: HardHat, agentCount: 9, group: "business",
    description: "Site to sign-off. Safety, BIM, consenting, project management, architecture, awards, tenders.",
    wananga: "Te Kete Tuauri — the basket of the physical world",
    route: "/hanga", smsStatus: "active", whatsappStatus: "coming-soon",
  },
  {
    id: "auaha", name: "Auaha", nameEn: "Creative & Media",
    color: "#F0D078", icon: Palette, agentCount: 9, group: "business",
    description: "Brief to published. Copy, image, video, podcast, ads, analytics — the full creative pipeline.",
    wananga: "Te Kete Aronui — the basket of human expression",
    route: "/packs/auaha", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "pakihi", name: "Pakihi", nameEn: "Business & Commerce",
    color: "#5AADA0", icon: Briefcase, agentCount: 11, group: "business",
    description: "Accounting, insurance, retail, trade, agriculture, real estate, immigration. The engine of NZ commerce.",
    wananga: "Te Kete Tuatea — the basket of strategy and governance",
    route: "/packs/pakihi", smsStatus: "active", whatsappStatus: "coming-soon",
  },
  {
    id: "waka", name: "Waka", nameEn: "Transport & Vehicles",
    color: "#6B8FA3", icon: Truck, agentCount: 3, group: "business",
    description: "Automotive, maritime, trucking, logistics. Dealership compliance to heavy vehicle logbooks.",
    wananga: "Te Kete Tuauri — the basket of movement and trade",
    route: "/packs/waka", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "hangarau", name: "Hangarau", nameEn: "Technology",
    color: "#1A3A5C", icon: Cpu, agentCount: 12, group: "business",
    description: "Your in-house tech team. Security, DevOps, infrastructure, monitoring, environment, manufacturing, IP.",
    wananga: "Te Kete Tuauri — the basket of systems and the natural world",
    route: "/packs/hangarau", smsStatus: "active", whatsappStatus: "coming-soon",
  },
  {
    id: "hauora", name: "Hauora", nameEn: "Health, Wellbeing, Sport & Lifestyle",
    color: "#A87D4A", icon: Heart, agentCount: 8, group: "business",
    description: "Sport, health, beauty, nutrition, interior design, travel. Everything that keeps people well.",
    wananga: "Te Kete Aronui — the basket of wellbeing and human flourishing",
    route: "/packs/hauora", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "te-kahui-reo", name: "Te Kāhui Reo", nameEn: "Māori Business Intelligence",
    color: "#3A6A9C", icon: Globe, agentCount: 8, group: "specialist",
    description: "Data sovereignty, whānau governance, iwi reporting, kaupapa Māori — built from the ground up.",
    wananga: "Ngā Kete o te Wānanga — all three baskets woven together",
    route: "/packs/te-kahui-reo", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "toroa", name: "Tōroa", nameEn: "Family Navigator",
    color: "#D4A843", icon: Bird, agentCount: 1, group: "whanau",
    description: "SMS-first. No app, no login. Just text. School notices, meals, budgets, reminders, learning.",
    wananga: "Te Kete Aronui — caring for whānau",
    route: "/toroa", smsStatus: "active", whatsappStatus: "active",
  },
];

export const KETE_BY_GROUP = {
  business: KETE_CONFIG.filter(k => k.group === "business"),
  specialist: KETE_CONFIG.filter(k => k.group === "specialist"),
  whanau: KETE_CONFIG.filter(k => k.group === "whanau"),
};
