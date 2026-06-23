import { getDashTool } from '@/lib/hapai/dash/tools';
import { dashOgAlt, dashOgContentType, dashOgSize, renderDashToolOgImage } from '@/lib/hapai/dash/og';

export const alt = dashOgAlt;
export const size = dashOgSize;
export const contentType = dashOgContentType;

export default function OpengraphImage() {
  return renderDashToolOgImage(getDashTool('fare-optimiser')!);
}
