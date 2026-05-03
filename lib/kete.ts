export type KeteSlug =
  | "waihanga"
  | "manaaki"
  | "pikau"
  | "arataki"
  | "auaha"
  | "toroa";

export type Kete = {
  slug: KeteSlug;
  name: string;
  industry: string;
  tagline: string;
  accent: string;
  accentName: string;
  /**
   * "industry" — one of the five locked industry kete (sold via Operator /
   * Leader / Enterprise tiers).
   * "whanau" — Tōroa, sold standalone on the Family tier.
   * Source: PRICING-LOCKED.md
   */
  type: "industry" | "whanau";
};

export const KETES: Kete[] = [
  {
    slug: "waihanga",
    name: "Waihanga",
    industry: "Construction",
    tagline:
      "Autonomous compliance, evidence packs, and auditor-ready outputs.",
    accent: "#CBB8A4",
    accentName: "Clay Sand",
    type: "industry",
  },
  {
    slug: "manaaki",
    name: "Manaaki",
    industry: "Hospitality",
    tagline: "Front-of-house, rosters, and food safety — quietly handled.",
    accent: "#E6D8C6",
    accentName: "Warm Linen",
    type: "industry",
  },
  {
    slug: "pikau",
    name: "Pikau",
    industry: "Freight & Customs",
    tagline:
      "Manifests, customs lodgements, and chain-of-custody evidence.",
    accent: "#B8C7B1",
    accentName: "Soft Moss",
    type: "industry",
  },
  {
    slug: "arataki",
    name: "Arataki",
    industry: "Automotive & Fleet",
    tagline: "WoF/CoF tracking, service records, and fleet compliance.",
    accent: "#D5C0C8",
    accentName: "Dusky Rose",
    type: "industry",
  },
  {
    slug: "auaha",
    name: "Auaha",
    industry: "Creative",
    tagline:
      "Briefs, scripts, brand guardrails — provenance-watermarked.",
    accent: "#C8DDD8",
    accentName: "Pale Seafoam",
    type: "industry",
  },
  {
    slug: "toroa",
    name: "Tōroa",
    industry: "Whānau",
    tagline:
      "Routines, school logistics, and household admin in one quiet kete.",
    accent: "#C7D9E8",
    accentName: "Moonstone Blue",
    type: "whanau",
  },
];

export const INDUSTRY_KETES = KETES.filter((k) => k.type === "industry");
export const WHANAU_KETE = KETES.find((k) => k.type === "whanau")!;

export function getKete(slug: KeteSlug): Kete {
  const kete = KETES.find((k) => k.slug === slug);
  if (!kete) throw new Error(`Unknown kete: ${slug}`);
  return kete;
}
