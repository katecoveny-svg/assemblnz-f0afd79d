'use client';

import { useMemo } from 'react';
import { Shape, ShapeGeometry, DoubleSide } from 'three';
import { FOOTPRINT, WALL_H, RIDGE_RISE, SLOPE_DROP, DECK, type Phase } from './geometry';

/**
 * VillaModel — the 16C two-bed unit, procedurally built and morphed across the
 * four construction phases. It is NOT Nick's drawings: it is a considered
 * stand-in of the typology (gable, living-end deck, piles for the cross-fall)
 * so the ARC insight layer has a real building to hover over.
 *
 *   consent       — the plan, laid on the ground; ghost planning walls; envelope lines
 *   concept       — solid massing, charcoal, no cladding
 *   construction  — timber framing: studs, plates, rafters, piles, roof exposed
 *   complete       — clad, roofed, glazed, deck down, windows warm at dusk
 */

const CHARCOAL = '#3a3f3a';
const TIMBER = '#c39a63';
const TIMBER_DARK = '#8a6a3d';
const CLAD = '#b98c57';
const CLAD_TRIM = '#7c5a34';
const ROOF = '#3b3833';
const GLASS = '#9fb9bd';
const GLOW = '#f4c987';
const PAPER = '#efe7d3';
const INK = '#2a2722';

const HALF_X = FOOTPRINT.x / 2;
const HALF_Z = FOOTPRINT.z / 2;
const ROOF_ANGLE = Math.atan2(RIDGE_RISE, HALF_X);
const SLOPE_LEN = Math.hypot(HALF_X, RIDGE_RISE);

/** A gable end triangle as a flat shape (used for concept + complete). */
function useGableGeo() {
  return useMemo(() => {
    const s = new Shape();
    s.moveTo(-HALF_X, 0);
    s.lineTo(HALF_X, 0);
    s.lineTo(0, RIDGE_RISE);
    s.closePath();
    return new ShapeGeometry(s);
  }, []);
}

/** The two roof planes + gable ends, shared by concept (charcoal) + complete (dark). */
function Roof({ color, opacity = 1 }: { color: string; opacity?: number }) {
  const gable = useGableGeo();
  return (
    <group position={[0, WALL_H, 0]}>
      {/* left + right slopes — plane laid flat inside a tilt-group so the depth
          runs along the ridge (Z) and only the run (X) tilts up to the ridge */}
      {[-1, 1].map((s) => (
        <group key={s} position={[(s * HALF_X) / 2, RIDGE_RISE / 2, 0]} rotation={[0, 0, -s * ROOF_ANGLE]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[SLOPE_LEN, FOOTPRINT.z + 0.5]} />
            <meshStandardMaterial
              color={color}
              side={DoubleSide}
              roughness={0.85}
              transparent={opacity < 1}
              opacity={opacity}
            />
          </mesh>
        </group>
      ))}
      {/* gable ends */}
      {[-1, 1].map((s) => (
        <mesh key={`g${s}`} geometry={gable} position={[0, 0, s * HALF_Z]} rotation={[0, s === 1 ? 0 : Math.PI, 0]}>
          <meshStandardMaterial color={color} side={DoubleSide} roughness={0.9} transparent={opacity < 1} opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

/** Four solid walls as a hollow box (concept + backing for complete). */
function Walls({ color, opacity = 1 }: { color: string; opacity?: number }) {
  const t = 0.12;
  const mat = (
    <meshStandardMaterial color={color} roughness={0.9} transparent={opacity < 1} opacity={opacity} />
  );
  return (
    <group position={[0, WALL_H / 2, 0]}>
      {/* +Z / -Z (north/south) */}
      {[HALF_Z, -HALF_Z].map((z) => (
        <mesh key={`z${z}`} position={[0, 0, z]}>
          <boxGeometry args={[FOOTPRINT.x, WALL_H, t]} />
          {mat}
        </mesh>
      ))}
      {/* +X / -X (sides) */}
      {[HALF_X, -HALF_X].map((x) => (
        <mesh key={`x${x}`} position={[x, 0, 0]}>
          <boxGeometry args={[t, WALL_H, FOOTPRINT.z]} />
          {mat}
        </mesh>
      ))}
    </group>
  );
}

/** Envelope as line segments — the drawn edge, used in the consent phase. */
function Envelope({ color }: { color: string }) {
  const pts = useMemo(() => {
    // eight verticals + top/bottom rectangles + ridge
    const segs: Array<[number, number, number]> = [];
    const corners: Array<[number, number]> = [
      [-HALF_X, -HALF_Z],
      [HALF_X, -HALF_Z],
      [HALF_X, HALF_Z],
      [-HALF_X, HALF_Z],
    ];
    const push = (a: [number, number, number], b: [number, number, number]) => {
      segs.push(a, b);
    };
    corners.forEach(([x, z], i) => {
      const [nx, nz] = corners[(i + 1) % 4];
      push([x, 0, z], [x, WALL_H, z]); // vertical
      push([x, 0, z], [nx, 0, nz]); // bottom
      push([x, WALL_H, z], [nx, WALL_H, nz]); // top plate
    });
    // ridge + gable lines
    push([0, WALL_H + RIDGE_RISE, -HALF_Z], [0, WALL_H + RIDGE_RISE, HALF_Z]);
    [-HALF_Z, HALF_Z].forEach((z) => {
      push([-HALF_X, WALL_H, z], [0, WALL_H + RIDGE_RISE, z]);
      push([HALF_X, WALL_H, z], [0, WALL_H + RIDGE_RISE, z]);
    });
    return new Float32Array(segs.flat());
  }, []);
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pts, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.8} />
    </lineSegments>
  );
}

/** Consent: the GA plan laid flat + translucent planning-doc walls. */
function ConsentState() {
  return (
    <group>
      {/* the plan, laid on the ground — paper with the room grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[FOOTPRINT.x + 0.6, FOOTPRINT.z + 0.6]} />
        <meshBasicMaterial color={PAPER} transparent opacity={0.92} />
      </mesh>
      {/* faint partition lines on the plan (living / beds / bath) */}
      <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  // cross-partition (beds vs living)
                  -HALF_X, 1.2, 0, HALF_X, 1.2, 0,
                  // bed split
                  0, 1.2, 0, 0, HALF_Z, 0,
                  // bath box
                  HALF_X - 2, -HALF_Z, 0, HALF_X - 2, -HALF_Z + 1.6, 0,
                  HALF_X - 2, -HALF_Z + 1.6, 0, HALF_X, -HALF_Z + 1.6, 0,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={INK} transparent opacity={0.35} />
        </lineSegments>
      </group>
      {/* ghost planning walls — translucent paper standing where walls go */}
      <Walls color={PAPER} opacity={0.16} />
      {/* the drawn envelope */}
      <Envelope color={INK} />
    </group>
  );
}

/** Concept: solid massing, charcoal, no openings. */
function ConceptState() {
  return (
    <group>
      <Walls color={CHARCOAL} />
      <Roof color={CHARCOAL} />
      {/* massing ground slab */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[FOOTPRINT.x + 0.3, 0.1, FOOTPRINT.z + 0.3]} />
        <meshStandardMaterial color="#4a4f4a" roughness={0.95} />
      </mesh>
    </group>
  );
}

/** Construction: timber framing skeleton, rafters, piles. */
function ConstructionState() {
  const studs = useMemo(() => {
    const list: Array<{ p: [number, number, number]; s: [number, number, number] }> = [];
    const t = 0.09;
    const spacing = 0.8;
    // studs along +Z / -Z walls (run in X)
    for (let x = -HALF_X; x <= HALF_X + 0.01; x += spacing) {
      [HALF_Z, -HALF_Z].forEach((z) => list.push({ p: [x, WALL_H / 2, z], s: [t, WALL_H, t] }));
    }
    // studs along side walls (run in Z)
    for (let z = -HALF_Z + spacing; z <= HALF_Z - spacing + 0.01; z += spacing) {
      [HALF_X, -HALF_X].forEach((x) => list.push({ p: [x, WALL_H / 2, z], s: [t, WALL_H, t] }));
    }
    return list;
  }, []);

  const plates = useMemo(() => {
    const t = 0.11;
    return [
      // top + bottom plates on all four walls
      ...[0, WALL_H].flatMap((y) => [
        { p: [0, y, HALF_Z] as [number, number, number], s: [FOOTPRINT.x, t, t] as [number, number, number] },
        { p: [0, y, -HALF_Z] as [number, number, number], s: [FOOTPRINT.x, t, t] as [number, number, number] },
        { p: [HALF_X, y, 0] as [number, number, number], s: [t, t, FOOTPRINT.z] as [number, number, number] },
        { p: [-HALF_X, y, 0] as [number, number, number], s: [t, t, FOOTPRINT.z] as [number, number, number] },
      ]),
    ];
  }, []);

  const rafters = useMemo(() => {
    const list: Array<{ p: [number, number, number]; r: [number, number, number] }> = [];
    const spacing = 0.9;
    for (let z = -HALF_Z; z <= HALF_Z + 0.01; z += spacing) {
      list.push({ p: [-HALF_X / 2, WALL_H + RIDGE_RISE / 2, z], r: [0, 0, ROOF_ANGLE] });
      list.push({ p: [HALF_X / 2, WALL_H + RIDGE_RISE / 2, z], r: [0, 0, -ROOF_ANGLE] });
    }
    return list;
  }, []);

  const piles = useMemo(() => {
    // piles pick up the cross-fall on the downhill (-X) side + under the deck
    const list: Array<[number, number, number]> = [];
    for (let z = -HALF_Z + 0.5; z <= HALF_Z; z += 2.2) {
      list.push([-HALF_X + 0.2, -SLOPE_DROP / 2, z]);
      list.push([HALF_X - 0.2, -SLOPE_DROP / 4, z]);
    }
    return list;
  }, []);

  return (
    <group>
      {studs.map((s, i) => (
        <mesh key={`st${i}`} position={s.p}>
          <boxGeometry args={s.s} />
          <meshStandardMaterial color={TIMBER} roughness={0.8} />
        </mesh>
      ))}
      {plates.map((s, i) => (
        <mesh key={`pl${i}`} position={s.p}>
          <boxGeometry args={s.s} />
          <meshStandardMaterial color={TIMBER_DARK} roughness={0.8} />
        </mesh>
      ))}
      {rafters.map((r, i) => (
        <mesh key={`rf${i}`} position={r.p} rotation={r.r}>
          <boxGeometry args={[SLOPE_LEN, 0.1, 0.09]} />
          <meshStandardMaterial color={TIMBER} roughness={0.8} />
        </mesh>
      ))}
      {/* ridge beam */}
      <mesh position={[0, WALL_H + RIDGE_RISE, 0]}>
        <boxGeometry args={[0.14, 0.16, FOOTPRINT.z]} />
        <meshStandardMaterial color={TIMBER_DARK} roughness={0.8} />
      </mesh>
      {piles.map((p, i) => (
        <mesh key={`pi${i}`} position={[p[0], p[1], p[2]]}>
          <boxGeometry args={[0.16, 1.0 + SLOPE_DROP, 0.16]} />
          <meshStandardMaterial color={TIMBER_DARK} roughness={0.85} />
        </mesh>
      ))}
      {/* sub-floor platform */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[FOOTPRINT.x, 0.12, FOOTPRINT.z]} />
        <meshStandardMaterial color="#9a7b4f" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Complete: clad walls, dark roof, warm glazing, deck. */
function CompleteState() {
  // window openings: two on the sunny +Z wall, one each side
  const windows: Array<{ p: [number, number, number]; s: [number, number, number] }> = [
    { p: [-1.6, 1.35, HALF_Z + 0.02], s: [1.6, 1.5, 0.05] },
    { p: [1.6, 1.35, HALF_Z + 0.02], s: [1.6, 1.5, 0.05] },
    { p: [HALF_X + 0.02, 1.4, -1.5], s: [0.05, 1.3, 1.4] },
    { p: [-HALF_X - 0.02, 1.4, 2.0], s: [0.05, 1.2, 1.2] },
  ];
  return (
    <group>
      {/* clad walls */}
      <Walls color={CLAD} />
      {/* shiplap trim bands — a few horizontal reveals for texture */}
      {[0.5, 1.2, 1.9, 2.5].map((y) => (
        <mesh key={y} position={[0, y, HALF_Z + 0.065]}>
          <boxGeometry args={[FOOTPRINT.x, 0.02, 0.02]} />
          <meshStandardMaterial color={CLAD_TRIM} roughness={0.9} />
        </mesh>
      ))}
      <Roof color={ROOF} />
      {/* floor */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[FOOTPRINT.x, 0.12, FOOTPRINT.z]} />
        <meshStandardMaterial color="#caa877" roughness={0.7} />
      </mesh>
      {/* warm interior glow behind glazing */}
      {windows.map((w, i) => (
        <group key={i}>
          <mesh position={w.p}>
            <boxGeometry args={w.s} />
            <meshStandardMaterial color={GLASS} roughness={0.15} metalness={0.1} transparent opacity={0.55} />
          </mesh>
          <mesh position={[w.p[0] * 0.96, w.p[1], w.p[2] * 0.96]}>
            <boxGeometry args={[w.s[0] * 0.9 || 0.04, w.s[1] * 0.9, w.s[2] * 0.9 || 0.04]} />
            <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
      {/* living-end deck + a couple of piles showing on the downhill side */}
      <mesh position={[1.4, -0.02, HALF_Z + DECK.z / 2]}>
        <boxGeometry args={[DECK.x, 0.1, DECK.z]} />
        <meshStandardMaterial color="#a8814f" roughness={0.85} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[1.4 + s * (DECK.x / 2 - 0.2), -0.5, HALF_Z + DECK.z - 0.2]}>
          <boxGeometry args={[0.14, 1.0, 0.14]} />
          <meshStandardMaterial color={TIMBER_DARK} roughness={0.85} />
        </mesh>
      ))}
      {/* entry step */}
      <mesh position={[1.4, -0.12, HALF_Z + DECK.z + 0.2]}>
        <boxGeometry args={[1.4, 0.16, 0.5]} />
        <meshStandardMaterial color="#8a6a3d" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function VillaModel({ phase }: { phase: Phase }) {
  return (
    <group>
      {phase === 'consent' && <ConsentState />}
      {phase === 'concept' && <ConceptState />}
      {phase === 'construction' && <ConstructionState />}
      {phase === 'complete' && <CompleteState />}
    </group>
  );
}
