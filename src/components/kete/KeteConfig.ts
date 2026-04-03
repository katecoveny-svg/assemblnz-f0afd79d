import {
  UtensilsCrossed, HardHat, Palette, Briefcase, Cpu, Globe, Bird,
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
    color: "#D4A843", icon: UtensilsCrossed, agentCount: 8, group: "business",
    description: "Your complete hospitality operations hub. From front-of-house to food safety compliance, Manaaki runs your venue so you can focus on your guests.",
    wananga: "Te Kete Aronui — the basket of love and care for people",
    route: "/packs/manaaki", smsStatus: "active", whatsappStatus: "coming-soon",
  },
  {
    id: "hanga", name: "Hanga", nameEn: "Construction",
    color: "#3A7D6E", icon: HardHat, agentCount: 6, group: "business",
    description: "Construction intelligence from site safety to project completion. Hanga coordinates your build with safety, scheduling, procurement, consenting, and quality assurance.",
    wananga: "Te Kete Tuauri — the basket of the physical world",
    route: "/hanga", smsStatus: "active", whatsappStatus: "coming-soon",
  },
  {
    id: "auaha", name: "Auaha", nameEn: "Creative & Media",
    color: "#F0D078", icon: Palette, agentCount: 8, group: "business",
    description: "Your creative studio in a kete. Brand identity, content strategy, design systems, video production, and social media management — the full creative pipeline.",
    wananga: "Te Kete Aronui — the basket of human expression",
    route: "/packs/auaha", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "pakihi", name: "Pakihi", nameEn: "Business & Commerce",
    color: "#5AADA0", icon: Briefcase, agentCount: 8, group: "business",
    description: "Run your business from one intelligent hub. Accounting, HR, sales, legal, operations, and growth strategy — corporate firepower without the overhead.",
    wananga: "Te Kete Tuatea — the basket of strategy and governance",
    route: "/packs/pakihi", smsStatus: "active", whatsappStatus: "coming-soon",
  },
  {
    id: "hangarau", name: "Hangarau", nameEn: "Technology",
    color: "#1A3A5C", icon: Cpu, agentCount: 8, group: "business",
    description: "Your in-house tech team. Software development, infrastructure monitoring, security, integrations, databases, DevOps, and AI/ML.",
    wananga: "Te Kete Tuauri — the basket of systems and the natural world",
    route: "/packs/hangarau", smsStatus: "active", whatsappStatus: "coming-soon",
  },
  {
    id: "te-kahui-reo", name: "Te Kāhui Reo", nameEn: "Māori Business Intelligence",
    color: "#3A6A9C", icon: Globe, agentCount: 8, group: "specialist",
    description: "Business intelligence built on kaupapa Māori principles. The only BI suite in the world designed from tikanga up — for whānau enterprise, governance, and kaitiakitanga.",
    wananga: "Ngā Kete o te Wānanga — all three baskets woven together",
    route: "/packs/te-kahui-reo", smsStatus: "coming-soon", whatsappStatus: "coming-soon",
  },
  {
    id: "toroa", name: "Tōroa", nameEn: "Family Navigator",
    color: "#D4A843", icon: Bird, agentCount: 1, group: "whanau",
    description: "Your whānau's intelligent navigator. SMS-first support for everyday family life in Aotearoa — school notices, meal planning, bus tracking, homework, budgets, and more. No app. No login. Just text.",
    wananga: "Te Kete Aronui — caring for whānau",
    route: "/toroa", smsStatus: "active", whatsappStatus: "active",
  },
];

export const KETE_BY_GROUP = {
  business: KETE_CONFIG.filter(k => k.group === "business"),
  specialist: KETE_CONFIG.filter(k => k.group === "specialist"),
  whanau: KETE_CONFIG.filter(k => k.group === "whanau"),
};
