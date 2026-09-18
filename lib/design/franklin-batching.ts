import { BufferGeometry, Group, Mesh, type Material, type Object3D, type BufferAttribute, type InterleavedBufferAttribute } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Batch static geometry without changing shape or texture UVs.
 * GLTFLoader sanitises periods from node names, so accept the owned Franklin prefix.
 * Cached source geometry and materials remain untouched.
 */
export function batchFranklinOffice(source: Object3D): Group {
  const groups = new Map<string, { name: string; material: Material; parts: BufferGeometry[] }>();
  let franklinCount = 0;
  const output = new Group();
  output.name = 'FranklinOffice';
  source.updateMatrixWorld(true);
  source.traverse(object => {
    if (!(object instanceof Mesh)) return;
    const dog = object.name.startsWith('Franklin');
    if (dog) franklinCount++;
    const geometry: BufferGeometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
    if (Array.isArray(object.material)) {
      const mesh = new Mesh(geometry, object.material);
      mesh.name = object.name;
      mesh.castShadow = true; mesh.receiveShadow = true;
      output.add(mesh);
      return;
    }
    const attributes = Object.entries(geometry.attributes) as [string, BufferAttribute | InterleavedBufferAttribute][];
    const signature = attributes.sort(([a],[b]) => a.localeCompare(b)).map(([name,a]) => `${name}:${a.itemSize}:${a.normalized}:${a.array.constructor.name}`).join('|');
    const key = `${dog?'dog':'room'}:${object.material.uuid}:${Boolean(geometry.index)}:${signature}`;
    let group = groups.get(key);
    if (!group) { group = { name: `${dog?'Franklin':'Office'}.${object.material.name}`, material: object.material, parts: [] }; groups.set(key, group); }
    group.parts.push(geometry);
  });
  for (const group of groups.values()) {
    const merged = mergeGeometries(group.parts, false);
    if (!merged) {
      for (const part of group.parts) {
        const mesh = new Mesh(part, group.material); mesh.name=group.name;
        mesh.castShadow=true; mesh.receiveShadow=true; output.add(mesh);
      }
      continue;
    }
    for (const part of group.parts) part.dispose();
    merged.computeBoundingSphere();
    const mesh = new Mesh(merged, group.material);
    mesh.name=group.name; mesh.castShadow=true; mesh.receiveShadow=true; output.add(mesh);
  }
  output.userData.franklinAuthoredMeshes = franklinCount;
  return output;
}
