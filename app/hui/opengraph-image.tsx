import { getHapaiTool } from '@/lib/hapai/shareable-tools';
import { ogContentType, ogSize, renderHapaiToolOgImage } from '@/lib/hapai/og-image';

export const alt = 'Hui by assembl — prepare a meeting record for review';
export const size = ogSize;
export const contentType = ogContentType;

export default function HuiOpenGraphImage() {
  const tool = getHapaiTool('meeting-recorder');
  if (!tool) throw new Error('The Hui share-card entry is missing.');
  return renderHapaiToolOgImage(tool);
}
