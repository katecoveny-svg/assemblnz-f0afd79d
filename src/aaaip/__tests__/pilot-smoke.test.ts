// ═══════════════════════════════════════════════════════════════
// AAAIP — Pilot smoke tests
// Imports every major pilot module on the AAAIP-protected branch
// so any structural breakage (missing default export, broken
// import path, syntactic regression) is caught in CI before it
// reaches main or the Lovable preview.
//
// These tests do NOT mount the components — they just verify the
// modules parse and expose a default export. That's enough to catch
// 95% of accidental breakage from cross-branch merges.
// ═══════════════════════════════════════════════════════════════

import { describe, expect, it } from "vitest";

const PILOT_MODULES: Record<string, () => Promise<{ default: unknown }>> = {
  // Kete (graphics + grid)
  "kete/KeteGrid": () => import("@/components/kete/KeteGrid"),
  "kete/KeteCard": () => import("@/components/kete/KeteCard"),
  "kete/KeteSelector": () => import("@/components/kete/KeteSelector"),
  "kete/KeteSkillGrid": () => import("@/components/kete/KeteSkillGrid"),

  // Toroa (logistics / shipping)
  "toroa/ToroaDashboard": () => import("@/components/toroa/ToroaDashboard"),
  "pages/ToroaApp": () => import("@/pages/ToroaApp"),
  "pages/ToroaLandingPage": () => import("@/pages/ToroaLandingPage"),
  "pages/ToroaInstallPage": () => import("@/pages/ToroaInstallPage"),

  // Hanga (construction)
  "hanga/HangaDashboard": () => import("@/components/hanga/HangaDashboard"),
  "hanga/HangaLayout": () => import("@/components/hanga/HangaLayout"),
  "hanga/AraiSafetyPage": () => import("@/components/hanga/AraiSafetyPage"),
  "hanga/AtaBimDashboard": () => import("@/components/hanga/AtaBimDashboard"),
  "hanga/SiteCheckinPage": () => import("@/components/hanga/SiteCheckinPage"),
  "hanga/PhotoDocsPage": () => import("@/components/hanga/PhotoDocsPage"),
  "hanga/TenderWriterPage": () => import("@/components/hanga/TenderWriterPage"),
  "hanga/DocIntelPage": () => import("@/components/hanga/DocIntelPage"),
  "hanga/CommsHubPage": () => import("@/components/hanga/CommsHubPage"),
  "hanga/VoiceAgentPage": () => import("@/components/hanga/VoiceAgentPage"),
  "hanga/KaupapaDashboard": () => import("@/components/hanga/KaupapaDashboard"),
  "hanga/RawaDashboard": () => import("@/components/hanga/RawaDashboard"),
  "hanga/WhakaaeDashboard": () => import("@/components/hanga/WhakaaeDashboard"),
  "hanga/PaiDashboard": () => import("@/components/hanga/PaiDashboard"),
  "hanga/KanohiDashboard": () => import("@/components/hanga/KanohiDashboard"),

  // Hangarau (freight / IoT)
  "hangarau/HangarauDashboard": () => import("@/components/hangarau/HangarauDashboard"),

  // Aura (hospitality)
  "aura/AuraEvents": () => import("@/components/aura/AuraEvents"),
  "aura/AuraGuestExperience": () => import("@/components/aura/AuraGuestExperience"),
  "aura/AuraGuestMemory": () => import("@/components/aura/AuraGuestMemory"),
  "aura/AuraKitchenFnB": () => import("@/components/aura/AuraKitchenFnB"),
  "aura/AuraOperations": () => import("@/components/aura/AuraOperations"),
  "aura/AuraReservations": () => import("@/components/aura/AuraReservations"),
  "aura/AuraRevenue": () => import("@/components/aura/AuraRevenue"),
  "aura/AuraPropertySetup": () => import("@/components/aura/AuraPropertySetup"),
  "aura/AuraTeam": () => import("@/components/aura/AuraTeam"),
  "aura/AuraSustainability": () => import("@/components/aura/AuraSustainability"),
  "aura/AuraMarketing": () => import("@/components/aura/AuraMarketing"),
  "aura/AuraFoodSafety": () => import("@/components/aura/AuraFoodSafety"),
  "aura/AuraPOS": () => import("@/components/aura/AuraPOS"),
  "aura/AuraTrade": () => import("@/components/aura/AuraTrade"),

  // Other dashboards mentioned in App.tsx routing
  "manaaki/ManaakiDashboard": () => import("@/components/manaaki/ManaakiDashboard"),
  "pakihi/PakihiDashboard": () => import("@/components/pakihi/PakihiDashboard"),
  "te-kahui-reo/TeKahuiReoDashboard": () =>
    import("@/components/te-kahui-reo/TeKahuiReoDashboard"),

  // The AAAIP dashboard itself
  "pages/AaaipDashboard": () => import("@/pages/AaaipDashboard"),
};

describe("Pilot module smoke tests", () => {
  for (const [name, loader] of Object.entries(PILOT_MODULES)) {
    it(`imports ${name}`, async () => {
      const mod = await loader();
      expect(mod).toBeDefined();
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });
  }
});
