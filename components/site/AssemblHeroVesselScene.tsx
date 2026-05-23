'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface AssemblHeroVesselSceneProps {
  reduceMotion: boolean;
}

const MODEL_URL = '/models/assembl-hero-vessel.glb';

function sourceColor(source: THREE.Material | THREE.Material[] | undefined, fallback: string) {
  const material = Array.isArray(source) ? source[0] : source;
  if (material && 'color' in material && material.color instanceof THREE.Color) {
    const color = material.color.clone();
    const brightness = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
    if (brightness < 0.93) return color;
  }
  return new THREE.Color(fallback);
}

function makeGlassMaterial(index: number, source?: THREE.Material | THREE.Material[]) {
  const palette = [
    { color: '#f7efd8', roughness: 0.24, transmission: 0.26, metalness: 0.02, opacity: 0.92 },
    { color: '#a8d17e', roughness: 0.08, transmission: 0.54, metalness: 0.01, opacity: 0.78 },
    { color: '#6fb55d', roughness: 0.06, transmission: 0.62, metalness: 0.01, opacity: 0.72 },
    { color: '#d7a85b', roughness: 0.1, transmission: 0.42, metalness: 0.04, opacity: 0.76 },
    { color: '#fff9e8', roughness: 0.3, transmission: 0.16, metalness: 0.03, opacity: 0.94 },
  ];
  const tone = palette[index % palette.length];

  return new THREE.MeshPhysicalMaterial({
    color: sourceColor(source, tone.color),
    metalness: tone.metalness,
    roughness: tone.roughness,
    transmission: tone.transmission,
    thickness: 0.68,
    ior: 1.46,
    reflectivity: 0.78,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    transparent: true,
    opacity: tone.opacity,
    envMapIntensity: 1.85,
    side: THREE.DoubleSide,
  });
}

function enhanceAuthoredMaterial(source: THREE.Material | THREE.Material[], index: number) {
  const materials = Array.isArray(source) ? source : [source];
  const enhanced = materials.map((material) => {
    if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
      const color = material.color.clone().lerp(new THREE.Color('#4F9F7E'), 0.68);

      return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.01,
        roughness: 0.065,
        transmission: 0.34,
        thickness: 1.18,
        ior: 1.48,
        reflectivity: 0.9,
        clearcoat: 1,
        clearcoatRoughness: 0.045,
        transparent: true,
        opacity: 0.88,
        envMapIntensity: 2.25,
        attenuationColor: new THREE.Color('#2B6B57'),
        attenuationDistance: 1.8,
        side: THREE.DoubleSide,
      });
    }

    return makeGlassMaterial(index, material);
  });

  return Array.isArray(source) ? enhanced : enhanced[0];
}

function addGlassEdges(mesh: THREE.Mesh, index: number) {
  const edges = new THREE.EdgesGeometry(mesh.geometry, 18);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: index % 3 === 0 ? '#FFFFFF' : '#6FAF8F',
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );

  line.renderOrder = 1000 + index;
  mesh.add(line);
}

function frameObject(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const scale = 2.28 / maxAxis;
  const pivot = new THREE.Group();

  object.position.copy(center).multiplyScalar(-1);
  pivot.add(object);
  pivot.scale.setScalar(scale);
  pivot.rotation.set(THREE.MathUtils.degToRad(8), THREE.MathUtils.degToRad(-26), THREE.MathUtils.degToRad(-2));

  return pivot;
}

export function AssemblHeroVesselScene({ reduceMotion }: AssemblHeroVesselSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(0, 0.1, 5.35);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.78;
    host.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const ambient = new THREE.HemisphereLight(0xfffbef, 0x557a67, 0.84);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 3.85);
    key.position.set(-3.2, 3.2, 4.4);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x6fd29d, 5.8);
    rim.position.set(3.6, 2.3, -2.6);
    scene.add(rim);

    const gold = new THREE.PointLight(0xffc468, 34, 9);
    gold.position.set(1.9, -0.7, 2.2);
    scene.add(gold);

    const pearl = new THREE.PointLight(0xffffff, 22, 7);
    pearl.position.set(-2.2, 1.2, 2.8);
    scene.add(pearl);

    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 46;
    const sparklePositions = new Float32Array(sparkleCount * 3);
    for (let index = 0; index < sparkleCount; index += 1) {
      const angle = (index / sparkleCount) * Math.PI * 2;
      const radius = 1.3 + (index % 7) * 0.08;
      sparklePositions[index * 3] = Math.cos(angle) * radius;
      sparklePositions[index * 3 + 1] = -0.9 + (index % 13) * 0.15;
      sparklePositions[index * 3 + 2] = Math.sin(angle) * 0.34;
    }
    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
    const sparkleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.018,
      transparent: true,
      opacity: 0.74,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    scene.add(sparkles);

    const group = new THREE.Group();
    scene.add(group);

    let model: THREE.Object3D | null = null;
    let animationFrame = 0;
    let disposed = false;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const rawModel = gltf.scene;

        let meshIndex = 0;
        rawModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = enhanceAuthoredMaterial(child.material, meshIndex);
            child.castShadow = false;
            child.receiveShadow = false;
            child.renderOrder = meshIndex;
            addGlassEdges(child, meshIndex);
            meshIndex += 1;
          }
        });

        model = frameObject(rawModel);
        group.add(model);
        setLoaded(true);
      },
      undefined,
      () => {
        setLoaded(true);
      },
    );

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

    const startedAt = performance.now();
    const animate = () => {
      const time = (performance.now() - startedAt) / 1000;
      if (model && !reduceMotion) {
        group.rotation.y = Math.sin(time * 0.34) * 0.18;
        group.rotation.x = Math.sin(time * 0.28) * 0.035;
        group.rotation.z = Math.sin(time * 0.21) * 0.018;
        group.position.y = Math.sin(time * 0.72) * 0.055;
        sparkles.rotation.y = time * 0.08;
        sparkleMaterial.opacity = 0.52 + Math.sin(time * 1.35) * 0.16;
      }
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      dracoLoader.dispose();
      pmrem.dispose();
      scene.environment?.dispose();
      sparkleGeometry.dispose();
      sparkleMaterial.dispose();
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reduceMotion]);

  return (
    <div
      ref={hostRef}
      className="absolute inset-y-[-3%] left-1/2 z-20 w-[88vw] max-w-[840px] -translate-x-1/2 md:w-[58vw] md:max-w-[1100px]"
      aria-hidden
    >
      <Image
        src="/img/home/assembl-hero-vessel-original.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="(min-width: 1024px) 820px, 100vw"
        className={`object-contain transition-opacity duration-700 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
