import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { GET } from "./route";

const ask = (query: string) => GET(new Request(`https://www.assembl.co.nz/do/ask${query}`));

describe("Ask DO phone entry", () => {
  it("shows the asked words for review without saving, sending or fetching anything", async () => {
    const result = ask("?q=" + encodeURIComponent("Fictional: book the bach for Labour weekend"));
    const html = await result.text();
    expect(result.status).toBe(200);
    expect(result.headers.get("cache-control")).toBe("private, no-store");
    expect(result.headers.get("referrer-policy")).toBe("no-referrer");
    expect(result.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(html).toContain("Here is what you asked.");
    expect(html).toContain("Fictional: book the bach for Labour weekend");
    expect(html).toContain("Open in Personal DO");
    expect(html).toContain("sessionStorage.setItem");
    expect(html).not.toContain("fetch(");
  });
  it("accepts text as an alias and keeps a title and a cleaned link", async () => {
    const html = await ask("?text=Compare+these&title=From+Safari&url=" + encodeURIComponent("https://example.org/plan?token=private#frag")).text();
    expect(html).toContain("From Safari");
    expect(html).toContain("https://example.org/plan");
    expect(html).not.toContain("token=private");
    expect(html).not.toContain("#frag");
  });
  it("escapes the asked words in HTML and inline JSON with one nonce-bound script", async () => {
    const attack = '</textarea><script>alert("oops")</script>';
    const result = ask("?q=" + encodeURIComponent(attack));
    const html = await result.text();
    expect(html).not.toContain(attack);
    expect(html).toContain("&lt;/textarea&gt;");
    expect(html.match(/<script /g)).toHaveLength(1);
    const nonce = /<script nonce="([^"]+)"/.exec(html)?.[1];
    expect(result.headers.get("content-security-policy")).toContain(`script-src 'nonce-${nonce}'`);
  });
  it("just opens DO when nothing was asked, without echoing anything", () => {
    const result = ask("");
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toBe("https://www.assembl.co.nz/do/personal");
    expect(ask("?q=%20%20").status).toBe(303);
  });
  it("rejects duplicate, unsafe, oversized asks", () => {
    expect(ask("?q=one&q=two").status).toBe(400);
    expect(ask("?url=" + encodeURIComponent("javascript:alert(1)")).status).toBe(400);
    expect(ask("?url=" + encodeURIComponent("https://user:secret@example.org")).status).toBe(400);
    expect(ask("?q=" + "x".repeat(10_001)).status).toBe(400);
    expect(ask("?q=" + "x".repeat(20_000)).status).toBe(413);
  });
  it("is a DO-scoped manifest shortcut so Android long-press offers Ask DO", () => {
    const manifest = JSON.parse(readFileSync("public/do/manifest.webmanifest", "utf8"));
    const shortcut = manifest.shortcuts.find((s: { url: string }) => s.url === "/do/ask");
    expect(shortcut).toMatchObject({ name: "Ask DO", short_name: "Ask" });
    expect(shortcut.url.startsWith(`${manifest.scope}/`)).toBe(true);
  });
});
