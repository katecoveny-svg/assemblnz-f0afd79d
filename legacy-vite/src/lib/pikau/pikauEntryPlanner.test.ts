import { describe, expect, it } from "vitest";

import { buildPikauEntryPlan } from "./pikauEntryPlanner";

describe("buildPikauEntryPlan", () => {
  it("holds food imports missing intended use and MPI evidence", () => {
    const plan = buildPikauEntryPlan({
      importerName: "Test Importer",
      description: "Processed food for retail sale",
      hsCode: "210390",
      originCountry: "IT",
      incoterm: "CIF",
      customsValueNzd: 12500,
      freightNzd: 0,
      insuranceNzd: 0,
      documentTypes: ["commercial_invoice", "bill_of_lading", "packing_list"],
      hasImporterClientCode: true,
      claimPreference: false,
      hasFoodForSale: true,
      hasWoodPackaging: false,
      hasDangerousGoods: false,
      intendedUseCode: "",
    });

    expect(plan.status).toBe("hold_for_compliance");
    expect(plan.blockers.some((issue) => issue.code === "missing_intended_use")).toBe(true);
    expect(plan.missingDocuments).toContain("mpi_certificate");
  });

  it("flags dangerous goods and missing evidence as blockers", () => {
    const plan = buildPikauEntryPlan({
      importerName: "Battery Broker",
      description: "Lithium battery packs",
      hsCode: "850760",
      originCountry: "CN",
      incoterm: "FOB",
      customsValueNzd: 8400,
      freightNzd: 900,
      insuranceNzd: 60,
      documentTypes: ["commercial_invoice", "packing_list", "bill_of_lading"],
      hasImporterClientCode: true,
      claimPreference: false,
      hasFoodForSale: false,
      hasWoodPackaging: false,
      hasDangerousGoods: true,
      intendedUseCode: "",
    });

    expect(plan.status).toBe("hold_for_compliance");
    expect(plan.blockers.some((issue) => issue.code === "missing_dg_declaration")).toBe(true);
    expect(plan.requiredDocuments).toContain("dangerous_goods_declaration");
  });

  it("marks a complete non-sensitive bundle as ready for broker review", () => {
    const plan = buildPikauEntryPlan({
      importerName: "Machine Imports NZ",
      description: "Industrial machine parts",
      hsCode: "848310",
      originCountry: "DE",
      incoterm: "FOB",
      customsValueNzd: 24000,
      freightNzd: 1400,
      insuranceNzd: 220,
      documentTypes: ["commercial_invoice", "packing_list", "bill_of_lading"],
      hasImporterClientCode: true,
      claimPreference: false,
      hasFoodForSale: false,
      hasWoodPackaging: false,
      hasDangerousGoods: false,
      intendedUseCode: "",
    });

    expect(plan.status).toBe("ready_for_broker_review");
    expect(plan.blockers).toHaveLength(0);
    expect(plan.dutyRatePercent).toBe(0);
  });
});
