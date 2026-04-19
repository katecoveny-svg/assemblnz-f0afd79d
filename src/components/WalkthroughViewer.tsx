import { Suspense, useRef, useEffect, useCallback, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, Center, Grid } from "@react-three/drei";
import * as THREE from "three";
import { Maximize2, Minimize2, Move, RotateCcw } from "lucide-react";

/* ── GLB Model ─────────────────────────────────────────── */
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

/* ── First-Person Controls ─────────────────────────────── */
const MOVE_SPEED = 4;
const LOOK_SPEED = 0.002;

function FPSControls() {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const locked = useRef(false);

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 1.7, 5);

    const onKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (!locked.current) return;
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= e.movementX * LOOK_SPEED;
      euler.current.x -= e.movementY * LOOK_SPEED;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };
    const onPointerLockChange = () => {
      locked.current = document.pointerLockElement === gl.domElement;
    };
    const onClick = () => {
      if (!locked.current) gl.domElement.requestPointerLock();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    gl.domElement.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      gl.domElement.removeEventListener("click", onClick);
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const k = keys.current;
    const speed = MOVE_SPEED * delta;
    const direction = new THREE.Vector3();

    if (k["KeyW"] || k["ArrowUp"]) direction.z -= 1;
    if (k["KeyS"] || k["ArrowDown"]) direction.z += 1;
    if (k["KeyA"] || k["ArrowLeft"]) direction.x -= 1;
    if (k["KeyD"] || k["ArrowRight"]) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize().applyQuaternion(camera.quaternion);
      direction.y = 0; // keep on ground plane
      camera.position.addScaledVector(direction, speed);
    }

    // Q/E for vertical
    if (k["KeyQ"]) camera.position.y -= speed;
    if (k["KeyE"]) camera.position.y += speed;
  });

  return null;
}

/* ── Loading Placeholder ───────────────────────────────── */
function LoadingCube() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#5AADA0" wireframe />
    </mesh>
  );
}

/* ── Main Component ────────────────────────────────────── */
interface WalkthroughViewerProps {
  glbUrl: string;
  color?: string;
}

const WalkthroughViewer = ({ glbUrl, color = "#5AADA0" }: WalkthroughViewerProps) => {
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full rounded-lg overflow-hidden" style={{ background: "transparent" }}>
      {/* Controls overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-full text-[10px] font-mono"
          style={{ background: "rgba(58,125,110,0.12)", color, border: `1px solid ${color}30` }}>
          <Move className="inline w-3 h-3 mr-1" />
          WASD to move · Mouse to look · Click to start
        </div>
      </div>

      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        <button onClick={toggleFullscreen}
          className="p-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3D Canvas */}
      <div className={fullscreen ? "w-full h-full" : "w-full h-[400px] md:h-[500px]"}>
        <Canvas camera={{ position: [0, 1.7, 5], fov: 75, near: 0.01, far: 1000 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={0.7} />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />
          <hemisphereLight intensity={0.3} />
          <fog attach="fog" args={["#0A0A14", 20, 80]} />

          <Suspense fallback={<LoadingCube />}>
            <Model url={glbUrl} />
            <FPSControls />
          </Suspense>

          <Grid
            args={[100, 100]}
            position={[0, -0.01, 0]}
            cellSize={1}
            cellThickness={0.4}
            cellColor="#1a1a2e"
            sectionSize={5}
            sectionThickness={0.8}
            sectionColor="#2a2a4e"
            fadeDistance={40}
            infiniteGrid
          />
        </Canvas>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        <div className="px-3 py-1 rounded text-[9px] font-mono"
          style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
          Q/E ↕ · ESC exit
        </div>
      </div>
    </div>
  );
};

export default WalkthroughViewer;
