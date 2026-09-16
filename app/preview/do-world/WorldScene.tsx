'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react';
import { useTexture } from '@react-three/drei/core/Texture';
import { RoundedBox } from '@react-three/drei/core/RoundedBox';
import { CatmullRomCurve3, Vector3 } from 'three';

function Slab({position, scale, color, metalness=0}: {position:[number,number,number];scale:[number,number,number];color:string;metalness?:number}) {
  return <RoundedBox position={position} args={scale} radius={Math.min(.07, ...scale.map(n=>n/3))} smoothness={2} receiveShadow castShadow><meshStandardMaterial color={color} roughness={.55} metalness={metalness}/></RoundedBox>;
}
function LightRibbon({x}: {x:number}) {
  const curve = useMemo(() => new CatmullRomCurve3(Array.from({length:40},(_,i) => new Vector3(x+Math.sin(i/8)*1.7,5.1,8-i))),[x]);
  return <mesh><tubeGeometry args={[curve,120,.055,8,false]}/><meshStandardMaterial color="#ffddce" emissive="#f5aaa7" emissiveIntensity={3}/></mesh>;
}
function Identity() {
  const texture = useTexture('/do/canvas/dimensional-d.png');
  return <mesh position={[3,2.8,-16]}><planeGeometry args={[2.3,2.3]}/><meshBasicMaterial map={texture} transparent toneMapped={false}/></mesh>;
}
function Room() {
  return <>
    <Slab position={[0,-.2,-9]} scale={[22,.4,46]} color="#b8a396"/>
    <Slab position={[0,5.5,-9]} scale={[22,.3,46]} color="#3d272e"/>
    <Suspense fallback={null}><Identity/></Suspense><LightRibbon x={0}/><LightRibbon x={5}/>
    {Array.from({length:17},(_,i)=><group key={i} position={[-9,0,10-i*2.6]}><Slab position={[0,2.7,0]} scale={[.07,5.4,.07]} color="#6b4740" metalness={.7}/><mesh position={[0,2.7,-1.3]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[2.6,5.4]}/><meshPhysicalMaterial color="#b9869a" transparent opacity={.12} roughness={.1} side={2} depthWrite={false}/></mesh></group>)}
    {[-2,-16,-28].map((z,i)=><group key={z}>
      <Slab position={[3,.95,z]} scale={[5,.16,2.4]} color="#694539"/>
      {[-1.6,1.6].map(x=><mesh key={x} position={[3+x,.42,z]} castShadow><cylinderGeometry args={[.3,.38,.84,32]}/><meshStandardMaterial color="#38232b" roughness={.6}/></mesh>)}
      {[-1.5,0,1.5].map(x=><group key={x}><Slab position={[3+x,.48,z+1.9]} scale={[.9,.2,.9]} color="#c0a49b"/><Slab position={[3+x,.9,z+2.25]} scale={[.9,.8,.15]} color="#ab8388"/><Slab position={[3+x,1.055,z]} scale={[.75,.018,.55]} color="#fff1df"/></group>)}
      <pointLight position={[3,3.8,z]} intensity={25} color={i===1?'#eab0cf':'#ffd5b7'} distance={12}/>
      <Slab position={[9,2.5,z-4]} scale={[.3,5,5]} color="#4a3039"/>
    </group>)}
    <mesh rotation={[-Math.PI/2,0,0]} position={[-65,-.3,-10]}><planeGeometry args={[110,130]}/><meshStandardMaterial color="#625462" metalness={.75} roughness={.23}/></mesh>
    {Array.from({length:46},(_,i)=><Slab key={i} position={[-45-(i%4)*2, (.6+(i*7%13)/7)/2,-65+i*2.3]} scale={[1.2,.6+(i*7%13)/7,1.4]} color="#3d3342"/>)}
    <hemisphereLight args={['#e0bcc8','#46303b',2]}/><directionalLight position={[-12,7,2]} intensity={3.8} color="#e1b0ac" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-normalBias={.03}/>
  </>;
}
function Journey({progress,paused}:{progress:RefObject<number>;paused:boolean}) {
  const current = useRef(0);
  const { camera, invalidate } = useThree();
  useEffect(() => {
    const redraw = () => { if (!paused) invalidate(); };
    addEventListener('scroll', redraw, {passive:true});
    invalidate();
    return () => removeEventListener('scroll', redraw);
  }, [paused, invalidate]);
  useFrame((_,delta)=>{
    if(!paused) current.current += (progress.current-current.current)*(1-Math.exp(-delta*3));
    const t=current.current;
    camera.position.set(-2+Math.sin(t*Math.PI*2)*1.4,2.05,9-t*34);
    camera.lookAt(1+Math.sin(t*Math.PI)*2,1.9,1-t*34);
    if(!paused && Math.abs(progress.current-current.current)>.0001) invalidate();
  });
  return null;
}
export default function WorldScene(props:{progress:RefObject<number>;paused:boolean}) {
  return <Canvas shadows frameloop="demand" camera={{position:[-2,2.05,9],fov:62,near:.1,far:180}} dpr={[1,1.5]} gl={{antialias:true}}><color attach="background" args={['#574551']}/><fog attach="fog" args={['#574551',35,110]}/><Room/><Journey {...props}/></Canvas>;
}
