'use client';

import { useEffect, useRef } from 'react';
import styles from './splat-atelier.module.css';

const THREE_IMPORTMAP = {
  imports: {
    three: 'https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js',
    '@sparkjsdev/spark': 'https://sparkjs.dev/releases/spark/2.2.0/spark.module.js',
  },
};

export default function SplatAucklandAtelier() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const boot = async () => {
      const runtimeImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>;
      const THREE = await runtimeImport('three');
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

      // The current Studio office artwork becomes a photoreal image-splat wall.
      const officeWall = imageSplats({
        url: '/do/office/office-poster.webp',
        subXY: 2,
        dotRadius: 0.9,
      });
      officeWall.position.set(0, 3.5, -5.8);
      officeWall.scale.set(0.018, 0.018, 0.018);
      room.add(officeWall);

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

      const franklin = new Group();
      const coat = new MeshPhysicalMaterial({ color: '#3a2526', roughness: 0.62, metalness: 0.02 });
      const noseMat = new MeshPhysicalMaterial({ color: '#171013', roughness: 0.4 });
      const body = new Mesh(new CapsuleGeometry(0.34, 1.22, 8, 20), coat);
      body.rotation.z = Math.PI / 2;
      body.position.set(0, 0.62, 0);
      franklin.add(body);

      const head = new Mesh(new SphereGeometry(0.39, 24, 16), coat);
      head.position.set(0.83, 0.8, 0);
      franklin.add(head);

      const snout = new Mesh(new CapsuleGeometry(0.12, 0.34, 8, 14), noseMat);
      snout.rotation.z = Math.PI / 2;
      snout.position.set(1.14, 0.74, 0);
      franklin.add(snout);

      for (const [x, z] of [[0.45, 0.2], [0.45, -0.2], [-0.42, 0.2], [-0.42, -0.2]]) {
        const leg = new Mesh(new CapsuleGeometry(0.09, 0.36, 8, 12), coat);
        leg.position.set(x, 0.27, z);
        franklin.add(leg);
      }

      for (const z of [0.29, -0.29]) {
        const ear = new Mesh(new CapsuleGeometry(0.11, 0.38, 8, 12), coat);
        ear.rotation.z = -0.32;
        ear.position.set(0.68, 1.08, z);
        franklin.add(ear);
      }

      franklin.scale.setScalar(0.92);
      franklin.position.set(-1.7, 0.05, 0.8);
      room.add(franklin);

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

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);

      const animate = () => {
        if (disposed) return;
        const scaled = progress * (cameraStops.length - 1);
        const i = Math.min(Math.floor(scaled), cameraStops.length - 2);
        const local = scaled - i;
        const a = cameraStops[i];
        const b = cameraStops[i + 1];

        const nextPosition = a.p.clone().lerp(b.p, local);
        const nextTarget = a.t.clone().lerp(b.t, local);
        camera.position.lerp(nextPosition, 0.08);
        const look = camera.getWorldDirection(new Vector3()).multiplyScalar(8).add(camera.position);
        const desired = nextTarget.clone();
        const targetDir = desired.sub(camera.position).normalize();
        const currentQuat = camera.quaternion.clone();
        camera.lookAt(camera.position.clone().add(targetDir));
        const desiredQuat = camera.quaternion.clone();
        camera.quaternion.copy(currentQuat).slerp(desiredQuat, 0.08);

        franklin.rotation.y = Math.sin(performance.now() * 0.00035) * 0.08;
        franklin.position.y = 0.05 + Math.sin(performance.now() * 0.0011) * 0.018;

        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };

      animate();

      cleanup = () => {
        window.removeEventListener('scroll', onScroll);
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
