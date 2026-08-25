type JsonObject = Record<string, unknown>;

export type KnowledgeSourceRecord = {
  id: string;
  name: string;
  type: string;
  url: string;
  category?: string | null;
  authority_tier?: number | null;
  authority_weight?: number | string | null;
  provenance?: string | null;
  config?: JsonObject | null;
};

function objectValue(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject
    : {};
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

/**
 * Carry source authority and Opportunity Horizon routing into every Knowledge
 * Brain document. Existing non-opportunity sources receive the same compact
 * provenance envelope without being reclassified as commercial signals.
 */
export function documentEnvelope(
  source: KnowledgeSourceRecord,
  adapter: string,
  itemMetadata: JsonObject = {},
): { metadata: JsonObject; topic_tags: string[] } {
  const config = objectValue(source.config);
  const opportunity = objectValue(config.opportunity);
  const configuredMetadata = objectValue(config.document_metadata);
  const configuredTags = stringArray(config.topic_tags);
  const opportunityEnabled = source.category === "opportunity_horizon" || Object.keys(opportunity).length > 0;

  const metadata: JsonObject = {
    ...configuredMetadata,
    ...itemMetadata,
    provenance: {
      source_id: source.id,
      source_name: source.name,
      source_url: source.url,
      source_type: source.type,
      publisher_org: opportunity.publisher_org ?? null,
      authority_tier: source.authority_tier ?? null,
      authority_weight: source.authority_weight == null ? null : Number(source.authority_weight),
      declared_provenance: source.provenance ?? null,
      captured_via: adapter,
      captured_at: new Date().toISOString(),
    },
  };

  if (opportunityEnabled) metadata.opportunity = opportunity;

  return {
    metadata,
    topic_tags: Array.from(new Set([
      ...configuredTags,
      ...(opportunityEnabled ? ["opportunity-horizon"] : []),
    ])),
  };
}
