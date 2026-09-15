import { doWidgetScript } from '@/apps/do/shared/distribution';
export const dynamic = 'force-dynamic';
export function GET(request: Request) {
  return new Response(doWidgetScript(new URL(request.url).origin), {
    headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' },
  });
}
