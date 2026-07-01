// Minimal type shims for @react-three/fiber and @react-three/drei so tsc
// resolves imports before `pnpm install` runs. Real types kick in once the
// packages are installed. Everything here is intentionally loose.

declare module '@react-three/fiber' {
  export interface RootState {
    clock: { getElapsedTime(): number };
  }
  export function useFrame(callback: (state: RootState, delta: number) => void): void;
  export const Canvas: (props: {
    children?: unknown;
    camera?: unknown;
    dpr?: unknown;
    gl?: unknown;
    style?: unknown;
    frameloop?: unknown;
  }) => any;
}

declare module '@react-three/drei' {
  type Common = {
    children?: unknown;
    args?: unknown;
    position?: unknown;
    rotation?: unknown;
    scale?: unknown;
    ref?: unknown;
  };
  export const Torus: (props: Common) => any;
  export const Sphere: (props: Common) => any;
  export const Box: (props: Common) => any;
  export const Cylinder: (props: Common) => any;
  export const Plane: (props: Common) => any;
  export const Environment: (props: { preset?: string }) => any;
  // Loose overload — real types kick in once drei is installed.
  export function useTexture(input: string | string[]): any;
}

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      group: Record<string, unknown>;
      mesh: Record<string, unknown>;
      ambientLight: Record<string, unknown>;
      directionalLight: Record<string, unknown>;
      pointLight: Record<string, unknown>;
      planeGeometry: Record<string, unknown>;
      ringGeometry: Record<string, unknown>;
      meshStandardMaterial: Record<string, unknown>;
      meshPhysicalMaterial: Record<string, unknown>;
      meshBasicMaterial: Record<string, unknown>;
      color: Record<string, unknown>;
    }
  }
}
