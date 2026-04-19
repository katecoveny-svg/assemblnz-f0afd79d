import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Full-canvas animated constellation hero.
 * White twinkling starfield + glowing gold/pounamu nexus mark at centre.
 */
const ConstellationHero = ({ size = 420, fullBleed = false }: { size?: number; fullBleed?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let animId: number;
    let t = 0;

    const r = (a: number, b: number) => a + Math.random() * (b - a);

    // Star colours — white family only
    const SC = () =>
      ["255,255,255", "230,235,245", "240,238,255", "220,230,255"][
        Math.floor(Math.random() * 4)
      ];

    interface Star {
      x: number; y: number; rad: number; op: number;
      spd: number; ph: number; col: string; nd: boolean;
    }
    interface Line { f: Star; t: Star; op: number }

    let W = 0, H = 0;
    let stars: Star[] = [];
    let lines: Line[] = [];

    function init() {
      const N = Math.floor((W * H) / 3500);
      const NL = 14;
      const bg: Star[] = Array.from({ length: N }, () => ({
        x: r(0, W), y: r(0, H), rad: r(0.2, 1.4),
        op: r(0.1, 0.85), spd: r(0.4, 3), ph: r(0, Math.PI * 2),
        col: SC(), nd: false,
      }));
      const nd: Star[] = Array.from({ length: NL }, () => ({
        x: r(W * 0.04, W * 0.96), y: r(H * 0.06, H * 0.94),
        rad: r(1.4, 2.8), op: r(0.5, 1), spd: r(0.8, 2),
        ph: r(0, Math.PI * 2), col: "255,255,255", nd: true,
      }));
      const mx = Math.min(W, H) * 0.48;
      lines = [];
      for (let i = 0; i < nd.length; i++) {
        for (let j = i + 1; j < nd.length; j++) {
          const dx = nd[i].x - nd[j].x, dy = nd[i].y - nd[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < mx)
            lines.push({ f: nd[i], t: nd[j], op: r(0.05, 0.18) });
        }
      }
      stars = [...bg, ...nd];
    }

    function resize() {
      W = cv.width = cv.offsetWidth || size;
      H = cv.height = cv.offsetHeight || size;
      init();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      for (const l of lines) {
        const a = l.op * (0.55 + 0.45 * Math.sin(t * 0.35 + l.f.ph));
        ctx.beginPath();
        ctx.moveTo(l.f.x, l.f.y);
        ctx.lineTo(l.t.x, l.t.y);
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.lineWidth = 0.55;
        ctx.stroke();
      }

      for (const s of stars) {
        const bk = (Math.sin(t * s.spd + s.ph) + 1) / 2;
        const a = 0.12 + bk * s.op * 0.88;
        if (s.rad > 1.2) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.rad * 6);
          g.addColorStop(0, `rgba(${s.col},${a * 0.42})`);
          g.addColorStop(1, `rgba(${s.col},0)`);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.rad * 6, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.rad * (0.65 + bk * 0.55), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.col},${a})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [size, fullBleed]);

  // SVG mark dimensions scaled to container
  const markSize = size * 0.28;
  const vb = 36;
  const top = { x: 18, y: 8 };
  const bl  = { x: 8,  y: 26 };
  const br  = { x: 28, y: 26 };

  if (fullBleed) {
    return (
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />
    );
  }

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      {/* Starfield canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
        }}
      />

      {/* Soft central glow */}
      <motion.div
        style={{
          position: "absolute",
          width: size * 0.55,
          height: size * 0.55,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,67,0.18) 0%, rgba(58,125,110,0.08) 50%, transparent 75%)",
          filter: "blur(24px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbit ring */}
      <motion.div
        style={{
          position: "absolute",
          width: markSize * 2.4,
          height: markSize * 2.4,
          borderRadius: "50%",
          border: "1px solid rgba(212,168,67,0.22)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        style={{
          position: "absolute",
          width: markSize * 1.85,
          height: markSize * 1.85,
          borderRadius: "50%",
          border: "1px solid rgba(58,125,110,0.16)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />

      {/* The constellation mark — centred, large */}
      <motion.svg
        width={markSize}
        height={markSize}
        viewBox={`0 0 ${vb} ${vb}`}
        fill="none"
        style={{ position: "relative", zIndex: 10 }}
        animate={{
          scale: [1, 1.06, 1],
          filter: [
            "drop-shadow(0 0 10px rgba(212,168,67,.9)) drop-shadow(0 0 30px rgba(212,168,67,.55)) drop-shadow(0 0 60px rgba(212,168,67,.2))",
            "drop-shadow(0 0 22px rgba(255,220,80,1)) drop-shadow(0 0 60px rgba(212,168,67,.85)) drop-shadow(0 0 120px rgba(212,168,67,.45)) drop-shadow(0 0 180px rgba(240,208,120,.2))",
            "drop-shadow(0 0 10px rgba(212,168,67,.9)) drop-shadow(0 0 30px rgba(212,168,67,.55)) drop-shadow(0 0 60px rgba(212,168,67,.2))",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <radialGradient id="ch-g" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#A8DDDB" />
            <stop offset="50%" stopColor="#4AA5A8" />
            <stop offset="100%" stopColor="#8B6020" />
          </radialGradient>
          <radialGradient id="ch-p" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#7ACFC2" />
            <stop offset="50%" stopColor="#3A7D6E" />
            <stop offset="100%" stopColor="#1E5044" />
          </radialGradient>
          <radialGradient id="ch-pl" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#5AADA0" />
            <stop offset="50%" stopColor="#2E6B5E" />
            <stop offset="100%" stopColor="#153D35" />
          </radialGradient>
          <radialGradient id="ch-hi" cx="35%" cy="30%" r="28%">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ch-l" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4AA5A8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#3A7D6E" stopOpacity="0.65" />
          </linearGradient>
          <filter id="ch-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Constellation lines */}
        <motion.line x1={top.x} y1={top.y} x2={bl.x} y2={bl.y}
          stroke="url(#ch-l)" strokeWidth="1.3"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.line x1={top.x} y1={top.y} x2={br.x} y2={br.y}
          stroke="url(#ch-l)" strokeWidth="1.3"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.35 }} />
        <motion.line x1={bl.x} y1={bl.y} x2={br.x} y2={br.y}
          stroke="url(#ch-l)" strokeWidth="1.3"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }} />

        {/* Spheres with glow */}
        <g filter="url(#ch-glow)">
          <circle cx={top.x} cy={top.y} r="4.8" fill="url(#ch-g)" />
          <circle cx={top.x} cy={top.y} r="4.8" fill="url(#ch-hi)" />
          <circle cx={bl.x}  cy={bl.y}  r="4.8" fill="url(#ch-p)" />
          <circle cx={bl.x}  cy={bl.y}  r="4.8" fill="url(#ch-hi)" />
          <circle cx={br.x}  cy={br.y}  r="4.8" fill="url(#ch-pl)" />
          <circle cx={br.x}  cy={br.y}  r="4.8" fill="url(#ch-hi)" />
        </g>
      </motion.svg>
    </div>
  );
};

export default ConstellationHero;
