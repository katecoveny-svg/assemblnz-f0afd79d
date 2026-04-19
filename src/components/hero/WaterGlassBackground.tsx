import { useEffect, useRef } from "react";

const WaterGlassBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      time += 0.003;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Base
      ctx.fillStyle = "#FAFBFC";
      ctx.fillRect(0, 0, width, height);

      // Caustic layers
      for (let i = 0; i < 5; i++) {
        const phase = time + i * 1.2;
        const x = width * (0.3 + 0.4 * Math.sin(phase * 0.7 + i));
        const y = height * (0.3 + 0.4 * Math.cos(phase * 0.5 + i * 0.8));
        const radius = 200 + 100 * Math.sin(phase * 0.3);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

        const colors = [
          ["rgba(74,165,168,0.06)", "rgba(74,165,168,0)"],
          ["rgba(232,169,72,0.05)", "rgba(232,169,72,0)"],
          ["rgba(184,165,208,0.04)", "rgba(184,165,208,0)"],
          ["rgba(74,165,168,0.05)", "rgba(74,165,168,0)"],
          ["rgba(232,169,72,0.04)", "rgba(232,169,72,0)"],
        ];

        gradient.addColorStop(0, colors[i][0]);
        gradient.addColorStop(1, colors[i][1]);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Water caustic pattern using overlapping sine waves
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let px = 0; px < width; px += 4) {
        for (let py = 0; py < height; py += 4) {
          const caustic =
            Math.sin(px * 0.02 + time * 2) *
            Math.cos(py * 0.02 + time * 1.5) *
            Math.sin((px + py) * 0.01 + time) *
            12;

          if (caustic > 3) {
            for (let dx = 0; dx < 4 && px + dx < width; dx++) {
              for (let dy = 0; dy < 4 && py + dy < height; dy++) {
                const i2 = ((py + dy) * width + (px + dx)) * 4;
                data[i2] = Math.min(255, data[i2] + caustic * 2);
                data[i2 + 1] = Math.min(255, data[i2 + 1] + caustic * 2);
                data[i2 + 2] = Math.min(255, data[i2 + 2] + caustic * 1.5);
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(draw);
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Draw once statically
      draw();
      cancelAnimationFrame(animationId);
    } else {
      draw();
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    />
  );
};

export default WaterGlassBackground;
