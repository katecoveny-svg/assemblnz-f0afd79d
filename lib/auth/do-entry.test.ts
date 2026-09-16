import { describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: vi.fn(async () => NextResponse.next()),
}));
import { middleware } from "@/middleware";
import { isDoReturn, resolveAuthReturn, safeReturnPath } from "./redirect";
import { resolveAuthOrigin } from "./origin";
const request = (path: string, host = "www.assembl.co.nz") =>
  new NextRequest(`https://${host}${path}`, { headers: { host } });
describe("Public DO account entry", () => {
  it("keeps the DO login and confirmation on the workspace host", async () => {
    for (const path of [
      "/login?redirect=%2Fdo%3Fopen%3D1",
      "/auth/confirm?next=%2Fdo",
      "/auth/callback?next=%2Fdo%2Ffamily",
      "/auth/confirm?next=" +
        encodeURIComponent("https://www.assembl.co.nz/auth/confirm?next=%2Fdo"),
    ]) {
      const response = await middleware(request(path));
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    }
    expect(
      resolveAuthOrigin({
        host: "www.assembl.co.nz",
        redirectTo: "/do?open=1",
      }),
    ).toBe("https://www.assembl.co.nz");
  });
  it("preserves private operator routing and rejects lookalike return paths", async () => {
    expect(
      (await middleware(request("/auth/confirm?next=%2Fadmin"))).headers.get(
        "location",
      ),
    ).toBe("https://demo.assembl.co.nz/auth/confirm?next=%2Fadmin");
    expect(
      (await middleware(request("/login?redirect=%2Fdouble"))).headers.get(
        "location",
      ),
    ).toBe("https://www.assembl.co.nz/");
    expect(isDoReturn("/do/../admin")).toBe(false);
    expect(
      resolveAuthOrigin({ host: "www.assembl.co.nz", redirectTo: "/admin" }),
    ).toBe("https://demo.assembl.co.nz");
  });
  it("never accepts an off-site, protocol-relative or backslash redirect", () => {
    for (const value of [
      "//foreign.example",
      "/\\foreign.example",
      "/\n/foreign.example",
      "https://foreign.example/do",
      "javascript:alert(1)",
    ]) {
      expect(safeReturnPath(value)).toBe("/app");
      expect(isDoReturn(value)).toBe(false);
    }
    expect(
      resolveAuthReturn(
        "https://assembl.co.nz/auth/confirm?next=%2F%2Fforeign.example",
      ),
    ).toBe("/app");
    expect(resolveAuthReturn("https://assembl.co.nz.foreign.example/do")).toBe(
      "/app",
    );
    expect(
      resolveAuthReturn(
        "https://www.assembl.co.nz/auth/confirm?next=%2Fdo%2Ffamily",
      ),
    ).toBe("/do/family");
  });
});
