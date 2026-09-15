import { describe, it, expect } from "vitest";
import { doWatchPlanSchema, changedWatchFindings } from "./watch-plan";
const plan = {
  id: "synthetic",
  name: "Public update draft",
  query: "Official public updates",
  source: "public_web_search",
  everyHours: 24,
  notification: "meaningful_changes",
  delivery: "in_app",
  state: "draft",
};
const finding = {
  id: "one",
  url: "https://example.org/one",
  title: "Update",
  summary: "Source summary",
};
describe("DO watch planning without execution", () => {
  it("cannot activate a watch or accept an unbounded schedule", () => {
    expect(doWatchPlanSchema.safeParse(plan).success).toBe(true);
    expect(
      doWatchPlanSchema.safeParse({ ...plan, state: "active" }).success,
    ).toBe(false);
    expect(
      doWatchPlanSchema.safeParse({ ...plan, everyHours: 0 }).success,
    ).toBe(false);
  });
  it("requires an explicit connected-source reference", () => {
    expect(
      doWatchPlanSchema.safeParse({ ...plan, source: "connected_source" })
        .success,
    ).toBe(false);
  });
  it("deduplicates results and ignores ordering", () => {
    const two = { ...finding, id: "two" };
    expect(
      changedWatchFindings([finding, two], [two, finding, finding]),
    ).toEqual([]);
  });
  it("returns new and changed findings only", () => {
    const changed = { ...finding, summary: "Updated source summary" };
    expect(changedWatchFindings([finding], [changed, changed])).toEqual([
      changed,
    ]);
  });
});
