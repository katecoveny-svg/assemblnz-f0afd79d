import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { FeedResponseError, parseFeedResponse } from "./feed-response.ts";

const Parser = createRequire(import.meta.url)("rss-parser");
const parser = new Parser();
const parse = (xml: string) => parser.parseString(xml);
const rss = `<?xml version="1.0"?><rss version="2.0"><channel><title>Official releases</title><link>https://www.beehive.govt.nz</link><description>Releases</description><item><title>Fixture release</title><link>https://www.beehive.govt.nz/release/fixture</link><guid>fixture</guid><description>Fixture content</description><pubDate>Wed, 30 Sep 2026 12:00:00 GMT</pubDate></item></channel></rss>`;

for (const contentType of ["application/rss+xml", "application/xml; charset=utf-8", "text/plain"]) {
  test(`accepts real RSS with ${contentType} and preserves attribution/date`, async () => {
    const feed = await parseFeedResponse(new Response(rss, { headers: { "Content-Type": contentType } }), parse);
    assert.equal(feed.items[0].link, "https://www.beehive.govt.nz/release/fixture");
    assert.equal(feed.items[0].isoDate, "2026-09-30T12:00:00.000Z");
  });
}
test("accepts Atom", async () => {
  const feed = await parseFeedResponse(new Response(`<feed xmlns="http://www.w3.org/2005/Atom"><title>Fixture</title><entry><id>fixture</id><title>Fixture entry</title><link href="https://example.org/fixture"/><updated>2026-09-30T12:00:00Z</updated><summary>Fixture</summary></entry></feed>`), parse);
  assert.equal(feed.items.length, 1);
});
for (const [label, body, contentType, status, code] of [
  ["Beehive challenge", '<html><head><script async></script></head><body><iframe src="/_Incapsula_Resource?token=secret"></iframe></body></html>', "text/html", 200, "feed_upstream_blocked"],
  ["mislabeled HTML", '<!DOCTYPE html><html><body>Unavailable</body></html>', "application/xml", 200, "feed_html_response"],
  ["HTML with XML declaration", '<?xml version="1.0"?><html>Unavailable</html>', "application/xml", 200, "feed_html_response"],
  ["HTTP failure", "Unavailable", "text/plain", 403, "feed_http_error"],
  ["empty", "", "application/xml", 200, "feed_empty_response"],
  ["non-feed XML", "<error>Unavailable</error>", "application/xml", 200, "feed_invalid_format"],
  ["malformed XML", "<rss><channel><item bad></channel></rss>", "application/rss+xml", 200, "feed_malformed_xml"],
] as const) {
  test(`fails closed on ${label}`, async () => {
    let parsed = false;
    await assert.rejects(() => parseFeedResponse(new Response(body, { status, headers: { "Content-Type": contentType } }), async (xml) => {
      parsed = true;
      return parse(xml);
    }), (error: unknown) => {
      assert.ok(error instanceof FeedResponseError);
      assert.equal(error.code, code);
      assert.equal(error.details.http_status, status);
      assert.ok(!JSON.stringify(error).includes("secret"));
      return true;
    });
    assert.equal(parsed, code === "feed_malformed_xml");
  });
}
test("empty valid feed remains a successful check without inventing headlines", async () => {
  const feed = await parseFeedResponse(new Response(rss.replace(/<item>[\s\S]*<\/item>/, "")), parse);
  assert.deepEqual(feed.items, []);
});
