import { describe, expect, it } from "vitest";
import {
  clampCompanionPosition,
  readCompanionPosition,
} from "./companion-position";

describe("portable companion position", () => {
  it("restores saved position and rejects corrupt or non-finite preferences", () => {
    expect(readCompanionPosition('{"left":240,"top":80}')).toEqual({
      left: 240,
      top: 80,
    });
    for (const raw of [
      null,
      "{broken",
      "null",
      "[]",
      '{"left":"40","top":20}',
      '{"left":1e999,"top":20}',
    ]) {
      expect(readCompanionPosition(raw)).toBeNull();
    }
  });
  it("keeps the complete widget reachable after moving from desktop to mobile", () => {
    expect(
      clampCompanionPosition(
        { left: 1300, top: 900 },
        { width: 375, height: 667 },
        { width: 88, height: 96 },
      ),
    ).toEqual({ left: 279, top: 563 });
    expect(
      clampCompanionPosition(
        { left: -100, top: -40 },
        { width: 375, height: 667 },
        { width: 88, height: 96 },
      ),
    ).toEqual({ left: 8, top: 8 });
  });
});
