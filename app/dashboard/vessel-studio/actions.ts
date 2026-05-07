'use server';

import { revalidatePath } from 'next/cache';
import {
  deleteGeneration,
  insertGeneration,
  recordSizeExport,
} from '@/lib/vessel-studio/persistence';
import type {
  AspectRatio,
  Model,
  SizeExportRecord,
  Studio,
  VesselGeneration,
} from '@/lib/vessel-studio/types';

interface SaveGenerationInput {
  studio: Studio;
  preset_key: string;
  preset_label: string;
  prompt_full: string;
  prompt_to_provider: string;
  aspect_ratio: AspectRatio;
  variants: number;
  model: Model;
  reference_image_url: string | null;
  anchor_strength: number | null;
  image_urls: string[];
  cost_usd: number;
  generated_at: string;
}

export async function saveGenerationAction(input: SaveGenerationInput): Promise<{
  ok: boolean;
  reason?: string;
  generation?: VesselGeneration;
}> {
  const result = await insertGeneration(input);
  if (result.ok) revalidatePath('/dashboard/vessel-studio');
  return result;
}

export async function deleteGenerationAction(id: string): Promise<{
  ok: boolean;
  reason?: string;
}> {
  const result = await deleteGeneration(id);
  if (result.ok) revalidatePath('/dashboard/vessel-studio');
  return result;
}

export async function recordSizeExportAction(
  generationId: string,
  record: SizeExportRecord
): Promise<{ ok: boolean; reason?: string }> {
  const result = await recordSizeExport(generationId, record);
  if (result.ok) revalidatePath('/dashboard/vessel-studio');
  return result;
}
