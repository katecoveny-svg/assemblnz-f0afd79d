'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Color, ExtrudeGeometry, Float32BufferAttribute, Group, Path, Plane, Shape, Vector3 } from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { ASSEMBL_A_PATH, ASSEMBL_A_TRANSFORM } from '@/lib/brand/assembl-mark';

type Pose = { position: [number, number, number]; rotation?: [number, number, number]; scale?: number };
const colours = ['#240B21', '#DAD2F4', '#EAC8DF'] as const;
const point = (x: number, y: number) => new Vector3((x - 32) / 28, (32 - y) / 28, 0);

/** Real refractive geometry. Camera movement changes reflections; no raster billboard. */
export function AssembledGlassD(pose: Pose) {
  const { size } = useThree();
  const geometry = useMemo(() => {
    // One watertight rounded outline: intersecting transmissive tubes and caps
    // refract each other at the joins and create the old jagged grey protrusions.
    const outer = new Shape();
    outer.moveTo(16, 8.5); outer.lineTo(29, 8.5);
    outer.bezierCurveTo(46, 8.5, 55.5, 18, 55.5, 32);
    outer.bezierCurveTo(55.5, 46, 46, 55.5, 29, 55.5);
    outer.lineTo(16, 55.5); outer.quadraticCurveTo(12.5, 55.5, 12.5, 52);
    outer.lineTo(12.5, 12); outer.quadraticCurveTo(12.5, 8.5, 16, 8.5);
    const hole = new Path();
    hole.moveTo(19.5, 17.5); hole.lineTo(19.5, 46.5);
    hole.quadraticCurveTo(19.5, 48.5, 21.5, 48.5); hole.lineTo(29, 48.5);
    hole.bezierCurveTo(42, 48.5, 48.5, 42, 48.5, 32);
    hole.bezierCurveTo(48.5, 22, 42, 15.5, 29, 15.5);
    hole.lineTo(21.5, 15.5); hole.quadraticCurveTo(19.5, 15.5, 19.5, 17.5); hole.closePath();
    outer.holes.push(hole);
    const result = new ExtrudeGeometry(outer, { depth: 4, bevelEnabled: true, bevelThickness: 1.45, bevelSize: 0.7, bevelSegments: 5, curveSegments: 32 });
    result.translate(-32, -32, -2); result.scale(1 / 28, -1 / 28, 1 / 28);
    // Reflect SVG y and restore triangle winding. Assign materials per triangle
    // in this single solid, rather than overlapping transparent meshes.
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
    const positions = result.attributes.position;
    const vertexColours: number[] = [];
    const plum = new Color('#65404F');
    const lilac = new Color(colours[1]); const petal = new Color(colours[2]);
    for (let vertex = 0; vertex < positions.count; vertex++) {
      const x = positions.getX(vertex); const y = positions.getY(vertex);
      const colour = petal.clone().lerp(lilac, Math.max(0, Math.min(1, y * 4 + 0.5)));
      colour.lerp(plum, Math.max(0, Math.min(1, (-x - 0.38) * 12)));
      vertexColours.push(colour.r, colour.g, colour.b);
    }
    result.setAttribute('color', new Float32BufferAttribute(vertexColours, 3));
    // Extrusion duplicates triangle vertices. Weld the untextured solid before
    // recomputing normals so bevels reflect smoothly across triangle joins.
    result.deleteAttribute('normal'); result.deleteAttribute('uv');
    const smooth = mergeVertices(result, 0.00001); smooth.computeVertexNormals();
    result.dispose();
    return smooth;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <group {...pose} name="canonical-assembled-glass-D">
    <mesh geometry={geometry}><meshPhysicalMaterial vertexColors metalness={0} roughness={0.16} transmission={size.width < 600 ? 0.38 : 0.58} thickness={0.16} ior={1.32} clearcoat={1} clearcoatRoughness={0.12} envMapIntensity={1.35} /></mesh>
    <mesh position={point(30, 32)}><sphereGeometry args={[6 / 28, 32, 24]} /><meshPhysicalMaterial color={colours[2]} roughness={0.16} transmission={0.5} thickness={0.16} ior={1.32} clearcoat={1} envMapIntensity={1.35} /></mesh>
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
      <meshPhysicalMaterial color={colours[i]} clippingPlanes={clip} clipShadows metalness={0} roughness={0.16} transmission={size.width < 600 ? 0.38 : 0.58} thickness={0.16} ior={1.32} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.05} />
    </mesh>)}
  </group>;
}
