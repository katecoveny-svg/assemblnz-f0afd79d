'use client';

import { useTexture } from '@react-three/drei/core/Texture';
import { SRGBColorSpace } from 'three';
import { useEffect } from 'react';

type Props={kind:'assembl'|'do';position:[number,number,number];rotation?:[number,number,number];scale?:number};
/** Locked 2D identity artwork placed inside the real architectural scene.
 * These are artwork planes, not a reconstruction of the canonical glass mesh.
 * White source paper is keyed at render time; source bytes remain untouched. */
export function CanonicalGlassSceneArtwork({kind,...pose}:Props){
  const texture=useTexture(kind==='do'?'/brand/do-assembled-plum.webp':'/brand/assembl-assembled-plum.webp');
  useEffect(()=>{texture.colorSpace=SRGBColorSpace;texture.needsUpdate=true;},[texture]);
  return <mesh {...pose} name={`locked-${kind}-glass-artwork-plane`}>
    <planeGeometry args={[3.45,2.3]}/>
    <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} onBeforeCompile={(shader: {fragmentShader: string})=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        float identityTint = 1.0 - min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));
        diffuseColor.a *= smoothstep(0.05,0.30,identityTint);
        float artworkEdge = length((vMapUv-vec2(0.5,0.54))/vec2(0.39,0.52));
        diffuseColor.a *= 1.0-smoothstep(0.82,1.0,artworkEdge);
        diffuseColor.a *= smoothstep(0.10,0.19,vMapUv.y);
      `);
    }}/>
  </mesh>;
}
