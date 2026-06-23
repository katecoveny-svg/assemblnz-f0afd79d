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
export const creativeTools = {
  generateImage: tool({
    description:
      'Generate a marketing image from a prompt (Recraft / Ideogram / Flux / fal.ai). Use when the user wants a visual asset.',
    inputSchema: z.object({
      prompt: z.string().describe('What the image should show'),
      aspect: z.string().optional().describe('Aspect ratio, e.g. "1:1", "16:9"'),
    }),
    execute: async ({ prompt, aspect }) => ({
      status: 'stub',
      note: 'Live image generation is not wired in this build yet. Describe the image you would create and offer to draft the brief, copy or alt-text now; flag that the render is a follow-up.',
      prompt,
      aspect: aspect ?? '1:1',
      vendors: CREATIVE_VENDORS.image,
    }),
  }),
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
