import { describe, it, expect } from "vitest";
import {
  personalSaveSchema,
  personalMutationSchema,
  responsibilityStatus,
  type Responsibility,
} from "./contract";
const input = {
  action: "save",
  title: "Prepare my day",
  goal: "Prepare a daily checklist.",
  notes: "Proposal due Friday.",
  timezone: "Pacific/Auckland",
  localHour: 7,
  consent: true,
};
describe("Personal DO permissions and bounds", () => {
  it("requires explicit consent and rejects injected owner or execution fields", () => {
    expect(personalSaveSchema.safeParse(input).success).toBe(true);
    for (const patch of [
      { consent: false },
      { ownerId: "other" },
      { send: true },
      { timezone: "Auckland??" },
      { localHour: 24 },
      { notes: "" },
      { notes: "x".repeat(10001) },
    ])
      expect(personalSaveSchema.safeParse({ ...input, ...patch }).success).toBe(
        false,
      );
  });
  it("accepts only bounded owner actions, never external execution", () => {
    expect(
      personalMutationSchema.safeParse({
        action: "pause",
        id: "11111111-1111-4111-8111-111111111111",
      }).success,
    ).toBe(true);
    expect(
      personalMutationSchema.safeParse({
        action: "send",
        id: "11111111-1111-4111-8111-111111111111",
      }).success,
    ).toBe(false);
  });
  it("expired permission never looks scheduled", () => {
    const item = {
      active: true,
      consent_until: "2026-09-30T00:00:00Z",
    } as Responsibility;
    expect(responsibilityStatus(item, Date.parse(item.consent_until))).toBe(
      "Permission expired",
    );
    expect(responsibilityStatus({ ...item, active: false })).toBe("Paused");
  });
});
