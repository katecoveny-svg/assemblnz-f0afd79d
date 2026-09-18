import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { franklinView, FRANKLIN_ASSETS } from './franklin-scene';
import { batchFranklinOffice } from './franklin-batching';
import { AssemblWorldHero } from '@/components/site/assembl-the-work/AssemblWorldHero';

describe('Franklin real 3D homepage', () => {
  it('ships actual named dog meshes and embedded owned textures', () => {
    const bytes=readFileSync('public'+FRANKLIN_ASSETS.model);
    expect(bytes.subarray(0,4).toString()).toBe('glTF');
    expect(bytes.readUInt32LE(4)).toBe(2);
    expect(bytes.length).toBeLessThan(18_000_000);
    const scene=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
    const dog=scene.nodes.filter((n:{name?:string;mesh?:number})=>n.name?.startsWith('Franklin.')&&typeof n.mesh==='number');
    expect(dog.length).toBeGreaterThan(10);
    expect(scene.images.length).toBeGreaterThanOrEqual(5);
    for(const image of scene.images)expect(typeof image.bufferView).toBe('number');
  });
  it('provides three distinct camera positions on desktop and phone', () => {
    for(const compact of [false,true]){
      const frames=[0,.37,.74].map(p=>franklinView(p,compact));
      expect(new Set(frames.map(f=>JSON.stringify(f.position))).size).toBe(3);
      for(const f of frames)for(const n of [...f.position,...f.target])expect(Number.isFinite(n)).toBe(true);
      expect(franklinView(-1,compact)).toEqual(franklinView(0,compact));
      expect(franklinView(Number.NaN,compact)).toEqual(franklinView(0,compact));
    }
  });
  it('batches room objects without mutating source geometry or losing the dog', () => {
    const source=new Group(),material=new MeshStandardMaterial();
    for(let i=0;i<2;i++){const mesh=new Mesh(new BoxGeometry(1,1,1),material);mesh.name='Desk '+i;mesh.position.x=i*2;source.add(mesh);}
    const dog=new Mesh(new BoxGeometry(1,1,1),material);dog.name='Franklin.test';source.add(dog);
    const batched=batchFranklinOffice(source);
    expect(source.children.length).toBe(3);
    expect(batched.children.length).toBe(2);
    expect(batched.userData.franklinAuthoredMeshes).toBe(1);
    expect(batched.children.some(m=>m.name.startsWith('Franklin.'))).toBe(true);
    expect((source.children[0] as Mesh).geometry.getAttribute('position').count).toBe(24);
  });
  it('keeps the headline and three public paths in readable HTML', () => {
    const html=renderToStaticMarkup(createElement(AssemblWorldHero));
    expect(html).toContain('data-world="franklin"');
    expect(html).toContain('assembl');expect(html).toContain('the work.');
    expect(html).toContain(FRANKLIN_ASSETS.poster);expect(html).toContain(FRANKLIN_ASSETS.mobilePoster);
    for(const href of ['/pursuit','/do','/creative-studio'])expect(html).toContain(`href="${href}"`);
    expect(html).toContain('The complete work loop');
    expect(html).not.toContain('https://assembl-pursuit');
    expect(html).not.toContain('from insight to impact');
  });
});
