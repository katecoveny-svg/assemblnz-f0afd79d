import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { GET, POST } from "./route";

const request = (values: Record<string, string>) => new Request("https://assembl.co.nz/do/receive", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(values) });

describe("DO scoped review-only share intake", () => {
  it("accepts text/link into a private review page without account or provider effects", async () => {
    const result = await POST(request({ title: "School notice", text: "Fictional trip on Friday", url: "https://example.org/notice" }));
    const html = await result.text();
    expect(result.status).toBe(200);
    expect(result.headers.get("cache-control")).toBe("private, no-store");
    expect(result.headers.get("referrer-policy")).toBe("no-referrer");
    expect(result.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(html).toContain("Review in Personal DO");
    expect(html).toContain("sessionStorage.setItem");
    expect(html).not.toContain("fetch(");
    expect(html).not.toContain('href="https://example.org/notice"');
  });
  it("escapes text in both HTML and inline JSON, and uses nonce-bound scripts", async () => {
    const attack = '</textarea><script>alert("oops")</script><img src=x onerror=alert(1)>';
    const result = await POST(request({ title: attack, text: attack }));
    const html = await result.text();
    expect(html).not.toContain(attack);
    expect(html).toContain("&lt;/textarea&gt;");
    expect(html).toContain('\\u003c/script>');
    expect(html.match(/<script /g)).toHaveLength(1);
    const nonce = /<script nonce="([^"]+)"/.exec(html)?.[1];
    expect(result.headers.get("content-security-policy")).toContain(`script-src 'nonce-${nonce}'`);
  });
  it.each(["javascript:alert(1)", "file:///tmp/private", "https://user:secret@example.org"]) ("rejects unsafe link %s", async url => {
    expect((await POST(request({ url }))).status).toBe(400);
  });
  it("rejects empty, duplicate, unknown, oversized and file payloads", async () => {
    expect((await POST(request({}))).status).toBe(400);
    expect((await POST(request({ text: "x", owner_id: "another" }))).status).toBe(400);
    expect((await POST(request({ text: "x".repeat(10001) }))).status).toBe(400);
    expect((await POST(request({ text: "x".repeat(50000) }))).status).toBe(413);
    expect((await POST(new Request("https://assembl.co.nz/do/receive", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "text=one&text=two" }))).status).toBe(400);
    expect((await POST(new Request("https://assembl.co.nz/do/receive", { method: "POST", body: new FormData() }))).status).toBe(415);
  });
  it("ordinary GET does not echo input or retain it in a redirect", async () => {
    const result = GET(new Request("https://assembl.co.nz/do/receive?text=private"));
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toBe("https://assembl.co.nz/do/personal");
  });
  it("removes query and fragment access data before browser handoff", async () => {
    const result = await POST(request({ url: "https://example.org/doc?access_token=private-token#secret-fragment" }));
    const html = await result.text();
    expect(html).toContain("https://example.org/doc");
    expect(html).not.toContain("private-token");
    expect(html).not.toContain("secret-fragment");
    expect(html).toContain("query details and fragments are removed");
  });
  it("manifest uses only the scoped POST text/link endpoint", () => {
    const manifest = JSON.parse(readFileSync("public/do/manifest.webmanifest", "utf8"));
    expect(manifest.share_target).toEqual({ action: "/do/receive", method: "POST", enctype: "application/x-www-form-urlencoded", params: { title: "title", text: "text", url: "url" } });
    expect(manifest.share_target.action.startsWith(`${manifest.scope}/`)).toBe(true);
  });
});
