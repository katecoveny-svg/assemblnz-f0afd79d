/**
 * Creative flagship knowledge + tools (Auaha).
 *
 * Auaha ("to create") is the full creative shop in one chat: Brief → Copy →
 * Image → Video → Podcast → one-shot apps. This module ports the working
 * creative pipeline from the old `assemblnz-latest/src/components/auaha/*`
 * studios, the vendor stack named in the roster amendment, and the
 * creative-compliance guardrails distilled from `lib/compliance/policies/auaha.ts`.
 *
 * Production is REAL, fail-open per tool (a missing key returns a structured
 * note so the agent hands over the brief/prompt/script instead of failing or
 * faking an asset):
 *   - generateImage   → `generate-image` edge function (Fal Flux), shown inline,
 *                       displayed through the assembl watermark proxy.
 *   - generateVideo   → Fal Kling image-to-video (async submit; the chat UI
 *                       polls /api/agents/creative/video-status to the MP4).
 *   - generatePodcast → the locked assembl NZ voice (ElevenLabs) via /api/voice/tts.
 *
 * Every asset renders inline through an `assembl-visual` fenced block (see
 * MEDIA_RENDER_KNOWLEDGE + components/marketplace/AgentVisual.tsx).
 */

import { tool } from 'ai';
import { z } from 'zod';
import { AUAHA_POLICY_METADATA } from '@/lib/compliance/policies/auaha';
import { isVoiceConfigured } from '@/lib/voice/platform-voice';

/** The creative pipeline stages Auaha runs through, from the old AuahaDashboard. */
export const CREATIVE_PIPELINE = [
  'Brief',
  'Copy',
  'Design',
  'Video',
  'Schedule',
  'Publish',
  'Analyse',
  'Iterate',
] as const;

/** Vendor stack per medium (roster amendment). Defaults first. */
export const CREATIVE_VENDORS = {
  image: ['Recraft', 'Ideogram', 'Flux', 'fal.ai'],
  video: ['Runway', 'Pika', 'Kling', 'HeyGen', 'fal.ai'],
  audio: ['ElevenLabs Studio'],
  apps: ['Vercel drop.new', 'v0', 'bolt.new'],
} as const;

/**
 * Auaha's creative knowledge block, appended to its system prompt. English-first.
 */
export const CREATIVE_KNOWLEDGE = `# Creative studio knowledge

You are a creative studio in one chat: brief, copy, image, video, podcast and
one-shot apps. You draft and produce; the human approves before anything ships.

## The pipeline
Brief → Copy → Design → Video → Schedule → Publish → Analyse → Iterate. Move
through it with the user; stop and check in at each step rather than racing ahead.

## What you can make (these tools actually run)
- Copy — campaigns, captions, taglines, briefs, scripts (NZ English, on the
  brand's voice if one is supplied).
- Image — call \`generateImage\`. A real picture comes back; show it inline.
- Video — call \`generateVideo\` to animate an image you just made (Fal Kling,
  image-to-video). It renders in 1–3 min and appears inline when ready.
- Audio / podcast — call \`generatePodcast\` with a finished spoken-word script;
  it is voiced in the one locked assembl NZ voice and plays inline.
- One-shot apps / pages — Vercel drop.new patterns (described, not yet rendered).
- Hand a finished asset to the Social Manager workflow for scheduling and replies.

Consent + receipt: before you generate, say in one line what you are about to
make. If a tool returns a not-configured / error note, hand over the brief,
prompt or script and say plainly the asset itself could not be rendered — never
pretend an image, clip or audio was produced.

## Creative-compliance guardrails (hard gates before publishing)
- Copyright / licence: any third-party stock, music or footage needs a verified
  licence reference. No licence, no publish. (NZ Copyright Act 1994.)
- Likeness consent: an identifiable person in an image or video needs a recorded
  model release. (Privacy Act 2020 + ASA Code.)
- Brand safety: flag profanity, sensitive topics or unverified claims for a human
  review before publishing.
- Te reo integrity: anything featuring te reo Māori (macrons, karakia, waiata,
  whakataukī) needs kaitiaki review — never auto-publish te reo creative.
- Misinformation: a marketing claim you are not confident is factual gets flagged
  for review or labelled editorial. (ASA Code.)
- When uncertain, defer to the brand manager rather than shipping.

## Tone
Generative and energetic, but it always defers the final ship to the human.`;

/** The creative-compliance policy ids surfaced to the agent (kept in sync with the pack). */
export const CREATIVE_GUARDRAIL_IDS = AUAHA_POLICY_METADATA.map((p) => p.id);

// ── Fal helpers (image-to-video) ──────────────────────────────────────────--

function falKey(): string | null {
  return process.env.FAL_API_KEY || process.env.FAL_KEY || null;
}

/** Fal model id for Kling image-to-video. Overridable as Kling versions move. */
function klingModel(): string {
  return process.env.FAL_KLING_MODEL || 'fal-ai/kling-video/v2/master/image-to-video';
}

/** Kling only supports these three ratios; anything portrait-ish folds to 9:16. */
function klingAspect(ar?: string): string {
  if (ar === '9:16' || ar === '4:5') return '9:16';
  if (ar === '1:1') return '1:1';
  return '16:9';
}

/** Fal CDN hosts whose images we can safely fetch + watermark. */
const FAL_HOST = /(^|\.)fal\.(media|run|ai)$/i;

/**
 * Build the assembl-watermark proxy URL for a Fal-hosted image. Anything else
 * (a data: URL, or a non-Fal host we shouldn't proxy) is returned unchanged so
 * the image still shows — just without the server-side mark.
 */
export function watermarkDisplayUrl(src: string): string {
  try {
    const u = new URL(src);
    if (u.protocol === 'https:' && FAL_HOST.test(u.hostname)) {
      return `/api/agents/creative/watermark?src=${encodeURIComponent(src)}`;
    }
  } catch {
    /* not a URL — fall through */
  }
  return src;
}

/** Poll a Kling render to its MP4. Shared with the video-status route. */
export async function falCheckVideo(
  requestId: string,
): Promise<{ status: 'processing' | 'completed' | 'failed' | 'error'; videoUrl?: string }> {
  const apiKey = falKey();
  if (!apiKey) return { status: 'error' };
  if (requestId.startsWith('done:')) return { status: 'completed', videoUrl: requestId.slice(5) };
  const model = klingModel();
  try {
    const statusRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}/status`, {
      headers: { Authorization: `Key ${apiKey}` },
    });
    if (!statusRes.ok) return { status: 'processing' };
    const s = (await statusRes.json()) as { status?: string };
    if (s.status === 'COMPLETED') {
      const resultRes = await fetch(`https://queue.fal.run/${model}/requests/${requestId}`, {
        headers: { Authorization: `Key ${apiKey}` },
      });
      if (!resultRes.ok) return { status: 'error' };
      const result = (await resultRes.json()) as { video?: { url?: string } };
      return { status: 'completed', videoUrl: result.video?.url };
    }
    if (s.status === 'FAILED') return { status: 'failed' };
    return { status: 'processing' };
  } catch {
    return { status: 'error' };
  }
}

// ── Tools ─────────────────────────────────────────────────────────────────--

/**
 * Real image generation — calls the `generate-image` edge function (Fal-routed)
 * and returns the hosted image URL plus an assembl-watermarked display URL. The
 * agent shows it inline via an assembl-visual image block (see MEDIA_RENDER_KNOWLEDGE).
 */
export const generateImageTool = tool({
  description:
    'Generate a real image from a prompt (Fal / Flux). Use when the user asks for a visual, poster, logo concept, social graphic or any image. Returns a hosted imageUrl and a watermarked displayUrl; show the displayUrl with an assembl-visual image block, and pass imageUrl to generateVideo if the user wants it animated.',
  inputSchema: z.object({
    prompt: z.string().describe('A detailed description of the image to create'),
    style: z.enum(['photorealistic', 'illustration', '3d', 'default']).optional().describe('Visual style'),
  }),
  execute: async ({ prompt, style }) => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!base || !key) {
      return {
        status: 'error' as const,
        note: 'Image generation is not configured. Describe the image and offer the brief or copy instead.',
      };
    }
    try {
      const res = await fetch(`${base}/functions/v1/generate-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, provider: 'fal', style: style ?? 'default' }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        return {
          status: 'error' as const,
          note: `Image generation failed (${res.status}). Offer to retry or draft the brief instead.`,
          detail: detail.slice(0, 200),
        };
      }
      const data = (await res.json()) as { imageUrl?: string; provider?: string };
      if (!data.imageUrl) {
        return { status: 'error' as const, note: 'No image came back — suggest a simpler prompt and offer to retry.' };
      }
      return {
        status: 'ok' as const,
        imageUrl: data.imageUrl,
        displayUrl: watermarkDisplayUrl(data.imageUrl),
        provider: data.provider ?? 'fal',
      };
    } catch (e) {
      return {
        status: 'error' as const,
        note: `Image generation error: ${e instanceof Error ? e.message : 'unknown'}. Offer to retry.`,
      };
    }
  },
});

export const creativeTools = {
  /** Real Kling image-to-video. Submits the job; the UI polls to the MP4. */
  generateVideo: tool({
    description:
      'Animate a still image into a short video clip with Fal Kling (image-to-video). Call AFTER an image exists, passing its clean imageUrl (from generateImage or a user-supplied image). Defaults to 16:9; use 9:16 for TikTok/Reels. Renders in ~1–3 min and appears inline when ready — tell the user it is rendering, then carry on.',
    inputSchema: z.object({
      imageUrl: z.string().describe('The source image URL to animate — the imageUrl from generateImage, or a user-provided image.'),
      prompt: z.string().describe('What should move / happen in the clip — camera motion, action, mood.'),
      aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:5']).optional().describe('Defaults to 16:9.'),
      duration: z.enum(['5', '10']).optional().describe('Clip length in seconds (default 5).'),
    }),
    execute: async ({ imageUrl, prompt, aspectRatio, duration }) => {
      const apiKey = falKey();
      if (!apiKey) {
        return {
          status: 'not_configured' as const,
          note: 'Video generation is not configured (FAL_API_KEY not set). Storyboard the shots and the motion prompt; say no clip was rendered.',
        };
      }
      try {
        const res = await fetch(`https://queue.fal.run/${klingModel()}`, {
          method: 'POST',
          headers: { Authorization: `Key ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            image_url: imageUrl,
            duration: duration ?? '5',
            aspect_ratio: klingAspect(aspectRatio),
          }),
        });
        if (!res.ok) {
          const detail = await res.text().catch(() => '');
          return { status: 'error' as const, note: `Kling did not accept the job (${res.status}). Check the image URL is publicly reachable.`, detail: detail.slice(0, 200) };
        }
        const data = (await res.json()) as { request_id?: string; video?: { url?: string } };
        const requestId = data.video?.url ? `done:${data.video.url}` : data.request_id;
        if (!requestId) return { status: 'error' as const, note: 'Kling returned no job id — offer to retry.' };
        return {
          status: 'rendering' as const,
          requestId,
          aspectRatio: klingAspect(aspectRatio),
          duration: duration ?? '5',
          note: 'Kling is rendering (~1–3 min). Emit an assembl-visual video block with this requestId so it appears inline when ready, then keep working.',
        };
      } catch (e) {
        return { status: 'error' as const, note: `Video submission failed: ${e instanceof Error ? e.message : 'unknown'}.` };
      }
    },
  }),

  /** Voice a script in the one locked assembl NZ voice (ElevenLabs via /api/voice/tts). */
  generatePodcast: tool({
    description:
      'Voice a script as audio (podcast intro, ad read, voiceover) in the one locked assembl NZ voice. Write the finished spoken-word script yourself (plain prose, NZ-English, no stage directions or speaker labels) and pass it as script. The audio player appears inline.',
    inputSchema: z.object({
      script: z.string().describe('The finished spoken-word script (plain prose, NZ-English, no markdown or [stage directions]).'),
      title: z.string().optional().describe('Short label shown above the player, e.g. "Launch teaser VO".'),
    }),
    execute: async ({ script, title }) => {
      if (!isVoiceConfigured()) {
        return {
          status: 'not_configured' as const,
          note: 'Voice generation is not configured (ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID not set). Hand over the finished script and say the audio can be voiced once the voice is wired.',
        };
      }
      const clean = script.replace(/\s+/g, ' ').trim();
      if (!clean) return { status: 'error' as const, note: 'Empty script.' };
      return {
        status: 'ok' as const,
        title: title ?? 'Audio',
        script: clean,
        voice: 'assembl NZ voice',
        note: 'Emit an assembl-visual audio block with this script so it plays inline in the assembl NZ voice. Show the user the script text too.',
      };
    },
  }),
};

/** Tells creative agents how to display generated image / video / audio inline. */
export const MEDIA_RENDER_KNOWLEDGE = `# Showing a generated asset inline
Render every generated asset by emitting a fenced \`assembl-visual\` block — nothing else inside the fence, valid JSON, and use the EXACT values the tool returned.

Image — when generateImage returns status "ok":
\`\`\`assembl-visual
{"type":"image","url":"THE_EXACT_displayUrl","title":"a short caption"}
\`\`\`
Use the watermarked displayUrl (not imageUrl) for the block. Keep imageUrl to pass to generateVideo if the user wants the image animated.

Video — when generateVideo returns status "rendering":
\`\`\`assembl-visual
{"type":"video","requestId":"THE_EXACT_requestId","title":"a short caption"}
\`\`\`
The player shows a “rendering” state and swaps in the clip when Kling finishes. Tell the user it’s rendering, then continue.

Audio — when generatePodcast returns status "ok":
\`\`\`assembl-visual
{"type":"audio","script":"THE EXACT SCRIPT, JSON-escaped","title":"a short label"}
\`\`\`
The player voices the script in the assembl NZ voice. Also show the script as normal text so the user can read it.

If a tool returns status "error" or "not_configured", say so plainly and offer the brief / prompt / script — never paste a raw asset URL as text, and never claim an asset was made when it wasn't.`;

/**
 * @deprecated superseded by MEDIA_RENDER_KNOWLEDGE (image + video + audio).
 * Kept exported so any other importer keeps compiling.
 */
export const IMAGE_RENDER_KNOWLEDGE = MEDIA_RENDER_KNOWLEDGE;
