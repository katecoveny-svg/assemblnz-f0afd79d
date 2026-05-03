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
};

export const KETES: Kete[] = [
  {
    slug: "waihanga",
    name: "Waihanga",
    industry: "Construction",
    tagline: "Autonomous compliance, evidence packs, and auditor-ready outputs.",
    accent: "#CBB8A4",
    accentName: "Clay Sand",
  },
  {
    slug: "manaaki",
    name: "Manaaki",
    industry: "Hospitality",
    tagline: "Front-of-house, rosters, and food safety — quietly handled.",
    accent: "#E6D8C6",
    accentName: "Warm Linen",
  },
  {
    slug: "pikau",
    name: "Pikau",
    industry: "Freight & Customs",
    tagline: "Manifests, customs lodgements, and chain-of-custody evidence.",
    accent: "#B8C7B1",
    accentName: "Soft Moss",
  },
  {
    slug: "arataki",
    name: "Arataki",
    industry: "Automotive & Fleet",
    tagline: "WoF/CoF tracking, service records, and fleet compliance.",
    accent: "#D5C0C8",
    accentName: "Dusky Rose",
  },
  {
    slug: "auaha",
    name: "Auaha",
    industry: "Creative",
    tagline: "Briefs, scripts, brand guardrails — provenance-watermarked.",
    accent: "#C8DDD8",
    accentName: "Pale Seafoam",
  },
  {
    slug: "toroa",
    name: "Tōroa",
    industry: "Family",
    tagline: "Routines, school logistics, and household admin in one kete.",
    accent: "#C7D9E8",
    accentName: "Moonstone Blue",
  },
];

export function getKete(slug: KeteSlug): Kete {
  const kete = KETES.find((k) => k.slug === slug);
  if (!kete) throw new Error(`Unknown kete: ${slug}`);
  return kete;
}
