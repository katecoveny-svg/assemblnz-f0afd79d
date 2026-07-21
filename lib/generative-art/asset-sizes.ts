/**
 * Preset export sizes so Kate doesn't have to hunt for what Instagram or
 * LinkedIn wants this week. Every entry is a real target pixel size that
 * the platform actually accepts (verified against each platform's help
 * centre 2026-Q2).
 */

export type AssetGroup = 'social' | 'video' | 'wallpaper' | 'print' | 'current';

export interface AssetSize {
  id: string;
  label: string;
  group: AssetGroup;
  /** Width in pixels at 1× (renderer output; toBlob captures this exact size). */
  width: number;
  /** Height in pixels at 1×. */
  height: number;
  /** Short hint under the label — e.g. "1080 × 1080 · square". */
  hint: string;
}

export const ASSET_SIZES: AssetSize[] = [
  // Social
  { id: 'instagram-post',    label: 'Instagram post',    group: 'social', width: 1080, height: 1080, hint: '1080 × 1080 · square' },
  { id: 'instagram-portrait',label: 'Instagram portrait',group: 'social', width: 1080, height: 1350, hint: '1080 × 1350 · 4:5' },
  { id: 'instagram-story',   label: 'Instagram story',   group: 'social', width: 1080, height: 1920, hint: '1080 × 1920 · 9:16' },
  { id: 'twitter-card',      label: 'X / Twitter card',  group: 'social', width: 1600, height: 900,  hint: '1600 × 900 · 16:9' },
  { id: 'linkedin-post',     label: 'LinkedIn post',     group: 'social', width: 1200, height: 627,  hint: '1200 × 627 · 1.91:1' },
  { id: 'linkedin-banner',   label: 'LinkedIn banner',   group: 'social', width: 1584, height: 396,  hint: '1584 × 396 · 4:1' },
  { id: 'facebook-post',     label: 'Facebook post',     group: 'social', width: 1200, height: 630,  hint: '1200 × 630 · 1.91:1' },
  { id: 'pinterest-pin',     label: 'Pinterest pin',     group: 'social', width: 1000, height: 1500, hint: '1000 × 1500 · 2:3' },

  // Video / thumbs
  { id: 'youtube-thumb',     label: 'YouTube thumbnail', group: 'video',  width: 1280, height: 720,  hint: '1280 × 720 · 16:9' },
  { id: 'video-square',      label: 'Video square 1080', group: 'video',  width: 1080, height: 1080, hint: '1080 × 1080 · 1:1' },
  { id: 'video-16-9',        label: 'Video 16:9 1080p',  group: 'video',  width: 1920, height: 1080, hint: '1920 × 1080 · 16:9' },

  // Wallpaper
  { id: 'wallpaper-desktop', label: 'Desktop wallpaper', group: 'wallpaper', width: 2560, height: 1440, hint: '2560 × 1440 · 16:9' },
  { id: 'wallpaper-iphone',  label: 'iPhone wallpaper',  group: 'wallpaper', width: 1290, height: 2796, hint: '1290 × 2796 · 15 Pro' },
  { id: 'wallpaper-ipad',    label: 'iPad wallpaper',    group: 'wallpaper', width: 2048, height: 2732, hint: '2048 × 2732 · 12.9" Pro' },

  // Print
  { id: 'print-a4-portrait', label: 'Print A4 portrait', group: 'print',  width: 2480, height: 3508, hint: '2480 × 3508 · 300dpi' },
  { id: 'print-a3-portrait', label: 'Print A3 portrait', group: 'print',  width: 3508, height: 4961, hint: '3508 × 4961 · 300dpi' },
  { id: 'print-square-3k',   label: 'Print square 3k',   group: 'print',  width: 3000, height: 3000, hint: '3000 × 3000 · gallery' },
];

export const ASSET_GROUPS: { id: AssetGroup; label: string }[] = [
  { id: 'social',    label: 'social' },
  { id: 'video',     label: 'video' },
  { id: 'wallpaper', label: 'wallpaper' },
  { id: 'print',     label: 'print' },
];
