'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { DataTexture, Group, RedFormat, RepeatWrapping, type OrthographicCamera as ThreeCamera } from 'three';
import { RoundedBox } from '@react-three/drei/core/RoundedBox';
import { OrthographicCamera } from '@react-three/drei/core/OrthographicCamera';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';

const plum = '#492b3e', rose = '#b78188', petal = '#eac8df', cream = '#fff5e6', sage = '#8a987d';
type Vec = [number, number, number];
// All interaction belongs to the stable HTML button, never the decorative canvas.
const decorativeEvents = () => ({ enabled: false, priority: 0 });
const Grain = createContext<DataTexture | null>(null);
function Clay({ color = cream }: { color?: string }) {
  const grain = useContext(Grain);
  return <meshStandardMaterial color={color} roughness={.92} metalness={0} bumpMap={grain} bumpScale={.018} />;
}
function Blob({ at = [0,0,0], scale = [1,1,1], color = cream, rotation = [0,0,0] }: { at?: Vec; scale?: Vec; color?: string; rotation?: Vec }) {
  return <mesh position={at} scale={scale} rotation={rotation} castShadow receiveShadow><sphereGeometry args={[1,40,28]} /><Clay color={color} /></mesh>;
}
function Block({ at = [0,0,0], size, color = cream, rotation = [0,0,0] }: { at?: Vec; size: Vec; color?: string; rotation?: Vec }) {
  return <RoundedBox position={at} rotation={rotation} args={size} radius={Math.min(...size)*.34} smoothness={4} castShadow receiveShadow><Clay color={color} /></RoundedBox>;
}
function Loop({ at, radius, tube = .04, color = rose, rotation = [0,0,0], scale = [1,1,1] }: { at: Vec; radius: number; tube?: number; color?: string; rotation?: Vec; scale?: Vec }) {
  return <mesh position={at} rotation={rotation} scale={scale} castShadow receiveShadow><torusGeometry args={[radius,tube,12,40]} /><Clay color={color} /></mesh>;
}
function Clock({ at, scale = 1 }: { at: Vec; scale?: number }) {
  return <group position={at} scale={scale} rotation={[0,-.12,-.1]}>
    <Blob at={[0,.38,0]} scale={[.38,.39,.16]} color={rose} />
    <Blob at={[0,.38,.13]} scale={[.31,.32,.065]} />
    <Block at={[.06,.39,.2]} size={[.17,.045,.045]} color={plum} rotation={[0,0,-.3]} />
    <Block at={[0,.47,.2]} size={[.045,.2,.045]} color={plum} />
    <Blob at={[0,.38,.22]} scale={[.035,.035,.03]} color={plum} />
    {[-.23,.23].map(x=><Blob key={x} at={[x,.085,0]} scale={[.08,.09,.1]} color={plum} />)}
    {[-.24,.24].map(x=><Blob key={x} at={[x,.72,0]} scale={[.16,.09,.13]} color={petal} rotation={[0,0,x>0?-.5:.5]} />)}
  </group>;
}
function Calendar({ at = [0,0,0], scale = 1 }: { at?: Vec; scale?: number }) {
  return <group position={at} scale={scale} rotation={[-.12,.08,.07]}>
    <Block at={[0,.42,0]} size={[.78,.8,.22]} color={rose} />
    <Block at={[0,.39,.13]} size={[.68,.61,.09]} />
    <Block at={[0,.66,.19]} size={[.6,.1,.05]} color={petal} />
    {[-.2,0,.2].map(x=>[.2,.36,.5].map(y=><Blob key={`${x}${y}`} at={[x,y,.2]} scale={[.038,.035,.025]} color={x===0&&y===.36?plum:rose} />))}
    {[-.22,.22].map(x=><Loop key={x} at={[x,.82,.04]} radius={.075} tube={.035} color={plum} rotation={[0,Math.PI/2,0]} />)}
  </group>;
}
function Envelope({ at }: { at: Vec }) {
  return <group position={at} rotation={[-.2,.1,-.17]}><Block size={[.64,.43,.14]} color={petal} /><Block at={[-.13,.075,.09]} size={[.32,.035,.035]} color={rose} rotation={[0,0,-.6]} /><Block at={[.13,.075,.09]} size={[.32,.035,.035]} color={rose} rotation={[0,0,.6]} /></group>;
}
function Suitcase() {
  return <group position={[-.3,0,-.08]} rotation={[0,-.12,-.09]}>
    <Block at={[0,.49,0]} size={[.7,.84,.42]} color={rose} />
    <Loop at={[0,.95,0]} radius={.14} tube={.055} color={plum} scale={[1,.75,1]} />
    {[-.21,.21].map(x=><Block key={x} at={[x,.49,.22]} size={[.06,.66,.035]} color={petal} />)}
    {[-.22,.22].map(x=><Blob key={x} at={[x,.055,0]} scale={[.075,.075,.09]} color={plum} />)}
  </group>;
}
function Plane() {
  return <group position={[.35,.93,.12]} rotation={[.12,-.32,-.12]} scale={.8}>
    <Blob scale={[.6,.14,.17]} />
    <Blob at={[-.02,0,0]} scale={[.25,.065,.68]} rotation={[0,-.3,0]} />
    <Blob at={[-.43,.16,0]} scale={[.18,.22,.055]} color={petal} rotation={[0,0,.3]} />
    <Blob at={[-.4,.02,0]} scale={[.16,.05,.3]} color={petal} />
    <Blob at={[.4,.07,.075]} scale={[.12,.065,.09]} color={plum} />
    {[.12,-.02,-.16].map(x=><Blob key={x} at={[x,.03,.155]} scale={[.027,.035,.02]} color={rose} />)}
  </group>;
}
function Plate({ at, color = cream }: { at: Vec; color?: string }) {
  return <group position={at}><Blob scale={[.39,.055,.37]} color={color} /><Loop at={[0,.04,0]} radius={.31} tube={.035} color={color} rotation={[Math.PI/2,0,0]} /></group>;
}
function Candle() {
  return <group position={[.08,0,-.26]}><Blob at={[0,.065,0]} scale={[.2,.065,.18]} color={rose} /><Block at={[0,.36,0]} size={[.16,.6,.16]} /><Blob at={[0,.74,0]} scale={[.055,.12,.045]} color="#d4a47e" rotation={[0,0,-.15]} /></group>;
}
function Pot({ flap }: { flap: React.RefObject<Group | null> }) {
  return <group position={[-.16,0,0]}>
    <Blob at={[0,.32,0]} scale={[.46,.31,.4]} color={rose} />
    <Loop at={[0,.48,0]} radius={.37} tube={.065} color={rose} rotation={[Math.PI/2,0,0]} />
    {[-.48,.48].map(x=><Loop key={x} at={[x,.37,0]} radius={.12} tube={.055} color={plum} rotation={[Math.PI/2,0,0]} scale={[1, .8,1]} />)}
    <group ref={flap}><Blob at={[0,.57,0]} scale={[.43,.12,.39]} /><Blob at={[0,.73,0]} scale={[.095,.07,.08]} color={plum} /></group>
    <group position={[.61,0,.2]}><Blob at={[0,.17,0]} scale={[.2,.18,.19]} color="#bc7477" /><Blob at={[0,.34,0]} scale={[.11,.035,.06]} color={sage} rotation={[0,.6,0]} /><Block at={[0,.36,0]} size={[.035,.09,.035]} color={sage} rotation={[0,0,-.3]} /></group>
  </group>;
}
function Gifts({ flap }: { flap: React.RefObject<Group | null> }) {
  return <group>
    <group position={[-.3,.03,-.08]} rotation={[-.12,.1,-.06]}>
      <Block at={[0,.42,0]} size={[.55,.66,.24]} color={petal} />
      {[-1,1].map(side=><Block key={side} at={[side*.35,.48,0]} size={[.25,.47,.24]} color={petal} rotation={[0,0,side*.4]} />)}
      <Loop at={[0,.74,.03]} radius={.12} tube={.045} color={rose} rotation={[Math.PI/2,0,0]} scale={[1,.65,1]} />
      <Block at={[0,.13,.01]} size={[.53,.09,.25]} color={rose} />
    </group>
    <group position={[.38,0,.24]}><Block at={[0,.23,0]} size={[.5,.45,.47]} color={rose} /><Block at={[0,.24,.24]} size={[.07,.43,.035]} />
      <group ref={flap}><Block at={[0,.48,0]} size={[.54,.1,.51]} color={cream} /><Loop at={[-.09,.6,0]} radius={.09} tube={.027} color={plum} rotation={[Math.PI/2,0,-.4]} /><Loop at={[.09,.6,0]} radius={.09} tube={.027} color={plum} rotation={[Math.PI/2,0,.4]} /></group>
    </group>
  </group>;
}
function Basket() {
  return <group rotation={[0,-.12,0]}>
    <Block at={[0,.28,0]} size={[.94,.48,.65]} color={rose} />
    <Block at={[0,.52,0]} size={[1.01,.1,.7]} color={petal} />
    <Loop at={[0,.62,0]} radius={.39} tube={.055} color={plum} scale={[1,1.15,1]} />
    {[-.32,-.16,0,.16,.32].map(x=><Block key={x} at={[x,.29,.331]} size={[.045,.3,.025]} color={petal} rotation={[0,0,.035]} />)}
    <group position={[-.22,.5,0]} rotation={[0,0,-.12]}><Block at={[0,.2,0]} size={[.25,.43,.26]} /><Block at={[0,.45,0]} size={[.25,.14,.24]} rotation={[0,0,.12]} color={petal} /></group>
    <group position={[.23,.5,.08]}><Blob at={[0,.14,0]} scale={[.19,.19,.17]} color="#b1b49a" /><Blob at={[0,.3,0]} scale={[.115,.17,.11]} color="#b1b49a" /><Block at={[0,.48,0]} size={[.04,.1,.04]} color={plum} rotation={[0,0,-.2]} /><Blob at={[.09,.46,0]} scale={[.1,.025,.05]} color={sage} /></group>
  </group>;
}
function Objects({ kind, reduced, gesture, quiet }: { kind: string; reduced: boolean; gesture: number; quiet: boolean }) {
  const root = useRef<Group>(null), flap = useRef<Group>(null), progress = useRef(1.4);
  const { invalidate } = useThree();
  useEffect(() => { progress.current = reduced || quiet ? 1.4 : 0; invalidate(); }, [gesture,reduced,quiet,invalidate]);
  useFrame((_, delta) => {
    progress.current = Math.min(1.4,progress.current+Math.min(delta,.05));
    const t = progress.current/1.4, wave = Math.sin(t*Math.PI), settle = Math.sin(t*Math.PI*2)*(1-t);
    if (!root.current) return;
    root.current.rotation.y = settle*.13;
    root.current.position.y = kind==='flight'?wave*.08:0;
    if (flap.current) { flap.current.position.y = wave*(kind==='meals'?.16:kind==='gifts'?.1:.06); flap.current.rotation.z = settle*.08; }
    if(t<1 && !reduced && !quiet) invalidate();
  });
  return <group ref={root}>{kind==='desk'?<><Calendar at={[-.32,0,-.12]} scale={.85}/><Clock at={[.39,0,.15]} scale={.7}/><group ref={flap}><Envelope at={[-.37,.23,.38]}/></group></>:kind==='flight'?<><Suitcase/><group ref={flap}><Plane/></group></>:kind==='table'?<><group ref={flap}><Plate at={[-.35,.07,.12]}/><Plate at={[.37,.07,.24]} color={petal}/></group><Candle/></>:kind==='meals'?<Pot flap={flap}/>:kind==='gifts'?<Gifts flap={flap}/>:kind==='groceries'?<Basket/>:<><group ref={flap}><Calendar at={[-.24,0,-.09]}/></group><Clock at={[.4,0,.28]} scale={.65}/></>}</group>;
}
function Studio(props: {kind:string; reduced:boolean; gesture:number; quiet:boolean}) {
  const { size } = useThree();
  const grain = useMemo(() => {
    const bytes = new Uint8Array(128*128); let seed=17;
    for(let i=0;i<bytes.length;i++){seed=(seed*1664525+1013904223)>>>0;bytes[i]=110+(seed%36);}
    const texture=new DataTexture(bytes,128,128,RedFormat);texture.wrapS=texture.wrapT=RepeatWrapping;texture.repeat.set(3,3);texture.needsUpdate=true;return texture;
  },[]);
  useEffect(()=>()=>grain.dispose(),[grain]);
  return <Grain.Provider value={grain}>
    <OrthographicCamera makeDefault position={[2.6,2.2,4.5]} rotation={[-.4,.48,.2]} zoom={Math.min(128,size.width/1.7,size.height/1.65)} near={.1} far={20} onUpdate={(camera: ThreeCamera) => camera.lookAt(0,0,0)}/>
    <ambientLight intensity={.65}/><hemisphereLight args={['#fff8ed','#a07a86',1.1]}/>
    <directionalLight position={[-3,5,4]} intensity={3.2} color="#fff4df"/>
    <directionalLight position={[1,2,5]} intensity={.65} color="#fffdfb"/>
    <directionalLight position={[3,3,-3]} intensity={2.4} color="#efc1b8"/>
    <group position={[0,-.42,0]}><Objects {...props}/><ContactShadows position={[0,-.015,0]} opacity={.48} scale={3.5} blur={2.6} far={1.7} resolution={256} color="#654a4e" frames={Infinity}/></group>
  </Grain.Provider>;
}
class SceneBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?null:this.props.children;}}
export default function DoMiniatureScene(props:{kind:string;reduced:boolean;gesture:number;quiet:boolean}){
  return <SceneBoundary><Canvas events={decorativeEvents} orthographic frameloop="demand" dpr={[1,1.5]} camera={{position:[2.6,2.2,4.5],zoom:100,near:.1,far:20}} gl={{alpha:true,antialias:true,powerPreference:'low-power'}} style={{pointerEvents:'none'}}><Studio {...props}/></Canvas></SceneBoundary>;
}
