'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useEffect, useRef, type ReactNode } from 'react';
import { Group } from 'three';
import { RoundedBox } from '@react-three/drei/core/RoundedBox';

const plum = '#492b3e', rose = '#916a70', petal = '#eac8df', paper = '#fffdfb', lilac = '#dad2f4';
type Vec = [number, number, number];
function Block({ at = [0, 0, 0], size, color = paper, rotation = [0, 0, 0] }: { at?: Vec; size: Vec; color?: string; rotation?: Vec }) {
  return <RoundedBox position={at} rotation={rotation} args={size} radius={Math.min(...size) * .22} smoothness={2} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.48} metalness={.08} /></RoundedBox>;
}
function Ball({ at, scale = [.12, .12, .12], color = rose }: { at: Vec; scale?: Vec; color?: string }) {
  return <mesh position={at} scale={scale} castShadow><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color={color} roughness={.35} metalness={.12} /></mesh>;
}
function Bar({ at, length, radius = .025, rotation = [0, 0, 0], color = rose }: { at: Vec; length: number; radius?: number; rotation?: Vec; color?: string }) {
  return <mesh position={at} rotation={rotation} castShadow><cylinderGeometry args={[radius, radius, length, 16]} /><meshStandardMaterial color={color} roughness={.3} metalness={.3} /></mesh>;
}
function Wheel({ at }: { at: Vec }) {
  return <mesh position={at} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.12, .12, .075, 24]} /><meshStandardMaterial color={plum} roughness={.4} /></mesh>;
}
function Trolley() {
  return <group rotation={[0, -.25, 0]}>
    <Block at={[0,.38,0]} size={[.94,.06,.64]} color={petal} />
    {[-.34,.34].map(x => [-.25,.25].map(z => <Wheel key={`${x}${z}`} at={[x,.15,z]} />))}
    {[-.34,.34].map(x => <Bar key={x} at={[x,.28,0]} length={.54} rotation={[Math.PI/2,0,0]} color={plum} />)}
    {[-.34,-.17,0,.17,.34].map(x => [-.31,.31].map(z => <Bar key={`${x}${z}`} at={[x,.65,z]} length={.54} />))}
    {[-.43,.43].map(x => [-.22,0,.22].map(z => <Bar key={`${x}${z}`} at={[x,.65,z]} length={.54} />))}
    {[.48,.68,.91].map(y => <group key={y}>{[-.31,.31].map(z => <Bar key={z} at={[0,y,z]} length={.94} rotation={[0,0,Math.PI/2]} />)}{[-.45,.45].map(x => <Bar key={x} at={[x,y,0]} length={.63} rotation={[Math.PI/2,0,0]} />)}</group>)}
    <Bar at={[-.56,.96,0]} length={.7} rotation={[Math.PI/2,0,0]} radius={.045} color={plum} />
    {[-.3,.3].map(z => <Bar key={z} at={[-.51,.86,z]} length={.3} rotation={[0,0,-.4]} />)}
    <Block at={[-.17,.72,0]} size={[.25,.56,.28]} color={paper} rotation={[0,0,.14]} />
    <Ball at={[.22,.64,.05]} scale={[.2,.2,.18]} color={rose} /><Ball at={[.13,.84,.08]} scale={[.16,.16,.15]} color={petal} />
    <Ball at={[.18,.98,.08]} scale={[.07,.025,.1]} color={plum} />
  </group>;
}
function Newspaper({ flap }: { flap: React.RefObject<Group | null> }) {
  return <group rotation={[.08,.1,-.08]} position={[0,.24,0]}>
    {[0,.025,.05].map(y => <Block key={y} at={[0,y,0]} size={[1.12,.02,.8]} color={paper} />)}
    <group ref={flap} position={[-.55,.07,0]}>
      <Block at={[.55,0,0]} size={[1.1,.025,.8]} />
      <Block at={[.55,.017,-.23]} size={[.82,.012,.09]} color={plum} />
      <Block at={[.29,.018,.07]} size={[.3,.012,.3]} color={petal} />
      {[0,.1,.2].map(z => <Block key={z} at={[.74,.018,z]} size={[.37,.012,.022]} color={rose} />)}
      <Block at={[.55,.018,.31]} size={[.82,.012,.025]} color={rose} />
    </group>
  </group>;
}
function Plane() {
  return <group rotation={[0,-.25,0]} position={[0,.6,0]}>
    <Ball at={[0,0,0]} scale={[.68,.12,.14]} color={paper} />
    <Block at={[.04,.015,0]} size={[.28,.045,1.4]} color={petal} rotation={[0,-.18,0]} />
    <Block at={[-.46,.04,0]} size={[.2,.04,.58]} color={rose} />
    <Block at={[-.48,.17,0]} size={[.24,.3,.035]} color={plum} rotation={[0,0,.25]} />
    {[.25,.12,-.01,-.14].map(x => <Ball key={x} at={[x,.05,.115]} scale={[.025,.035,.015]} color={plum} />)}
    <Ball at={[.48,.055,.025]} scale={[.11,.065,.1]} color={plum} />
    {[-.4,.4].map(z => <Ball key={z} at={[.02,-.09,z]} scale={[.18,.08,.08]} color={plum} />)}
  </group>;
}
function Envelope({ at, color = paper }: { at: Vec; color?: string }) {
  return <group position={at} rotation={[0,0,.05]}><Block size={[.55,.035,.36]} color={color} /><Block at={[0,.024,-.02]} size={[.29,.015,.29]} color={petal} rotation={[0,Math.PI/4,0]} /></group>;
}
function Desk({ flap }: { flap: React.RefObject<Group | null> }) {
  return <group><Block at={[0,.45,0]} size={[1.2,.09,.7]} color={rose} />{[-.48,.48].map(x => [-.24,.24].map(z => <Bar key={`${x}${z}`} at={[x,.22,z]} length={.44} radius={.035} color={plum} />))}
    <Block at={[-.25,.64,-.18]} size={[.5,.32,.035]} color={plum} rotation={[-.12,0,0]} /><Block at={[-.25,.51,.05]} size={[.5,.025,.3]} color={lilac} />
    <group ref={flap}><Envelope at={[.32,.53,.04]} /><Envelope at={[.35,.59,-.02]} color={lilac} /></group>
    <Bar at={[.47,.63,-.23]} length={.24} radius={.07} color={petal} />
  </group>;
}
function Weights({ flap }: { flap: React.RefObject<Group | null> }) {
  return <group position={[0,.25,0]} rotation={[0,.25,0]}><Block at={[0,-.17,0]} size={[1.25,.06,.68]} color={petal} />
    <group ref={flap}><Bar at={[0,.13,0]} length={1.1} rotation={[0,0,Math.PI/2]} radius={.045} color={rose} />
    {[-.42,.42].map(x => <group key={x}>{[-.06,.06].map(dx => <mesh key={dx} position={[x+dx,.13,0]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.23,.23,.1,12]} /><meshStandardMaterial color={dx < 0 ? plum : rose} roughness={.45} /></mesh>)}</group>)}
  </group></group>;
}
function Objects({ kind, reduced, gesture }: { kind: string; reduced: boolean; gesture: number }) {
  const root = useRef<Group>(null), flap = useRef<Group>(null), progress = useRef(3);
  const { invalidate } = useThree();
  useEffect(() => { progress.current = reduced ? 3 : 0; invalidate(); }, [gesture,reduced,invalidate]);
  useFrame((_, delta) => {
    progress.current = Math.min(3, progress.current + Math.min(delta,.05));
    const t = progress.current / 3, wave = Math.sin(t*Math.PI), settle = Math.sin(t*Math.PI*2) * (1-t);
    if (!root.current) return;
    root.current.position.x = kind === 'groceries' ? -.3 * (1-t)**2 : kind === 'flight' ? -.22*(1-t) : 0;
    root.current.position.y = kind === 'flight' ? wave*.2 : 0;
    root.current.rotation.z = kind === 'flight' ? settle*.18 : 0;
    if (flap.current) { flap.current.rotation.z = kind === 'newsletter' ? .08 + wave*.55 : 0; flap.current.position.y = kind === 'desk' ? wave*.18 : kind === 'weights' ? wave*.22 : flap.current.position.y; }
    if (t < 1 && !reduced) invalidate();
  });
  return <group ref={root}>{kind==='groceries'?<Trolley />:kind==='newsletter'?<Newspaper flap={flap} />:kind==='flight'?<Plane />:kind==='desk'?<Desk flap={flap} />:<Weights flap={flap} />}</group>;
}
class SceneBoundary extends Component<{children: ReactNode}, {failed:boolean}> {
  state={failed:false}; static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed ? null : this.props.children;}
}
export default function DoMiniatureScene(props: {kind:string; reduced:boolean; gesture:number}) {
  return <SceneBoundary><Canvas orthographic shadows frameloop="demand" dpr={1} camera={{position:[3,2.6,4],zoom:67,near:.1,far:20}} gl={{alpha:true,antialias:true,powerPreference:'low-power'}} style={{pointerEvents:'none'}}>
    <ambientLight intensity={1.3} /><directionalLight position={[-3,5,4]} intensity={3} castShadow shadow-mapSize={[256,256]} shadow-camera-left={-2} shadow-camera-right={2} shadow-camera-top={2} shadow-camera-bottom={-2} shadow-bias={-.002} /><directionalLight position={[3,2,-2]} intensity={1} color={petal} />
    <group position={[0,-.4,0]}><Objects {...props} /><mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[4,4]} /><shadowMaterial opacity={.16} color={plum} /></mesh></group>
  </Canvas></SceneBoundary>;
}
