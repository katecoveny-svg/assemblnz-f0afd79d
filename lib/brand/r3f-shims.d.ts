// Minimal type shims for @react-three/fiber and @react-three/drei so tsc
// resolves imports before `pnpm install` runs. Real types kick in once the
// packages are installed. Everything here is intentionally loose.

declare module '@react-three/fiber' {
  export interface RootState {
    clock: { getElapsedTime(): number };
    /** normalized pointer coordinates (-1..1) */
    pointer: { x: number; y: number };
    gl: {
      getPixelRatio(): number;
      domElement: HTMLCanvasElement;
      toneMapping: unknown;
      toneMappingExposure: number;
      setClearColor: (color: string, alpha?: number) => void;
    };
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
    resize?: unknown;
    // Loose `any` (not RootState) — other call sites in this codebase type
    // their onCreated callback against a wider RootState & {scene, camera,
    // ...} intersection; a concrete RootState signature here made those
    // handlers newly unassignable (parameter contravariance). `any` keeps
    // this prop exactly as unconstrained as it was before it had a name.
    onCreated?: (state: any) => void;
    [key: string]: unknown;
  }) => any;
  // Loose pass-through — real ThreeEvent<T> intersects T with R3F-specific
  // fields (object/point/distance/etc.); none of this codebase's pointer
  // handlers touch those, only native PointerEvent members
  // (stopPropagation/target/pointerId/clientX/clientY), so an alias to T
  // itself is enough until drei/fiber's real types are in play.
  export type ThreeEvent<T> = T;
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
  export const Environment: (props: { preset?: string; background?: boolean; files?: string | string[]; resolution?: number; environmentIntensity?: number; children?: unknown }) => any;
  export const Lightformer: (props: Record<string, unknown>) => any;
  export const Html: (props: Record<string, unknown>) => any;
  export const OrbitControls: (props: Record<string, unknown>) => any;
  export const PointerLockControls: (props: Record<string, unknown>) => any;
  export const ContactShadows: (props: Record<string, unknown>) => any;
  export const Edges: (props: Record<string, unknown>) => any;
  export const Line: (props: Record<string, unknown>) => any;
  // Loose overload — real types kick in once drei is installed.
  export function useTexture(input: string | string[]): any;
  // GLTF loader hook + preloader — loose shim; real types arrive with drei.
  export const useGLTF: ((path: string) => any) & { preload: (path: string) => void };
  export function useProgress(): { progress: number; active: boolean };
}

// Loose pointer-handler prop shape shared by draggable r3f meshes/groups —
// typed as native PointerEvent (not `unknown`) so inline handlers like
// `onPointerOver={(e) => e.stopPropagation()}` don't fall back to implicit
// `any` for `e`. See the ThreeEvent<T> note above: real drei/fiber types
// carry extra R3F fields none of this codebase's handlers use.
type R3FPointerHandlers = {
  onPointerOver?: (event: PointerEvent) => void;
  onPointerOut?: (event: PointerEvent) => void;
  onPointerDown?: (event: PointerEvent) => void;
  onPointerMove?: (event: PointerEvent) => void;
  onPointerUp?: (event: PointerEvent) => void;
  onPointerCancel?: (event: PointerEvent) => void;
};

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      group: Record<string, unknown> & R3FPointerHandlers;
      mesh: Record<string, unknown> & R3FPointerHandlers;
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
      capsuleGeometry: Record<string, unknown>;
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
