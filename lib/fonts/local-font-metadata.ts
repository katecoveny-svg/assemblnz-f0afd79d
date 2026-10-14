import type { NextFont } from 'next/dist/compiled/@next/font/dist/types';

/** Match the single-style Google API when localFont has several source faces. */
export function preserveSingleFontStyle<T extends NextFont>(font: T, style: 'normal' | 'italic'): T {
  return {
    ...font,
    className: `${font.className} assembl-local-font-${style}`,
    style: { ...font.style, fontStyle: style },
  };
}
