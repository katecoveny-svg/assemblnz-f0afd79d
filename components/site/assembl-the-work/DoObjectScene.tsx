"use client";
import {Suspense,useEffect,useMemo} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {OrbitControls,useGLTF} from '@react-three/drei';
import {Bounds} from '@react-three/drei/core/Bounds';
import {Center} from '@react-three/drei/core/Center';
import {AnimationMixer,PMREMGenerator,type AnimationClip} from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
// Three.js owns this mutable renderer scene; update its environment inside the effect.
// eslint-disable-next-line react-hooks/immutability
function Lighting(){const{gl,scene,invalidate}=useThree();useEffect(()=>{const pmrem=new PMREMGenerator(gl),room=new RoomEnvironment(),map=pmrem.fromScene(room,.04);scene.environment=map.texture;invalidate();return()=>{scene.environment=null;map.dispose();pmrem.dispose();room.dispose();};},[gl,scene,invalidate]);return null;}
function Badge({progress}:{progress:number}){const{scene,animations}=useGLTF('/cinematic-nature/do-portable.glb'),mixer=useMemo(()=>new AnimationMixer(scene),[scene]),{invalidate}=useThree();useEffect(()=>{const actions=(animations as AnimationClip[]).map(clip=>mixer.clipAction(clip));actions.forEach(action=>action.play());mixer.setTime(.4+progress*3.4);invalidate();return()=>{actions.forEach(action=>action.stop());};},[animations,mixer,progress,invalidate]);return <group rotation={[Math.PI/2,0,(progress-.5)*.25]}><primitive object={scene}/></group>;}
export default function DoObjectScene({progress}:{progress:number}){return <Canvas frameloop="demand" dpr={[1,1.5]} camera={{position:[0,0,9],fov:40}} aria-label="Interactive portable DO badge. Drag to turn it; scroll to bring its layers together."><color attach="background" args={['#240b21']}/><ambientLight intensity={1.3}/><directionalLight position={[-3,5,6]} intensity={3} color="#ffe5f2"/><directionalLight position={[4,-2,4]} intensity={3} color="#eca8d0"/><Lighting/><Suspense fallback={null}><Bounds fit clip observe margin={1.25}><Center><Badge progress={progress}/></Center></Bounds></Suspense><OrbitControls makeDefault enablePan={false} enableZoom={false}/></Canvas>;}
