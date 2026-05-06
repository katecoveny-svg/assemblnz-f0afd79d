'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment, Float, Sphere, Html } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { TextureLoader } from 'three';

// Brand colors
const POUNAMU = '#2B6B57';
const SOFT_GOLD = '#D4A853';
const INK = '#23211F';
const PAPER = '#FAF7F2';

// New Zealand coordinates (approx center)
const NZ_LAT = -41.2;
const NZ_LON = 174.9;

function Globe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(TextureLoader, '/assets/3d/texture_earth.jpg');

  useFrame(({ clock }) => {
    if (globeRef.current) {
      // Slow rotation to keep NZ in view
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.05 - 2.8;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group>
        {/* Main globe */}
        <Sphere ref={globeRef} args={[2, 64, 64]}>
          <meshStandardMaterial
            map={texture}
            metalness={0.1}
            roughness={0.8}
          />
        </Sphere>

        {/* Glass outer shell */}
        <Sphere args={[2.05, 64, 64]}>
          <meshPhysicalMaterial
            color={PAPER}
            transmission={0.9}
            thickness={0.5}
            roughness={0.1}
            ior={1.5}
            transparent
            opacity={0.3}
          />
        </Sphere>

        {/* NZ marker pin */}
        <group position={latLonToXYZ(NZ_LAT, NZ_LON, 2.1)}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={POUNAMU} emissive={POUNAMU} emissiveIntensity={0.5} />
          </mesh>
          {/* Pulse ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.15, 32]} />
            <meshBasicMaterial color={POUNAMU} transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Glassmorphism info card */}
        <Html
          position={latLonToXYZ(NZ_LAT + 10, NZ_LON + 30, 2.5)}
          center
          distanceFactor={8}
        >
          <div className="pointer-events-none w-48 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#2B6B57]">
              Built in
            </p>
            <p className="mt-1 font-display text-lg font-light text-[#23211F]">
              Aotearoa
            </p>
            <p className="mt-2 text-[10px] text-[#23211F]/60">
              For New Zealand businesses
            </p>
          </div>
        </Html>
      </group>
    </Float>
  );
}

// Convert lat/lon to 3D coordinates
function latLonToXYZ(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} color={PAPER} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color={SOFT_GOLD} />
      <Globe />
      <Environment preset="dawn" />
    </>
  );
}

export function AotearoaGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#23211F]"
    >
      {/* Background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(43,107,87,0.15) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(212,168,83,0.1) 0%, transparent 40%)',
        }}
      />

      <div className="relative flex min-h-screen flex-col md:flex-row">
        {/* Left side — text content */}
        <motion.div
          style={{ opacity }}
          className="flex w-full flex-col justify-center px-6 py-20 md:w-1/2 md:px-12 md:py-0 lg:px-20"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#D4A853]">
            Made in Aotearoa
          </p>
          <h2
            className="mt-6 max-w-lg font-display leading-[0.92] tracking-tight text-[#FAF7F2]"
            style={{ fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            For Aotearoa.{' '}
            <em className="italic text-[#2B6B57]">By Aotearoa.</em>
          </h2>
          <p className="mt-8 max-w-md text-base leading-relaxed text-[#FAF7F2]/70 md:text-lg">
            Every agent grounded in NZ legislation. Every output reviewed before it ships.
            We don&apos;t generate AI karakia, whaikōrero, or waiata. That is a hard boundary.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: '100%', label: 'NZ-owned' },
              { value: '20+', label: 'NZ Acts cited' },
              { value: '4', label: 'Pou foundation' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p
                  className="font-display text-[#D4A853]"
                  style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  {value}
                </p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#FAF7F2]/50">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right side — 3D globe */}
        <div className="relative h-[60vh] w-full md:h-screen md:w-1/2">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2B6B57] border-t-transparent" />
              </div>
            }
          >
            <Canvas
              camera={{ position: [0, 0, 6], fov: 45 }}
              style={{ background: 'transparent' }}
            >
              <Scene />
            </Canvas>
          </Suspense>

          {/* Glassmorphism overlay cards */}
          <div className="pointer-events-none absolute bottom-8 right-8 hidden flex-col gap-4 md:flex">
            {['Rangatiratanga', 'Kaitiakitanga', 'Manaakitanga', 'Whanaungatanga'].map(
              (pou, i) => (
                <motion.div
                  key={pou}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
                >
                  <span className="font-display text-sm text-[#FAF7F2]/80" style={{ fontWeight: 300 }}>
                    {pou}
                  </span>
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
