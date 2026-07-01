/**
 * <JsonLd> — renders a schema.org JSON-LD block as a <script> tag.
 *
 * Server component. Pass a single node or a full `graph(...)` document. Emitted
 * verbatim so answer engines (Perplexity, ChatGPT Search, Claude, Google AI
 * Overviews) can parse the entity graph without executing JS.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe; there is no user-controlled HTML here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
