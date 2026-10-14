/** A source-page observation is not a publisher-dated event. */
export function pageObservation(observedAt: string) {
  return {
    published_at: null,
    metadata: {
      extraction_scope: "source_page",
      observation_type: "source_page_snapshot",
      observed_at: observedAt,
      publication_date_state: "unknown",
    },
  };
}
