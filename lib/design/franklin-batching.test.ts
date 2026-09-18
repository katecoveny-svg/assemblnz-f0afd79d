import { describe, expect, it } from 'vitest';
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, PropertyBinding } from 'three';
import { batchFranklinOffice } from './franklin-batching';
describe('loaded Franklin node names',()=>{
 it('recognises the actual GLTFLoader-sanitised form without losing geometry',()=>{
  const scene=new Group();
  const dog=new Mesh(new BoxGeometry(),new MeshStandardMaterial());
  dog.name=PropertyBinding.sanitizeNodeName('Franklin.long torso');
  expect(dog.name).toBe('Franklinlong_torso');
  scene.add(dog);
  const result=batchFranklinOffice(scene);
  expect(result.userData.franklinAuthoredMeshes).toBe(1);
  expect(result.children.length).toBe(1);
 });
});
