'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { CubicBezierCurve3, CurvePath, ExtrudeGeometry, Group, LineCurve3, Plane, TubeGeometry, Vector3 } from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { ASSEMBL_A_PATH, ASSEMBL_A_TRANSFORM } from '@/lib/brand/assembl-mark';

type Pose = { position: [number, number, number]; rotation?: [number, number, number]; scale?: number };
const colours = ['#240B21', '#DAD2F4', '#EAC8DF'] as const;
const point = (x: number, y: number) => new Vector3((x - 32) / 28, (32 - y) / 28, 0);

/** Real refractive geometry. Camera movement changes reflections; no raster billboard. */
export function AssembledGlassD(pose: Pose) {
  const { size } = useThree();
  const pieces = useMemo(() => {
    const spine = new CurvePath<Vector3>();
    spine.add(new LineCurve3(point(16, 12), point(16, 52)));
    const upper = new CurvePath<Vector3>();
    upper.add(new LineCurve3(point(16, 12), point(29, 12)));
    upper.add(new CubicBezierCurve3(point(29, 12), point(44, 12), point(52, 20), point(52, 32)));
    const lower = new CurvePath<Vector3>();
    lower.add(new CubicBezierCurve3(point(52, 32), point(52, 44), point(44, 52), point(29, 52)));
    lower.add(new LineCurve3(point(29, 52), point(16, 52)));
    return [spine, upper, lower].map(curve => ({ geometry: new TubeGeometry(curve, 56, 7 / 56, 24, false), ends: [curve.getPoint(0), curve.getPoint(1)] }));
  }, []);
  useEffect(() => () => pieces.forEach(piece => piece.geometry.dispose()), [pieces]);
  const material = (colour: string) => <meshPhysicalMaterial color={colour} metalness={0} roughness={0.055} transmission={size.width < 600 ? 0.5 : 0.86} thickness={0.3} ior={1.46} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.05} />;
  return <group {...pose} name="canonical-assembled-glass-D">
    {pieces.map((piece, i) => <group key={i}>
      <mesh geometry={piece.geometry}>{material(colours[i])}</mesh>
      {piece.ends.filter((_, n) => i === 0 || (i === 2 && n === 0)).map((end, n) => <mesh key={n} position={end}><sphereGeometry args={[7 / 56, 32, 24]} />{material(colours[i])}</mesh>)}
    </group>)}
    <mesh position={point(30, 32)}><sphereGeometry args={[6 / 28, 32, 24]} />{material(colours[2])}</mesh>
  </group>;
}

/** Exact outlined lowercase a, divided into three material pieces in its own plane. */
export function AssembledGlassA(pose: Pose) {
  const group = useRef<Group>(null);
  const { size, invalidate } = useThree();
  const geometry = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${ASSEMBL_A_PATH}" transform="${ASSEMBL_A_TRANSFORM}" fill="#240B21"/></svg>`;
    const shapes = new SVGLoader().parse(svg).paths.flatMap(path => SVGLoader.createShapes(path));
    const result = new ExtrudeGeometry(shapes, { depth: 3.3, bevelEnabled: true, bevelThickness: 1.05, bevelSize: 0.8, bevelSegments: 3, curveSegments: 16 });
    result.translate(-32, -32, -1.65);
    result.scale(1 / 28, -1 / 28, 1 / 28);
    // SVG y points down. Reflecting it changes triangle winding as well as
    // positions; keep the physical material's front faces and normals aligned.
    for (const attribute of Object.values(result.attributes)) {
      const values = attribute.array;
      for (let vertex = 0; vertex < attribute.count; vertex += 3) {
        for (let channel = 0; channel < attribute.itemSize; channel++) {
          const a = (vertex + 1) * attribute.itemSize + channel;
          const b = (vertex + 2) * attribute.itemSize + channel;
          const previous = values[a]; values[a] = values[b]; values[b] = previous;
        }
      }
      attribute.needsUpdate = true;
    }
    return result;
  }, []);
  const localPlanes = useMemo(() => [
    [new Plane(new Vector3(1, 0, 0), -0.405)],
    [new Plane(new Vector3(-1, 0, 0), 0.395), new Plane(new Vector3(0, 1, 0), -0.155)],
    [new Plane(new Vector3(-1, 0, 0), 0.395), new Plane(new Vector3(0, -1, 0), 0.145)],
  ], []);
  const planes = useMemo(() => localPlanes.map(part => part.map(plane => plane.clone())), [localPlanes]);
  useLayoutEffect(() => {
    group.current?.updateWorldMatrix(true, true);
    if (group.current) planes.forEach((part, i) => part.forEach((plane, n) => plane.copy(localPlanes[i][n]).applyMatrix4(group.current!.matrixWorld)));
    invalidate();
  }, [planes, localPlanes, invalidate]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <group ref={group} {...pose} name="canonical-lowercase-assembled-glass-a">
    {planes.map((clip, i) => <mesh key={i} geometry={geometry}>
      <meshPhysicalMaterial color={colours[i]} clippingPlanes={clip} clipShadows metalness={0} roughness={0.065} transmission={size.width < 600 ? 0.5 : 0.86} thickness={0.25} ior={1.46} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.05} />
    </mesh>)}
  </group>;
}
