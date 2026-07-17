'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import type { QualityProfile } from '@/lib/motion/capability';
import type { SceneConfig } from '@/lib/motion/scene-config';
import { getParticleBuffers, getTargets } from '@/lib/motion/targets';
import { useVisualState, type AssemblVisualState, type TargetForm } from '@/lib/motion/visual-state';

/**
 * One THREE.Points population, GPU-side motion. Attributes carry start
 * position, target, seed and style; uniforms carry the visual state. The
 * SAME particles morph between the cached target forms — no per-particle
 * React components, no resampling per render.
 *
 * Normal alpha blending, no bloom, no additive — every point stays a small
 * distinct metallic fleck on the white page, never a filled volume.
 */

const VERT = /* glsl */ `
  attribute vec3 aTarget;
  attribute vec4 aSeed;   // delay, invDuration, phase, drift
  attribute vec2 aStyle;  // size, alpha
  attribute vec2 aLane;   // courier lane (-1 = none), lane phase
  uniform float uTime;
  uniform float uProgress;
  uniform float uPixelRatio;
  uniform float uPointScale;
  uniform vec2 uPointer;      // world units
  uniform float uPointerForce;
  uniform float uBreath;      // 0..1 — controlled breathing once formed
  uniform float uListen;
  uniform float uThink;
  uniform float uAct;
  uniform float uRipple;      // seconds since the completion ripple; <0 off
  uniform float uCoherence;   // 1 = coherent
  uniform vec3 uLanes[9];     // three thinking paths, three points each
  uniform vec3 uExit[3];      // the acting exit stream
  varying float vAlpha;
  varying float vShade;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  vec3 qBezier(vec3 a, vec3 b, vec3 c, float t) {
    return mix(mix(a, b, t), mix(b, c, t), t);
  }

  void main() {
    // directed assembly: per-particle delay + duration, cubic ease-out
    float lp = clamp((uProgress - aSeed.x) * aSeed.y, 0.0, 1.0);
    float eased = 1.0 - pow(1.0 - lp, 3.0);
    vec3 pos = mix(position, aTarget, eased);

    // sub-pixel independent drift so the held sculpture stays alive
    pos.x += sin(uTime * (0.4 + fract(aSeed.z) * 0.4) + aSeed.z * 7.0) * aSeed.w;
    pos.y += cos(uTime * (0.32 + fract(aSeed.z * 1.7) * 0.3) + aSeed.z * 5.0) * aSeed.w;
    pos.z += sin(uTime * 0.27 + aSeed.z * 3.0) * aSeed.w * 0.6;

    // controlled breathing — a slow, shallow swell of the whole form
    pos *= 1.0 + sin(uTime * 0.55 + aSeed.z * 0.6) * 0.012 * uBreath * eased;

    // listening — a calm inward pulse toward the sculpture's centre
    float pulse = 0.5 + 0.5 * sin(uTime * 1.35);
    pos.xy *= 1.0 - uListen * 0.045 * pulse;

    // thinking — couriers travel along a few clear paths
    float travel = 0.0;
    if (aLane.x > -0.5) {
      int lane = int(aLane.x + 0.5);
      float t = fract(uTime * 0.09 + aLane.y);
      vec3 p = qBezier(uLanes[lane * 3], uLanes[lane * 3 + 1], uLanes[lane * 3 + 2], t);
      float w = uThink * smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.88, 1.0, t));
      pos = mix(pos, p, w);

      // acting — the same couriers form a directed stream leaving the form
      float te = fract(uTime * 0.16 + aLane.y * 1.7);
      vec3 pe = qBezier(uExit[0], uExit[1], uExit[2], te);
      float we = uAct * smoothstep(0.0, 0.08, te) * (1.0 - smoothstep(0.82, 1.0, te));
      pos = mix(pos, pe, we);

      travel = max(w, we);
    }

    // completion — one restrained ripple crossing the form, then stillness
    if (uRipple >= 0.0) {
      float d = length(aTarget.xy);
      float front = uRipple * 2.6;
      float amp = 0.07 * exp(-uRipple * 1.5);
      vec2 dir = aTarget.xy / max(0.001, d);
      pos.xy += dir * exp(-pow((d - front) * 2.4, 2.0)) * amp;
    }

    // reduced coherence — a slight loosening, never a shake
    float loss = 1.0 - uCoherence;
    if (loss > 0.001) {
      float wander = 0.6 + 0.4 * sin(uTime * 0.7 + aSeed.z * 11.0);
      pos += vec3(
        hash(aSeed.z * 13.0) - 0.5,
        hash(aSeed.z * 29.0) - 0.5,
        hash(aSeed.z * 47.0) - 0.5
      ) * loss * 0.8 * wander;
    }

    // pointer — a gentle local lift, no swirl
    vec2 pd = pos.xy - uPointer;
    float pf = exp(-dot(pd, pd) * 0.55) * uPointerForce;
    pos.z += pf * 0.18;
    pos.xy += normalize(pd + vec2(0.001)) * pf * 0.06;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float perspective = 6.0 / max(0.001, -mv.z);
    gl_PointSize = clamp(
      aStyle.x * (1.0 + travel * 0.5) * uPointScale * perspective * uPixelRatio,
      0.9 * uPixelRatio,
      3.2 * uPixelRatio
    );

    // travelling couriers brighten so the paths read clearly
    vAlpha = mix(aStyle.y * (0.3 + 0.7 * eased), 0.92, travel);
    vShade = 0.68 + hash(aSeed.z * 131.0) * 0.47;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vShade;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float a = smoothstep(0.5, 0.24, d) * vAlpha;
    if (a < 0.012) discard;
    gl_FragColor = vec4(uColor * vShade, a);
  }
`;

/** Fine metallic silver on gallery white (between the hero's --silver and
 *  graphite tokens so structural points keep definition). */
const PARTICLE_COLOR = '#79878e';

function laneVectors(scale: number): THREE.Vector3[] {
  // three clear paths following the wing sweep, root → tip
  const raw: Array<[number, number, number]> = [
    [-2.6, -1.2, 0.0], [-0.4, 0.9, 0.3], [2.4, 0.6, 0.0],
    [-2.2, -1.4, -0.3], [0.2, -0.2, 0.2], [2.6, 1.2, 0.2],
    [-2.8, -0.8, 0.3], [-0.2, 0.3, -0.2], [2.2, 1.5, -0.3],
  ];
  return raw.map(([x, y, z]) => new THREE.Vector3(x * scale, y * scale, z * scale));
}

function exitVectors(scale: number): THREE.Vector3[] {
  // a directed stream leaving the sculpture toward the page content
  const raw: Array<[number, number, number]> = [
    [0.4, 0.2, 0.0], [-1.8, -1.0, 0.4], [-5.4, -2.7, 0.8],
  ];
  return raw.map(([x, y, z]) => new THREE.Vector3(x * scale, y * scale, z * scale));
}

type SimState = {
  progress: number;
  form: TargetForm;
  prevState: AssemblVisualState;
  rippleAge: number;
};

export function ParticleScene({
  profile,
  config,
  reducedMotion,
}: {
  profile: QualityProfile;
  config: SceneConfig;
  reducedMotion: boolean;
}) {
  const geoRef = React.useRef<THREE.BufferGeometry>(null);
  const matRef = React.useRef<THREE.ShaderMaterial>(null);
  const groupRef = React.useRef<THREE.Group>(null);
  const { pointer, viewport, invalidate } = useThree();

  const count = Math.max(300, Math.round(profile.particleCount * config.density));
  const scale = config.formScale;

  const sim = React.useRef<SimState>({
    progress: reducedMotion ? 1 : 0,
    form: useVisualState.getState().form,
    prevState: useVisualState.getState().state,
    rippleAge: -1,
  });

  // Attribute arrays are COPIES of the cached target arrays: the cache stays
  // immutable while morphs promote target → position in place.
  const buffers = React.useMemo(() => {
    const form = useVisualState.getState().form;
    const { seeds, styles, lanes } = getParticleBuffers(count);
    return {
      positions: getTargets('scatter', count, scale).slice(),
      targets: getTargets(form, count, scale).slice(),
      seeds,
      styles,
      lanes,
    };
  }, [count, scale]);

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: reducedMotion ? 1 : 0 },
      uPixelRatio: { value: 1 },
      uPointScale: { value: profile.pointSize * config.pointSize },
      uPointer: { value: new THREE.Vector2(999, 999) },
      uPointerForce: { value: 0 },
      uBreath: { value: 0 },
      uListen: { value: 0 },
      uThink: { value: 0 },
      uAct: { value: 0 },
      uRipple: { value: -1 },
      uCoherence: { value: 1 },
      uLanes: { value: laneVectors(scale) },
      uExit: { value: exitVectors(scale) },
      uColor: { value: new THREE.Color(PARTICLE_COLOR) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  React.useEffect(() => {
    const mat = matRef.current;
    if (!mat) return;
    mat.uniforms.uPointScale.value = profile.pointSize * config.pointSize;
    mat.uniforms.uLanes.value = laneVectors(scale);
    mat.uniforms.uExit.value = exitVectors(scale);
  }, [profile.pointSize, config.pointSize, scale]);

  // Reduced motion: the completed form, rendered once, no continuous motion.
  React.useEffect(() => {
    if (reducedMotion) invalidate();
  }, [reducedMotion, invalidate]);

  useFrame((three, rawDt) => {
    const mat = matRef.current;
    const geo = geoRef.current;
    if (!mat || !geo) return;
    // Cap only pathological jumps (resume from a paused frameloop). Slow
    // devices still assemble in wall-clock time — a 5fps frame is 0.2s.
    const dt = Math.min(rawDt, 0.25);
    const u = mat.uniforms;
    u.uPixelRatio.value = three.gl.getPixelRatio();

    const store = useVisualState.getState();
    const s = sim.current;

    if (reducedMotion) {
      // held sculptural form — no time, no breathing, no camera movement
      u.uProgress.value = 1;
      u.uTime.value = 0;
      u.uBreath.value = 0;
      if (store.state === 'dormant' || store.state === 'gathering') {
        store.setVisualState('formed');
      }
      return;
    }

    u.uTime.value += dt;

    // form morph: promote current target → start, aim at the new form
    if (store.form !== s.form) {
      const pos = geo.getAttribute('position') as THREE.BufferAttribute;
      const tgt = geo.getAttribute('aTarget') as THREE.BufferAttribute;
      (pos.array as Float32Array).set(tgt.array as Float32Array);
      pos.needsUpdate = true;
      (tgt.array as Float32Array).set(getTargets(store.form, count, scale));
      tgt.needsUpdate = true;
      s.form = store.form;
      s.progress = 0;
    }

    // state transitions
    const st = store.state;
    if (st !== s.prevState) {
      if (st === 'complete') s.rippleAge = 0;
      if (st === 'dispersing') {
        // the form releases back into the scattered field
        const pos = geo.getAttribute('position') as THREE.BufferAttribute;
        (pos.array as Float32Array).set(getTargets('scatter', count, scale));
        pos.needsUpdate = true;
      }
      s.prevState = st;
    }

    // assembly progress
    if (st === 'dormant') {
      s.progress = Math.max(0, s.progress - dt / (config.assemblySeconds * 0.8));
    } else if (st === 'dispersing') {
      s.progress = Math.max(0, s.progress - dt / (config.assemblySeconds * 0.8));
      if (s.progress <= 0) store.setVisualState('dormant');
    } else {
      s.progress = Math.min(1, s.progress + dt / config.assemblySeconds);
      if (st === 'gathering' && s.progress >= 1) store.setVisualState('formed');
    }
    u.uProgress.value = s.progress;

    // mode uniforms ease toward their targets — nothing pops
    u.uListen.value = THREE.MathUtils.damp(u.uListen.value, st === 'listening' ? 1 : 0, 3, dt);
    u.uThink.value = THREE.MathUtils.damp(u.uThink.value, st === 'thinking' ? 1 : 0, 3, dt);
    u.uAct.value = THREE.MathUtils.damp(u.uAct.value, st === 'acting' ? 1 : 0, 3, dt);
    const breathing =
      st === 'formed' || st === 'listening' || st === 'thinking' || st === 'acting' || st === 'complete';
    u.uBreath.value = THREE.MathUtils.damp(u.uBreath.value, breathing ? 1 : 0, 2, dt);

    // one restrained ripple on completion, then stillness
    if (s.rippleAge >= 0) {
      s.rippleAge += dt;
      if (s.rippleAge > 2.4) s.rippleAge = -1;
    }
    u.uRipple.value = s.rippleAge;

    // coherence recovers on its own — error handling only dips it
    if (store.coherence < 1) store.setCoherence(Math.min(1, store.coherence + dt * 0.25));
    u.uCoherence.value = THREE.MathUtils.damp(u.uCoherence.value, store.coherence, 2, dt);

    // pointer, in world units, faded in so load never jumps
    const px = (pointer.x * viewport.width) / 2;
    const py = (pointer.y * viewport.height) / 2;
    (u.uPointer.value as THREE.Vector2).lerp({ x: px, y: py } as THREE.Vector2, 0.06);
    u.uPointerForce.value = THREE.MathUtils.damp(
      u.uPointerForce.value,
      config.interactionStrength * s.progress,
      2,
      dt,
    );

    // the whole sculpture sways a few tenths of a degree — assembling calm
    const g = groupRef.current;
    if (g) {
      g.rotation.y = Math.sin(u.uTime.value * 0.17) * 0.06 * s.progress;
      g.rotation.z = Math.sin(u.uTime.value * 0.13) * 0.014 * s.progress;
    }
  });

  return (
    <group ref={groupRef}>
      <points key={`${count}:${scale}`} frustumCulled={false}>
        <bufferGeometry ref={geoRef}>
          <bufferAttribute attach="attributes-position" args={[buffers.positions, 3]} />
          <bufferAttribute attach="attributes-aTarget" args={[buffers.targets, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[buffers.seeds, 4]} />
          <bufferAttribute attach="attributes-aStyle" args={[buffers.styles, 2]} />
          <bufferAttribute attach="attributes-aLane" args={[buffers.lanes, 2]} />
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
    </group>
  );
}
