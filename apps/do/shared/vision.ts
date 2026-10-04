import { z } from "zod";
import type { TranscriptionCompletion } from "@/lib/ai/completion";

export const DO_VISION_IMAGE_BYTES = 2_000_000;
export const DO_VISION_BODY_BYTES = 2_800_000;
export const doVisionInput = z
  .object({
    mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]),
    data: z
      .string()
      .min(16)
      .max(2_666_668)
      .regex(/^[A-Za-z0-9+/]+={0,2}$/),
    question: z.string().trim().min(3).max(2_000),
    consent: z.literal(true),
    purpose: z.enum(["observation", "transcription"]).optional(),
  })
  .strict();

export type DoVisionInput = z.infer<typeof doVisionInput>;
export type DoVisionResult = {
  text: string;
  completion?: TranscriptionCompletion;
  receipt: {
    model: string;
    imageHash: string;
    outputHash: string;
    createdAt: string;
    boundary: string;
  };
};

export function visionResultContext(text: string): string {
  return `DO visual observation — review against the image before use:\n${text.trim().slice(0, 12_000)}`;
}
