'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import styles from './spatial.module.css';

type Props = { needsYou: number; working: number; done: number };

function WorkPod({ position, tone, active }: { position: [number, number, number]; tone: string; active: number }) {
  return (
    <group position={position}>
      <RoundedBox args={[2.15, 0.22, 1.38]} radius={0.14} smoothness={4} position={[0, 0.16, 0]}>
        <meshStandardMaterial color="#fffdfb" roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[1.45, 0.65, 0.08]} radius={0.08} smoothness={4} position={[0, 0.82, -0.28]}>
        <meshStandardMaterial color={tone} roughness={0.32} metalness={0.08} />
      </RoundedBox>
      {Array.from({ length: Math.min(Math.max(active, 1), 4) }).map((_, index) => (
        <mesh key={index} position={[-0.6 + index * 0.4, 0.48, 0.2]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color={index === 0 ? '#240b21' : '#916a70'} roughness={0.35} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function OfficeScene({ needsYou, working, done }: Props) {
  return (
    <>
      <color attach="background" args={['#f5f1f2']} />
      <ambientLight intensity={1.7} />
      <directionalLight position={[5, 8, 4]} intensity={2.2} color="#fff8f4" />
      <directionalLight position={[-5, 4, -2]} intensity={0.8} color="#d6e2e8" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[13.5, 8]} />
        <meshStandardMaterial color="#fffdfb" roughness={0.82} />
      </mesh>

      <mesh position={[0, 1.3, -3.15]}>
        <boxGeometry args={[12.6, 2.5, 0.08]} />
        <meshStandardMaterial color="#d7e1e5" transparent opacity={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.15, -3.28]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial color="#78919b" roughness={0.5} />
      </mesh>

      <mesh position={[0, 0.15, 2.8]}>
        <boxGeometry args={[11.6, 0.3, 0.14]} />
        <meshStandardMaterial color="#240b21" roughness={0.4} />
      </mesh>

      <WorkPod position={[-3.6, 0, -0.45]} tone="#916a70" active={needsYou} />
      <WorkPod position={[0, 0, -0.45]} tone="#654a4e" active={working} />
      <WorkPod position={[3.6, 0, -0.45]} tone="#240b21" active={done} />

      <group position={[-4.7, 0, 2.1]}>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.34, 0.43, 1.5, 28]} />
          <meshStandardMaterial color="#654a4e" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.62, 0]}>
          <sphereGeometry args={[0.65, 24, 24]} />
          <meshStandardMaterial color="#916a70" roughness={0.72} />
        </mesh>
      </group>

      <group position={[4.4, 0, 1.8]}>
        <RoundedBox args={[2.2, 0.16, 1.1]} radius={0.08} smoothness={4} position={[0, 0.55, 0]}>
          <meshStandardMaterial color="#f5f1f2" roughness={0.72} />
        </RoundedBox>
        <mesh position={[0, 0.95, 0]}>
          <torusGeometry args={[0.42, 0.08, 18, 48]} />
          <meshStandardMaterial color="#916a70" metalness={0.45} roughness={0.28} />
        </mesh>
      </group>

      <OrbitControls enablePan={false} minDistance={7.3} maxDistance={11.5} minPolarAngle={0.72} maxPolarAngle={1.32} target={[0, 0.6, 0]} />
    </>
  );
}

export function DoOfficeSpatial(props: Props) {
  return (
    <section className={styles.wrap} aria-labelledby="do-office-spatial-title">
      <div className={styles.copy}>
        <div>
          <span>spatial office · first room</span>
          <h2 id="do-office-spatial-title">your DOs have a place to work.</h2>
        </div>
        <p>
          A first interactive architectural shell for the future Auckland harbour office. The 3D room reflects the same Office state below; it is not a second system.
        </p>
      </div>
      <div className={styles.scene} aria-label="Interactive conceptual 3D DO Office with three work zones overlooking water">
        <Canvas camera={{ position: [7.8, 6.4, 8.5], fov: 42 }} dpr={[1, 1.5]}>
          <OfficeScene {...props} />
        </Canvas>
        <div className={styles.legend} aria-hidden>
          <span><i data-tone="rose" />needs you · {props.needsYou}</span>
          <span><i data-tone="muted" />working · {props.working}</span>
          <span><i data-tone="plum" />done · {props.done}</span>
        </div>
      </div>
      <p className={styles.fallback}>Drag to look around. The full accessible task view remains directly below the spatial scene.</p>
    </section>
  );
}
