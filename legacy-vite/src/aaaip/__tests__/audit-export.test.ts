import { describe, it, expect } from "vitest";

import { AuditLog } from "../metrics/audit";
import type { ComplianceDecision } from "../policy/types";

const fakeDecision = (verdict: ComplianceDecision["verdict"]): ComplianceDecision => ({
  action: {
    id: "act",
    domain: "clinic_scheduling",
    kind: "schedule_appointment",
    payload: {},
    confidence: 0.9,
    proposedAt: 0,
    rationale: "test",
  },
  evaluations: [],
  verdict,
  explanation: "test",
});

describe("AuditLog.buildExportPayload", () => {
  it("packages domain, pilot label, entries and aggregates for the edge function", () => {
    const log = new AuditLog();
    log.record(fakeDecision("allow"), true);
    log.record(fakeDecision("needs_human"), false);
    log.record(fakeDecision("block"), false);

    const payload = log.buildExportPayload({
      domain: "clinic",
      pilotLabel: "Test pilot",
    });

    expect(payload.domain).toBe("clinic");
    expect(payload.pilotLabel).toBe("Test pilot");
    expect(payload.entries.length).toBe(3);
    expect(payload.aggregates.total).toBe(3);
    expect(payload.aggregates.allowed).toBe(1);
    expect(payload.aggregates.needsHuman).toBe(1);
    expect(payload.aggregates.blocked).toBe(1);
    expect(typeof payload.exportedAt).toBe("string");
    expect(Number.isNaN(Date.parse(payload.exportedAt))).toBe(false);
  });

  it("exportJson serialises the same payload", () => {
    const log = new AuditLog();
    log.record(fakeDecision("allow"), true);
    const json = log.exportJson({ domain: "robot", pilotLabel: "Robot pilot" });
    const parsed = JSON.parse(json);
    expect(parsed.domain).toBe("robot");
    expect(parsed.pilotLabel).toBe("Robot pilot");
    expect(parsed.entries.length).toBe(1);
  });
});
