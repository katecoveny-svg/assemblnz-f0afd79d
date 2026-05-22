'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Kete, KeteSlug } from '@/lib/kete';
import type { RegulatoryPulseStats } from '@/lib/regulatory-pulse';
import { AssemblConciergeWidget } from './AssemblConciergeWidget';
import { EvidencePackPreview } from './EvidencePackPreview';
import { HapaiToolPreview } from '@/components/hapai/HapaiToolPreview';
import { HAPAI_TOOLS as ALL_HAPAI_TOOLS } from '@/lib/hapai/shareable-tools';
import { MarketplaceStrip } from './MarketplaceStrip';
import { RegulatoryPulse } from './RegulatoryPulse';
import { ThreeSteps } from './ThreeSteps';

interface HomePortalProps {
  ketes: Kete[];
  regulatoryPulse: RegulatoryPulseStats;
}

const FEATURED_HAPAI_TOOL_SLUGS = ['study-helper', 'meeting-recorder', '9am-brief'] as const;

const FEATURED_HAPAI_TOOLS = FEATURED_HAPAI_TOOL_SLUGS.map((slug) =>
  ALL_HAPAI_TOOLS.find((tool) => tool.slug === slug),
).filter((tool): tool is (typeof ALL_HAPAI_TOOLS)[number] => Boolean(tool));

const PRICING_ENTRY_POINTS = [
  [
    'PILOT SPRINT',
    '$5,000 + GST',
    'Bring one workflow. We map it, build the agent, set the review points, run a real job, seal it in an evidence pack. Ten working days. You leave with a working proof and a path forward.',
    'Book a pilot',
    '/pilot-sprint',
    '#2B6B57',
  ],
  [
    'INDUSTRY PACK',
    '$5,000 / month',
    'The full specialist fleet for your industry, plus HAPAI white-labelled to your organisation. Your wordmark, your voice. Practical tools your team can open in thirty seconds.',
    'See industry packs',
    '/industry-pack',
    '#D4A853',
  ],
  [
    'HAPAI',
    'Public tools',
    'Small useful tools for real work: meeting notes, travel desk, 9am Brief, share cards, food logs, captions, and more.',
    'Open HAPAI',
    '/hapai',
    '#23211F',
  ],
] as const;

const KETE_CARD_COPY: Record<KeteSlug, string> = {
  waihanga: 'RFI drafter, variation pack builder, site observation logger, and six more.',
  manaaki: 'Allergen incident logger, guest reply drafter, supplier comparison, and six more.',
  pikau: 'Customs entry drafter, freight exception report, carrier compliance review, and six more.',
  arataki: 'WoF readiness check, CGA disclosure generator, fleet defect log, and six more.',
  auaha: 'Caption batch composer, brief drafter, tagline shortlist, and six more.',
  ako: 'School notice rewriter, assessment summary, parent update drafter, and six more.',
  matauranga: 'Source verifier, document comparison, submission drafter, and six more.',
  hoko: 'Return triage, customer reply drafter, supplier comparison, and six more.',
  toro: 'School notice parser, weekly plan, gear list generator, and six more.',
};

const KETE_ACCENT_NAMES: Record<KeteSlug, string> = {
  waihanga: 'pounamu',
  manaaki: 'kōkōwai',
  pikau: 'kikorangi',
  arataki: 'karaka',
  auaha: 'kahurangi',
  ako: 'parauri',
  matauranga: 'pōuriuri',
  hoko: 'waiporoporo',
  toro: 'mangū',
};

function AssemblHeroObject({ reduceMotion }: { reduceMotion: boolean | null }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layerAnimation = reduceMotion
    ? undefined
    : {
        rotateY: [-7, 8, -7],
        rotateX: [7, 2, 7],
        y: [0, -10, 0],
      };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.28, 7.4);

    const group = new THREE.Group();
    group.rotation.x = -0.18;
    scene.add(group);

    const whiteGlass = new THREE.MeshPhysicalMaterial({
      color: 0xfaf7f2,
      roughness: 0.08,
      metalness: 0,
      transparent: true,
      opacity: 0.56,
      transmission: 0.72,
      thickness: 0.9,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      side: THREE.DoubleSide,
    });
    const pounamuGlass = new THREE.MeshPhysicalMaterial({
      color: 0x8fb7a6,
      roughness: 0.12,
      transparent: true,
      opacity: 0.34,
      transmission: 0.58,
      thickness: 0.6,
      clearcoat: 0.8,
      side: THREE.DoubleSide,
    });
    const amberGlass = new THREE.MeshPhysicalMaterial({
      color: 0xd9a85a,
      roughness: 0.16,
      transparent: true,
      opacity: 0.38,
      transmission: 0.46,
      thickness: 0.5,
      clearcoat: 0.8,
      side: THREE.DoubleSide,
    });
    const threadMaterial = new THREE.MeshBasicMaterial({
      color: 0xf3d79d,
      transparent: true,
      opacity: 0.74,
    });
    const whiteThreadMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.82,
    });

    const addDisc = (y: number, material: THREE.Material, scaleX: number, scaleZ: number, rotationZ: number) => {
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.25, 96), material);
      disc.rotation.x = -Math.PI / 2;
      disc.rotation.z = rotationZ;
      disc.position.y = y;
      disc.scale.set(scaleX, scaleZ, 1);
      group.add(disc);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.014, 16, 160), threadMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.rotation.z = rotationZ;
      ring.position.y = y + 0.008;
      ring.scale.set(scaleX, scaleZ, 1);
      group.add(ring);
      return { disc, ring };
    };

    const plates = [
      addDisc(-0.64, amberGlass, 1.72, 0.28, -0.07),
      addDisc(-0.38, pounamuGlass, 1.9, 0.24, 0.07),
      addDisc(-0.13, whiteGlass, 1.62, 0.21, -0.02),
    ];

    const sheetGeometry = new THREE.PlaneGeometry(3.35, 1.32, 52, 14);
    const position = sheetGeometry.attributes.position;
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const y = position.getY(index);
      const z = Math.sin(x * 2.2) * 0.18 + Math.cos(y * 4.4) * 0.08;
      position.setZ(index, z);
    }
    position.needsUpdate = true;
    sheetGeometry.computeVertexNormals();
    const sheet = new THREE.Mesh(sheetGeometry, whiteGlass);
    sheet.rotation.set(-0.28, -0.24, 0.12);
    sheet.position.set(0, 0.58, 0.1);
    group.add(sheet);

    const threads: THREE.Mesh[] = [];
    for (let index = 0; index < 18; index += 1) {
      const z = -0.92 + index * 0.11;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.95, -0.1 + Math.sin(index) * 0.08, z),
        new THREE.Vector3(-0.7, 0.22 + Math.cos(index) * 0.1, z + 0.08),
        new THREE.Vector3(0.62, 0.03 + Math.sin(index * 0.7) * 0.1, z - 0.03),
        new THREE.Vector3(1.9, 0.18 + Math.cos(index * 0.4) * 0.09, z),
      ]);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 32, index % 3 === 0 ? 0.006 : 0.004, 8, false),
        index % 4 === 0 ? whiteThreadMaterial : threadMaterial,
      );
      tube.rotation.x = -0.16;
      tube.position.y = -0.1;
      group.add(tube);
      threads.push(tube);
    }

    const glintMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
    const glints: THREE.Mesh[] = [];
    for (let index = 0; index < 13; index += 1) {
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.018 + (index % 3) * 0.006, 12, 12), glintMaterial);
      glint.position.set(-1.6 + index * 0.28, 0.58 + Math.sin(index * 1.3) * 0.48, -0.6 + Math.cos(index) * 0.52);
      group.add(glint);
      glints.push(glint);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(-3, 4, 4);
    scene.add(key);
    const warm = new THREE.PointLight(0xd9a85a, 2.4, 8);
    warm.position.set(2, 1.5, 2.5);
    scene.add(warm);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let frame = 0;
    let animationFrame = 0;
    const render = () => {
      frame += 0.01;
      if (!reduceMotion) {
        group.rotation.y = Math.sin(frame * 0.6) * 0.22;
        group.rotation.z = Math.sin(frame * 0.38) * 0.025;
        sheet.rotation.z = 0.12 + Math.sin(frame * 0.8) * 0.035;
        plates.forEach((plate, index) => {
          plate.disc.rotation.z += 0.0018 + index * 0.0007;
          plate.ring.rotation.z += 0.0022 + index * 0.0008;
        });
        threads.forEach((thread, index) => {
          thread.position.y = -0.1 + Math.sin(frame * 1.4 + index * 0.4) * 0.025;
        });
        glints.forEach((glint, index) => {
          glint.scale.setScalar(0.8 + Math.sin(frame * 3 + index) * 0.32);
        });
      }
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.dispose();
      [sheetGeometry, ...plates.flatMap((plate) => [plate.disc.geometry, plate.ring.geometry]), ...threads.map((thread) => thread.geometry), ...glints.map((glint) => glint.geometry)].forEach((geometry) => geometry.dispose());
      [whiteGlass, pounamuGlass, amberGlass, threadMaterial, whiteThreadMaterial, glintMaterial].forEach((material) => material.dispose());
    };
  }, [reduceMotion]);

  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-[30px] border border-white/58 bg-[linear-gradient(145deg,rgba(255,255,255,0.66)_0%,rgba(250,247,242,0.30)_46%,rgba(232,239,233,0.48)_100%)] p-4 shadow-[0_42px_130px_rgba(35,33,31,0.12)] backdrop-blur-2xl md:min-h-[540px] md:p-8 lg:min-h-[min(72svh,720px)]">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(43,107,87,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(43,107,87,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-10 top-8 h-px bg-gradient-to-r from-transparent via-[#D4A853]/58 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-10 bottom-8 h-px bg-gradient-to-r from-transparent via-[#2B6B57]/24 to-transparent" aria-hidden />

      <div className="relative flex h-full min-h-[392px] items-center justify-center md:min-h-[500px]">
        <div className="relative mx-auto flex min-h-[350px] w-full max-w-[720px] items-center justify-center [perspective:1400px] md:min-h-[470px]">
          <div className="absolute left-1/2 top-1/2 h-[70%] w-[86%] -translate-x-1/2 -translate-y-[28%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.82),rgba(43,107,87,0.22)_42%,rgba(217,168,90,0.16)_62%,transparent_78%)] blur-2xl" aria-hidden />
          <div className="absolute bottom-[12%] left-1/2 h-[16%] w-[74%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(35,33,31,0.22),rgba(35,33,31,0.07)_52%,transparent_76%)] blur-xl" aria-hidden />

          <motion.div
            className="relative h-[330px] w-[min(84vw,620px)] [transform-style:preserve-3d] md:h-[430px]"
            animate={layerAnimation}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          >
            {Array.from({ length: 18 }).map((_, index) => {
              const left = 12 + index * 4.3;
              const height = 42 + (index % 5) * 8;
              const delay = index * 0.18;
              return (
                <motion.span
                  key={`loom-thread-${index}`}
                  aria-hidden
                  className="absolute top-[18%] w-px rounded-full bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.82),rgba(212,168,83,0.56),rgba(43,107,87,0.28),transparent)] shadow-[0_0_14px_rgba(255,255,255,0.62)]"
                  style={{
                    left: `${left}%`,
                    height: `${height}%`,
                    transform: `rotate(${index % 2 === 0 ? -13 : 16}deg) translateZ(${50 + index * 3}px)`,
                    opacity: 0.22 + (index % 4) * 0.08,
                  }}
                  animate={reduceMotion ? undefined : { opacity: [0.2, 0.62, 0.2], y: [0, -4, 0] }}
                  transition={{ duration: 4.8, delay, repeat: Infinity, ease: 'easeInOut' }}
                />
              );
            })}
            {Array.from({ length: 9 }).map((_, index) => (
              <motion.span
                key={`glint-${index}`}
                aria-hidden
                className="absolute h-px rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.95),0_0_34px_rgba(212,168,83,0.40)]"
                style={{
                  left: `${18 + index * 7.5}%`,
                  top: `${19 + (index % 4) * 13}%`,
                  width: `${22 + (index % 3) * 16}px`,
                  transform: `rotate(${index % 2 === 0 ? 34 : -28}deg) translateZ(${140 + index * 4}px)`,
                }}
                animate={reduceMotion ? undefined : { opacity: [0.05, 0.9, 0.05], scaleX: [0.55, 1.25, 0.55] }}
                transition={{ duration: 3.6, delay: index * 0.34, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
            <motion.div
              className="absolute left-[11%] top-[58%] h-[21%] w-[78%] rounded-[50%] border border-[#8B765F]/34 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(157,140,125,0.26))] shadow-[0_34px_58px_rgba(35,33,31,0.20)] backdrop-blur-md [transform:rotateX(64deg)_translateZ(-82px)]"
              animate={reduceMotion ? undefined : { x: [0, 5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-[4%] top-[49%] h-[17%] w-[92%] rounded-[50%] border border-[#D4A853]/58 bg-[linear-gradient(90deg,rgba(212,168,83,0.38),rgba(255,255,255,0.82),rgba(212,168,83,0.30))] shadow-[0_30px_70px_rgba(212,168,83,0.22)] backdrop-blur-xl [transform:rotateX(68deg)_rotateZ(-5deg)_translateZ(-26px)]"
              animate={reduceMotion ? undefined : { rotateZ: [-5, -1, -5] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-[2%] top-[40%] h-[16%] w-[96%] rounded-[50%] border border-[#2B6B57]/46 bg-[linear-gradient(90deg,rgba(202,222,214,0.42),rgba(255,255,255,0.84),rgba(43,107,87,0.30))] shadow-[0_28px_80px_rgba(43,107,87,0.18)] backdrop-blur-xl [transform:rotateX(66deg)_rotateZ(4deg)_translateZ(18px)]"
              animate={reduceMotion ? undefined : { rotateZ: [4, 8, 4] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-[18%] top-[12%] h-[42%] w-[64%] rounded-[42%_58%_48%_52%] border border-white/86 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(250,247,242,0.20)_46%,rgba(232,239,233,0.42))] shadow-[inset_0_0_74px_rgba(255,255,255,0.94),0_42px_96px_rgba(35,33,31,0.14)] backdrop-blur-xl [transform:rotateX(10deg)_rotateY(-16deg)_rotateZ(7deg)_translateZ(84px)]"
              animate={reduceMotion ? undefined : { rotateZ: [7, 12, 7], y: [0, -5, 0] }}
              transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-[49%] top-[16%] h-[52%] w-[2px] rounded-full bg-[linear-gradient(180deg,rgba(212,168,83,0),rgba(255,255,255,0.92),rgba(212,168,83,0.70),rgba(212,168,83,0))] shadow-[0_0_24px_rgba(212,168,83,0.46)] [transform:rotateZ(22deg)_translateZ(142px)]"
              animate={reduceMotion ? undefined : { rotateZ: [22, 28, 22] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-[8%] top-[11%] h-[64%] w-[84%] rounded-[50%] border border-[#D4A853]/34 opacity-80 [transform:rotateX(70deg)_rotateZ(22deg)_translateZ(96px)]"
              animate={reduceMotion ? undefined : { rotateZ: [22, 42, 22] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute left-[21%] top-[7%] h-[72%] w-[58%] rounded-[50%] border border-[#2B6B57]/22 opacity-70 [transform:rotateX(74deg)_rotateZ(-24deg)_translateZ(124px)]"
              animate={reduceMotion ? undefined : { rotateZ: [-24, -44, -24] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            {Array.from({ length: 14 }).map((_, index) => (
              <motion.span
                key={`front-thread-${index}`}
                aria-hidden
                className="absolute left-[12%] h-px rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.92),rgba(212,168,83,0.68),rgba(43,107,87,0.34),transparent)] shadow-[0_0_18px_rgba(255,255,255,0.88),0_0_30px_rgba(212,168,83,0.24)]"
                style={{
                  top: `${24 + index * 3.4}%`,
                  width: `${58 + (index % 3) * 8}%`,
                  transform: `rotate(${index % 2 === 0 ? -8 : 10}deg) translateZ(${170 + index * 5}px)`,
                  opacity: 0.26 + (index % 5) * 0.08,
                }}
                animate={reduceMotion ? undefined : { opacity: [0.18, 0.72, 0.18], x: [0, index % 2 === 0 ? 8 : -8, 0] }}
                transition={{ duration: 5.8, delay: index * 0.16, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function HomePortal({ ketes, regulatoryPulse }: HomePortalProps) {
  const pageRef = useRef<HTMLElement | null>(null);
  const [activeSlug, setActiveSlug] = useState<KeteSlug>('waihanga');
  const reduceMotion = useReducedMotion();
  const activeKete = useMemo(
    () => ketes.find((kete) => kete.slug === activeSlug) ?? ketes[0],
    [activeSlug, ketes],
  );
  const activeStyle = { '--kete-accent': activeKete.accent } as CSSProperties;

  return (
    <main
      ref={pageRef}
      className="min-h-screen overflow-x-hidden bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]"
      style={activeStyle}
    >
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.08)] bg-[linear-gradient(180deg,#FAF7F2_0%,#F6F0E8_58%,#FAF7F2_100%)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[color:var(--assembl-gold-thread)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,247,242,1)_0%,rgba(250,247,242,0.95)_52%,rgba(246,240,232,0.74)_100%)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#FAF7F2] to-transparent" aria-hidden />
        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4.5rem)] w-full max-w-[1480px] items-center gap-10 px-6 py-10 md:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)] lg:gap-14 xl:px-14">
          <motion.div
            initial={reduceMotion ? false : { opacity: 1, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 max-w-[720px]"
          >
            <p className="inline-flex border border-[rgba(43,107,87,0.22)] bg-white/72 px-3 py-2 font-mono text-eyebrow uppercase text-[color:var(--text-secondary)] shadow-sm backdrop-blur-md">
              BUILT IN AOTEAROA
            </p>
            <h1 className="mt-6 max-w-[780px] font-display text-[clamp(4.2rem,11vw,9.6rem)] font-light italic leading-[0.83] tracking-normal text-[#103F35] lg:text-[clamp(5.8rem,7.8vw,10.2rem)]">
              Mahi that earns its proof.
            </h1>
            <p className="mt-6 max-w-[620px] text-[clamp(1.08rem,2vw,1.45rem)] font-medium leading-[1.42] text-[#23211F] md:mt-7">
              assembl turns real work into reviewed outputs with sources, actions,
              and a record you can stand behind.
            </p>
            <div className="mt-5 max-w-[620px] text-[0.98rem] leading-[1.65] text-[#3D4250] md:text-[1.04rem]">
              <p>
                Start with a public HAPAI tool, a specialist kete, or one workflow
                your team repeats. The useful work becomes draft, review, sign-off,
                and proof.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10">
              <Link
                href="#product-map"
                className="cta-primary inline-flex h-12 w-full items-center justify-center px-8 text-base sm:w-auto md:h-14"
              >
                See what to use
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/hapai"
                className="btn-ghost inline-flex h-12 w-full items-center justify-center bg-white/62 px-8 text-base backdrop-blur-md sm:w-auto md:h-14"
              >
                Open HAPAI tools
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative z-10"
            initial={reduceMotion ? false : { opacity: 1, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.82, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <AssemblHeroObject reduceMotion={reduceMotion} />
          </motion.div>
        </div>
      </section>

      <section
        aria-label="Legislation trust signal"
        className="border-b border-[rgba(35,33,31,0.08)] bg-[rgba(255,255,255,0.42)] px-6 py-6 md:px-12"
      >
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 text-sm leading-7 text-[color:var(--text-secondary)] md:flex-row md:items-center md:justify-between">
          <p>
            Grounded in PCO&apos;s New Zealand Legislation API. Live legal retrieval
            supports the Privacy Act, Building Act, HSWA, Customs and Excise Act,
            Food Act, Fair Trading Act, CCCFA, CGA, and Construction Contracts Act.
          </p>
          <a
            className="inline-flex rounded-sm font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
            href="https://www.legislation.govt.nz"
            rel="noreferrer"
            target="_blank"
          >
            legislation.govt.nz
          </a>
        </div>
      </section>

      <RegulatoryPulse initial={regulatoryPulse} />

      <RevealSection id="product-map" className="scroll-mt-24 border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-28 md:px-12 md:py-36" reduceMotion={reduceMotion}>
        <div className="mx-auto max-w-[1500px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            HOW TO READ ASSEMBL
          </p>
          <div className="mt-4 grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <h2 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,5rem)] font-normal italic leading-tight">
              Pick the right door.
            </h2>
            <p className="max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              HAPAI is the shareable tool library. Kete are specialist packs.
              Workflows are repeatable jobs with review and evidence. They are
              different doors into the same operating layer.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ['HAPAI tools', 'Public one-task tools: study, meetings, travel, share cards, logs, briefs, and useful everyday jobs.', '/hapai', 'Try the tools'],
              ['Kete packs', 'Specialist operating areas with agents, tools, live knowledge, and review rules.', '#kete-workflows', 'See the kete'],
              ['Workflows', 'Repeatable jobs with inputs, reviewers, outputs, and evidence packs.', '/workflows', 'Browse workflows'],
            ].map(([title, body, href, cta]) => (
              <Link
                key={title}
                href={href}
                className="group rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/54 p-6 transition-all hover:-translate-y-0.5 hover:border-[color:var(--assembl-pounamu)] hover:bg-white hover:shadow-[0_22px_70px_rgba(35,33,31,0.08)]"
              >
                <span className="block font-display text-3xl font-light italic leading-none text-[#103F35]">
                  {title}
                </span>
                <span className="mt-4 block min-h-[96px] text-sm leading-relaxed text-[color:var(--text-body)]">
                  {body}
                </span>
                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                  {cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection className="border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <div className="mx-auto grid max-w-[1500px] gap-8 md:px-2 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              WHAT WE DO
            </p>
            <h2 className="mt-4 max-w-4xl font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
              Less admin. More mahi.
            </h2>
          </div>
          <div>
            <p className="max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              Hospitality teams shouldn&apos;t spend their best hour writing the
              allergen incident report. Construction teams shouldn&apos;t spend their
              best hour cross-referencing the variation against clause 24A of the
              contract. Schools shouldn&apos;t spend their best hour rewording the
              same notice for the fourth year group.
            </p>
            <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              Those are the jobs assembl picks up. Specialist agents — trained
              on your industry&apos;s regulations and your business&apos;s voice — handle
              the admin layer. Your team reviews the output, signs it off, and
              goes back to the work they care about.
            </p>
            <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              The output gets sealed with a trail of how it was made, so it
              stands up later.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/hapai" className="cta-primary inline-flex h-12 items-center justify-center px-6">
                Open HAPAI tools
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link href="/c/waihanga" className="btn-ghost inline-flex h-12 items-center justify-center px-6">
                Try a kete chat
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="border-b border-[rgba(35,33,31,0.08)] bg-white/42 px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <ThreeSteps />
      </RevealSection>

      <RevealSection className="border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <MarketplaceStrip />
      </RevealSection>

      <RevealSection className="border-b border-[rgba(35,33,31,0.08)] bg-white/38 px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
              HAPAI · PUBLIC TOOLS
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.8rem,6vw,5rem)] font-normal italic leading-tight">
              Try one useful tool.
            </h2>
            <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              HAPAI is the apps and tools page: single-purpose public tools for
              real work. Open one, get a useful result, then turn the win into a
              private internal tool if it earns its keep.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {FEATURED_HAPAI_TOOLS.map((tool, index) => (
              <motion.div
                key={tool.href}
                initial={reduceMotion ? false : { opacity: 1, y: 22 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.26 }}
                transition={{ duration: 0.52, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reduceMotion ? undefined : { y: -4 }}
              >
                <Link
                  href={tool.href}
                  className="group flex min-h-[390px] flex-col overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] transition-colors hover:border-[color:var(--assembl-pounamu)] hover:bg-white"
                >
                  <span className="relative block aspect-[16/10] border-b border-[rgba(35,33,31,0.10)] bg-white">
                    <span className="block h-full transition-transform duration-500 group-hover:scale-[1.025]">
                      <HapaiToolPreview visual={tool.visual} />
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-5">
                    <span className="w-fit rounded-full bg-[color:var(--assembl-pounamu)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#FAF7F2]">
                      LIVE
                    </span>
                    <span className="mt-5 block font-display text-2xl font-light italic leading-none">
                      {tool.name}
                    </span>
                    <span className="mt-4 block text-sm leading-relaxed text-[color:var(--text-body)]">
                      {tool.description}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                      Open the tool <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </span>
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={reduceMotion ? false : { opacity: 1, y: 22 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.26 }}
              transition={{ duration: 0.52, delay: FEATURED_HAPAI_TOOLS.length * 0.045, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <Link
              href="/hapai"
              className="group flex min-h-[300px] flex-col justify-between rounded-[8px] border border-[rgba(43,107,87,0.28)] bg-[color:var(--assembl-pounamu)] p-6 text-[#FAF7F2] transition-transform hover:-translate-y-0.5"
              >
                <span aria-hidden />
                <span>
                  <span className="block font-display text-4xl font-light italic leading-none text-[#FAF7F2]">
                    See the full library.
                  </span>
                  <span className="mt-4 block text-sm leading-relaxed text-[#FAF7F2]/82">
                    Live tools your team can try on real work today.
                  </span>
                  <span className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                    Open HAPAI <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </RevealSection>

      <RevealSection id="kete-workflows" className="scroll-mt-24 border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-4xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              NINE KETE · NINE INDUSTRIES
            </p>
            <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
              A specialist team for every kind of work.
            </h2>
            <p className="mt-5 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              Each pack holds a specialist team: assistants trained on the
              industry&apos;s regulations, policies, and patterns of work; review
              points where a named person signs off; evidence packs shaped for
              the audience that has to read them. Try any of the nine in the
              public chat. No signup.
            </p>
          </div>
          <KeteCardGrid
            ketes={ketes}
            activeSlug={activeSlug}
            onSelect={setActiveSlug}
            reduceMotion={reduceMotion}
          />
        </div>
      </RevealSection>

      <RevealSection className="border-b border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              EVIDENCE PACK
            </p>
            <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
              Not just an answer. A record.
            </h2>
            <p className="mt-6 max-w-[720px] text-[17px] leading-[1.6] text-[color:var(--text-body)] md:text-base">
              Every workflow ends in a single document with the work and its
              working. Sources cited inline. Assumptions made explicit. Checks
              logged. Review notes attached. A timestamp on every step. A hash
              chain that proves nothing has been changed since the reviewer
              signed off. File it. Forward it. Footnote it. Hand it to your
              auditor, your insurer, your board.
            </p>
            <Link href="/evidence-pack" className="mt-8 inline-flex h-12 items-center rounded-[8px] bg-[color:var(--assembl-pounamu)] px-6 font-medium text-[#FAF7F2]">
              See an evidence pack <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#EFEAE1]/58 p-4 shadow-[0_24px_80px_rgba(35,33,31,0.10)] md:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 82% 18%, rgba(43,107,87,0.10), transparent 42%), linear-gradient(180deg, rgba(250,247,242,0.88), rgba(239,234,225,0.54))',
              }}
            />
            <div className="relative grid gap-4">
              <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[#FAF7F2]/88 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                  sealed example
                </p>
                <h3 className="mt-3 max-w-lg font-display text-[clamp(2.2rem,4vw,4.2rem)] font-light italic leading-[0.94]">
                  Consent variation pack.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[color:var(--text-body)]">
                  A fileable record of the inputs, checks, draft, reviewer notes,
                  and the final sign-off trail.
                </p>
              </div>
              <EvidencePackPreview
                title="Kitchen extract consent response"
                workflowId="ASM-MAN-0429"
                reviewer="Mere Wilson"
                generatedAt="21 May 2026 · 09:42 NZST"
                citations={['Building Act 2004', 'Food Act 2014', 'Privacy Act 2020']}
                checks={['Source documents attached', 'Reviewer note recorded', 'Hash-chain entry sealed']}
                className="bg-white/82"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                {['inputs logged', 'citations inline', 'human signed off'].map((label) => (
                  <div
                    key={label}
                    className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/58 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="border-b border-[rgba(35,33,31,0.08)] bg-white/42 px-6 py-32 md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <div className="mx-auto max-w-[1500px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
            START HERE
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-2xl font-display text-[clamp(3rem,7vw,5.8rem)] font-normal italic leading-tight">
              Three ways in.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PRICING_ENTRY_POINTS.map(([name, price, body, cta, href, accent], index) => (
              <motion.article
                key={name}
                className="rounded-[8px] border border-[rgba(35,33,31,0.10)] border-t-[5px] bg-[color:var(--assembl-paper)] p-6"
                style={{ borderTopColor: accent }}
                initial={reduceMotion ? false : { opacity: 1, y: 22 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.34 }}
                transition={{ duration: 0.5, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reduceMotion ? undefined : { y: -3 }}
              >
                <h3 className="font-display text-4xl font-light italic leading-none">
                  {name}
                </h3>
                <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                  {price}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--text-body)]">
                  {body}
                </p>
                <Link href={href} className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
                  {cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </motion.article>
            ))}
          </div>
          <Link href="/pricing" className="mt-8 inline-flex h-12 items-center justify-center rounded-[8px] border border-[rgba(35,33,31,0.14)] px-6 font-medium text-[color:var(--text-primary)]">
            See full pricing <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </RevealSection>

      <RevealSection className="bg-[color:var(--assembl-pounamu)] px-6 py-32 text-[#FAF7F2] md:px-12 md:py-40" reduceMotion={reduceMotion}>
        <div className="mx-auto flex max-w-[1500px] flex-col items-center gap-8 text-center">
          <h2 className="max-w-4xl font-display text-[clamp(3rem,7vw,6rem)] font-normal italic leading-tight text-[#FAF7F2]">
            Bring one workflow. Leave with proof.
          </h2>
          <p className="max-w-[620px] text-[17px] leading-[1.6] text-[#FAF7F2]/86 md:text-base">
            Ten working days. One job your team actually runs. An evidence pack
            you can hand to anyone.
          </p>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link href="/pilot-sprint" className="inline-flex h-12 items-center justify-center rounded-[8px] bg-[#FAF7F2] px-6 font-medium text-[color:var(--assembl-pounamu)]">
              Book a pilot <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link href="/hapai" className="inline-flex h-12 items-center justify-center rounded-[8px] border border-[#FAF7F2]/45 px-6 font-medium text-[#FAF7F2]">
              Try a HAPAI tool <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link href="/evidence-pack" className="inline-flex h-12 items-center justify-center rounded-[8px] border border-[#FAF7F2]/45 px-6 font-medium text-[#FAF7F2]">
              See an evidence pack <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </RevealSection>

      <div className="hidden md:block">
        <AssemblConciergeWidget />
      </div>
    </main>
  );
}

function RevealSection({
  children,
  className,
  reduceMotion,
  id,
}: {
  children: React.ReactNode;
  className: string;
  reduceMotion: boolean | null;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={reduceMotion ? false : { opacity: 1, y: 34 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.12, margin: '-80px 0px' }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
}

function KeteCardGrid({
  ketes,
  activeSlug,
  onSelect,
  reduceMotion,
}: {
  ketes: Kete[];
  activeSlug: KeteSlug;
  onSelect: (slug: KeteSlug) => void;
  reduceMotion: boolean | null;
}) {
  return (
    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Choose a kete">
      {ketes.map((kete, index) => {
        const active = kete.slug === activeSlug;
        return (
          <motion.div
            key={kete.slug}
            style={{ '--tile-accent': kete.accent } as CSSProperties}
            initial={reduceMotion ? false : { opacity: 1, y: 24, scale: 0.985 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.24 }}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            transition={{ duration: 0.5, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] }}
          >
            <article
              onMouseEnter={() => onSelect(kete.slug)}
              className={[
                'group relative flex min-h-[360px] flex-col overflow-hidden rounded-[8px] border bg-white/65 text-left shadow-[0_10px_36px_rgba(35,33,31,0.05)] backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tile-accent)] focus-visible:ring-offset-2',
                active
                  ? 'border-[color:var(--tile-accent)] bg-white'
                  : 'border-[rgba(35,33,31,0.12)] hover:border-[color:var(--tile-accent)] hover:bg-white/78',
              ].join(' ')}
              aria-current={active ? 'true' : undefined}
            >
              <span
                className="relative block aspect-[16/10] w-full overflow-hidden border-b border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)]"
                aria-hidden
              >
                <Image
                  src={kete.heroImage}
                  alt=""
                  fill
                  sizes="170px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  style={{ objectPosition: "50% 35%" }}
                />
                <span
                  className="absolute inset-x-0 top-0 h-1.5 bg-[color:var(--tile-accent)]"
                  aria-hidden
                />
              </span>
              <span className="flex flex-1 flex-col p-7">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  {kete.industry}
                </span>
                <span className="block font-display text-[28px] font-medium leading-none text-[color:var(--tile-accent)]">
                  {kete.name}
                </span>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                  {KETE_ACCENT_NAMES[kete.slug]}
                </span>
                <span className="mt-4 block min-h-[74px] text-[14.5px] leading-relaxed text-[#2A2825]">
                  {KETE_CARD_COPY[kete.slug]}
                </span>
                <span className="mt-auto flex flex-wrap items-center gap-4 pt-6 text-[13px]">
                  <Link
                    href={`/kete/${kete.slug}`}
                    onFocus={() => onSelect(kete.slug)}
                    className="font-medium text-[color:var(--text-primary)] underline-offset-4 hover:text-[color:var(--assembl-pounamu)] hover:underline"
                  >
                    Learn more →
                  </Link>
                  <Link
                    href={`/c/${kete.slug}`}
                    onFocus={() => onSelect(kete.slug)}
                    className="font-medium text-[color:var(--assembl-pounamu)] underline-offset-4 hover:underline"
                  >
                    Try the chat →
                  </Link>
                  <Link
                    href={`/workflows?kete=${kete.slug}`}
                    onFocus={() => onSelect(kete.slug)}
                    className="text-[12px] text-[color:var(--text-secondary)] underline-offset-4 hover:underline"
                  >
                    See workflows →
                  </Link>
                </span>
              </span>
            </article>
          </motion.div>
        );
      })}
    </div>
  );
}
