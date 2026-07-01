import { buildLlmsFullTxt } from '@/lib/seo/llms';

// /llms-full.txt — the extended AI-search map with citable content chunks.
export const revalidate = 3600;

export function GET() {
  return new Response(buildLlmsFullTxt(), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
