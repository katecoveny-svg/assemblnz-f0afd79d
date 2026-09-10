import { describe, expect, it } from "vitest";
import { publicPageKind } from "./public-route-canon";

describe("public page frame boundaries", () => {
  it.each([
    "/journeys",
    "/agents",
    "/how-it-works",
    "/contact",
    "/concept-studio",
  ])("frames the public landing %s", (path) => {
    expect(publicPageKind(path)).toBe("crafted");
  });

  it.each([
    "/legal/privacy",
    "/docs/permissions",
    "/notes/a-useful-wait",
    "/workflows/sample",
  ])("uses a reading surface for %s", (path) => {
    expect(publicPageKind(path)).toBe("document");
  });

  it.each([
    "/",
    "/agents/gateway",
    "/journeys/one-nz",
    "/journeys/one-nz/pilot",
    "/journeys/evidence-receipt",
    "/hapai/customs-entry",
    "/genome",
    "/generative-studio",
    "/admin",
    "/login",
    "/api/contact",
  ])("preserves the existing interface at %s", (path) => {
    expect(publicPageKind(path)).toBeNull();
  });

  it("normalises a trailing slash without broadening the route match", () => {
    expect(publicPageKind("/pricing/")).toBe("crafted");
    expect(publicPageKind("/pricing/private")).toBeNull();
    expect(publicPageKind(null)).toBeNull();
  });
});
