'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface AssemblHeroVesselSceneProps {
  reduceMotion: boolean;
}

const PLATE_TEMPLATES = [
  { y: -0.55, rx: 1.32, rz: 0.96, amp: 0.16, amp2: 0.05, phase: 0.0, rotY: 0.1, rotZ: 0.03, lobe: 2 },
  { y: -0.18, rx: 1.24, rz: 0.9, amp: 0.15, amp2: 0.05, phase: 2.1, rotY: -0.32, rotZ: -0.04, lobe: 2 },
  { y: 0.18, rx: 1.16, rz: 0.86, amp: 0.14, amp2: 0.05, phase: 4.3, rotY: 0.42, rotZ: 0.05, lobe: 3 },
  { y: 0.56, rx: 1.06, rz: 0.8, amp: 0.13, amp2: 0.04, phase: 0.9, rotY: -0.22, rotZ: -0.03, lobe: 2 },
  { y: 0.94, rx: 0.94, rz: 0.72, amp: 0.12, amp2: 0.04, phase: 3.5, rotY: 0.28, rotZ: 0.04, lobe: 3 },
];

function noise3(x: number, y: number, z: number, seed = 0) {
  return (
    Math.sin(x * 1.7 + seed * 0.9) * Math.cos(z * 1.9 + seed * 1.3) * Math.sin(y * 1.4 + seed * 0.5) * 0.55 +
    Math.sin(x * 3.3 + seed * 2.1) * Math.cos(y * 3.1 + seed * 0.7) * 0.3 +
    Math.cos(z * 5.1 + seed * 1.6) * Math.sin(x * 4.7 + seed * 0.3) * 0.18
  );
}

function makeBlobGeometry(radius: number, squashY: number, ampOuter: number, seed: number) {
  const geometry = new THREE.SphereGeometry(radius, 96, 64);
  const positions = geometry.attributes.position;
  const point = new THREE.Vector3();

  for (let index = 0; index < positions.count; index += 1) {
    point.fromBufferAttribute(positions, index);
    const nx = point.x / radius;
    const ny = point.y / radius;
    const nz = point.z / radius;
    const displacement = (
      noise3(point.x * 0.7, point.y * 0.7, point.z * 0.7, seed) +
      noise3(point.x * 1.6, point.y * 1.6, point.z * 1.6, seed + 1.7) * 0.35
    ) * ampOuter;
    const pinch = 1 - Math.pow(Math.abs(ny), 2.5) * 0.35;

    positions.setXYZ(
      index,
      (point.x + nx * displacement) * pinch,
      (point.y + ny * displacement) * squashY,
      (point.z + nz * displacement) * pinch,
    );
  }

  geometry.computeVertexNormals();
  return geometry;
}

function ctx2d(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas context unavailable');
  return context;
}

function makeShellTextures() {
  const size = 1024;
  const colourCanvas = document.createElement('canvas');
  colourCanvas.width = colourCanvas.height = size;
  const colour = ctx2d(colourCanvas);

  const base = colour.createRadialGradient(size * 0.4, size * 0.35, 20, size * 0.5, size * 0.5, size * 0.75);
  base.addColorStop(0, '#FFF8EC');
  base.addColorStop(0.55, '#EFE0C5');
  base.addColorStop(1, '#D4C29D');
  colour.fillStyle = base;
  colour.fillRect(0, 0, size, size);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = bumpCanvas.height = size;
  const bump = ctx2d(bumpCanvas);
  bump.fillStyle = '#808080';
  bump.fillRect(0, 0, size, size);

  for (let radius = 4; radius < size * 1.4; radius += 3.4) {
    const dark = Math.sin(radius * 1.71) > 0;
    const alpha = 0.32 + (Math.sin(radius * 0.013) + 1) * 0.16;
    const stroke = dark ? `rgba(58,42,22,${alpha})` : `rgba(255,250,232,${alpha})`;
    const bumpStroke = dark ? `rgba(12,12,12,${alpha + 0.12})` : `rgba(252,252,252,${alpha + 0.12})`;
    const lineWidth = 0.9 + (Math.sin(radius * 0.04) + 1) * 0.8;

    colour.lineWidth = lineWidth;
    bump.lineWidth = lineWidth;
    colour.strokeStyle = stroke;
    bump.strokeStyle = bumpStroke;
    colour.beginPath();
    bump.beginPath();

    for (let segment = 0; segment <= 260; segment += 1) {
      const angle = (segment / 260) * Math.PI * 2;
      const warp = Math.sin(angle * 6 + radius * 0.035) * 1.6 + Math.sin(angle * 13 + radius * 0.018) * 0.8;
      const currentRadius = radius + warp;
      const x = size / 2 + Math.cos(angle) * currentRadius;
      const y = size / 2 + Math.sin(angle) * currentRadius * 0.9;
      if (segment === 0) {
        colour.moveTo(x, y);
        bump.moveTo(x, y);
      } else {
        colour.lineTo(x, y);
        bump.lineTo(x, y);
      }
    }

    colour.stroke();
    bump.stroke();
  }

  ['rgba(180,205,235,0.15)', 'rgba(235,195,205,0.12)', 'rgba(200,225,210,0.12)', 'rgba(220,200,235,0.12)'].forEach((tone, index) => {
    const x = size * (0.22 + index * 0.18);
    const y = size * (0.24 + (index % 2) * 0.34);
    const glow = colour.createRadialGradient(x, y, 0, x, y, 220);
    glow.addColorStop(0, tone);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    colour.fillStyle = glow;
    colour.beginPath();
    colour.arc(x, y, 220, 0, Math.PI * 2);
    colour.fill();
  });

  const map = new THREE.CanvasTexture(colourCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  return { map, bumpMap };
}

function makeGlassBumpTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = ctx2d(canvas);
  context.fillStyle = '#808080';
  context.fillRect(0, 0, size, size);

  for (let index = 0; index < 60; index += 1) {
    const x1 = (Math.sin(index * 12.9898) * 43758.5453) % size;
    const y1 = (Math.cos(index * 78.233) * 24634.6345) % size;
    const length = 210 + (index % 9) * 42;
    const angle = index * 0.72;
    const x2 = x1 + Math.cos(angle) * length;
    const y2 = y1 + Math.sin(angle) * length;
    const gradient = context.createLinearGradient(x1, y1, x2, y2);
    const value = index % 2 === 0 ? 215 : 90;
    gradient.addColorStop(0, `rgba(${value},${value},${value},0)`);
    gradient.addColorStop(0.5, `rgba(${value},${value},${value},0.55)`);
    gradient.addColorStop(1, `rgba(${value},${value},${value},0)`);
    context.strokeStyle = gradient;
    context.lineWidth = 0.8 + (index % 5) * 0.35;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

function makeWavyPlateGeometry({
  rx,
  rz,
  ampPrimary,
  ampSecondary,
  phase,
  greenBias,
  lobe,
}: {
  rx: number;
  rz: number;
  ampPrimary: number;
  ampSecondary: number;
  phase: number;
  greenBias: number;
  lobe: number;
}) {
  const segR = 56;
  const segA = 110;
  const positions: number[] = [];
  const colours: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let radialIndex = 0; radialIndex <= segR; radialIndex += 1) {
    const radius = radialIndex / segR;
    for (let angleIndex = 0; angleIndex <= segA; angleIndex += 1) {
      const angle = (angleIndex / segA) * Math.PI * 2;
      const angularRadius = 1 + Math.sin(angle * 2 + phase) * 0.05 + Math.cos(angle + phase * 0.7) * 0.04;
      const x = Math.cos(angle) * radius * rx * angularRadius;
      const z = Math.sin(angle) * radius * rz * angularRadius;
      const y =
        Math.sin(angle + phase) * Math.pow(radius, 1.2) * ampPrimary +
        Math.cos(angle * lobe + phase * 0.6) * Math.pow(radius, 1.4) * ampSecondary -
        Math.pow(radius, 5) * 0.02;

      positions.push(x, y, z);

      const radial = Math.pow(1 - radius, 0.9);
      const swirl = 0.65 + 0.35 * Math.sin(angle * 2 + radius * 4 + phase * 1.5);
      const ink = THREE.MathUtils.clamp(radial * swirl * 1.3, 0, 1) * greenBias;
      colours.push(
        THREE.MathUtils.lerp(0.98, 0.18, ink),
        THREE.MathUtils.lerp(0.99, 0.48, ink),
        THREE.MathUtils.lerp(0.96, 0.4, ink),
      );
      uvs.push(0.5 + Math.cos(angle) * radius * 0.5, 0.5 + Math.sin(angle) * radius * 0.5);
    }
  }

  for (let radialIndex = 0; radialIndex < segR; radialIndex += 1) {
    for (let angleIndex = 0; angleIndex < segA; angleIndex += 1) {
      const a = radialIndex * (segA + 1) + angleIndex;
      const b = a + 1;
      const c = a + (segA + 1);
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeHaloTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = ctx2d(canvas);
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 218, 168, 0.70)');
  gradient.addColorStop(0.38, 'rgba(255, 210, 150, 0.24)');
  gradient.addColorStop(1, 'rgba(255, 200, 130, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function AssemblHeroVesselScene({ reduceMotion }: AssemblHeroVesselSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);
    Object.assign(renderer.domElement.style, {
      position: 'absolute',
      inset: '0',
      zIndex: '1',
      display: 'block',
      width: '100%',
      height: '100%',
    });
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(16, 16 / 10, 0.1, 100);
    camera.position.set(2.35, 2.15, 11.4);
    camera.lookAt(0, 0.18, 0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;

    const paperMaterial = new THREE.MeshStandardMaterial({ color: 0xf1eadc, roughness: 0.95, metalness: 0 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), paperMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    floor.receiveShadow = true;
    scene.add(floor);

    const ambient = new THREE.AmbientLight(0xfff1dc, 0.7);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffe2b8, 2.7);
    key.position.set(-5.5, 6.5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -3.5;
    key.shadow.camera.right = 3.5;
    key.shadow.camera.top = 3.5;
    key.shadow.camera.bottom = -3.5;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 24;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.02;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xf6ecda, 0.55);
    fill.position.set(4, 2.5, 3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xc9ddcb, 0.55);
    rim.position.set(-1.5, 3, -4.5);
    scene.add(rim);

    const glint = new THREE.PointLight(0xffd58a, 0.85, 8, 1.6);
    glint.position.set(-1.6, 2.4, 1.8);
    scene.add(glint);

    const backLight = new THREE.DirectionalLight(0xffe6be, 0.95);
    backLight.position.set(0.5, -2.8, -3.5);
    scene.add(backLight);

    const underGlow = new THREE.PointLight(0xc8e0cb, 0.74, 6, 1.8);
    underGlow.position.set(0, -0.6, 0.6);
    scene.add(underGlow);

    const vessel = new THREE.Group();
    vessel.scale.setScalar(0.74);
    scene.add(vessel);

    const brassMaterial = new THREE.MeshStandardMaterial({ color: 0xc9a368, metalness: 0.85, roughness: 0.38 });
    const standDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.022, 64), brassMaterial);
    standDisc.position.y = -1.18;
    standDisc.castShadow = true;
    standDisc.receiveShadow = true;
    vessel.add(standDisc);

    const standRod = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.9, 24), brassMaterial);
    standRod.position.y = -0.22;
    standRod.castShadow = true;
    vessel.add(standRod);

    const shellTexture = makeShellTextures();
    const glassBumpTexture = makeGlassBumpTexture();

    const ceramicMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: shellTexture.map,
      bumpMap: shellTexture.bumpMap,
      bumpScale: 1.8,
      roughness: 0.4,
      metalness: 0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.2,
      iridescence: 0.45,
      iridescenceIOR: 1.34,
      iridescenceThicknessRange: [240, 760],
    });

    const blobBottom = new THREE.Mesh(makeBlobGeometry(0.52, 0.42, 0.045, 0.3), ceramicMaterial);
    blobBottom.scale.set(1.05, 1, 0.95);
    blobBottom.position.y = -0.95;
    blobBottom.rotation.y = 0.4;
    blobBottom.castShadow = true;
    blobBottom.receiveShadow = true;
    vessel.add(blobBottom);

    const blobTop = new THREE.Mesh(makeBlobGeometry(0.48, 0.38, 0.04, 7.1), ceramicMaterial);
    blobTop.scale.set(1.08, 1, 0.92);
    blobTop.position.y = 1.38;
    blobTop.rotation.y = -0.7;
    blobTop.rotation.z = 0.08;
    blobTop.castShadow = true;
    blobTop.receiveShadow = true;
    vessel.add(blobTop);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      vertexColors: true,
      metalness: 0,
      roughness: 0.05,
      transmission: 1,
      thickness: 0.1,
      ior: 1.5,
      attenuationDistance: 2.4,
      attenuationColor: new THREE.Color('#D6E5D8'),
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      bumpMap: glassBumpTexture,
      bumpScale: 0.15,
      transparent: true,
      side: THREE.DoubleSide,
      envMapIntensity: 1.2,
    });

    const platesGroup = new THREE.Group();
    vessel.add(platesGroup);
    const plates = PLATE_TEMPLATES.map((template, index) => {
      const geometry = makeWavyPlateGeometry({
        rx: template.rx,
        rz: template.rz,
        ampPrimary: template.amp,
        ampSecondary: template.amp2,
        phase: template.phase,
        greenBias: 0.46,
        lobe: template.lobe,
      });
      const mesh = new THREE.Mesh(geometry, glassMaterial.clone());
      mesh.position.y = template.y;
      mesh.rotation.y = template.rotY;
      mesh.rotation.z = template.rotZ;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      platesGroup.add(mesh);
      return { mesh, baseY: template.y, baseRotY: template.rotY, baseRotZ: template.rotZ, phase: index * 0.9 };
    });

    const haloMaterial = new THREE.SpriteMaterial({
      map: makeHaloTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.22,
    });
    const halo = new THREE.Sprite(haloMaterial);
    halo.scale.set(4.25, 4.25, 1);
    halo.position.set(0.2, 0.4, -1.6);
    scene.add(halo);

    const sparkCount = 80;
    const sparkGeometry = new THREE.SphereGeometry(0.012, 6, 5);
    const sparkMaterial = new THREE.MeshBasicMaterial({
      color: 0xffe2a8,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparkles = new THREE.InstancedMesh(sparkGeometry, sparkMaterial, sparkCount);
    sparkles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    sparkles.frustumCulled = false;
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const sparkData = Array.from({ length: sparkCount }, (_, index) => {
      const angle = (index / sparkCount) * Math.PI * 2 + Math.sin(index) * 0.2;
      const radius = 0.58 + ((index * 17) % 100) / 100 * 1.34;
      const y = -0.42 + ((index * 29) % 100) / 100 * 1.72;
      const tint = index % 7 === 0 ? new THREE.Color('#B8D3BD') : index % 3 === 0 ? new THREE.Color('#FFEED0') : new THREE.Color('#FFD18A');
      sparkles.setColorAt(index, tint);
      return { angle, radius, y, phase: index * 0.61, speed: 0.65 + (index % 9) * 0.16, size: 0.52 + (index % 6) * 0.17, tint };
    });
    scene.add(sparkles);

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.targetY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };
    const onPointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerleave', onPointerLeave);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, true);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let animationFrame = 0;
    const startedAt = performance.now();
    setReady(true);

    const animate = () => {
      const time = (performance.now() - startedAt) / 1000;
      const still = reduceMotion;
      pointer.x += (pointer.targetX - pointer.x) * 0.06;
      pointer.y += (pointer.targetY - pointer.y) * 0.06;

      if (!still) {
        vessel.rotation.y = time * 0.018 + pointer.x * 0.1;
        vessel.rotation.x = -pointer.y * 0.07;
        vessel.position.y = Math.sin(time * 0.55) * 0.018;
        plates.forEach((plate) => {
          plate.mesh.position.y = plate.baseY + Math.sin(time * 0.5 + plate.phase) * 0.008;
          plate.mesh.rotation.y = plate.baseRotY + Math.sin(time * 0.3 + plate.phase) * 0.02 + pointer.x * 0.04;
          plate.mesh.rotation.z = plate.baseRotZ + Math.cos(time * 0.27 + plate.phase * 1.3) * 0.012;
        });
        blobTop.rotation.y = -0.7 + Math.sin(time * 0.18) * 0.08;
        blobBottom.rotation.y = 0.4 + Math.cos(time * 0.14) * 0.06;
        halo.scale.setScalar(4.25 * (1 + Math.sin(time * 0.6) * 0.035));
        glint.position.x = -1.6 + Math.sin(time * 0.4) * 0.5;
        glint.position.z = 1.8 + Math.cos(time * 0.4) * 0.5;
        glint.intensity = 0.55 + (Math.sin(time * 1.1) * 0.5 + 0.5) * 0.55;
      }

      sparkData.forEach((spark, index) => {
        const twinkle = 0.25 + (Math.sin(time * spark.speed + spark.phase) * 0.5 + 0.5) * 0.95;
        const drift = still ? 0 : Math.sin(time * 0.35 + spark.phase) * 0.025;
        position.set(
          Math.cos(spark.angle) * spark.radius - pointer.x * 0.05,
          spark.y + drift - pointer.y * 0.04,
          Math.sin(spark.angle) * spark.radius * 0.95,
        );
        const currentScale = spark.size * (0.6 + twinkle * 0.8) * 0.9;
        scale.set(currentScale, currentScale, currentScale);
        matrix.compose(position, quaternion, scale);
        sparkles.setMatrixAt(index, matrix);
        sparkles.setColorAt(index, spark.tint.clone().multiplyScalar(twinkle * 0.82));
      });
      sparkles.instanceMatrix.needsUpdate = true;
      if (sparkles.instanceColor) sparkles.instanceColor.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      pmrem.dispose();
      scene.environment?.dispose();
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.Points) {
          child.geometry?.dispose();
          const material = child.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material?.dispose();
        }
      });
      haloMaterial.map?.dispose();
      haloMaterial.dispose();
      shellTexture.map.dispose();
      shellTexture.bumpMap.dispose();
      glassBumpTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reduceMotion]);

  return (
    <div
      ref={hostRef}
      className="absolute inset-y-[-7%] left-1/2 z-20 w-[112vw] max-w-[1180px] -translate-x-1/2 opacity-100 md:inset-y-[-10%] md:w-[70vw] 2xl:max-w-[1280px]"
      aria-hidden
    >
      <div
        className={`pointer-events-none absolute inset-0 rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.70),rgba(221,238,230,0.22)_36%,rgba(217,168,90,0.10)_58%,transparent_76%)] blur-2xl transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden
      />
    </div>
  );
}
