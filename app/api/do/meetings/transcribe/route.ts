import { doOwner, sameDoOrigin, privateDoHeaders as headers } from '@/apps/do/services/owner';
import { checkChatRateLimit } from '@/lib/agents/chat-rate-limit';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function GET() { return Response.json({ configured: Boolean(process.env.DEEPGRAM_API_KEY) }, { headers }); }
export async function POST(request: Request) {
  const reply = (message: string, status: number) => Response.json({ message }, { status, headers });
  if (!sameDoOrigin(request)) return reply('Open Meeting DO to transcribe.', 403);
  const owner = await doOwner();
  if (!owner) return reply('Sign in before sharing audio for transcription.', 401);
  if (!process.env.DEEPGRAM_API_KEY) return reply('Transcription needs platform setup. You can still record, download audio or paste notes.', 503);
  if (!(await checkChatRateLimit(owner.id, 'do-meeting-transcription')).allowed) return reply('Please wait before transcribing again.', 429);
  if (Number(request.headers.get('content-length')) > 4_000_000) return reply('Use an audio file smaller than 4 MB.', 413);
  // Bound chunked uploads too; Content-Length is not an authority boundary.
  const reader = request.body?.getReader();
  if (!reader) return reply('Attach an audio file.', 400);
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const chunk = await reader.read(); if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 4_000_000) { await reader.cancel(); return reply('Use an audio file smaller than 4 MB.', 413); }
      chunks.push(chunk.value);
    }
  } catch { return reply('Audio upload was interrupted.', 400); }
  const bytes = Buffer.concat(chunks);
  const form = await new Response(bytes, { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData().catch(() => null);
  const audio = form?.get('audio');
  if (form?.get('consent') !== 'true') return reply('Confirm permission to share this recording.', 400);
  if (!(audio instanceof Blob) || !audio.size || audio.size > 4_000_000 || !/^(audio\/(webm|mp4|mpeg|wav|ogg)|video\/webm)(;|$)/.test(audio.type)) return reply('Use supported audio smaller than 4 MB.', 400);
  try {
    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=en-NZ&smart_format=true&punctuate=true&diarize=true', {
      method: 'POST', headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`, 'Content-Type': audio.type },
      body: await audio.arrayBuffer(), signal: AbortSignal.any([request.signal, AbortSignal.timeout(50_000)]),
    });
    if (!response.ok) return reply('Transcription could not finish. Your local recording is still available.', 502);
    const data = await response.json();
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript;
    if (typeof transcript !== 'string' || !transcript.trim()) return reply('No speech was recognised. Check the recording or paste notes.', 422);
    return Response.json({ transcript: transcript.trim(), provider: 'Deepgram', status: 'review_required' }, { headers });
  } catch { return reply('Transcription could not finish. Try again or paste notes.', 502); }
}
