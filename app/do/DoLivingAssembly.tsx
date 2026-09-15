'use client';

import {useEffect, useRef} from 'react';

type Props = {running: boolean; reduced: boolean; view: number; cinema: boolean};
const TAU = Math.PI * 2;
const smooth = (x: number) => {const t = Math.max(0, Math.min(1, x)); return t*t*(3-2*t);};
const seed = (n: number) => {const v = Math.sin(n*127.1+311.7)*43758.5453; return v-Math.floor(v);};

/** A living photographic composition. No agent activity is represented by this artwork. */
export function LivingAssembly({running, reduced, view, cinema}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef({running, reduced, view, cinema});

  useEffect(() => {controls.current = {running, reduced, view, cinema};}, [running, reduced, view, cinema]);

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext('2d', {alpha: false});
    if (!surface || !context) return;
    let width = 1, height = 1, ratio = 1, frame = 0, elapsed = 0, previous = 0, lastDraw = 0;
    let inView = true;
    let disposed = false, ready = false, dirty = true, lastView = -1;
    let lastReduced = controls.current.reduced;
    let lastCinema = controls.current.cinema, framing = controls.current.cinema ? 1 : 0;
    let currentView = controls.current.view;
    const sprite = new window.Image();
    // Decode once into a small atlas instead of resampling the large source every frame.
    const atlas = document.createElement('canvas');
    atlas.width = 128; atlas.height = 212;
    sprite.onload = () => {
      if (disposed) return;
      atlas.getContext('2d')?.drawImage(sprite, 0, 0, atlas.width, atlas.height);
      ready = true; dirty = true;
    };
    sprite.src = '/do/world/snapper-sprite.png';
    const resize = () => {
      const rect = surface.getBoundingClientRect();
      width = rect.width; height = rect.height;
      ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      surface.width = Math.round(width*ratio); surface.height = Math.round(height*ratio);
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(surface); resize();
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) dirty = true;
    });
    visibility.observe(surface);

    function render(time: number) {
      if (disposed || !context || !surface) return;
      if (!inView || (time - lastDraw < 1000 / 30 && !dirty)) {
        if (!inView) previous = time;
        frame = requestAnimationFrame(render);
        return;
      }
      lastDraw = time;
      const state = controls.current;
      if (lastReduced !== state.reduced) {dirty = true; lastReduced = state.reduced;}
      if (lastCinema !== state.cinema) {dirty = true; lastCinema = state.cinema;}
      surface.dataset.motion = state.running ? 'playing' : 'paused';
      const dt = previous ? Math.min((time-previous)/1000, .05) : 0;
      previous = time;
      const changedView = state.view !== lastView;
      if (state.running) {
        elapsed += dt;
        currentView += (state.view-currentView)*Math.min(1, dt*1.4);
        framing += ((state.cinema ? 1 : 0)-framing)*Math.min(1, dt*2);
      } else if (changedView) {
        currentView = state.view;
      }
      if (!state.running) framing = state.cinema ? 1 : 0;
      if (state.running || dirty || changedView) {
        lastView = state.view; dirty = false;
        const t = state.reduced ? 7 : elapsed;
        const cycle = t % 24;
        const assembled = state.reduced ? 1 : smooth(cycle/5)*(1-smooth((cycle-15)/7));
        const mobile = width < 700;
        const scale = Math.min(width*((mobile ? .7 : .37)*(1-framing)+(mobile ? .44 : .32)*framing), height*(.51-framing*.08));
        const cx = width*((mobile ? .69 : .74)*(1-framing)+.5*framing), cy = height*(.47+framing*.02);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.fillStyle = '#240B21'; context.fillRect(0,0,width,height);
        const light = context.createRadialGradient(cx-scale*.1,cy-scale*.2,0,cx,cy,scale*1.7);
        light.addColorStop(0,'#61334F'); light.addColorStop(.5,'#3C1833'); light.addColorStop(1,'#240B21');
        context.fillStyle = light; context.fillRect(0,0,width,height);
        if (ready) {
          const count = mobile ? 160 : 300;
          const fish = [];
          for (let i = 0; i < count; i++) {
            const a = i/count*TAU + t*.085;
            const lane = (seed(i+1)-.5)*.38;
            const phase = seed(i+20)*TAU;
            // Each fish has a separate depth, orbit and swimming rhythm.
            const ringX = Math.cos(a)*(1+lane);
            const ringY = Math.sin(a)*(.77+lane*.65);
            const ribbonX = Math.cos(a)*(1+lane)*1.08;
            const ribbonY = Math.sin(2*a)*.52 + lane*.65;
            const waveX = Math.cos(a)*(1+lane)*(.8+.23*Math.cos(3*a));
            const waveY = Math.sin(a)*(1+lane)*(.8+.23*Math.cos(3*a));
            const first = Math.min(currentView,1), second = Math.max(0,currentView-1);
            let x = (ringX*(1-first)+ribbonX*first)*(1-second)+waveX*second;
            let y = (ringY*(1-first)+ribbonY*first)*(1-second)+waveY*second;
            const scatterX = (seed(i+600)-.5)*3.7 + .16*Math.sin(t*.22+phase);
            const scatterY = (seed(i+900)-.5)*2.8 + .14*Math.cos(t*.19+phase);
            x = x*assembled + scatterX*(1-assembled);
            y = y*assembled + scatterY*(1-assembled);
            const z = Math.sin(a+.6)*.5 + seed(i+450)*.35;
            const twist = -.32;
            const px = cx + (x*Math.cos(twist)-y*Math.sin(twist))*scale;
            const py = cy + (x*Math.sin(twist)+y*Math.cos(twist))*scale;
            const depth = .58 + (z+.5)*.5;
            const size = (mobile ? 25 : 34)*depth*(.75+seed(i+710)*.65);
            const ringAngle = Math.atan2(Math.cos(a)*.77,-Math.sin(a));
            const ribbonAngle = Math.atan2(Math.cos(2*a)*1.04,-Math.sin(a)*1.08);
            const angle = ringAngle + first*Math.atan2(Math.sin(ribbonAngle-ringAngle),Math.cos(ribbonAngle-ringAngle));
            fish.push({px,py,z,size,angle: angle+Math.PI/2+twist+Math.sin(t*4+phase)*.045,alpha:.38+depth*.5,phase});
          }
          fish.sort((a,b)=>a.z-b.z);
          for (const f of fish) {
            context.save(); context.translate(f.px,f.py); context.rotate(f.angle);
            context.globalAlpha = f.alpha;
            // One atlas draw per fish keeps the page responsive while it swims.
            const w = f.size*.604;
            context.drawImage(atlas,-w/2,-f.size/2,w,f.size);
            context.restore();
          }
        }
        surface.dataset.phase = state.reduced ? 'assembled' : cycle<5 ? 'gathering' : cycle<15 ? 'assembled' : 'opening';
        surface.dataset.time = t.toFixed(2);
      }
      frame = requestAnimationFrame(render);
    }
    frame = requestAnimationFrame(render);
    return () => {disposed = true; cancelAnimationFrame(frame); observer.disconnect(); visibility.disconnect(); sprite.onload = null;};
  }, []);

  return <div className="do-living-scene" aria-hidden="true"><canvas ref={canvas}/></div>;
}
