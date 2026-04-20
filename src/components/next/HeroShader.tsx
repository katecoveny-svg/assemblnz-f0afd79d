import { useEffect, useRef } from "react";

/**
 * Full-bleed WebGL caustics / liquid-light shader.
 * Pure WebGL1 + GLSL — no three.js dependency, no WebGPU (sandbox-safe).
 *
 * Visual: layered noise + radial gradient producing teal/ice caustics that
 * drift slowly and react to cursor position. Built for the white-ice palette.
 */
export default function HeroShader({
  className = "",
  intensity = 1,
}: { className?: string; intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) return;

    const VERT = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    // Caustics: layered domain-warped noise on a teal/ice palette.
    const FRAG = `
      precision highp float;
      uniform vec2  u_res;
      uniform float u_time;
      uniform vec2  u_mouse;
      uniform float u_intensity;

      // hash + value noise
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
        return v;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
        vec2 m  = (u_mouse - 0.5 * u_res) / u_res.y;

        // Domain warp driven by time + cursor
        float t = u_time * 0.06;
        vec2 q = vec2(fbm(uv * 1.4 + vec2(t, -t)),
                      fbm(uv * 1.4 + vec2(-t, t) + 4.7));
        vec2 r = vec2(fbm(uv + 1.6 * q + vec2(1.7 + t, 9.2)),
                      fbm(uv + 1.6 * q + vec2(8.3 - t, 2.8)));
        float n = fbm(uv + 1.8 * r + m * 0.4);

        // Caustic ridges
        float caustic = pow(1.0 - abs(n - 0.5) * 2.0, 6.0);

        // Palette — white ice → soft teal → deep teal accent
        vec3 ice    = vec3(0.980, 0.992, 0.996); // #FAFCFE
        vec3 mist   = vec3(0.910, 0.957, 0.961); // #E8F4F5
        vec3 teal   = vec3(0.290, 0.647, 0.659); // #4AA5A8
        vec3 deep   = vec3(0.227, 0.490, 0.431); // #3A7D6E

        vec3 col = mix(ice, mist, n);
        col = mix(col, teal, caustic * 0.55 * u_intensity);
        col = mix(col, deep, pow(caustic, 3.0) * 0.25 * u_intensity);

        // Vignette toward the bottom for compositional weight
        float vig = smoothstep(1.2, 0.2, length(uv * vec2(0.7, 1.0)));
        col = mix(col, ice, (1.0 - vig) * 0.35);

        // Subtle film grain so it doesn't read as gradient banding
        float grain = (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.018;
        col += grain;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        // eslint-disable-next-line no-console
        console.warn("[HeroShader]", gl.getShaderInfoLog(s));
      }
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Fullscreen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uIntensity = gl.getUniformLocation(prog, "u_intensity");

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio, 1.5);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width * dpr));
      h = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let mx = w / 2, my = h / 2;
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) * dpr;
      my = (r.height - (e.clientY - r.top)) * dpr;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const start = performance.now();
    let raf = 0;
    const draw = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform1f(uIntensity, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      ro.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ display: "block" }}
    />
  );
}
