'use client';

/**
 * InteractivePlayground — the engagement surfaces from the design handoff
 * ("Dash - Interactive.dc.html"): a scratch-to-reveal reward card and the
 * "Coin Dash" coin-catching mini-game. Ported from the handoff's vanilla logic
 * to a React client component with refs; the canvas scratch + rAF game loop run
 * imperatively, with listeners cleaned up on unmount.
 *
 * Palette locked: white + champagne #BFA37A + charcoal #3a3832.
 */

import { useEffect, useRef } from 'react';

const MASCOT = '/dash/mascot-dog.png';

interface Coin {
  el: HTMLDivElement;
  x: number;
  y: number;
  v: number;
  big: boolean;
  s: number;
  dead: boolean;
}

export function InteractivePlayground() {
  // scratch refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coatRef = useRef<HTMLDivElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  // game refs
  const areaRef = useRef<HTMLDivElement>(null);
  const dogRef = useRef<HTMLImageElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const overRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  // imperative API the buttons call
  const api = useRef<{ resetScratch: () => void; startGame: () => void }>({
    resetScratch: () => {},
    startGame: () => {},
  });

  useEffect(() => {
    // ---------- SCRATCH ----------
    let revealed = false;
    let scratch: { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; w: number; h: number } | null = null;

    function drawCoat() {
      if (!scratch) return;
      const { ctx, w, h } = scratch;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#BFA37A';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(58,56,50,.09)';
      for (let x = -12; x < w; x += 30) ctx.fillRect(x, 0, 16, h);
      ctx.fillStyle = '#3a3832';
      ctx.textAlign = 'center';
      ctx.font = '700 15px "Space Mono", monospace';
      ctx.fillText('SCRATCH TO REVEAL', w / 2, h / 2 - 4);
      ctx.font = '400 12px "Space Mono", monospace';
      ctx.fillText('drag to uncover your reward', w / 2, h / 2 + 18);
      ctx.globalCompositeOperation = 'destination-out';
    }

    function checkScratch() {
      if (!scratch || revealed) return;
      const { cv, ctx } = scratch;
      const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += 4 * 50) {
        total++;
        if (data[i] < 40) clear++;
      }
      if (total && clear / total > 0.48) {
        revealed = true;
        const coat = coatRef.current;
        if (coat) {
          coat.style.transition = 'opacity .5s ease';
          coat.style.opacity = '0';
          coat.style.pointerEvents = 'none';
        }
        const win = winRef.current;
        if (win) win.style.animation = 'bdPop .5s cubic-bezier(.22,.61,.36,1) both';
      }
    }

    function resetScratch() {
      const coat = coatRef.current;
      if (coat) {
        coat.style.transition = 'none';
        coat.style.opacity = '1';
        coat.style.pointerEvents = 'auto';
      }
      revealed = false;
      drawCoat();
    }

    const cv = canvasRef.current;
    let down: ((e: MouseEvent | TouchEvent) => void) | null = null;
    let move: ((e: MouseEvent | TouchEvent) => void) | null = null;
    let up: (() => void) | null = null;

    if (cv) {
      const ctx = cv.getContext('2d');
      if (ctx) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = cv.offsetWidth || 360;
        const h = cv.offsetHeight || 240;
        cv.width = w * dpr;
        cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        scratch = { cv, ctx, w, h };
        drawCoat();

        const pt = (e: MouseEvent | TouchEvent): [number, number] => {
          const r = cv.getBoundingClientRect();
          const touch = 'touches' in e ? e.touches[0] : null;
          const cx = (touch ? touch.clientX : (e as MouseEvent).clientX) - r.left;
          const cy = (touch ? touch.clientY : (e as MouseEvent).clientY) - r.top;
          return [cx, cy];
        };
        const dab = (x: number, y: number) => {
          ctx.beginPath();
          ctx.arc(x, y, 24, 0, 7);
          ctx.fill();
        };
        let drawing = false;
        down = (e) => {
          if (revealed) return;
          drawing = true;
          const p = pt(e);
          dab(p[0], p[1]);
          if (e.cancelable) e.preventDefault();
        };
        move = (e) => {
          if (!drawing || revealed) return;
          const p = pt(e);
          dab(p[0], p[1]);
          if (e.cancelable) e.preventDefault();
        };
        up = () => {
          if (!drawing) return;
          drawing = false;
          checkScratch();
        };
        cv.addEventListener('mousedown', down as EventListener);
        window.addEventListener('mousemove', move as EventListener);
        window.addEventListener('mouseup', up);
        cv.addEventListener('touchstart', down as EventListener, { passive: false });
        cv.addEventListener('touchmove', move as EventListener, { passive: false });
        window.addEventListener('touchend', up);
      }
    }

    // ---------- GAME ----------
    const game = { running: false, score: 0, coins: [] as Coin[], dogX: 0.5, timeLeft: 20 };
    let tick: ReturnType<typeof setInterval> | null = null;

    const area = areaRef.current;
    const setX = (clientX: number) => {
      if (!area) return;
      const r = area.getBoundingClientRect();
      game.dogX = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    };
    const onMouse = (e: MouseEvent) => setX(e.clientX);
    const onTouch = (e: TouchEvent) => {
      setX(e.touches[0].clientX);
      if (e.cancelable) e.preventDefault();
    };
    if (area) {
      area.addEventListener('mousemove', onMouse);
      area.addEventListener('touchmove', onTouch, { passive: false });
    }

    function spawnCoin(host: HTMLDivElement, W: number) {
      const big = Math.random() < 0.18;
      const s = big ? 34 : 24;
      const el = document.createElement('div');
      el.textContent = '$';
      el.style.cssText =
        'position:absolute;width:' +
        s +
        'px;height:' +
        s +
        'px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:\'Space Mono\',monospace;font-weight:700;font-size:' +
        (big ? 13 : 11) +
        'px;z-index:1;background:' +
        (big ? '#3a3832' : '#BFA37A') +
        ';color:' +
        (big ? '#BFA37A' : '#3a3832') +
        ';box-shadow:0 4px 12px rgba(150,110,10,.3)' +
        (big ? ',0 0 14px rgba(58,56,50,.4)' : '');
      const x = Math.random() * (W - s);
      el.style.left = x + 'px';
      el.style.top = '-34px';
      host.appendChild(el);
      game.coins.push({ el, x, y: -34, v: 130 + Math.random() * 140, big, s, dead: false });
    }

    function endGame() {
      game.running = false;
      if (tick) clearInterval(tick);
      if (startRef.current) startRef.current.style.display = 'none';
      if (finalRef.current) finalRef.current.textContent = '$' + (game.score * 0.01).toFixed(2);
      const over = overRef.current;
      if (over) {
        over.style.opacity = '1';
        over.style.pointerEvents = 'auto';
      }
    }

    function startGame() {
      if (!area) return;
      const dog = dogRef.current;
      const scoreEl = scoreRef.current;
      const timeEl = timeRef.current;
      if (!dog || !scoreEl || !timeEl) return;
      game.coins.forEach((c) => c.el && c.el.remove());
      game.coins = [];
      game.running = true;
      game.score = 0;
      game.timeLeft = 20;
      if (startRef.current) startRef.current.style.display = 'none';
      const over = overRef.current;
      if (over) {
        over.style.opacity = '0';
        over.style.pointerEvents = 'none';
      }
      scoreEl.textContent = '0';
      timeEl.textContent = '20s';
      let last = performance.now();
      let spawn = 0;
      if (tick) clearInterval(tick);
      const loop = () => {
        if (!game.running) {
          if (tick) clearInterval(tick);
          return;
        }
        const t = performance.now();
        const W = area.clientWidth;
        const H = area.clientHeight;
        const dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        game.timeLeft -= dt;
        spawn -= dt;
        if (game.timeLeft <= 0) {
          timeEl.textContent = '0s';
          endGame();
          return;
        }
        timeEl.textContent = Math.ceil(game.timeLeft) + 's';
        const dogW = 78;
        const dx = game.dogX * (W - dogW);
        dog.style.left = dx + 'px';
        if (spawn <= 0) {
          spawn = 0.5 + Math.random() * 0.45;
          spawnCoin(area, W);
        }
        const catchTop = H - 70;
        for (const c of game.coins) {
          c.y += c.v * dt;
          c.el.style.top = c.y + 'px';
          if (
            !c.dead &&
            c.y > catchTop - 26 &&
            c.y < catchTop + 40 &&
            c.x + c.s > dx + 8 &&
            c.x < dx + dogW - 8
          ) {
            c.dead = true;
            game.score += c.big ? 5 : 1;
            scoreEl.textContent = String(game.score);
            c.el.style.transition = 'transform .2s,opacity .2s';
            c.el.style.transform = 'scale(1.7)';
            c.el.style.opacity = '0';
            setTimeout(() => c.el.remove(), 200);
          } else if (c.y > H + 30) {
            c.dead = true;
            c.el.remove();
          }
        }
        game.coins = game.coins.filter((c) => !c.dead);
      };
      tick = setInterval(loop, 1000 / 60);
    }

    // expose to buttons
    api.current = { resetScratch, startGame };

    // ---------- CLEANUP ----------
    return () => {
      game.running = false;
      if (tick) clearInterval(tick);
      game.coins.forEach((c) => c.el && c.el.remove());
      if (cv && down) {
        cv.removeEventListener('mousedown', down as EventListener);
        cv.removeEventListener('touchstart', down as EventListener);
        cv.removeEventListener('touchmove', move as EventListener);
      }
      if (move) window.removeEventListener('mousemove', move as EventListener);
      if (up) {
        window.removeEventListener('mouseup', up);
        window.removeEventListener('touchend', up);
      }
      if (area) {
        area.removeEventListener('mousemove', onMouse);
        area.removeEventListener('touchmove', onTouch);
      }
    };
  }, []);

  return (
    <>
      {/* SCRATCH CARD */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #EFEADC',
          borderRadius: 28,
          padding: 36,
          boxShadow: '0 20px 50px rgba(180,150,40,.1)',
          marginBottom: 36,
        }}
      >
        <div style={{ display: 'flex', gap: 36, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div
              className="bd-mono"
              style={{
                fontSize: 11,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                color: '#c79b1f',
                marginBottom: 10,
              }}
            >
              Reward reveal
            </div>
            <h2 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 30, letterSpacing: '-.03em', color: '#3a3832' }}>
              Scratch to see what you earned.
            </h2>
            <p style={{ margin: '0 0 22px', fontSize: 16, lineHeight: 1.6, color: '#56544b' }}>
              When the agent finishes, the wait pays out. Drag across the panel to scratch it off and
              see what landed in your account.
            </p>
            <button
              type="button"
              onClick={() => api.current.resetScratch()}
              className="bd-reset"
              style={{
                background: 'rgba(191,163,122,.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,.65)',
                boxShadow: '0 8px 26px rgba(191,163,122,.3),inset 0 1px 0 rgba(255,255,255,.8)',
                color: '#3a3832',
                fontWeight: 700,
                fontSize: 15,
                padding: '13px 26px',
                borderRadius: 99,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Reset panel
            </button>
          </div>
          <div
            style={{
              flex: 'none',
              width: 360,
              height: 240,
              position: 'relative',
              borderRadius: 22,
              boxShadow: '0 16px 40px rgba(180,150,40,.18)',
              maxWidth: '100%',
            }}
          >
            {/* reward beneath */}
            <div
              ref={winRef}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 22,
                background: 'radial-gradient(circle at 50% 30%,#FFF7DD,#fff)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={MASCOT}
                alt=""
                aria-hidden
                className="bd-float7"
                style={{ width: 150, height: 'auto', filter: 'drop-shadow(0 10px 12px rgba(180,150,40,.25))' }}
              />
              <div
                className="bd-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: '#b89a2e',
                  marginTop: 4,
                }}
              >
                you earned
              </div>
              <div style={{ fontWeight: 700, fontSize: 34, letterSpacing: '-.03em', color: '#3a3832', lineHeight: 1 }}>
                $0.18
              </div>
              <div style={{ fontSize: 13, color: '#56544b', marginTop: 2 }}>→ straight to your KiwiSaver</div>
            </div>
            {/* coating */}
            <div ref={coatRef} style={{ position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden' }}>
              <canvas
                ref={canvasRef}
                style={{ display: 'block', width: 360, height: 240, maxWidth: '100%', borderRadius: 22, cursor: 'grab' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MINI GAME */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #EFEADC',
          borderRadius: 28,
          padding: 36,
          boxShadow: '0 20px 50px rgba(180,150,40,.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 18,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div
              className="bd-mono"
              style={{
                fontSize: 11,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                color: '#c79b1f',
                marginBottom: 10,
              }}
            >
              Mini game
            </div>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: 30, letterSpacing: '-.03em', color: '#3a3832' }}>
              Coin Dash — catch the coins.
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 15, color: '#8a887e' }}>
              Move your mouse (or finger) to steer the dog. Catch coins while you wait. Dark coins
              are worth 5×.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ textAlign: 'center' }}>
              <div ref={scoreRef} style={{ fontWeight: 700, fontSize: 30, color: '#3a3832', lineHeight: 1 }}>
                0
              </div>
              <div
                className="bd-mono"
                style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#bdb592' }}
              >
                coins
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div ref={timeRef} style={{ fontWeight: 700, fontSize: 30, color: '#3a3832', lineHeight: 1 }}>
                20s
              </div>
              <div
                className="bd-mono"
                style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#bdb592' }}
              >
                left
              </div>
            </div>
          </div>
        </div>

        <div
          ref={areaRef}
          style={{
            position: 'relative',
            height: 380,
            background: 'radial-gradient(circle at 50% -10%,#FFF7EC,#fff)',
            border: '1px solid #EFEADC',
            borderRadius: 20,
            overflow: 'hidden',
            cursor: 'none',
            touchAction: 'none',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={dogRef}
            src={MASCOT}
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 8,
              left: 0,
              width: 78,
              height: 'auto',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 8px 10px rgba(180,150,40,.3))',
              zIndex: 2,
            }}
          />
          {/* start overlay */}
          <div
            ref={startRef}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,247,236,.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              zIndex: 5,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 32, letterSpacing: '-.03em', color: '#3a3832' }}>
              Ready to play?
            </div>
            <button
              type="button"
              onClick={() => api.current.startGame()}
              className="bd-play bd-glowpulse"
              style={{
                background: '#BFA37A',
                border: 'none',
                color: '#3a3832',
                fontWeight: 700,
                fontSize: 17,
                padding: '15px 36px',
                borderRadius: 99,
                cursor: 'pointer',
              }}
            >
              ▶ Play
            </button>
          </div>
          {/* game over overlay */}
          <div
            ref={overRef}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,247,236,.66)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              zIndex: 6,
              opacity: 0,
              pointerEvents: 'none',
              transition: 'opacity .35s',
            }}
          >
            <div
              className="bd-mono"
              style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: '#b8860b' }}
            >
              time&apos;s up · you banked
            </div>
            <div ref={finalRef} style={{ fontWeight: 700, fontSize: 52, letterSpacing: '-.03em', color: '#3a3832', lineHeight: 1 }}>
              $0.00
            </div>
            <button
              type="button"
              onClick={() => api.current.startGame()}
              className="bd-play"
              style={{
                marginTop: 12,
                background: '#BFA37A',
                border: 'none',
                color: '#3a3832',
                fontWeight: 700,
                fontSize: 16,
                padding: '13px 30px',
                borderRadius: 99,
                cursor: 'pointer',
              }}
            >
              ↻ Play again
            </button>
          </div>
        </div>
        <div className="bd-mono" style={{ marginTop: 14, fontSize: 11, color: '#bdb592', textAlign: 'center' }}>
          a real, idle-time-worthy distraction · every coin = $0.01 to your reward
        </div>
      </div>
    </>
  );
}
