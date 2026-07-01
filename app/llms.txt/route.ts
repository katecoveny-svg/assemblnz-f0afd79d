import { buildLlmsTxt } from '@/lib/seo/llms';

// /llms.txt — the AI-search map (llmstxt.org). Regenerated hourly from the
// live agent roster so it never drifts from the marketplace.
export const revalidate = 3600;

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
