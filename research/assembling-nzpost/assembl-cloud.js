/*! assembl-cloud.js v2 — the assembly, in three dimensions.
 *
 *  Particles that start dispersed and RESOLVE into a form: the design
 *  constitution's central metaphor made literal. v2 adds materials — dark
 *  liquid ink, chrome and brass — and a form for each industry assembl builds
 *  in, so the object on a page is always a thing from that trade.
 *
 *  Requires three.js r144 (vendored in every demo folder). No THREE, or
 *  prefers-reduced-motion, and the host stays empty: the page never depends
 *  on it.
 *
 *  ── MATERIALS ──────────────────────────────────────────────────────────────
 *    'points'  hairline points in the brand colour. Quietest; the default.
 *    'chrome'  brushed silver beads. Constitution §6: brushed, never mirror.
 *    'brass'   warm metal — assembl's champagne. Use for proof and receipts.
 *    'ink'     dark liquid: beads that flow on a curl field before they settle.
 *    'brand'   the client's own colour, in metal.
 *  Metals are an InstancedMesh lit by a softbox environment, so they read as
 *  manufactured objects rather than glowing dots.
 *
 *  ── FORMS, and the trade each belongs to ───────────────────────────────────
 *    grid ledger ring column      the work itself — records, files, waits, queues
 *    house villa                  retirement, property, a home loan
 *    car                          motor retail
 *    plane                        aviation
 *    parcel                       logistics
 *    shield                       insurance and claims
 *    leaf                         energy
 *    basket                       grocery
 *    tower                        construction
 *    wave                         liquid ink, unresolved — for an opening
 *
 *  ── USAGE ──────────────────────────────────────────────────────────────────
 *    AssemblCloud.mount(el, { form:'car', material:'chrome', colour:'#BFA37A',
 *                             count:2600, mode:'scrub', stage:'#s', size:.06 });
 */
(function () {
  'use strict';

  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ── the forms ─────────────────────────────────────────────────────────── */
  function targets(form, n) {
    var p = new Float32Array(n * 3), i, x, y, z, a, r, row, col, per, k, t, s;
    function jit(m) { return (Math.random() - .5) * (m || .08); }

    for (i = 0; i < n; i++) {
      k = i / n;
      switch (form) {

        case 'ring':
          a = k * Math.PI * 2; r = 3.1 + jit(.1);
          x = Math.cos(a) * r; y = Math.sin(a) * r; z = jit(.16); break;

        case 'column':
          per = Math.max(1, Math.floor(n / 26)); row = Math.floor(i / per); col = i % per;
          x = (col / per - .5) * 4.6; y = 3.4 - row * .27 + jit(.03); z = jit(.5); break;

        case 'ledger':
          s = Math.floor(k * 7);
          x = jit(4.4); y = -1.8 + s * .62 + jit(.04); z = jit(3.0); break;

        case 'house':
        case 'villa':
          if (k < .5) {                                  // walls
            a = Math.floor(k / .125) % 4; t = (k % .125) / .125;
            var w = 2.5, h = 1.9;
            if (a === 0) { x = -w + t * 2 * w; y = -h; }
            else if (a === 1) { x = w; y = -h + t * 2 * h; }
            else if (a === 2) { x = w - t * 2 * w; y = h; }
            else { x = -w; y = h - t * 2 * h; }
            z = jit(2.4);
          } else if (k < .82) {                          // roof
            s = (k - .5) / .32; x = -3.0 + s * 6.0;
            y = 1.9 + (1 - Math.abs(s - .5) * 2) * 1.55; z = jit(2.4);
          } else { x = jit(5.2); y = -1.9; z = jit(2.4); }
          break;

        case 'car':                                      // a coupé silhouette
          if (k < .46) {                                 // body line
            t = k / .46; x = -3.4 + t * 6.8;
            var bx = x / 3.4;
            y = -.55 + Math.max(0, 1.25 - bx * bx * 1.25) * (bx > -.35 ? 1 : .55);
            y = -.55 + (1 - bx * bx) * 1.15;
            z = jit(1.7);
          } else if (k < .62) {                          // roofline
            t = (k - .46) / .16; x = -1.5 + t * 2.6;
            y = .62 + Math.sin(t * Math.PI) * .78; z = jit(1.5);
          } else if (k < .78) {                          // sill
            t = (k - .62) / .16; x = -3.3 + t * 6.6; y = -1.02 + jit(.05); z = jit(1.7);
          } else {                                       // wheels
            var wheel = k < .89 ? -1.95 : 1.95;
            a = ((k - .78) % .11) / .11 * Math.PI * 2;
            x = wheel + Math.cos(a) * .72; y = -1.02 + Math.sin(a) * .72; z = jit(1.5);
          }
          break;

        case 'plane':
          if (k < .38) { t = k / .38; x = -3.6 + t * 7.2; y = jit(.14); z = jit(.3); }
          else if (k < .78) {                            // swept wings
            t = (k - .38) / .4; var side = t < .5 ? 1 : -1; var u = (t % .5) * 2;
            x = .6 - u * 2.2; y = side * (u * 2.5); z = jit(.25);
          } else { t = (k - .78) / .22; x = -3.2 + t * .9; y = t * 1.3; z = jit(.2); }
          break;

        case 'parcel':                                   // a box in space
          a = Math.floor(k * 12); t = (k * 12) % 1; var e = 1.5;
          var ex = [[-1,-1,-1,1,-1,-1],[1,-1,-1,1,1,-1],[1,1,-1,-1,1,-1],[-1,1,-1,-1,-1,-1],
                    [-1,-1,1,1,-1,1],[1,-1,1,1,1,1],[1,1,1,-1,1,1],[-1,1,1,-1,-1,1],
                    [-1,-1,-1,-1,-1,1],[1,-1,-1,1,-1,1],[1,1,-1,1,1,1],[-1,1,-1,-1,1,1]][a % 12];
          x = (ex[0] + (ex[3] - ex[0]) * t) * e + jit(.05);
          y = (ex[1] + (ex[4] - ex[1]) * t) * e + jit(.05);
          z = (ex[2] + (ex[5] - ex[2]) * t) * e + jit(.05);
          break;

        case 'shield':
          if (k < .8) {
            t = k / .8; a = t * Math.PI * 2;
            var sr = t < .5 ? 2.1 : 2.1 * (1 - (t - .5) * .7);
            x = Math.sin(a) * 2.0 * (t > .55 ? (1 - (t - .55) * 1.7) : 1);
            y = 2.3 - t * 4.6; z = jit(.5);
          } else { t = (k - .8) / .2; x = jit(2.6); y = 2.3 - t * .1; z = jit(.5); }
          break;

        case 'leaf':
          t = k; a = t * Math.PI;
          x = Math.sin(a) * 2.4 * (t < .5 ? 1 : -1) * .8;
          y = -2.4 + t * 4.8; z = jit(.4) + Math.sin(t * Math.PI) * .3;
          break;

        case 'basket':
          if (k < .7) { t = k / .7; a = t * Math.PI; x = Math.cos(a) * 2.4; y = -1.4 - Math.sin(a) * .1 + Math.abs(Math.cos(a)) * .9; z = jit(1.6); }
          else { t = (k - .7) / .3; x = -2.4 + t * 4.8; y = 1.0 + jit(.06); z = jit(1.6); }
          break;

        case 'tower':
          per = Math.max(1, Math.floor(n / 30)); row = Math.floor(i / per);
          t = (i % per) / per; a = t * Math.PI * 2;
          r = 1.7 * (1 - row / 34 * .45);
          x = Math.cos(a) * r; y = -2.6 + row * .17; z = Math.sin(a) * r; break;

        case 'wave':                                     // unresolved liquid
          per = Math.ceil(Math.sqrt(n)); row = Math.floor(i / per); col = i % per;
          x = (col / (per - 1) - .5) * 7.2; z = (row / (per - 1) - .5) * 7.2;
          y = Math.sin(x * .8) * .45 + Math.cos(z * .7) * .45 + jit(.06); break;

        default:                                         // grid — records aligning
          per = Math.ceil(Math.sqrt(n)); row = Math.floor(i / per); col = i % per;
          x = (col / (per - 1) - .5) * 6.4; y = (row / (per - 1) - .5) * 6.4; z = jit(.12);
      }
      p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z;
    }
    return p;
  }

  /* ── the softbox: metals need something to reflect, or they read black ─── */
  function envMap(renderer, warm) {
    var pmrem = new THREE.PMREMGenerator(renderer), env = new THREE.Scene();
    env.background = new THREE.Color('#0d0d10');
    function panel(w, h, x, y, z, rx, ry, col, pow) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(pow) }));
      m.position.set(x, y, z); m.rotation.set(rx, ry, 0); env.add(m);
    }
    panel(18, 10, 0, 9, 2, -Math.PI / 2, 0, '#FFFFFF', 4.6);      // key from above
    panel(12, 8, -9, 2, 3, 0, Math.PI / 2, warm ? '#FFE9C8' : '#F2F6FF', 3.0);
    panel(12, 8, 9, 2, 1, 0, -Math.PI / 2, '#E8EEF6', 2.2);
    panel(14, 6, 0, -6, -6, Math.PI / 2, 0, '#FFFFFF', 1.1);      // bounce
    var tex = pmrem.fromScene(env, .02).texture;
    pmrem.dispose();
    return tex;
  }

  function materialFor(kind, colour, env, mix) {
    /* Kate, 1 Aug 2026: "can it not be in the brand colours?" — every finish
       is now TINTED with the client's colour. The material keeps its character
       (metal, liquid); the hue is theirs. `mix` (0..1, opt.brandMix) sets how
       far the finish leans into the brand — default .7, tune per page if a
       colour blows out under the softbox. */
    var m = (mix == null ? .7 : mix);
    function tint(base, k) { return new THREE.Color(base).lerp(new THREE.Color(colour || base), k); }
    switch (kind) {
      case 'chrome':
        return new THREE.MeshStandardMaterial({ color: tint('#E9ECF1', m), metalness: 1,
          roughness: .17, envMap: env, envMapIntensity: 1.9 });       // brushed, not mirror
      case 'brass':
        return new THREE.MeshStandardMaterial({ color: tint('#BFA37A', m), metalness: 1,
          roughness: .21, envMap: env, envMapIntensity: 2.0 });
      case 'ink':
        return new THREE.MeshStandardMaterial({ color: tint('#16171B', m * .8), metalness: .4,
          roughness: .16, envMap: env, envMapIntensity: 1.1 });       // wet, dark, in their hue
      case 'brand':
        return new THREE.MeshStandardMaterial({ color: colour, metalness: .82,
          roughness: .26, envMap: env, envMapIntensity: 1.5 });
      default: return null;                                            // points
    }
  }

  function mount(host, opt) {
    if (!host || typeof window.THREE === 'undefined') return null;
    opt = opt || {};
    var N = Math.min(opt.count || 2400, 4200);
    var COL = opt.colour || '#2F4F44';
    var KIND = opt.material || 'points';
    var MODE = opt.mode || 'auto';
    var SZ = opt.size || .055;

    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(42, host.clientWidth / host.clientHeight, .1, 100);
    cam.position.set(0, 0, 11);

    var ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    ren.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    ren.setSize(host.clientWidth, host.clientHeight);
    if (THREE.sRGBEncoding) ren.outputEncoding = THREE.sRGBEncoding;
    ren.domElement.className = 'mCanvas';
    host.appendChild(ren.domElement);

    var to = targets(opt.form || 'grid', N);
    var from = new Float32Array(N * 3);
    var i, i3;
    for (i = 0; i < N; i++) {                       // dispersed start
      var th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1),
        rr = 9 + Math.random() * 8;
      i3 = i * 3;
      from[i3] = Math.sin(ph) * Math.cos(th) * rr;
      from[i3 + 1] = Math.sin(ph) * Math.sin(th) * rr;
      from[i3 + 2] = Math.cos(ph) * rr;
    }

    var stagger = new Float32Array(N);
    for (i = 0; i < N; i++) stagger[i] = Math.random() * .45;

    var env = null, obj, geo, mat, dummy = null, cur = null;
    var isMetal = KIND !== 'points';

    if (isMetal) {
      env = envMap(ren, KIND === 'brass' || KIND === 'ink');
      scene.environment = env;
      mat = materialFor(KIND, COL, env, opt.brandMix);
      geo = new THREE.SphereGeometry(SZ * 1.25, 8, 6);
      obj = new THREE.InstancedMesh(geo, mat, N);
      obj.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      dummy = new THREE.Object3D();
      scene.add(new THREE.AmbientLight('#ffffff', .25));
      var key = new THREE.DirectionalLight('#ffffff', 1.15);
      key.position.set(5, 8, 6); scene.add(key);
    } else {
      cur = new Float32Array(N * 3); cur.set(from);
      geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(cur, 3));
      mat = new THREE.PointsMaterial({ color: new THREE.Color(COL), size: SZ,
        sizeAttenuation: true, transparent: true, opacity: .92, depthWrite: false });
      obj = new THREE.Points(geo, mat);
    }
    scene.add(obj);

    var p = REDUCED ? 1 : 0, target = REDUCED ? 1 : 0, t = 0;
    var FLOW = KIND === 'ink';                       // ink keeps moving until it settles

    function apply() {
      for (var i = 0; i < N; i++) {
        var lp = Math.min(1, Math.max(0, (p - stagger[i]) / (1 - stagger[i] || 1)));
        var e = 1 - Math.pow(1 - lp, 3);
        var i3 = i * 3;
        var x = from[i3] + (to[i3] - from[i3]) * e;
        var y = from[i3 + 1] + (to[i3 + 1] - from[i3 + 1]) * e;
        var z = from[i3 + 2] + (to[i3 + 2] - from[i3 + 2]) * e;
        if (FLOW) {                                  // a slow curl while unresolved
          var w = (1 - e) * .9;
          x += Math.sin(y * .5 + t * .8) * w;
          y += Math.cos(z * .45 + t * .7) * w;
          z += Math.sin(x * .4 + t * .6) * w;
        }
        if (isMetal) {
          dummy.position.set(x, y, z);
          var sc = .55 + e * .45;
          dummy.scale.setScalar(sc);
          dummy.updateMatrix();
          obj.setMatrixAt(i, dummy.matrix);
        } else {
          cur[i3] = x; cur[i3 + 1] = y; cur[i3 + 2] = z;
        }
      }
      if (isMetal) obj.instanceMatrix.needsUpdate = true;
      else geo.attributes.position.needsUpdate = true;
    }

    var mx = 0, my = 0, tmx = 0, tmy = 0;
    if (!REDUCED && window.matchMedia('(hover:hover)').matches) {
      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect();
        tmx = ((e.clientX - r.left) / r.width - .5) * .55;
        tmy = ((e.clientY - r.top) / r.height - .5) * .38;
      }, { passive: true });
      host.addEventListener('pointerleave', function () { tmx = 0; tmy = 0; });
    }

    var running = true;
    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      t += .01;
      p += (target - p) * .06;
      apply();
      mx += (tmx - mx) * .05; my += (tmy - my) * .05;
      obj.rotation.y = mx + Math.sin(t * .22) * .05 * p;
      obj.rotation.x = my + Math.cos(t * .18) * .03 * p;
      ren.render(scene, cam);
    }

    if (MODE === 'scrub') {
      var stageEl = opt.stage ? document.querySelector(opt.stage) : host.closest('[data-m-scrub]');
      window.addEventListener('m:scrub', function (ev) {
        if (!stageEl || ev.detail.el !== stageEl) return;
        target = ev.detail.p;
      });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { target = 1; io.disconnect(); } });
      }, { threshold: .25 });
      io.observe(host);
    }

    window.addEventListener('resize', function () {
      if (!host.clientWidth) return;
      cam.aspect = host.clientWidth / host.clientHeight;
      cam.updateProjectionMatrix();
      ren.setSize(host.clientWidth, host.clientHeight);
    }, { passive: true });

    var vis = new IntersectionObserver(function (es) {      // battery is part of premium
      es.forEach(function (e) {
        if (e.isIntersecting && !running) { running = true; loop(); }
        else if (!e.isIntersecting) running = false;
      });
    }, { threshold: 0 });
    vis.observe(host);

    loop();
    return {
      set: function (v) { target = Math.min(1, Math.max(0, v)); },
      destroy: function () {
        running = false; vis.disconnect();
        ren.dispose(); geo.dispose(); mat.dispose(); if (env) env.dispose();
      }
    };
  }

  window.AssemblCloud = {
    mount: mount,
    forms: ['grid', 'ledger', 'ring', 'column', 'house', 'villa', 'car', 'plane',
            'parcel', 'shield', 'leaf', 'basket', 'tower', 'wave'],
    materials: ['points', 'chrome', 'brass', 'ink', 'brand']
  };
})();
