// ════════════════════════════════════════════════════════════════════════
// lib/turf-audit.ts
//
// Types + assessment logic for the Turf Maintenance Log free tool.
// Mirrors the shape of lib/food-audit.ts so the operator UX is consistent
// (form → POST → results page with compliance flagging → download).
//
// Compliance backbone for NZ sports clubs / school grounds / community
// trusts:
//   • Health and Safety at Work Act 2015 (HSWA) — volunteer obligations
//   • Hazardous Substances and New Organisms Act 1996 (HSNO) — chemical
//     spray records (herbicide / fertiliser / line marking paint)
//   • Building Act 2004 — changing rooms, clubrooms, accessibility
//   • Food Act 2014 — canteen / kai service if applicable
// ════════════════════════════════════════════════════════════════════════

export type SurfaceType =
  | "natural_turf"
  | "artificial_turf"
  | "hybrid"
  | "asphalt"
  | "grass_field";

export type ChemicalApplication = {
  // What was applied
  product: string;
  // Application date in NZ format YYYY-MM-DD
  appliedOn: string;
  // The Approved Handler under HSNO Regulations 2017 (or Site Operator if
  // class 9.1/9.4 substance — fertiliser typically requires a Site Operator,
  // herbicide a Certified Handler).
  appliedBy: string;
  // What part of the ground
  appliedTo: string;
  // Notes — wind conditions, pre-application checks, signage put up, etc.
  notes?: string;
};

export type HazardInspection = {
  // Date the walk-around inspection was done
  inspectedOn: string;
  // Who did the walk
  inspectedBy: string;
  // Findings that need action
  hazards: string[];
};

export type TurfMaintenanceChecks = {
  // Mowing
  mowedThisWeek: boolean;
  mowingHeightMm?: number;
  // Irrigation
  irrigationRunning: boolean;
  // Line marking
  lineMarkingFresh: boolean;
  lineMarkingDate?: string;
  // Clubroom / changing room
  changingRoomsClean: boolean;
  firstAidStocked: boolean;
  // Volunteer safety
  volunteerInductionLog: boolean;
  ppeStocked: boolean;
};

export type TurfMaintenanceLog = {
  id: string;
  club_name: string;
  ground_name: string;
  surface_type: SurfaceType;
  recorded_by: string;
  recorded_date: string;
  weekly_checks: TurfMaintenanceChecks;
  chemical_applications: ChemicalApplication[];
  hazard_inspection: HazardInspection | null;
  notes: string | null;
  failed_checks: FailedTurfCheck[];
  created_at: string;
};

export type FailedTurfCheck = {
  kind:
    | "missing_mow"
    | "no_irrigation"
    | "stale_lines"
    | "changing_rooms"
    | "first_aid"
    | "induction_log"
    | "ppe"
    | "spray_record_missing"
    | "hazard_inspection_missing";
  detail: string;
  correctiveAction: string;
  regulation: string;
};

export function todayNzDate(): string {
  const nzNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Pacific/Auckland" }),
  );
  const year = nzNow.getFullYear();
  const month = String(nzNow.getMonth() + 1).padStart(2, "0");
  const day = String(nzNow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Walk the recorded checks + chemical applications + hazard inspection and
 * return the compliance failures with corrective actions. Returns [] when
 * everything is in order.
 *
 * Each failure cites the NZ regulation that triggered it so the results
 * page can show a defensible record.
 */
export function assessTurfMaintenance(input: {
  weekly_checks: TurfMaintenanceChecks;
  chemical_applications: ChemicalApplication[];
  hazard_inspection: HazardInspection | null;
  recorded_date: string;
}): FailedTurfCheck[] {
  const failures: FailedTurfCheck[] = [];
  const { weekly_checks, chemical_applications, hazard_inspection } = input;

  if (!weekly_checks.mowedThisWeek) {
    failures.push({
      kind: "missing_mow",
      detail: "No mow recorded this week",
      correctiveAction:
        "Schedule a mow this week and log mowing height. Long grass increases trip hazard risk.",
      regulation: "HSWA 2015 — duty to maintain a safe playing surface",
    });
  }

  if (!weekly_checks.irrigationRunning) {
    failures.push({
      kind: "no_irrigation",
      detail: "Irrigation not running",
      correctiveAction:
        "Confirm whether shutdown is seasonal or fault. Hard / cracked surface increases injury risk during play.",
      regulation: "HSWA 2015 — reasonably practicable steps to control hazards",
    });
  }

  if (!weekly_checks.lineMarkingFresh) {
    failures.push({
      kind: "stale_lines",
      detail: "Line marking flagged as not fresh",
      correctiveAction:
        "Re-mark before next match. If using solvent-based paint, log under HSNO chemical applications.",
      regulation: "Sport NZ field standards + HSNO 1996 for spray records",
    });
  }

  if (!weekly_checks.changingRoomsClean) {
    failures.push({
      kind: "changing_rooms",
      detail: "Changing rooms not signed off as clean",
      correctiveAction:
        "Schedule cleaning. If shared with public events, log inspection in venue records.",
      regulation: "Building Act 2004 — sanitary facility maintenance",
    });
  }

  if (!weekly_checks.firstAidStocked) {
    failures.push({
      kind: "first_aid",
      detail: "First-aid kit not stocked or unchecked",
      correctiveAction:
        "Restock and date-check before next training session.",
      regulation: "HSWA 2015 — emergency plans and first-aid requirements",
    });
  }

  if (!weekly_checks.volunteerInductionLog) {
    failures.push({
      kind: "induction_log",
      detail: "Volunteer induction log not maintained this period",
      correctiveAction:
        "Run a 10-minute brief at next training. Sign and date the induction sheet.",
      regulation: "HSWA 2015 — duty to PCBU + volunteer workers",
    });
  }

  if (!weekly_checks.ppeStocked) {
    failures.push({
      kind: "ppe",
      detail: "PPE not stocked (gloves, eye protection for sprays)",
      correctiveAction:
        "Restock before any chemical application. PPE required for HSNO Approved Handlers.",
      regulation: "HSNO Regulations 2017 — handler PPE requirements",
    });
  }

  // If chemical applications exist but inspection / handler details missing
  for (const app of chemical_applications) {
    if (!app.appliedBy || !app.appliedBy.trim()) {
      failures.push({
        kind: "spray_record_missing",
        detail: `Chemical application "${app.product || "unnamed product"}" missing handler details`,
        correctiveAction:
          "Add the Approved Handler name + their HSNO certification number to the application log.",
        regulation:
          "HSNO Regulations 2017 — Approved Handler / Certified Handler record-keeping",
      });
    }
  }

  if (!hazard_inspection) {
    failures.push({
      kind: "hazard_inspection_missing",
      detail: "No walk-around hazard inspection logged this period",
      correctiveAction:
        "Schedule a 15-minute pre-match walk. Log who walked, when, and any hazards found.",
      regulation:
        "HSWA 2015 — duty to identify reasonably foreseeable hazards",
    });
  }

  return failures;
}
