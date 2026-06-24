/**
 * Creative flagship knowledge + tools (Auaha).
 *
 * Auaha ("to create") was dropped from the locked 23 and is being re-added as a
 * creative agent. This module ports the working creative pipeline from the old
 * `assemblnz-latest/src/components/auaha/*` studios (Brief → Copy → Design →
 * Video → Schedule → Publish → Analyse → Iterate), the vendor stack named in the
 * roster amendment, and the creative-compliance guardrails distilled from the
 * ported policy pack (`lib/compliance/policies/auaha.ts`).
 *
 * The image/video generators are scaffolded as clearly-marked stubs (the same
 * fail-safe pattern as the NZ-knowledge tools in the chat route) — the legacy
 * gen edge functions (`generate-image`, `generate-video`, the `auaha-*` vendor
 * bridges) are Deno + vendor keys, so the runtime ports later; the shape lands
 * now so the agent can call them the moment they are wired.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { AUAHA_POLICY_METADATA } from '@/lib/compliance/policies/auaha';

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

## What you can make
- Copy — campaigns, captions, taglines, briefs, scripts (NZ English, on the
  brand's voice if one is supplied).
- Image — via Recraft, Ideogram, Flux or the fal.ai aggregator.
- Video — via Runway, Pika, Kling or HeyGen.
- Audio / podcast — via ElevenLabs Studio.
- One-shot apps / pages — Vercel drop.new patterns.
- Hand a finished asset to the Social Manager workflow for scheduling and replies.

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

/**
 * Creative generation tools — clearly-marked stubs until the legacy gen edge
 * functions / vendor bridges are wired. They return a structured "not wired"
 * note so the agent can describe what it *would* produce and offer the copy/brief
 * it can do now, instead of failing the turn.
 */
/**
 * Real image generation — calls the `generate-image` edge function (Fal-routed)
 * and returns the hosted image URL. The agent then shows it inline via an
 * assembl-visual image block (see IMAGE_RENDER_KNOWLEDGE).
 */
export const generateImageTool = tool({
  description:
    'Generate a real image from a prompt (Fal / Flux). Use when the user asks for a visual, poster, logo concept, social graphic or any image. Returns a hosted imageUrl; you then show it with an assembl-visual image block.',
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
      return { status: 'ok' as const, imageUrl: data.imageUrl, provider: data.provider ?? 'fal' };
    } catch (e) {
      return {
        status: 'error' as const,
        note: `Image generation error: ${e instanceof Error ? e.message : 'unknown'}. Offer to retry.`,
      };
    }
  },
});

/** Tells image-capable agents how to display a generated image inline. */
export const IMAGE_RENDER_KNOWLEDGE = `# Showing a generated image
When generateImage returns status "ok" with an imageUrl, show it to the user straight away by emitting a fenced block exactly like this, with nothing else inside the fence:
\`\`\`assembl-visual
{"type":"image","url":"THE_EXACT_IMAGE_URL","title":"a short caption"}
\`\`\`
Use the exact imageUrl the tool returned. Then add one short line offering a tweak or another option. If status is "error", say so plainly and offer to retry or draft the brief — never paste a raw image URL as text.`;

/** Video stays a clearly-marked stub until its gen edge function is wired. */
export const creativeTools = {
  generateVideo: tool({
    description:
      'Generate a short marketing video from a prompt (Runway / Pika / Kling / HeyGen). Use when the user wants a video asset.',
    inputSchema: z.object({
      prompt: z.string().describe('What the video should show'),
      seconds: z.number().optional().describe('Target length in seconds'),
    }),
    execute: async ({ prompt, seconds }) => ({
      status: 'stub',
      note: 'Live video generation is not wired in this build yet. Storyboard the shots and draft the script now; flag that the render is a follow-up.',
      prompt,
      seconds: seconds ?? 8,
      vendors: CREATIVE_VENDORS.video,
    }),
  }),
};
