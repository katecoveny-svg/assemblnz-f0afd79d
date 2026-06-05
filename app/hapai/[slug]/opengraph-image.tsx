import { HAPAI_TOOLS, getHapaiTool } from '@/lib/hapai/shareable-tools';
import {
  ogAlt,
  ogContentType,
  ogSize,
  renderHapaiToolOgImage,
} from '@/lib/hapai/og-image';

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  // Only tools that actually live under /hapai/<slug> are served by this
  // dynamic route. Tools with their own path (e.g. /electrify) ship their own
  // same-slug OG route instead.
  return HAPAI_TOOLS.filter((tool) => tool.href.startsWith('/hapai/')).map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function HapaiToolOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getHapaiTool(slug) ?? HAPAI_TOOLS[0];
  return renderHapaiToolOgImage(tool);
}
