import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(async (host: string) => ({
    address: host === "private.example" ? "127.0.0.1" : "93.184.216.34",
  })),
}));
import { POST } from "./route";
const html = `<title>Example Architecture Studio</title><meta name="description" content="${"Verified studio information. ".repeat(5)}"><main>${"We design useful places for our community. ".repeat(70)}</main>`;
const request = () =>
  new Request("https://assembl.example/api/ai-ready", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "https://public.example" }),
  });
function mockSite(extra: Record<string, string> = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: URL) => {
      const p = new URL(input).pathname;
      return new Response(
        extra[p] ??
          (p === "/"
            ? html
            : p === "/robots.txt"
              ? "User-agent: *\nAllow: /"
              : p === "/sitemap.xml"
                ? '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
                : ""),
        { status: p === "/llms.txt" && !extra[p] ? 404 : 200 },
      );
    }),
  );
}
beforeEach(() => mockSite());
afterEach(() => vi.unstubAllGlobals());
describe("public website findings", () => {
  it("does not score the optional llms.txt convention", async () => {
    const a = await (await POST(request())).json();
    mockSite({ "/llms.txt": "# Example\nA curated overview" });
    const b = await (await POST(request())).json();
    expect(a.score).toBe(b.score);
    expect(a.checks.find((c: { id: string }) => c.id === "llms").scored).toBe(
      false,
    );
    expect(a.methodology).toContain("not a measurement of AI visibility");
  });
  it("does not mistake an HTML fallback page for a sitemap", async () => {
    mockSite({ "/sitemap.xml": "<html>Not found</html>" });
    const a = await (await POST(request())).json();
    expect(
      a.checks.find((c: { id: string }) => c.id === "sitemap").status,
    ).toBe("fail");
  });
  it("rejects a redirect into a private destination before fetching it", async () => {
    const fetch = vi.fn(
      async () =>
        new Response(null, {
          status: 302,
          headers: { location: "http://private.example/" },
        }),
    );
    vi.stubGlobal("fetch", fetch);
    expect((await POST(request())).status).toBe(502);
    expect(fetch.mock.calls.length).toBe(3);
  });
  it("does not score a denied homepage as a business website", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Forbidden", { status: 403 })),
    );
    expect((await POST(request())).status).toBe(502);
  });
});
