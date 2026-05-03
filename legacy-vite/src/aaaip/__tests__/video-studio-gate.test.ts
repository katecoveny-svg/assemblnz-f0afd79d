import { describe, it, expect } from "vitest";
import { resolveVideoGate } from "@/components/auaha/AuahaVideoStudio";

describe("resolveVideoGate", () => {
  it("admin + not subscribed → proceed (admin bypass)", () => {
    expect(resolveVideoGate(true, false)).toBe("proceed");
  });

  it("admin + subscribed → proceed", () => {
    expect(resolveVideoGate(true, true)).toBe("proceed");
  });

  it("non-admin + subscribed → proceed", () => {
    expect(resolveVideoGate(false, true)).toBe("proceed");
  });

  it("non-admin + not subscribed → paywall", () => {
    expect(resolveVideoGate(false, false)).toBe("paywall");
  });
});
