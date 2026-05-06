import { CinematicHero } from '@/components/sections/CinematicHero';
import { HorizontalScrollKete } from '@/components/sections/HorizontalScrollKete';
import { KeteTotem3D } from '@/components/sections/KeteTotem3D';
import { StickyScrollNarrative } from '@/components/sections/StickyScrollNarrative';
import { TextRevealCards } from '@/components/sections/TextRevealCards';
import { BentoGrid } from '@/components/sections/BentoGrid';
import { AotearoaGlobe } from '@/components/sections/AotearoaGlobe';
import { ParallaxClose } from '@/components/sections/ParallaxClose';

export default function HomePage() {
  return (
    <>
      {/* Cinematic hero with massive headline + image bg */}
      <CinematicHero />

      {/* Apple-style horizontal scroll kete cards */}
      <HorizontalScrollKete />

      {/* 3D rotating kete totem */}
      <KeteTotem3D />

      {/* Sticky scroll narrative — problem → solution */}
      <StickyScrollNarrative />

      {/* Text reveal cards — before/after comparisons */}
      <TextRevealCards />

      {/* Bento grid with full-bleed imagery */}
      <BentoGrid />

      {/* 3D Aotearoa globe with glassmorphism */}
      <AotearoaGlobe />

      {/* Multi-layer parallax cinematic close */}
      <ParallaxClose />
    </>
  );
}
