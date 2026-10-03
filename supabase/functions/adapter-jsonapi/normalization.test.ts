import assert from "node:assert/strict";
import test from "node:test";
import { collectionItems, JsonFeedError, legacyExternalId, normalizeItem, readPath } from "./normalization.ts";
const cfg = { path: "features" };
const quake = { type: "Feature", properties: { publicID: "fixture-quake", locality: "Fixture locality", time: "2026-10-02T10:20:30Z", magnitude: 3.2 }, geometry: { type: "Point", coordinates: [174, -41] } };
test("declared GeoNet features normalize nested identity and publisher time", () => {
  const list = collectionItems({ type: "FeatureCollection", features: [quake] }, cfg);
  const result = normalizeItem(list[0], cfg);
  assert.equal(result.externalId, "fixture-quake");
  assert.equal(result.title, "Fixture locality");
  assert.equal(result.publishedAt, "2026-10-02T10:20:30.000Z");
  assert.equal(result.url, null);
  assert.ok(result.content.includes('"magnitude":3.2'));
});
test("declared NVD vulnerabilities normalize nested IDs, dates and English text", () => {
  const config = { path: "vulnerabilities" };
  const list = collectionItems({ vulnerabilities: [{ cve: { id: "CVE-2026-12345", published: "2026-10-02T10:20:30.000", descriptions: [{ lang: "es", value: "Fixture ES" }, { lang: "en", value: "Fixture EN" }], references: [{ url: "https://example.org/advisory" }] } }] }, config);
  const result = normalizeItem(list[0], config);
  assert.equal(result.externalId, "CVE-2026-12345");
  assert.equal(result.content, "Fixture EN");
  assert.equal(result.publishedAt, null);
  assert.equal(result.publisherDateRaw, "2026-10-02T10:20:30.000");
  assert.equal(result.url, "https://example.org/advisory");
});
test("explicit nested configured fields are bounded own-property lookups", () => {
  const result = normalizeItem({ info: { key: "id", label: "Fixture", when: "2026-10-02", body: "Text", url: "javascript:alert(1)" } }, { id_field: "info.key", title_field: "info.label", date_field: "info.when", content_field: "info.body", url_field: "info.url" });
  assert.equal(result.externalId, "id");
  assert.equal(result.content, "Text");
  assert.equal(result.url, null);
  assert.equal(readPath(Object.create({ private: "inherited" }), "private"), undefined);
  for (const path of ["__proto__.x", "constructor.name", "x.prototype", "x..y", "x.".repeat(9), "x".repeat(201)]) assert.throws(() => readPath({}, path), JsonFeedError);
});
test("missing paths/non-array/error envelopes cannot become green no-result checks", () => {
  for (const [payload, config] of [[{}, {}], [{ error: "Fixture failure" }, {}], [{ features: {} }, cfg], [[quake], cfg], [{ unrelated: [] }, cfg], [null, {}]] as const) assert.throws(() => collectionItems(payload, config), JsonFeedError);
  assert.throws(() => collectionItems({ features: [null] }, cfg), JsonFeedError);
});
test("genuine empty arrays stay no-results and do not invent items", () => {
  assert.deepEqual(collectionItems([], {}), []);
  assert.deepEqual(collectionItems({ features: [] }, cfg), []);
  assert.deepEqual(collectionItems({ vulnerabilities: [] }, { path: "vulnerabilities" }), []);
});
test("unknown dates remain unknown; malformed dates fail before any writes", () => {
  assert.equal(normalizeItem({ id: "fixture", title: "Fixture" }, {}).publishedAt, null);
  assert.throws(() => normalizeItem({ date: "not a date" }, {}), JsonFeedError);
  assert.throws(() => normalizeItem({ date: "2026-02-30" }, {}), JsonFeedError);
});
test("bounded normalization selects no more than 50 items", () => {
  assert.equal(collectionItems(Array.from({ length: 80 }, () => ({ id: "fixture" })), {}).length, 50);
});

test("timezone-less publisher timestamp is never interpreted in local server timezone", () => {
  const fixture = { cve: { id: "CVE-2026-12345", published: "2026-10-02T10:20:30.000" } };
  assert.equal(normalizeItem(fixture, { path: "vulnerabilities" }).publishedAt, null);
});

test("legacy identity algorithm reveals nested-ID and full-hash transitions", () => {
  assert.equal(legacyExternalId(quake, cfg), JSON.stringify(quake).slice(0, 80));
  const old = { cve: { id: "CVE-2026-12345" } };
  assert.equal(legacyExternalId(old, { path: "vulnerabilities" }), JSON.stringify(old).slice(0, 80));
  assert.equal(legacyExternalId({ id: "direct" }, {}), "direct");
  assert.notEqual(normalizeItem(quake, cfg).externalId, legacyExternalId(quake, cfg));
});
test("sparse collections fail and inherited configuration paths are not traversed", () => {
  assert.throws(() => collectionItems(new Array(2), {}), JsonFeedError);
  assert.throws(() => collectionItems({ features: [] }, Object.create({ path: "features" })), JsonFeedError);
  assert.equal(normalizeItem({ id: "direct", date: "2026-10-02" }, {}).publishedAt, null);
  assert.equal(normalizeItem({ id: "direct", date: "2026-10-02" }, {}).publisherDateRaw, "2026-10-02");
});
