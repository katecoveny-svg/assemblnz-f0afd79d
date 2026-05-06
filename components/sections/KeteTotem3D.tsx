'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';

// Brand colors
const POUNAMU = '#2B6B57';
const SOFT_GOLD = '#D4A853';
const INK = '#23211F';
const PAPER = '#FAF7F2';

function KeteShape({ position, color, scale = 1, rotationOffset = 0 }: {
  position: [number, number, number];
  color: string;
  scale?: number;
  rotationOffset?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3 + rotationOffset;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {/* Abstract woven basket shape using torus knot */}
        <torusKnotGeometry args={[0.8, 0.3, 128, 32, 2, 3]} />
        <MeshTransmissionMaterial
          color={color}
          thickness={0.5}
          roughness={0.1}
          transmission={0.6}
          ior={1.5}
          chromaticAberration={0.02}
          backside
        />
      </mesh>
    </Float>
  );
}

function TotemStack() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Stack of kete forms */}
      <KeteShape position={[0, 2.5, 0]} color={POUNAMU} scale={0.8} rotationOffset={0} />
      <KeteShape position={[0, 0, 0]} color={SOFT_GOLD} scale={1} rotationOffset={Math.PI / 3} />
      <KeteShape position={[0, -2.5, 0]} color={INK} scale={0.9} rotationOffset={Math.PI / 1.5} />
      
      {/* Central pillar */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 7, 32]} />
        <meshStandardMaterial color={INK} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#FAF7F2" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color={SOFT_GOLD} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color={POUNAMU} />
      
      <TotemStack />
      
      <Environment preset="studio" />
    </>
  );
}

export function KeteTotem3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#FAF7F2]"
    >
      <div className="absolute inset-0 flex">
        {/* Left side — text content */}
        <motion.div
          style={{ opacity }}
          className="flex w-full flex-col justify-center px-6 md:w-1/2 md:px-12 lg:px-20"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#23211F]/60">
            The Kete System
          </p>
          <h2
            className="mt-6 max-w-lg font-display leading-[0.92] tracking-tight text-[#23211F]"
            style={{ fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            Woven together.{' '}
            <em className="italic text-[#2B6B57]">Working as one.</em>
          </h2>
          <p className="mt-8 max-w-md text-base leading-relaxed text-[#23211F]/70 md:text-lg">
            Each kete is a bundle of specialist agents, grounded in the legislation 
            your industry lives under. Pick the agents you need — they work together seamlessly.
          </p>
          <div className="mt-10 flex gap-6">
            {[
              { color: POUNAMU, label: 'Pounamu' },
              { color: SOFT_GOLD, label: 'Soft gold' },
              { color: INK, label: 'Ink' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: color }}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#23211F]/50">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right side — 3D canvas */}
        <motion.div
          style={{ y }}
          className="hidden h-screen w-1/2 md:block"
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2B6B57] border-t-transparent" />
              </div>
            }
          >
            <Canvas
              camera={{ position: [0, 0, 12], fov: 45 }}
              style={{ background: 'transparent' }}
            >
              <Scene />
            </Canvas>
          </Suspense>
        </motion.div>
      </div>

      {/* Mobile fallback — static visual */}
      <div className="flex min-h-[60vh] items-center justify-center md:hidden">
        <div className="relative">
          {[POUNAMU, SOFT_GOLD, INK].map((color, i) => (
            <motion.div
              key={color}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="mx-auto my-4 h-20 w-20 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
                boxShadow: `0 10px 40px ${color}40`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
