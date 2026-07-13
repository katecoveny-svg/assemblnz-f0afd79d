'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  FORMATIONS,
  HOLD_SECONDS,
  MORPH_SECONDS,
  type FormationName,
  type HeroParticleSettings,
} from './config';
import { createSeedsAndStyles, createTargets } from './formations';

/**
 * One particle population morphing between designed formations.
 *
 * Normal alpha blending, no bloom, no additive — every point is a tiny
 * silver pinpoint whose size is clamped so nothing merges into a surface.
 * Movement is staggered per particle (delay + duration + cubic ease) and,
 * once arrived, each point keeps a sub-pixel sinusoidal drift so the
 * sculpture stays alive without becoming unstable.
 */

const VERT = /* glsl */ `
  attribute vec3 aTarget;
  attribute vec4 aSeed;   // delay, invDuration, phase, drift
  attribute vec2 aStyle;  // size, alpha
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uPointScale;
  varying float vAlpha;

  void main() {
    float lp = clamp((uProgress - aSeed.x) * aSeed.y, 0.0, 1.0);
    float eased = 1.0 - pow(1.0 - lp, 3.0);
    vec3 pos = mix(position, aTarget, eased);

    // restrained independent motion — fractions of a pixel visually
    pos.x += sin(uTime * (0.4 + fract(aSeed.z) * 0.4) + aSeed.z * 7.0) * aSeed.w;
    pos.y += cos(uTime * (0.32 + fract(aSeed.z * 1.7) * 0.3) + aSeed.z * 5.0) * aSeed.w;
    pos.z += sin(uTime * 0.27 + aSeed.z * 3.0) * aSeed.w * 0.6;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float perspective = 6.0 / max(0.001, -mv.z);
    gl_PointSize = clamp(
      aStyle.x * uPointScale * perspective * uPixelRatio,
      0.8 * uPixelRatio,
      2.2 * uPixelRatio
    );

    // points brighten as they arrive and soften while dispersing
    vAlpha = aStyle.y * (0.3 + 0.7 * eased);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float a = smoothstep(0.5, 0.24, d) * vAlpha;
    if (a < 0.012) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

export function ParticleField({
  cfg,
  lockedFormation,
  reducedMotion,
  externalProgress,
}: {
  cfg: HeroParticleSettings;
  /** Hold a single formation (dev toggles / #formation= hash). */
  lockedFormation?: FormationName | null;
  reducedMotion: boolean;
  /** Dev-panel scrub; NaN means "run normally". */
  externalProgress?: number;
}) {
  const geoRef = React.useRef<THREE.BufferGeometry>(null);
  const matRef = React.useRef<THREE.ShaderMaterial>(null);

  // Morph state lives in refs — mutated only inside the frame loop.
  const state = React.useRef({ index: 0, progress: 1, holdLeft: HOLD_SECONDS, morphing: false });

  const startName: FormationName = lockedFormation ?? 'wing';

  const { positions, targets, seeds, styles } = React.useMemo(() => {
    const initial = createTargets(startName, cfg);
    const { seeds: s, styles: st } = createSeedsAndStyles(cfg);
    return {
      positions: initial.slice(),
      targets: initial.slice(),
      seeds: s,
      styles: st,
    };
  }, [cfg, startName]);

  const uniforms = React.useMemo(
    () => ({
      uProgress: { value: 1 },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uPointScale: { value: cfg.pointSize },
      uColor: { value: new THREE.Color('#82898f') }, // silver on white
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  React.useEffect(() => {
    const mat = matRef.current;
    if (mat) mat.uniforms.uPointScale.value = cfg.pointSize;
  }, [cfg.pointSize]);

  useFrame((three, dt) => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms;
    u.uPixelRatio.value = three.gl.getPixelRatio();
    if (!reducedMotion) u.uTime.value += dt;

    if (externalProgress !== undefined && !Number.isNaN(externalProgress)) {
      u.uProgress.value = externalProgress;
      return;
    }
    if (reducedMotion || lockedFormation) {
      u.uProgress.value = 1;
      return;
    }

    const s = state.current;
    if (s.morphing) {
      s.progress = Math.min(1, s.progress + dt / MORPH_SECONDS);
      u.uProgress.value = s.progress;
      if (s.progress >= 1) {
        s.morphing = false;
        s.holdLeft = HOLD_SECONDS;
      }
    } else {
      s.holdLeft -= dt;
      if (s.holdLeft <= 0) {
        // promote target → source, aim at the next formation
        const geo = geoRef.current;
        if (!geo) return;
        const pos = geo.getAttribute('position') as THREE.BufferAttribute;
        const tgt = geo.getAttribute('aTarget') as THREE.BufferAttribute;
        (pos.array as Float32Array).set(tgt.array as Float32Array);
        pos.needsUpdate = true;
        s.index = (s.index + 1) % FORMATIONS.length;
        const next = createTargets(FORMATIONS[s.index], cfg);
        (tgt.array as Float32Array).set(next);
        tgt.needsUpdate = true;
        s.progress = 0;
        s.morphing = true;
      }
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[targets, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 4]} />
        <bufferAttribute attach="attributes-aStyle" args={[styles, 2]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.NormalBlending}
      />
    </points>
  );
}
