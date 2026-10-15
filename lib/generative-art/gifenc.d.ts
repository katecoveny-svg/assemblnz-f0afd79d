// gifenc 1.0.3 ships no types; this covers the three calls loop-export.ts makes.
declare module 'gifenc' {
  export type Palette = number[][];
  export interface Encoder {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: { palette?: Palette; delay?: number; repeat?: number; transparent?: boolean }): void;
    finish(): void;
    bytes(): Uint8Array;
  }
  export function GIFEncoder(opts?: { auto?: boolean }): Encoder;
  export function quantize(rgba: Uint8ClampedArray | Uint8Array, maxColors: number, opts?: { format?: string }): Palette;
  export function applyPalette(rgba: Uint8ClampedArray | Uint8Array, palette: Palette, format?: string): Uint8Array;
}
