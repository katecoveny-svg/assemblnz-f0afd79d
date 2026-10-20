'use client';

/**
 * assembl / living — the board in 3D, from the print files
 * ----------------------------------------------------------
 * The preview is the real geometry: every board and accessory is the served
 * v0.3 STL, turned back from its print orientation into its installed frame
 * (the same frame the CAD library designs in: x right, y up, z out of the
 * wall, the board 0–8 mm, the flange at 8–13 mm, the key at a cell centre),
 * then keyed to its cell. Click a keyway to place the chosen accessory; click
 * a part to select it. A newly placed part drops onto its key and quarter-turns
 * to lock, because motion here is work happening. Renders on demand only.
 */

import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CanvasTexture, SRGBColorSpace, type BufferGeometry, type Group } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { BOARD_MM, INTERFACE_SPEC, PITCH_MM, colourHex, colourInk, printFile, productByHandle, type Placement, type SpaceDesign } from '@/lib/living';
import { boards, cellOrigin, fieldSize } from './GridComposer';

const S = 1 / 100;
const T = INTERFACE_SPEC.board_thickness_mm;
const P = PITCH_MM;

type Design = Pick<SpaceDesign, 'field' | 'placements' | 'boardColour' | 'accessoryColour'> & { name?: string };
type Props = {
  design: Design;
  interactive?: boolean;
  tool?: string | null;
  selected?: string | null;
  onCell?: (col: number, row: number) => void;
  onSelect?: (placementId: string) => void;
};

/** How each print file was oriented for the bed (tools/living-cad/cad/build.py PRINT). */
const PRINT_ROTATION: Record<string, [number, number, number]> = { face_down: [180, 0, 0], as_is: [0, 0, 0], on_side: [0, 90, 0], on_bottom: [90, 0, 0] };

/**
 * Installed-frame bounding-box minimum and first-key position of every grid
 * part, from the CAD library (`lib.py`): the inverse print rotation gives the
 * shape, this gives it back its place. Keys sit at (0, 42) when the part
 * carries a locator nub in the cell below, else at (0, 0).
 */
const FRAME: Record<string, { min: [number, number, number]; key: [number, number] }> = {
  'grid-board-4x4': { min: [0, 0, 0], key: [0, 0] },
  'grid-board-2x4': { min: [0, 0, 0], key: [0, 0] },
  'grid-hook': { min: [-13, -16, 5], key: [0, P] },
  'grid-rod-cradle': { min: [-13, -16, 5], key: [0, P] },
  'grid-shelf-2': { min: [-17, -40, 7], key: [0, 0] },
  'grid-shelf-3': { min: [-17, -40, 7], key: [0, 0] },
  'grid-bin-2': { min: [-17, -60, 8], key: [0, 0] },
  'grid-cup': { min: [-20, -46, 5], key: [0, P] },
  'grid-lure-garage': { min: [-17, -88, 8], key: [0, 0] },
  'grid-name-plate': { min: [-21, -20, 8], key: [0, 0] },
};

const cache = new Map<string, Promise<BufferGeometry>>();

/** Loads a print file once, turns it back into its installed frame and puts its first key at the origin. */
function loadInstalled(partId: string): Promise<BufferGeometry> | null {
  const frame = FRAME[partId];
  const file = printFile(partId);
  if (!frame || !file.file) return null;
  const path = file.file.path;
  let p = cache.get(partId);
  if (!p) {
    p = new STLLoader().loadAsync(path).then((g) => {
      const [rx, ry, rz] = PRINT_ROTATION[file.print_orientation] ?? [0, 0, 0];
      g.rotateZ(-(rz * Math.PI) / 180);
      g.rotateY(-(ry * Math.PI) / 180);
      g.rotateX(-(rx * Math.PI) / 180);
      g.computeBoundingBox();
      const b = g.boundingBox!;
      g.translate(frame.min[0] - b.min.x - frame.key[0], frame.min[1] - b.min.y - frame.key[1], frame.min[2] - b.min.z);
      g.computeVertexNormals();
      return g;
    });
    cache.set(partId, p);
  }
  return p;
}

function useInstalled(partId: string | null): BufferGeometry | null {
  const [g, setG] = useState<{ id: string; geometry: BufferGeometry } | null>(null);
  useEffect(() => {
    if (!partId) return;
    let alive = true;
    loadInstalled(partId)?.then((geometry) => { if (alive) setG({ id: partId, geometry }); }).catch(() => undefined);
    return () => { alive = false; };
  }, [partId]);
  return g?.id === partId ? g.geometry : null;
}

/** The grid part behind a catalogue handle: the one print file the FRAME table knows. */
function partIdFor(handle: string): string | null {
  const product = productByHandle(handle);
  return product?.parts.find((pp) => FRAME[pp.id])?.id ?? null;
}

const EASE = (t: number) => 1 - Math.pow(1 - t, 3);
const SETTLE_MS = 460;

/** Drop in from 30 mm out with the key upright, then the quarter-turn that locks it. */
function Settle({ delay, children }: { delay: number; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  const start = useRef<number | null>(null);
  const done = useRef(false);
  const { invalidate } = useThree();
  useEffect(() => { invalidate(); }, [invalidate]);
  useFrame(({ clock }) => {
    if (done.current || !ref.current) return;
    const now = clock.getElapsedTime() * 1000;
    if (start.current === null) start.current = now + delay;
    const t = Math.min(1, Math.max(0, (now - start.current) / SETTLE_MS));
    const drop = EASE(Math.min(1, t / 0.55));
    const turn = t < 0.55 ? 0 : EASE((t - 0.55) / 0.45);
    ref.current.position.z = (1 - drop) * 30 * S;
    ref.current.rotation.z = -(1 - turn) * (Math.PI / 2);
    if (t >= 1) { done.current = true; ref.current.position.z = 0; ref.current.rotation.z = 0; }
    invalidate();
  });
  return <group ref={ref}>{children}</group>;
}

function Lettering({ text, colour, x0, x1, y0, y1, z }: { text: string; colour: string; x0: number; x1: number; y0: number; y1: number; z: number }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = Math.round((1024 * (y1 - y0)) / (x1 - x0));
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = colour;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let size = c.height * 0.8;
    ctx.font = `600 ${size}px "Instrument Sans", system-ui, sans-serif`;
    while (ctx.measureText(text).width > c.width * 0.92 && size > 8) { size -= 4; ctx.font = `600 ${size}px "Instrument Sans", system-ui, sans-serif`; }
    ctx.fillText(text, c.width / 2, c.height / 2);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [text, colour, x0, x1, y0, y1]);
  return (
    <mesh position={[((x0 + x1) / 2) * S, ((y0 + y1) / 2) * S, z * S + 0.0015]}>
      <planeGeometry args={[(x1 - x0) * S, (y1 - y0) * S]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

function Part({ placement, design, selected, delay, onSelect, toScene }: { placement: Placement; design: Design; selected: boolean; delay: number; onSelect?: (id: string) => void; toScene: (x: number, y: number) => [number, number] }) {
  const partId = partIdFor(placement.handle);
  const geometry = useInstalled(partId);
  const product = productByHandle(placement.handle);
  if (!geometry || !partId || !product?.footprint) return null;
  const { x, y } = cellOrigin(placement.col, placement.row);
  const [cx, cy] = toScene(x + P / 2, y + P / 2);
  const accent = colourHex(design.accessoryColour);
  const ink = colourInk(design.accessoryColour);
  const plate = product.kind === 'plate';
  return (
    <group position={[cx, cy, 0]}>
      <Settle delay={delay}>
        <group
          onClick={onSelect ? (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(placement.id); } : undefined}
          onPointerOver={onSelect ? (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; } : undefined}
          onPointerOut={onSelect ? () => { document.body.style.cursor = ''; } : undefined}
        >
          <mesh geometry={geometry} scale={[S, S, S]} castShadow receiveShadow>
            <meshStandardMaterial color={accent} roughness={0.82} metalness={0} emissive={selected ? '#916a70' : '#000000'} emissiveIntensity={selected ? 0.35 : 0} />
          </mesh>
          {plate && design.name && <Lettering text={design.name} colour={ink} x0={1} x1={125} y0={-13} y1={13} z={13} />}
          {selected && (
            <mesh position={[0, 0, (T + 0.6) * S]}>
              <ringGeometry args={[(P / 2 - 3) * S, (P / 2) * S, 48]} />
              <meshBasicMaterial color="#916a70" transparent opacity={0.9} />
            </mesh>
          )}
        </group>
      </Settle>
    </group>
  );
}

function Board({ partId, position, colour }: { partId: string; position: [number, number, number]; colour: string }) {
  const geometry = useInstalled(partId);
  if (!geometry) return null;
  return (
    <mesh geometry={geometry} position={position} scale={[S, S, S]} castShadow receiveShadow>
      <meshStandardMaterial color={colour} roughness={0.92} metalness={0} />
    </mesh>
  );
}

function Scene({ design, interactive, tool, selected, onCell, onSelect }: Props) {
  const { w, h } = fieldSize(design.field);
  const toScene = (xmm: number, ymm: number): [number, number] => [(xmm - w / 2) * S, (h / 2 - ymm) * S];
  const [hover, setHover] = useState<string | null>(null);

  // A part mounts once, when it is placed, and settles then. The first paint assembles the design in order.
  const [stagger] = useState(() => new Map(design.placements.map((p, i) => [p.id, 120 + i * 90])));

  const cells = useMemo(() => {
    if (!interactive || !tool) return [] as { col: number; row: number }[];
    const occupied = new Set<string>();
    for (const pl of design.placements) {
      const product = productByHandle(pl.handle);
      if (!product?.footprint) continue;
      for (let r = pl.row; r < pl.row + product.footprint.rows; r++) for (let c = pl.col; c < pl.col + product.footprint.cols; c++) occupied.add(`${c}:${r}`);
    }
    const cols = design.field.columns.reduce((s, c) => s + c, 0);
    const rows = design.field.rows * (BOARD_MM / P);
    const out: { col: number; row: number }[] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (!occupied.has(`${c}:${r}`)) out.push({ col: c, row: r });
    return out;
  }, [design.placements, design.field, interactive, tool]);

  const boardColour = colourHex(design.boardColour);
  const reach = Math.max(w, h) * S;

  return (
    <>
      <color attach="background" args={['#f5f1f2']} />
      <hemisphereLight args={['#fffdfb', '#d9d2cf', 0.75]} />
      <directionalLight position={[-1.6, 2.4, 3.2]} intensity={1.35} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.00015} shadow-normalBias={0.01}>
        <orthographicCamera attach="shadow-camera" args={[-reach, reach, reach, -reach, 0.5, 9]} />
      </directionalLight>
      <directionalLight position={[2.4, 0.6, 2]} intensity={0.35} />
      {/* the wall: paper, takes the shadow */}
      <mesh position={[0, 0, -0.0012]} receiveShadow>
        <planeGeometry args={[(w + 900) * S, (h + 900) * S]} />
        <meshStandardMaterial color="#fffdfb" roughness={1} />
      </mesh>
      {boards(design.field).map((b, i) => {
        const [bx, by] = toScene(b.x, b.y + BOARD_MM);
        return <Board key={i} partId={b.cols === 4 ? 'grid-board-4x4' : 'grid-board-2x4'} position={[bx, by, 0]} colour={boardColour} />;
      })}
      {design.placements.map((pl) => (
        <Part key={pl.id} placement={pl} design={design} selected={selected === pl.id} delay={stagger.get(pl.id) ?? 0} onSelect={interactive ? onSelect : undefined} toScene={toScene} />
      ))}
      {cells.map(({ col, row }) => {
        const { x, y } = cellOrigin(col, row);
        const [cx, cy] = toScene(x + P / 2, y + P / 2);
        const id = `${col}:${row}`;
        return (
          <group key={id} position={[cx, cy, (T + 0.4) * S]}>
            <mesh
              onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onCell?.(col, row); }}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(id); document.body.style.cursor = 'copy'; }}
              onPointerOut={() => { setHover((h) => (h === id ? null : h)); document.body.style.cursor = ''; }}
            >
              <planeGeometry args={[P * S, P * S]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            {hover === id && (
              <mesh>
                <ringGeometry args={[(P / 2 - 4) * S, (P / 2 - 1) * S, 48]} />
                <meshBasicMaterial color="#916a70" transparent opacity={0.85} />
              </mesh>
            )}
          </group>
        );
      })}
    </>
  );
}

export default function Preview3D(props: Props) {
  const { w, h } = fieldSize(props.design.field);
  const dist = Math.max(3.2, (Math.max(w, h * 1.35) / 100) * 1.25);
  return (
    <div className="lv-preview3d" aria-label="3D preview of the board layout, from the print files">
      <Canvas dpr={[1, 1.6]} frameloop="demand" shadows="soft" camera={{ position: [dist * 0.38, dist * 0.14, dist], fov: 32 }} gl={{ antialias: true }}>
        <Scene {...props} />
        <OrbitControls enablePan={false} minDistance={1.4} maxDistance={dist * 2.6} minPolarAngle={0.9} maxPolarAngle={Math.PI / 2 + 0.1} minAzimuthAngle={-1.0} maxAzimuthAngle={1.0} target={[0, 0, 0.08]} />
      </Canvas>
    </div>
  );
}
