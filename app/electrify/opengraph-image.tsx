import { getHapaiTool, HAPAI_TOOLS } from '@/lib/hapai/shareable-tools';
import {
  ogAlt,
  ogContentType,
  ogSize,
  renderHapaiToolOgImage,
} from '@/lib/hapai/og-image';

// The energy calculator lives at /electrify (a deliberate exception to the
// /hapai convention), so it ships its own OG route co-located at the same path.
// This keeps the tool page and its og:image on the same slug: /electrify.
export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default async function ElectrifyOpenGraphImage() {
  const tool = getHapaiTool('electrify') ?? HAPAI_TOOLS[0];
  return renderHapaiToolOgImage(tool);
}
