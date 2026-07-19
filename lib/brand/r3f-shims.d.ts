// Minimal type shims for @react-three/fiber and @react-three/drei so tsc
// resolves imports before `pnpm install` runs. Real types kick in once the
// packages are installed. Everything here is intentionally loose.

declare module '@react-three/fiber' {
  export interface RootState {
    clock: { getElapsedTime(): number };
    /** normalized pointer coordinates (-1..1) */
    pointer: { x: number; y: number };
    gl: { getPixelRatio(): number };
  }
  export function useFrame(callback: (state: RootState, delta: number) => void): void;
  export function useThree(): any;
  export const Canvas: (props: {
    children?: unknown;
    camera?: unknown;
    dpr?: unknown;
    gl?: unknown;
    style?: unknown;
    frameloop?: unknown;
    shadows?: unknown;
    [key: string]: unknown;
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
  export const Environment: (props: { preset?: string; background?: boolean; files?: string | string[]; resolution?: number; children?: unknown }) => any;
  export const Lightformer: (props: Record<string, unknown>) => any;
  export const Html: (props: Record<string, unknown>) => any;
  export const OrbitControls: (props: Record<string, unknown>) => any;
  export const PointerLockControls: (props: Record<string, unknown>) => any;
  export const ContactShadows: (props: Record<string, unknown>) => any;
  export const Edges: (props: Record<string, unknown>) => any;
  // Loose overload — real types kick in once drei is installed.
  export function useTexture(input: string | string[]): any;
  // GLTF loader hook + preloader — loose shim; real types arrive with drei.
  export const useGLTF: ((path: string) => any) & { preload: (path: string) => void };
  export function useProgress(): { progress: number; active: boolean };
}

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      group: Record<string, unknown>;
      mesh: Record<string, unknown>;
      primitive: Record<string, unknown>;
      ambientLight: Record<string, unknown>;
      hemisphereLight: Record<string, unknown>;
      directionalLight: Record<string, unknown>;
      pointLight: Record<string, unknown>;
      planeGeometry: Record<string, unknown>;
      ringGeometry: Record<string, unknown>;
      circleGeometry: Record<string, unknown>;
      sphereGeometry: Record<string, unknown>;
      boxGeometry: Record<string, unknown>;
      torusGeometry: Record<string, unknown>;
      torusKnotGeometry: Record<string, unknown>;
      icosahedronGeometry: Record<string, unknown>;
      bufferGeometry: Record<string, unknown>;
      bufferAttribute: Record<string, unknown>;
      lineSegments: Record<string, unknown>;
      lineBasicMaterial: Record<string, unknown>;
      meshStandardMaterial: Record<string, unknown>;
      meshPhysicalMaterial: Record<string, unknown>;
      meshBasicMaterial: Record<string, unknown>;
      color: Record<string, unknown>;
    }
  }
}
