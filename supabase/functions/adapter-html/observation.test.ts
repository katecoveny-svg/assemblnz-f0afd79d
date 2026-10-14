import assert from "node:assert/strict";
import test from "node:test";
import { pageObservation } from "./observation.ts";
test("source-page snapshot records observed time without inventing publication", () => {
  const observed = pageObservation("2026-10-03T01:15:00.000Z");
  assert.equal(observed.published_at, null);
  assert.equal(observed.metadata.observed_at, "2026-10-03T01:15:00.000Z");
  assert.equal(observed.metadata.publication_date_state, "unknown");
  assert.equal(observed.metadata.extraction_scope, "source_page");
  assert.equal(observed.metadata.observation_type, "source_page_snapshot");
});
