"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type ShapeId = "wing" | "vortex" | "tide" | "orbit" | "bloom" | "helix" | "matariki" | "image";
type MaterialId = "silver" | "ink" | "pounamu" | "brass" | "pearl";
type BackgroundId = "paper" | "gallery" | "night" | "sea";
type FormatId = "landscape" | "portrait" | "square";
type PatternId = "single" | "repeat" | "mirror" | "tunnel";
type ImagePoint = [number, number, number];

type StudioConfig = {
  shape: ShapeId;
  material: MaterialId;
  background: BackgroundId;
  format: FormatId;
  pattern: PatternId;
  title: string;
  caption: string;
  speed: number;
  energy: number;
  depth: number;
  scale: number;
  pointSize: number;
  trails: boolean;
  threads: boolean;
};

type Particle = {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  seed: number;
};

const SHAPES: { id: ShapeId; name: string; note: string; mark: string }[] = [
  { id: "wing", name: "Wing", note: "aerodynamic sweep", mark: "⌁" },
  { id: "vortex", name: "Vortex", note: "deep particle spiral", mark: "◉" },
  { id: "tide", name: "Tide", note: "rolling field", mark: "≈" },
  { id: "orbit", name: "Orbit", note: "living sphere", mark: "○" },
  { id: "bloom", name: "Bloom", note: "six soft petals", mark: "✣" },
  { id: "helix", name: "Helix", note: "connected intelligence", mark: "∿" },
  { id: "matariki", name: "Matariki", note: "seven gathered lights", mark: "✦" },
  { id: "image", name: "Your image", note: "extruded into 3D", mark: "▧" },
];

const PATTERNS: { id: PatternId; name: string; mark: string }[] = [
  { id: "single", name: "Single", mark: "●" },
  { id: "repeat", name: "Repeat", mark: "⠿" },
  { id: "mirror", name: "Mirror", mark: "◖◗" },
  { id: "tunnel", name: "Tunnel", mark: "◎" },
];

const MATERIALS: { id: MaterialId; name: string; colour: string }[] = [
  { id: "silver", name: "Silver", colour: "#90989b" },
  { id: "ink", name: "Ink", colour: "#263339" },
  { id: "pounamu", name: "Pounamu", colour: "#466f62" },
  { id: "brass", name: "Brass", colour: "#b89554" },
  { id: "pearl", name: "Pearl", colour: "#d9d4ca" },
];

const BACKGROUNDS: { id: BackgroundId; name: string; colour: string }[] = [
  { id: "paper", name: "Paper", colour: "#f4f2ec" },
  { id: "gallery", name: "Gallery", colour: "#fffefa" },
  { id: "night", name: "Night", colour: "#172025" },
  { id: "sea", name: "Sea glass", colour: "#dce8e5" },
];

const DEFAULT_CONFIG: StudioConfig = {
  shape: "wing",
  material: "silver",
  background: "paper",
  format: "landscape",
  pattern: "single",
  title: "Ideas, forming.",
  caption: "A small signal becoming something useful.",
  speed: 42,
  energy: 48,
  depth: 56,
  scale: 82,
  pointSize: 72,
  trails: false,
  threads: false,
};

const FORMAT_RATIOS: Record<FormatId, string> = {
  landscape: "16 / 9",
  portrait: "9 / 16",
  square: "1 / 1",
};

function seeded(index: number, salt = 0) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function targetFor(shape: ShapeId, index: number, count: number): [number, number, number] {
  const jitter = seeded(index, 3) - 0.5;

  if (shape === "vortex") {
    const arm = index % 3;
    const progress = Math.floor(index / 3) / Math.max(1, Math.floor(count / 3));
    const angle = progress * Math.PI * 8 + arm * ((Math.PI * 2) / 3) + (seeded(index, 5) - 0.5) * 0.08;
    const radius = 0.12 + Math.pow(progress, 0.72) * 1.12;
    const funnel = (progress - 0.5) * 0.72 + (arm - 1) * 0.04;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.78,
      funnel + Math.sin(angle * 0.35) * 0.08 + jitter * 0.13,
    ];
  }

  if (shape === "orbit") {
    const golden = Math.PI * (3 - Math.sqrt(5));
    const y = 1 - (index / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * index;
    const shell = 0.74 + seeded(index, 8) * 0.26;
    return [Math.cos(theta) * radius * shell, y * shell, Math.sin(theta) * radius * shell];
  }

  if (shape === "helix") {
    const strand = index % 2 === 0 ? 1 : -1;
    const progress = Math.floor(index / 2) / (count / 2);
    const angle = progress * Math.PI * 7;
    return [(progress - 0.5) * 2.4, Math.cos(angle) * 0.52 * strand, Math.sin(angle) * 0.52 * strand];
  }

  if (shape === "tide") {
    const cols = Math.floor(Math.sqrt(count * 1.8));
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = (col / cols - 0.5) * 2.5;
    const z = (row / Math.ceil(count / cols) - 0.5) * 1.45;
    const y = Math.sin(x * 2.2 + z * 2.7) * 0.3 + Math.cos(z * 4) * 0.08;
    return [x, y, z];
  }

  if (shape === "bloom") {
    const petal = index % 6;
    const progress = Math.floor(index / 6) / Math.ceil(count / 6);
    const angle = petal * (Math.PI / 3) + (seeded(index, 1) - 0.5) * 0.18;
    const radius = Math.pow(progress, 0.62) * (1.05 + Math.sin(progress * Math.PI) * 0.3);
    const pinch = Math.sin(progress * Math.PI);
    return [
      Math.cos(angle) * radius * (0.46 + pinch * 0.34),
      Math.sin(angle) * radius * (0.46 + pinch * 0.34),
      Math.sin(progress * Math.PI) * 0.5 - 0.22 + jitter * 0.08,
    ];
  }

  if (shape === "matariki") {
    const centres: [number, number, number][] = [
      [-0.72, -0.25, 0.1], [-0.34, 0.35, -0.14], [0, 0.03, 0.2],
      [0.4, -0.33, -0.05], [0.7, 0.28, 0.14], [0.08, -0.53, -0.2], [-0.55, 0.55, 0.02],
    ];
    const centre = centres[index % centres.length];
    const radius = Math.pow(seeded(index, 9), 2) * 0.34;
    const angle = seeded(index, 2) * Math.PI * 2;
    return [centre[0] + Math.cos(angle) * radius, centre[1] + Math.sin(angle) * radius, centre[2] + jitter * 0.42];
  }

  if (shape === "image") {
    const columns = Math.max(12, Math.floor(Math.sqrt(count * 1.45)));
    const rows = Math.ceil(count / columns);
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = (column / Math.max(1, columns - 1) - 0.5) * 2.15;
    const y = (row / Math.max(1, rows - 1) - 0.5) * -1.5;
    return [x, y, Math.sin(x * 3.2) * 0.18 + Math.cos(y * 4.5) * 0.12];
  }

  // A tapered aerodynamic wing — wide at the centre, fine at both tips.
  const side = index % 2 === 0 ? 1 : -1;
  const progress = Math.floor(index / 2) / (count / 2);
  const spine = (progress - 0.48) * 2.45;
  const sweep = Math.sin(progress * Math.PI);
  const rib = (seeded(index, 4) - 0.5) * sweep;
  return [spine, side * rib * 0.72 + Math.sin(progress * Math.PI * 2) * 0.1, -sweep * 0.35 + Math.abs(rib) * 0.5];
}

function applyPattern(point: ImagePoint, pattern: PatternId, index: number): ImagePoint {
  const [x, y, z] = point;
  if (pattern === "repeat") {
    const tile = index % 4;
    return [x * 0.5 + (tile % 2 === 0 ? -0.68 : 0.68), y * 0.5 + (tile < 2 ? -0.46 : 0.46), z * 0.58];
  }
  if (pattern === "mirror") {
    const side = index % 2 === 0 ? -1 : 1;
    return [Math.abs(x) * 0.56 * side + side * 0.46, y * 0.84, z * side];
  }
  if (pattern === "tunnel") {
    const layer = index % 5;
    const shrink = 0.35 + layer * 0.15;
    return [x * shrink, y * shrink, z * 0.4 + (layer - 2) * 0.48];
  }
  return point;
}

async function imagePointsFromFile(file: File): Promise<ImagePoint[]> {
  const source = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("That image could not be read."));
      element.src = source;
    });
    const size = 112;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return [];
    context.clearRect(0, 0, size, size);
    const fit = Math.min(size / image.naturalWidth, size / image.naturalHeight);
    const width = image.naturalWidth * fit;
    const height = image.naturalHeight * fit;
    const offsetX = (size - width) / 2;
    const offsetY = (size - height) / 2;
    context.drawImage(image, offsetX, offsetY, width, height);
    const pixels = context.getImageData(0, 0, size, size).data;
    const cornerOffsets = [0, (size - 1) * 4, (size * (size - 1)) * 4, (size * size - 1) * 4];
    const cornerLight = cornerOffsets.reduce((total, offset) => total + (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3, 0) / 4;
    const candidates: { point: ImagePoint; score: number }[] = [];
    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        const offset = (y * size + x) * 4;
        const alpha = pixels[offset + 3];
        if (alpha < 28) continue;
        const red = pixels[offset];
        const green = pixels[offset + 1];
        const blue = pixels[offset + 2];
        const light = (red + green + blue) / 3;
        const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);
        const score = Math.abs(light - cornerLight) + saturation * 0.42 + (255 - alpha) * 0.08;
        candidates.push({
          point: [
            (x / (size - 1) - 0.5) * 2.25,
            (y / (size - 1) - 0.5) * -2.25,
            (0.5 - light / 255) * 0.7 + (seeded(offset, 6) - 0.5) * 0.1,
          ],
          score,
        });
      }
    }
    const useful = candidates.filter((candidate) => candidate.score > 20);
    const sourcePoints = useful.length > 420 ? useful : candidates;
    sourcePoints.sort((first, second) => second.score - first.score);
    const cap = 2_200;
    const stride = Math.max(1, Math.ceil(sourcePoints.length / cap));
    return sourcePoints.filter((_, index) => index % stride === 0).slice(0, cap).map((candidate) => candidate.point);
  } finally {
    URL.revokeObjectURL(source);
  }
}

function normaliseConfig(value: unknown): StudioConfig | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Partial<StudioConfig>;
  const shape = SHAPES.some((item) => item.id === input.shape) ? input.shape! : DEFAULT_CONFIG.shape;
  const material = MATERIALS.some((item) => item.id === input.material) ? input.material! : DEFAULT_CONFIG.material;
  const background = BACKGROUNDS.some((item) => item.id === input.background) ? input.background! : DEFAULT_CONFIG.background;
  const format = ["landscape", "portrait", "square"].includes(String(input.format)) ? input.format! : DEFAULT_CONFIG.format;
  const pattern = PATTERNS.some((item) => item.id === input.pattern) ? input.pattern! : DEFAULT_CONFIG.pattern;
  const number = (candidate: unknown, fallback: number) => Math.max(0, Math.min(100, Number(candidate) || fallback));
  return {
    shape,
    material,
    background,
    format,
    pattern,
    title: String(input.title || DEFAULT_CONFIG.title).replace(/[\u0000-\u001f]/g, "").slice(0, 54),
    caption: String(input.caption || DEFAULT_CONFIG.caption).replace(/[\u0000-\u001f]/g, "").slice(0, 100),
    speed: number(input.speed, DEFAULT_CONFIG.speed),
    energy: number(input.energy, DEFAULT_CONFIG.energy),
    depth: number(input.depth, DEFAULT_CONFIG.depth),
    scale: number(input.scale, DEFAULT_CONFIG.scale),
    pointSize: number(input.pointSize, DEFAULT_CONFIG.pointSize),
    trails: Boolean(input.trails),
    threads: Boolean(input.threads),
  };
}

function encodeConfig(config: StudioConfig) {
  const bytes = new TextEncoder().encode(JSON.stringify(config));
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeConfig(value: string) {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    return normaliseConfig(JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)))));
  } catch {
    return null;
  }
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  return { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255 };
}

function Scene({ config, sceneVersion, imagePoints, canvasRef }: { config: StudioConfig; sceneVersion: number; imagePoints: ImagePoint[] | null; canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const configRef = useRef(config);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const dragRef = useRef({ active: false, x: 0, y: 0, rotationX: -0.12, rotationY: 0.18 });
  const resetRef = useRef(true);
  const shape = config.shape;
  const pattern = config.pattern;

  useEffect(() => {
    const count = particlesRef.current.length || (window.innerWidth < 700 ? 1_050 : 2_200);
    const nextTarget = (index: number) => {
      const base = shape === "image" && imagePoints?.length
        ? imagePoints[index % imagePoints.length]
        : targetFor(shape, index, count);
      return applyPattern(base, pattern, index);
    };
    if (!particlesRef.current.length) {
      particlesRef.current = Array.from({ length: count }, (_, index) => {
        const [tx, ty, tz] = nextTarget(index);
        return { x: (seeded(index, 11) - 0.5) * 3, y: (seeded(index, 12) - 0.5) * 2, z: (seeded(index, 13) - 0.5) * 2, tx, ty, tz, seed: seeded(index, 14) };
      });
    } else {
      particlesRef.current.forEach((particle, index) => {
        [particle.tx, particle.ty, particle.tz] = nextTarget(index);
      });
    }
    resetRef.current = true;
  }, [shape, pattern, imagePoints, sceneVersion]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let animation = 0;
    let time = 0;

    const resize = () => {
      const rect = shell.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      resetRef.current = true;
    };

    const draw = () => {
      const current = configRef.current;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const background = BACKGROUNDS.find((item) => item.id === current.background)?.colour ?? "#f4f2ec";
      const material = MATERIALS.find((item) => item.id === current.material)?.colour ?? "#90989b";
      const dark = current.background === "night";
      const bg = hexToRgb(background);
      const fade = current.trails && !resetRef.current ? 0.17 : 1;
      context.fillStyle = `rgba(${bg.r},${bg.g},${bg.b},${fade})`;
      context.fillRect(0, 0, width, height);
      resetRef.current = false;

      const speed = 0.0015 + current.speed * 0.000055;
      time += speed;
      const autoRotation = time * (0.35 + current.speed / 140);
      const rotationY = dragRef.current.rotationY + autoRotation * (current.shape === "vortex" ? 0.08 : 1) + pointerRef.current.x * 0.08;
      const rotationX = dragRef.current.rotationX + pointerRef.current.y * 0.055;
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const scaleFactor = 0.35 + current.scale * 0.00235;
      const scale = Math.min(width, height) * scaleFactor;
      const energy = current.energy / 100;
      const depth = 2.7 + (100 - current.depth) / 55;
      const baseColour = hexToRgb(material);
      const projected: { x: number; y: number; z: number; alpha: number }[] = [];

      particlesRef.current.forEach((particle, index) => {
        particle.x += (particle.tx - particle.x) * 0.046;
        particle.y += (particle.ty - particle.y) * 0.046;
        particle.z += (particle.tz - particle.z) * 0.046;
        const pulse = Math.sin(time * 32 + particle.seed * 20 + index * 0.013);
        const drift = Math.cos(time * 19 + particle.seed * 13) * energy * 0.055;
        let px = particle.x + pulse * energy * 0.024;
        let py = particle.y + drift;
        const pz = particle.z + Math.sin(time * 11 + index * 0.021) * energy * 0.05;
        if (current.shape === "vortex") {
          const flow = time * (18 + current.speed * 0.16) + particle.y * 0.18;
          const flowCos = Math.cos(flow);
          const flowSin = Math.sin(flow);
          const nextX = px * flowCos - py * flowSin;
          py = px * flowSin + py * flowCos;
          px = nextX;
        }
        const rx = px * cosY - pz * sinY;
        const rz = px * sinY + pz * cosY;
        const ry = py * cosX - rz * sinX;
        const rz2 = py * sinX + rz * cosX;
        const perspective = depth / Math.max(1.2, depth + rz2);
        const x = width * 0.5 + rx * scale * perspective;
        const y = height * 0.47 + ry * scale * perspective;
        const alpha = Math.max(0.25, Math.min(0.98, 0.47 + perspective * 0.22 + particle.seed * 0.24));
        projected.push({ x, y, z: rz2, alpha });
      });

      if (current.threads) {
        context.lineWidth = 0.45;
        for (let index = 0; index < projected.length - 19; index += 19) {
          const first = projected[index];
          const second = projected[index + 19];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance < scale * 0.42) {
            context.strokeStyle = `rgba(${baseColour.r},${baseColour.g},${baseColour.b},${Math.max(0.035, 0.11 - distance / (scale * 4))})`;
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.stroke();
          }
        }
      }

      if (current.shape === "vortex") {
        context.lineWidth = 0.55;
        context.strokeStyle = `rgba(${baseColour.r},${baseColour.g},${baseColour.b},0.16)`;
        for (let arm = 0; arm < 3; arm += 1) {
          context.beginPath();
          let started = false;
          for (let index = arm; index < projected.length; index += 9) {
            const point = projected[index];
            if (!started) {
              context.moveTo(point.x, point.y);
              started = true;
            } else {
              context.lineTo(point.x, point.y);
            }
          }
          context.stroke();
        }
      }

      projected.forEach((point, index) => {
        const shine = index % 43 === 0;
        const radius = (0.78 + current.pointSize / 50) * (shine ? 1.85 : 0.72 + seeded(index, 2) * 0.68);
        const light = point.z < -0.1 ? 26 : point.z > 0.4 ? -14 : 0;
        const r = Math.max(0, Math.min(255, baseColour.r + light));
        const g = Math.max(0, Math.min(255, baseColour.g + light));
        const b = Math.max(0, Math.min(255, baseColour.b + light));
        context.fillStyle = `rgba(${r},${g},${b},${point.alpha})`;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();
        if (shine) {
          context.fillStyle = dark ? "rgba(255,255,255,.58)" : "rgba(255,255,255,.82)";
          context.beginPath();
          context.arc(point.x - radius * 0.25, point.y - radius * 0.25, radius * 0.26, 0, Math.PI * 2);
          context.fill();
        }
      });

      const ink = dark ? "rgba(255,255,250,.92)" : "rgba(31,42,47,.93)";
      const muted = dark ? "rgba(255,255,250,.52)" : "rgba(50,58,60,.58)";
      const titleSize = Math.max(24, Math.min(48, width * 0.042));
      context.textAlign = "left";
      context.fillStyle = ink;
      context.font = `400 ${titleSize}px Georgia, serif`;
      context.fillText(current.title || "Untitled motion", width * 0.055, height * 0.865, width * 0.72);
      context.fillStyle = muted;
      context.font = `500 ${Math.max(8, width * 0.008)}px Courier New, monospace`;
      context.fillText((current.caption || "made with assembl"), width * 0.058, height * 0.91, width * 0.7);
      context.textAlign = "right";
      context.fillText("assembl · motion study", width * 0.945, height * 0.91);
      animation = requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(shell);
    resize();
    draw();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animation);
    };
  }, [canvasRef]);

  const pointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: (event.clientX / rect.width - 0.5) * 2, y: (event.clientY / rect.height - 0.5) * 2, active: true };
    if (dragRef.current.active) {
      dragRef.current.rotationY += (event.clientX - dragRef.current.x) * 0.006;
      dragRef.current.rotationX += (event.clientY - dragRef.current.y) * 0.004;
      dragRef.current.x = event.clientX;
      dragRef.current.y = event.clientY;
    }
  };

  return (
    <div
      ref={shellRef}
      className="scene-shell"
      style={{ aspectRatio: FORMAT_RATIOS[config.format] }}
      onPointerMove={pointer}
      onPointerLeave={() => { pointerRef.current = { x: 0, y: 0, active: false }; dragRef.current.active = false; }}
      onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); dragRef.current = { ...dragRef.current, active: true, x: event.clientX, y: event.clientY }; }}
      onPointerUp={() => { dragRef.current.active = false; }}
      aria-label={`Interactive ${SHAPES.find((item) => item.id === config.shape)?.name} particle motion scene. Drag to rotate.`}
    >
      <canvas ref={canvasRef} />
      <div className="scene-topline"><span>LIVE GENERATIVE STUDY</span><span>{config.format.replace("landscape", "16:9").replace("portrait", "9:16").replace("square", "1:1")}</span></div>
      <div className="drag-hint">drag to orbit</div>
    </div>
  );
}

function RangeControl({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="range-control">
      <span><b>{label}</b><i>{Math.round(value)}</i></span>
      <input type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export function MotionStudio() {
  const [config, setConfig] = useState<StudioConfig>(DEFAULT_CONFIG);
  const [sceneVersion, setSceneVersion] = useState(0);
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [remixed, setRemixed] = useState(false);
  const [imagePoints, setImagePoints] = useState<ImagePoint[] | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState("");
  const [panel, setPanel] = useState<"form" | "look" | "type" | "motion">("form");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<number | null>(null);

  const activeShape = useMemo(() => SHAPES.find((item) => item.id === config.shape) ?? SHAPES[0], [config.shape]);
  const update = <K extends keyof StudioConfig>(key: K, value: StudioConfig[K]) => setConfig((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("study");
    if (!value) return;
    const decoded = decodeConfig(value);
    if (!decoded) return;
    const timer = window.setTimeout(() => { setConfig(decoded); setRemixed(true); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const shareUrl = () => {
    const url = new URL(window.location.href);
    url.search = "";
    const shareableConfig = config.shape === "image" ? { ...config, shape: "vortex" as ShapeId } : config;
    url.searchParams.set("study", encodeConfig(shareableConfig));
    return url.toString();
  };

  const loadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 12_000_000) {
      setImageError("Choose a PNG, JPG or WebP under 12 MB.");
      return;
    }
    try {
      setImageError("");
      const points = await imagePointsFromFile(file);
      if (points.length < 80) throw new Error("Not enough visible detail.");
      setImagePoints(points);
      setImageName(file.name);
      setConfig((current) => ({ ...current, shape: "image", pattern: "single", scale: Math.max(current.scale, 82) }));
      setSceneVersion((version) => version + 1);
    } catch {
      setImageError("That image did not have enough visible detail. Try a clearer logo or photo.");
    }
  };

  const share = async () => {
    const url = shareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: `${config.title} · assembl Motion Studio`, text: "Remix this living particle study.", url });
        return;
      } catch { return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { window.prompt("Copy this remix link", url); }
  };

  const downloadStill = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `assembl-${config.shape}-study.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const recordClip = () => {
    const canvas = canvasRef.current;
    if (!canvas || recording || !("MediaRecorder" in window)) return;
    const stream = canvas.captureStream(30);
    const preferred = ["video/mp4;codecs=h264", "video/webm;codecs=vp9", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = () => {
      const type = recorder.mimeType || "video/webm";
      const extension = type.includes("mp4") ? "mp4" : "webm";
      const blob = new Blob(chunks, { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `assembl-${config.shape}-loop.${extension}`;
      link.href = url;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setRecording(false);
      setProgress(0);
      if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
    };
    recorder.start();
    setRecording(true);
    const started = Date.now();
    recordingTimerRef.current = window.setInterval(() => setProgress(Math.min(100, ((Date.now() - started) / 5000) * 100)), 100);
    window.setTimeout(() => recorder.stop(), 5000);
  };

  const randomise = () => {
    const choose = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
    setConfig((current) => ({
      ...current,
      shape: choose(SHAPES).id,
      material: choose(MATERIALS).id,
      background: choose(BACKGROUNDS).id,
      speed: 20 + Math.round(Math.random() * 65),
      energy: 25 + Math.round(Math.random() * 60),
      depth: 30 + Math.round(Math.random() * 60),
      scale: 70 + Math.round(Math.random() * 28),
      pointSize: 58 + Math.round(Math.random() * 36),
      pattern: choose(PATTERNS).id,
      trails: Math.random() > 0.35,
      threads: Math.random() > 0.6,
    }));
    setSceneVersion((version) => version + 1);
  };

  return (
    <main className={`motion-studio-root studio ${config.background === "night" ? "dark-studio" : ""}`}>
      <header className="studio-header">
        <div className="brand-lockup"><Link href="/">assembl</Link><span>motion studio <i>beta</i></span></div>
        <div className="header-note">SCULPT · MOVE · EXPORT · REMIX</div>
        <div className="header-actions">
          <button className="quiet-button" onClick={randomise}>↝ Surprise me</button>
          <button className="share-button" onClick={share}>{copied ? "✓ Link copied" : "↗ Share study"}</button>
        </div>
      </header>

      {remixed && <div className="remix-note"><span>You opened a shared study.</span><strong>Change anything — this remix is yours.</strong><button onClick={() => setRemixed(false)}>×</button></div>}

      <section className="studio-workspace" id="top">
        <aside className="control-rail">
          <div className="rail-intro">
            <p>FREE GENERATIVE TOOL · NO ACCOUNT</p>
            <h1>Make something<br /><em>move.</em></h1>
            <span>Start with a form. Art-direct the feeling. Export the loop.</span>
          </div>

          <div className="mobile-tabs" role="tablist" aria-label="Studio controls">
            {(["form", "look", "type", "motion"] as const).map((item) => <button key={item} role="tab" aria-selected={panel === item} onClick={() => setPanel(item)}>{item}</button>)}
          </div>

          <div className={panel === "form" ? "control-section active" : "control-section"}>
            <div className="control-heading"><span>01 · FORM</span><small>{activeShape.name}</small></div>
            <div className="shape-grid">
              {SHAPES.map((shape) => (
                <button key={shape.id} className={config.shape === shape.id ? "shape-option selected" : "shape-option"} onClick={() => { update("shape", shape.id); if (shape.id === "image") imageInputRef.current?.click(); }} aria-pressed={config.shape === shape.id}>
                  <b>{shape.mark}</b><span><strong>{shape.name}</strong><small>{shape.note}</small></span>
                </button>
              ))}
            </div>
            <input ref={imageInputRef} className="hidden-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void loadImage(event)} />
            <div className="image-upload">
              <button onClick={() => imageInputRef.current?.click()}>↑ Turn an image into particles</button>
              <span>{imageName || "PNG, JPG or WebP · stays on your device"}</span>
              {imageError && <small role="alert">{imageError}</small>}
            </div>
          </div>

          <div className={panel === "look" ? "control-section active" : "control-section"}>
            <div className="control-heading"><span>02 · LOOK</span><small>material + world</small></div>
            <label className="mini-label">Particles</label>
            <div className="swatch-row">
              {MATERIALS.map((material) => <button key={material.id} className={config.material === material.id ? "swatch selected" : "swatch"} style={{ "--swatch": material.colour } as React.CSSProperties} onClick={() => update("material", material.id)} aria-label={material.name} title={material.name} />)}
            </div>
            <label className="mini-label">Background</label>
            <div className="background-row">
              {BACKGROUNDS.map((background) => <button key={background.id} className={config.background === background.id ? "background-chip selected" : "background-chip"} onClick={() => update("background", background.id)}><i style={{ background: background.colour }} />{background.name}</button>)}
            </div>
            <label className="mini-label">Pattern</label>
            <div className="pattern-row">
              {PATTERNS.map((pattern) => <button key={pattern.id} className={config.pattern === pattern.id ? "pattern-chip selected" : "pattern-chip"} onClick={() => update("pattern", pattern.id)}><b>{pattern.mark}</b><span>{pattern.name}</span></button>)}
            </div>
          </div>

          <div className={panel === "type" ? "control-section active" : "control-section"}>
            <div className="control-heading"><span>03 · WORDS</span><small>drawn into your export</small></div>
            <label className="text-control"><span>Title</span><input value={config.title} maxLength={54} onChange={(event) => update("title", event.target.value)} /></label>
            <label className="text-control"><span>Small line</span><input value={config.caption} maxLength={100} onChange={(event) => update("caption", event.target.value)} /></label>
          </div>

          <div className={panel === "motion" ? "control-section active" : "control-section"}>
            <div className="control-heading"><span>04 · MOTION</span><small>make it yours</small></div>
            <div className="range-grid">
              <RangeControl label="Speed" value={config.speed} onChange={(value) => update("speed", value)} />
              <RangeControl label="Energy" value={config.energy} onChange={(value) => update("energy", value)} />
              <RangeControl label="Depth" value={config.depth} onChange={(value) => update("depth", value)} />
              <RangeControl label="Shape size" value={config.scale} onChange={(value) => update("scale", value)} />
              <RangeControl label="Particle" value={config.pointSize} onChange={(value) => update("pointSize", value)} />
            </div>
            <div className="toggle-row">
              <button className={config.trails ? "toggle active" : "toggle"} onClick={() => update("trails", !config.trails)}><i /> Soft trails</button>
              <button className={config.threads ? "toggle active" : "toggle"} onClick={() => update("threads", !config.threads)}><i /> Fine threads</button>
            </div>
          </div>
        </aside>

        <section className="canvas-stage" aria-label="Motion canvas">
          <div className={`canvas-frame format-${config.format}`}>
            <Scene config={config} sceneVersion={sceneVersion} imagePoints={imagePoints} canvasRef={canvasRef} />
          </div>
          <div className="format-switch" aria-label="Canvas format">
            {(["landscape", "portrait", "square"] as const).map((format) => <button key={format} onClick={() => update("format", format)} className={config.format === format ? "selected" : ""}>{format === "landscape" ? "16:9" : format === "portrait" ? "9:16" : "1:1"}</button>)}
          </div>
        </section>
      </section>

      <footer className="export-dock">
        <div className="study-id"><i /><span>LIVE STUDY</span><strong>{activeShape.name} · {MATERIALS.find((item) => item.id === config.material)?.name}</strong></div>
        <p>Everything renders in your browser. Nothing is uploaded.</p>
        <div className="export-actions">
          <button onClick={downloadStill}>↓ Download still <small>PNG</small></button>
          <button className={recording ? "recording" : ""} onClick={recordClip} disabled={recording}>
            <span>{recording ? `Recording ${Math.round(progress)}%` : "● Record 5s loop"}</span><small>AUTO</small>
            {recording && <i style={{ width: `${progress}%` }} />}
          </button>
        </div>
      </footer>
    </main>
  );
}
