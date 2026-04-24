// Official Assembl / Mārama brand assets
// These are the canonical SVGs — never use nexus-logo.png or other legacy files

// Core Assembl logos
export { default as assemblLogoFull } from "./assembl-logo-full.svg";
export { default as assemblMark } from "./assembl-mark.svg";
export { default as assemblWordmark } from "./assembl-wordmark.svg";

// Intelligence Group marks (5 packs)
export { default as manaakiMark } from "./manaaki-mark.svg";   // Hospitality
export { default as waihangaMark } from "./hanga-mark.svg";       // Construction / Trades
export { default as pakihiMark } from "./pakihi-mark.svg";     // Business / Professional
export { default as hangarauMark } from "./hangarau-mark.svg"; // Technology
export { default as auahaMark } from "./auaha-mark.svg";       // Creative / Marketing

// Specialist / Standalone
export { default as echoLogo } from "./echo-logo.svg";
export { default as toroaLogo } from "./toroa-logo.svg";
export { default as teKahuiReoLogo } from "./te-kahui-reo-logo.svg";
export { default as teKahuiReoMark } from "./te-kahui-reo-mark.svg";

// Intelligence layer icons
export { default as ihoIcon } from "./iho-icon.svg";       // IHO — Core Intelligence Router
export { default as kanohiIcon } from "./kanohi-icon.svg"; // KANOHI — Customer Experience
export { default as maharaIcon } from "./mahara-icon.svg"; // MAHARA — Memory & Learning
export { default as manaIcon } from "./mana-icon.svg";     // MANA — Governance & Compliance

// ───────────────────────────────────────────────────────────────
// Official brand reference imagery (PNG renders from Brand Bible)
// Use via brandImagery.<key> so alt text + dimensions stay paired
// with the file. Always import from this barrel — never reference
// the PNG paths directly.
// ───────────────────────────────────────────────────────────────
import heroBanner from "./assembl-hero-banner.png";
import keteMobileReference from "./assembl-kete-mobile-reference.png";
import brandGuidelinesCore from "./assembl-brand-guidelines-core.png";
import industryKeteSystem from "./assembl-industry-kete-system.png";
import logoFeatherKete from "./assembl-logo-feather-kete.png";
import digitalApplication from "./assembl-digital-application.png";
import digitalSystem from "./assembl-digital-system.png";

export const brandImagery = {
  heroBanner: {
    src: heroBanner,
    alt: "Assembl wordmark beside a feather kete on calm water — premium intelligence, built in Aotearoa",
  },
  keteMobileReference: {
    src: keteMobileReference,
    alt: "Mobile reference of the Assembl feather kete with industry accent variations",
  },
  brandGuidelinesCore: {
    src: brandGuidelinesCore,
    alt: "Assembl brand guidelines — core identity, logo system, colour palette and typography",
  },
  industryKeteSystem: {
    src: industryKeteSystem,
    alt: "Assembl industry kete system — eight feather kete variants with accent colours per industry",
  },
  logoFeatherKete: {
    src: logoFeatherKete,
    alt: "Assembl primary logo — feather kete with sparkle accent above the wordmark",
  },
  digitalApplication: {
    src: digitalApplication,
    alt: "Assembl digital application — UI principles, dashboard examples and styling tokens",
  },
  digitalSystem: {
    src: digitalSystem,
    alt: "Assembl digital system — UI principles, buttons, glass cards, dashboard style and industry motif",
  },
} as const;

export type BrandImageryKey = keyof typeof brandImagery;
