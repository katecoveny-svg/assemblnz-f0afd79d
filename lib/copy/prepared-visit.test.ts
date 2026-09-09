import { describe, expect, it } from "vitest";
import { prepareVisit, type VisitChoice } from "./prepared-visit";
describe("homepage prepared visit", () => {
  it("makes each answer change the prepared work", () => {
    const choices: VisitChoice[] = ["mobility", "clarity", "pickup", "skip"];
    const outputs = choices.map(prepareVisit);
    expect(new Set(outputs.map((o) => o.change)).size).toBe(4);
    expect(prepareVisit("mobility").items.join(" ")).toContain("transport");
    expect(prepareVisit("clarity").items.join(" ")).toContain("approval");
    expect(prepareVisit("pickup").items.join(" ")).toContain("collection");
  });
  it("keeps the ordinary service intact for skip", () => {
    const result = prepareVisit("skip");
    expect(result.items.length).toBe(3);
    expect(result.change).toBe("no additional preference used");
    expect(result.reason).toContain("ordinary preparation continues");
  });
  it("does not claim a booking or external action", () => {
    for (const choice of [
      "mobility",
      "clarity",
      "pickup",
      "skip",
    ] as VisitChoice[]) {
      expect(prepareVisit(choice).boundary).toContain(
        "No booking, price, transport or collection time has been confirmed.",
      );
    }
  });
});
