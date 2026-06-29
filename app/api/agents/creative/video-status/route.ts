/**
 * Kling render-status poll for Auaha's generateVideo tool.
 *
 * GET ?id=<fal request id> → { status: 'processing' | 'completed' | 'failed' |
 * 'error', videoUrl? }. The chat UI's assembl-visual video block polls this
 * after generateVideo returns a `rendering` result, and swaps in the inline
 * <video> once status === completed. The Fal key stays server-side.
 */
import { falCheckVideo } from '@/lib/agents/creative';

export const maxDuration = 30;

export async function GET(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return Response.json({ status: 'error', error: 'Missing id' }, { status: 400 });
  const result = await falCheckVideo(id);
  return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
