import { z } from 'zod';
import catalogue from './catalogue.json';
export const voicePresets = catalogue.presets;
export const presetSchema = z.enum(['warm', 'clear', 'bright']);
export type VoicePreset = z.infer<typeof presetSchema>;
export const voiceRequestSchema = z.object({
  text: z.string().trim().min(1).max(300).refine(s => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(s)),
  presets: z.array(presetSchema).min(1).max(3).refine(v => new Set(v).size === v.length),
  language: z.literal('en-NZ'), consent: z.literal(true),
}).strict();
export const voiceJobSchema = z.object({
  id: z.string().uuid(), state: z.enum(['queued','generating','ready','failed']),
  text: z.string().min(1).max(300), presets: z.array(presetSchema).min(1).max(3),
  expiresAt: z.number().int().positive(), accentReview: z.literal('pending'),
  outputs: z.array(z.object({preset:presetSchema,duration:z.number().min(.2).max(40),sha256:z.string().regex(/^[a-f0-9]{64}$/)}).strict()).max(3),
}).strict();
export type VoiceJob = z.infer<typeof voiceJobSchema>;
export type VoiceRequest = z.infer<typeof voiceRequestSchema>;
export const sampleScript = "Hello, you've reached assembl. Let's find a time that works for you. Would Thursday afternoon suit, or would you prefer Friday morning?";
