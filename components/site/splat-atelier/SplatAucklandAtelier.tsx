'use client';

import { useEffect, useRef } from 'react';
import styles from './splat-atelier.module.css';

const THREE_IMPORTMAP = {
  imports: {
    three: 'https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js',
    'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.184.0/examples/jsm/',
    '@sparkjsdev/spark': 'https://sparkjs.dev/releases/spark/2.2.0/spark.module.js',
  },
};

export default function SplatAucklandAtelier() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const qaStill = new URLSearchParams(window.location.search).has('qa');

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const boot = async () => {
      const runtimeImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>;
      const THREE = await runtimeImport('three');
      const { GLTFLoader } = await runtimeImport('three/addons/loaders/GLTFLoader.js');
      const Spark = await runtimeImport('@sparkjsdev/spark');

      if (disposed) return;

      const {
        Color,
        DirectionalLight,
        AmbientLight,
        PerspectiveCamera,
        Scene,
        WebGLRenderer,
        Mesh,
        MeshPhysicalMaterial,
        MeshStandardMaterial,
        BoxGeometry,
        CapsuleGeometry,
        SphereGeometry,
        CylinderGeometry,
        Group,
        Vector3,
        Quaternion,
        MathUtils,
      } = THREE;

      const { SparkRenderer, SplatMesh, imageSplats } = Spark;

      const scene = new Scene();
      scene.background = new Color('#efe8e8');

      const camera = new PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, 0.05, 100);
      camera.position.set(-7.4, 3.2, 11.5);

      const renderer = new WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const spark = new SparkRenderer({ renderer });
      scene.add(spark);

      scene.add(new AmbientLight('#fffaf8', 2.15));
      const key = new DirectionalLight('#fff7ef', 3.2);
      key.position.set(-4, 9, 7);
      scene.add(key);

      const room = new Group();
      scene.add(room);

      // Three owned office renders form the photographic splat envelope.
      const officeWall = imageSplats({
        url: '/do/world/scandi-v1/harbour-workroom.jpg',
        subXY: 2,
        dotRadius: 0.82,
      });
      officeWall.position.set(0, 3.4, -5.75);
      officeWall.scale.set(0.0185, 0.0185, 0.0185);
      room.add(officeWall);

      const loungeWall = imageSplats({
        url: '/do/world/scandi-v1/studio-lounge.jpg',
        subXY: 2,
        dotRadius: 0.76,
      });
      loungeWall.position.set(-6.0, 3.0, -0.4);
      loungeWall.rotation.y = Math.PI / 2.18;
      loungeWall.scale.set(0.015, 0.015, 0.015);
      room.add(loungeWall);

      const reviewWall = imageSplats({
        url: '/do/world/scandi-v1/review-room.jpg',
        subXY: 2,
        dotRadius: 0.76,
      });
      reviewWall.position.set(6.0, 3.0, -0.65);
      reviewWall.rotation.y = -Math.PI / 2.16;
      reviewWall.scale.set(0.015, 0.015, 0.015);
      room.add(reviewWall);

      const addSplat = (group: any, x: number, y: number, z: number, scale: number, color: string, opacity = 0.95) => {
        const center = new Vector3(x, y, z);
        const scales = new Vector3(scale, scale, scale);
        const quaternion = new Quaternion();
        const c = new Color(color);
        group.userData.splats.push([center, scales, quaternion, opacity, c]);
      };

      const makeSpatialSplats = () => {
        const group = new Group();
        const data: any[] = [];
        group.userData.splats = data;

        // Warm plaster floor plane.
        for (let x = -7; x <= 7; x += 0.22) {
          for (let z = -1; z <= 7; z += 0.22) {
            const jitter = Math.sin(x * 4.7 + z * 2.1) * 0.025;
            addSplat(group, x, 0.04 + jitter, z, 0.09, (x + z) % 1 > 0.5 ? '#eadfe0' : '#f4ece9', 0.72);
          }
        }

        // Dark timber feature wall, broken into soft point clusters.
        for (let x = -7; x <= 7; x += 0.16) {
          for (let y = 0.6; y <= 5.2; y += 0.18) {
            if (Math.abs(Math.sin(x * 3.4)) > 0.32) {
              addSplat(group, x, y, -4.9, 0.055, '#3a2731', 0.72);
            }
          }
        }

        // Auckland-window light: distant skyline / harbour horizon.
        for (let x = -9; x <= 9; x += 0.16) {
          const height = 0.18 + Math.max(0, Math.sin(x * 1.7)) * 0.5;
          for (let y = 0.1; y <= height; y += 0.16) {
            addSplat(group, x, y + 3.0, -4.6, 0.07, y < 0.45 ? '#8c9da3' : '#b6c2c5', 0.58);
          }
        }

        const splats = new Spark.PackedSplats({
          construct: (packed: any) => {
            for (const [center, scales, quaternion, opacity, color] of data) {
              packed.pushSplat(center, scales, quaternion, opacity, color);
            }
          },
        });
        const mesh = new SplatMesh({ packedSplats: splats });
        group.add(mesh);
        return group;
      };

      room.add(makeSpatialSplats());

      // Minimal physical objects: glass table, chrome rail, and Franklin.
      const table = new Mesh(
        new CylinderGeometry(2.15, 2.15, 0.16, 96),
        new MeshPhysicalMaterial({ color: '#4a313d', roughness: 0.26, metalness: 0.16, clearcoat: 0.7 }),
      );
      table.position.set(0.2, 1.42, 1.4);
      room.add(table);

      const pedestal = new Mesh(
        new CylinderGeometry(0.55, 0.72, 1.3, 64),
        new MeshPhysicalMaterial({ color: '#f5eeee', roughness: 0.42, metalness: 0.04 }),
      );
      pedestal.position.set(0.2, 0.7, 1.4);
      room.add(pedestal);

      const glass = new Mesh(
        new BoxGeometry(2.8, 1.7, 0.035),
        new MeshPhysicalMaterial({ color: '#fffdfb', roughness: 0.12, transmission: 0.76, transparent: true, opacity: 0.48, thickness: 0.04 }),
      );
      glass.position.set(4.1, 2.7, -0.6);
      glass.rotation.y = -0.24;
      room.add(glass);

      const rail = new Mesh(
        new CylinderGeometry(0.035, 0.035, 3.8, 24),
        new MeshStandardMaterial({ color: '#8e7c80', roughness: 0.18, metalness: 0.9 }),
      );
      rail.rotation.z = Math.PI / 2;
      rail.position.set(-3.2, 3.35, 0.5);
      room.add(rail);

      // Load Franklin from the owned Blender office export and keep only named Franklin.* meshes.
      const franklin = new Group();
      room.add(franklin);

      const fallbackBody = new Mesh(
        new CapsuleGeometry(0.34, 1.22, 8, 20),
        new MeshPhysicalMaterial({ color: '#3a2526', roughness: 0.62, metalness: 0.02 }),
      );
      fallbackBody.rotation.z = Math.PI / 2;
      fallbackBody.position.set(0, 0.62, 0);
      franklin.add(fallbackBody);

      const loader = new GLTFLoader();
      loader.load(
        '/do/world/franklin-v1/office.glb',
        (gltf: any) => {
          const extracted = new Group();
          gltf.scene.traverse((node: any) => {
            if (!node?.name?.startsWith?.('Franklin.')) return;
            const clone = node.clone(true);
            clone.position.copy(node.position);
            clone.rotation.copy(node.rotation);
            clone.scale.copy(node.scale);
            extracted.add(clone);
          });
          if (!extracted.children.length) return;
          franklin.clear();
          extracted.rotation.set(-Math.PI / 2, 0, Math.PI);
          extracted.scale.setScalar(1.18);
          extracted.position.set(0, 0, 0);
          franklin.add(extracted);
        },
        undefined,
        () => {
          // Keep the small geometric fallback rather than break the scene.
        },
      );

      franklin.position.set(-1.65, 0.03, 0.7);
      franklin.scale.setScalar(0.95);

      const cameraStops = [
        { p: new Vector3(-7.4, 3.2, 11.5), t: new Vector3(0, 1.6, -1.0) },
        { p: new Vector3(-2.0, 2.8, 7.5), t: new Vector3(0.4, 1.55, -1.7) },
        { p: new Vector3(2.9, 2.55, 4.2), t: new Vector3(0.5, 1.65, -2.4) },
        { p: new Vector3(5.6, 2.25, 1.4), t: new Vector3(0.0, 1.35, -2.0) },
      ];

      let progress = 0;
      let raf = 0;

      const onScroll = () => {
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        progress = MathUtils.clamp(window.scrollY / max, 0, 1);
      };

      const onResize = () => {
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      };

      const renderFrame = (ease = 0.08) => {
        const scaled = progress * (cameraStops.length - 1);
        const i = Math.min(Math.floor(scaled), cameraStops.length - 2);
        const local = scaled - i;
        const a = cameraStops[i];
        const b = cameraStops[i + 1];

        const nextPosition = a.p.clone().lerp(b.p, local);
        const nextTarget = a.t.clone().lerp(b.t, local);
        camera.position.lerp(nextPosition, ease);
        const targetDir = nextTarget.clone().sub(camera.position).normalize();
        const currentQuat = camera.quaternion.clone();
        camera.lookAt(camera.position.clone().add(targetDir));
        const desiredQuat = camera.quaternion.clone();
        camera.quaternion.copy(currentQuat).slerp(desiredQuat, ease);

        if (!qaStill) {
          franklin.rotation.y = Math.sin(performance.now() * 0.00028) * 0.035;
          franklin.position.y = 0.03 + Math.sin(performance.now() * 0.0009) * 0.009;
        }

        renderer.render(scene, camera);
      };

      const animate = () => {
        if (disposed) return;
        renderFrame(0.08);
        raf = requestAnimationFrame(animate);
      };

      const qaScroll = () => {
        onScroll();
        for (let i = 0; i < 18; i += 1) renderFrame(0.22);
      };

      window.addEventListener('resize', onResize);
      window.addEventListener('scroll', qaStill ? qaScroll : onScroll, { passive: true });

      onScroll();
      if (qaStill) {
        for (let i = 0; i < 22; i += 1) renderFrame(0.24);
      } else {
        animate();
      }

      cleanup = () => {
        window.removeEventListener('scroll', qaStill ? qaScroll : onScroll);
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(raf);
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    };

    boot().catch((error) => {
      console.error('Splat atelier failed to initialise', error);
      mount.dataset.failed = 'true';
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className={styles.page}>
      <script type="importmap" dangerouslySetInnerHTML={{ __html: JSON.stringify(THREE_IMPORTMAP) }} />
      <div className={styles.scene} ref={mountRef} aria-label="Interactive Assembl Gaussian splat atelier preview" />
      <div className={styles.overlay}>
        <div className={styles.brand}>assembl</div>
        <div className={styles.eyebrow}>prototype / gaussian atelier</div>
        <h1>Good work<br /><em>comes together.</em></h1>
        <p>Scroll through an Auckland workspace rebuilt as a living field of light, glass, splats and things in motion.</p>
        <div className={styles.meta}>Pursuit · DO · Studio</div>
      </div>
      <div className={styles.scrollCue}>scroll to move through the space ↓</div>
      <div className={styles.badge}>experimental · not the live homepage</div>
    </div>
  );
}
