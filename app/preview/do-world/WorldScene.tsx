'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useTexture } from '@react-three/drei/core/Texture';
import { useGLTF } from '@react-three/drei/core/Gltf';
import { Environment } from '@react-three/drei/core/Environment';
import { Lightformer } from '@react-three/drei/core/Lightformer';
import { BackSide, CatmullRomCurve3, Mesh, Vector3, type Object3D } from 'three';

function Identity() {
  const texture = useTexture('/do/canvas/dimensional-d.png');
  return <mesh position={[3.5,2.65,-15]}><planeGeometry args={[1.8,1.8]}/><meshBasicMaterial map={texture} transparent toneMapped={false}/></mesh>;
}
function Architecture({onReady}: {onReady: (ready: boolean) => void}) {
  const { scene } = useGLTF('/do/world/atelier.glb', '/do/office/draco/');
  const model = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((object: Object3D) => {
      if (object instanceof Mesh) { object.castShadow = true; object.receiveShadow = true; }
    });
    return clone;
  }, [scene]);
  useEffect(() => { onReady(true); }, [onReady]);
  return <primitive object={model} />;
}
function Dusk() {
  return <mesh><sphereGeometry args={[130,24,16]}/><shaderMaterial side={BackSide}
    vertexShader={`varying vec3 direction; void main(){direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
    fragmentShader={`varying vec3 direction; void main(){float h=normalize(direction).y; vec3 low=vec3(.34,.20,.27); vec3 high=vec3(.11,.08,.17); vec3 sky=mix(low,high,smoothstep(-.06,.65,h)); sky+=vec3(.16,.085,.055)*exp(-pow((h-.015)*12.,2.)); gl_FragColor=vec4(sky,1.);}`}/></mesh>;
}
function Room({onReady}: {onReady: (ready: boolean) => void}) {
  return <>
    <Dusk/><Suspense fallback={null}><Architecture onReady={onReady}/><Identity/></Suspense>
    <Environment resolution={128} frames={1} environmentIntensity={.55}>
      <Lightformer position={[-10,5,0]} rotation={[0,Math.PI/2,0]} scale={[30,8,1]} color="#e9c1cc" intensity={2}/>
      <Lightformer position={[0,8,0]} rotation={[Math.PI/2,0,0]} scale={[8,40,1]} color="#ffcfaf" intensity={2}/>
    </Environment>
    <hemisphereLight args={['#e0bdcb','#35252e',1.2]}/>
    <directionalLight position={[-12,7,2]} intensity={2.4} color="#e1b0ac" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-normalBias={.03}/>
    {[0,-15,-28].map(z => <pointLight key={z} position={[3,4.8,z]} intensity={60} color="#ffd0bc" distance={16} decay={2}/>)}
  </>;
}
function Journey({progress,paused}:{progress:RefObject<number>;paused:boolean}) {
  const current = useRef(0);
  const path = useMemo(() => new CatmullRomCurve3([
    new Vector3(3.8,2.1,9), new Vector3(-2.5,2.05,0),
    new Vector3(-1.6,2.05,-11), new Vector3(-1,2.05,-23), new Vector3(1.5,2.05,-29)
  ]), []);
  const gaze = useMemo(() => new CatmullRomCurve3([
    new Vector3(-5,2,-4), new Vector3(3,1.9,-7),
    new Vector3(3.5,2.3,-16), new Vector3(3,1.8,-28), new Vector3(3,1.7,-32)
  ]), []);
  const target = useMemo(() => new Vector3(), []);
  const { camera, invalidate } = useThree();
  useEffect(() => {
    const redraw = () => { if (!paused) invalidate(); };
    addEventListener('scroll', redraw, {passive:true});
    invalidate();
    return () => removeEventListener('scroll', redraw);
  }, [paused, invalidate]);
  useFrame((_,delta)=>{
    if(!paused) current.current += (progress.current-current.current)*(1-Math.exp(-Math.min(delta,.05)*3));
    const t=current.current;
    path.getPoint(t,camera.position);
    gaze.getPoint(t,target);
    camera.lookAt(target);
    if(!paused && Math.abs(progress.current-current.current)>.0001) invalidate();
  });
  return null;
}
export default function WorldScene(props:{progress:RefObject<number>;paused:boolean}) {
  const [ready,setReady] = useState(false);
  return <Canvas style={{opacity:ready?1:0}} shadows frameloop="demand" camera={{position:[-2,2.05,9],fov:62,near:.1,far:180}} dpr={[1,1.5]} gl={{antialias:true}}><color attach="background" args={['#574551']}/><fog attach="fog" args={['#574551',35,110]}/><Room onReady={setReady}/><Journey {...props}/></Canvas>;
}
