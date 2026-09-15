import { describe, it, expect } from "vitest";
import {
  newDoTrip,
  tripSchema,
  safeTravelLink,
  travelRevisionBrief,
} from "./travel";
describe("Travel DO saved drafts", () => {
  it("round trips a saved editable trip and checklist", () => {
    const t = newDoTrip();
    t.destination = "Wānaka";
    t.days = [
      {
        id: crypto.randomUUID(),
        title: "Wednesday",
        notes: "Walk by the lake",
        place: "Wānaka lakefront",
        bookingLink: "https://example.com/terms",
      },
    ];
    t.packing = [
      { id: crypto.randomUUID(), text: "Rain jacket", packed: true },
    ];
    expect(tripSchema.parse(JSON.parse(JSON.stringify(t)))).toEqual(t);
  });
  it("does not reopen executable or credential-bearing links", () => {
    expect(safeTravelLink("javascript:alert(1)")).toBe("");
    expect(safeTravelLink("https://user:pass@example.com")).toBe("");
    expect(safeTravelLink("http://example.com")).toBe("");
  });
  it("rejects malformed saved records rather than trusting browser storage", () => {
    expect(tripSchema.safeParse({ version: 1, title: "Trip" }).success).toBe(
      false,
    );
  });
  it("retains travel constraints and draft status when returning to DO", () => {
    const t = newDoTrip();
    t.budget = "NZD 1200 total";
    t.preferences = "No overnight driving";
    t.summary = "Proposed route";
    const brief = travelRevisionBrief(t);
    expect(brief).toContain("NZD 1200 total");
    expect(brief).toContain("No overnight driving");
    expect(brief).toContain("Nothing has been booked");
  });
});
