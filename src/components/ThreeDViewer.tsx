import { Suspense, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Grid } from "@react-three/drei";
import * as THREE from "three";

interface ThreeDViewerProps {
  glbUrl: string;
  color?: string;
  modelUrls?: { glb?: string; obj?: string; fbx?: string };
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

function AutoFit() {
  const { camera, scene } = useThree();
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const dist = maxDim / (2 * Math.tan(fov / 2)) * 1.5;
    camera.position.set(dist, dist * 0.6, dist);
    camera.lookAt(0, 0, 0);
    (camera as THREE.PerspectiveCamera).near = 0.01;
    (camera as THREE.PerspectiveCamera).far = dist * 10;
    camera.updateProjectionMatrix();
  }, [camera, scene]);
  return null;
}

function LoadingCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#B388FF" wireframe />
    </mesh>
  );
}

function DownloadButton({ url, label, color }: { url: string; label: string; color: string }) {
  if (!url) return null;
  const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proxy-model?url=${encodeURIComponent(url)}`;
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(proxyUrl, {
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      });
      const blob = await response.blob();
      const ext = label.split(" ").pop()?.toLowerCase() || "glb";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `model.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };
  return (
    <button
      onClick={handleDownload}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
      style={{
        border: `1px solid ${color}`,
        color,
      }}
    >
      {label}
    </button>
  );
}

const ThreeDViewer = ({ glbUrl, color = "#B388FF", modelUrls }: ThreeDViewerProps) => {
  return (
    <div className="w-full rounded-lg overflow-hidden">
      <div className="w-full h-[300px] md:h-[400px]" style={{ background: "#0E0E1A" }}>
        <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-3, 3, -3]} intensity={0.4} />
          <Suspense fallback={<LoadingCube />}>
            <Model url={glbUrl} />
            <AutoFit />
          </Suspense>
          <Grid
            args={[20, 20]}
            position={[0, -0.01, 0]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#1a1a2e"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#2a2a4e"
            fadeDistance={15}
            infiniteGrid
          />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            enablePan
            enableZoom
            makeDefault
          />
        </Canvas>
      </div>
      {modelUrls && (
        <div className="flex gap-2 flex-wrap mt-2">
          <DownloadButton url={modelUrls.glb || ""} label="Download GLB" color={color} />
          <DownloadButton url={modelUrls.obj || ""} label="Download OBJ" color={color} />
          <DownloadButton url={modelUrls.fbx || ""} label="Download FBX" color={color} />
        </div>
      )}
    </div>
  );
};

export default ThreeDViewer;
