import { useEffect, useRef, Component, type ReactNode } from "react";

class ParticleErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? null : this.props.children; }
}

const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let cancelled = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (cancelled) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; pulse: number }[] = [];
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * W(),
        y: Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1 + 0.3,
        alpha: Math.random() * 0.15 + 0.03,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      if (cancelled) return;
      try {
        ctx.clearRect(0, 0, W(), H());
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.pulse += 0.01;
          if (p.x < 0) p.x = W();
          if (p.x > W()) p.x = 0;
          if (p.y < 0) p.y = H();
          if (p.y > H()) p.y = 0;
          const glow = (Math.sin(p.pulse) + 1) / 2;
          const a = p.alpha * (0.5 + glow * 0.5);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.fill();
        }
        animFrame = requestAnimationFrame(draw);
      } catch {
        // Canvas detached during navigation — silently stop
      }
    };

    animFrame = requestAnimationFrame(draw);
    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
};

const ParticleField = () => (
  <ParticleErrorBoundary>
    <ParticleCanvas />
  </ParticleErrorBoundary>
);

export default ParticleField;
