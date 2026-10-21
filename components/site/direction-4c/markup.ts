// Trusted static markup adapted from the supplied Claude Design export (docs/design/direction-4c).
// Server-rendered as-is; never interpolate user input. The interactive Try DO card lives in TryDo.tsx.

const arrow = `<svg class="clear-arrow" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 19 5M5 5h14v14"/></svg>`;

const forwardArrow = `<svg class="clear-arrow" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>`;

/** Fixed canvas, static fallback backdrop and the floating header. */
export const chromeMarkup = `<img class="clear-coastal-poster" src="/direction-4c/assets/footage/coast-gen-c-poster.jpg" alt="" fetchpriority="high" aria-hidden="true">
<video data-coastal-video class="clear-coastal-video" muted playsinline loop preload="none" poster="/direction-4c/assets/footage/coast-gen-c-poster.jpg" aria-hidden="true" tabindex="-1"></video>
<canvas data-ref="canvasRef" aria-hidden="true" style="position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none"></canvas>
<div data-fallback><div aria-hidden="true" style="position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(120% 95% at 50% 45%,rgba(36,11,33,0) 45%,rgba(36,11,33,.5) 100%)"></div></div>


<header style="position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:20;width:min(1400px,calc(100% - 28px));display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 7px 7px 7px;border-radius:999px;background:rgba(36,11,33,.5);backdrop-filter:blur(18px) saturate(140%);-webkit-backdrop-filter:blur(18px) saturate(140%);box-shadow:0 14px 40px -26px rgba(14,4,13,.6),inset 0 0 0 1px rgba(234,200,223,.2)">
  <a href="#top" aria-label="assembl, back to top" style="display:flex;align-items:center;gap:11px;min-height:44px;padding-right:8px;color:#FFFDFB" class="clear-hover-0"><img src="/direction-4c/assets/brand/assembl-a-glass.webp" alt="" style="width:44px;height:44px;flex-shrink:0;border-radius:50%;object-fit:cover;object-position:44% 50%;box-shadow:0 0 0 1px rgba(255,253,251,.55),0 10px 26px -10px rgba(234,178,208,.9)"><strong data-ref="markRef" data-hide-sm="" style="font-size:23px;font-weight:600;letter-spacing:-.055em;opacity:0">assembl</strong></a>
  <nav aria-label="Primary" style="display:flex;gap:4px;font-size:14px">
    <a href="/pursuit" style="display:flex;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;color:#FFFDFB" class="clear-hover-1">Pursuit</a>
    <a href="/creative-studio" style="display:flex;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;color:#FFFDFB" class="clear-hover-2">Studio</a>
    <a href="/do" style="display:flex;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;color:#FFFDFB" class="clear-hover-3">DO</a>
  </nav>
  <div style="display:flex;align-items:center;gap:4px">
    <button type="button" data-pause aria-pressed="false" style="min-height:44px;padding:0 14px;border:0;border-radius:999px;background:transparent;color:#F2E6EB;font:400 11px/1 var(--font-mono),'IBM Plex Mono',monospace;letter-spacing:.06em;cursor:pointer" class="clear-hover-4">Pause motion</button>
    <a href="/contact" style="display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;border-radius:999px;background:#FFFDFB;color:#240B21;font-size:13px;font-weight:600;transition:box-shadow .4s ease" class="clear-hover-5">Bring us the work ${arrow}</a>
  </div>
</header>`;

/** Hero, Pursuit and DO sections — everything above Try DO. */
export const leadMarkup = `<section id="top" data-ref="heroRef" data-form="0" data-screen-label="Hero" style="position:relative;height:320svh">
    <div style="position:sticky;top:0;height:100svh;overflow:hidden">
      <h1 style="position:absolute;width:1px;height:1px;margin:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">assembl. Useful work.</h1>
      <div data-fallback>
        <p aria-hidden="true" data-wordmark style="position:absolute;left:0;right:0;top:calc(42svh - .5em);margin:0;text-align:center;white-space:nowrap;font-size:min(22vw,40svh);font-weight:600;line-height:1;letter-spacing:-.055em;color:#FFFDFB;text-shadow:0 8px 60px rgba(36,11,33,.45)">assembl</p>
      </div>
      <p data-ref="kickRef" data-scramble="" style="position:absolute;left:5.5%;right:5.5%;top:calc(42svh - min(9.15vw,16.67svh) - 50px);margin:0;text-align:center;font:400 11px/1.5 var(--font-mono),'IBM Plex Mono',monospace;letter-spacing:.22em;text-transform:uppercase;color:#FFFDFB;text-shadow:0 1px 14px rgba(36,11,33,.75)">agentic AI · built in Aotearoa New Zealand</p>
      <p data-ref="subRef" style="position:absolute;left:5.5%;right:5.5%;top:calc(42svh + min(9.15vw,16.67svh) + 26px);margin:0;text-align:center"><span class="clear-accent" style="display:inline-block;font-size:clamp(19px,1.8vw,26px);font-weight:500;line-height:1.3;letter-spacing:-.03em;color:#FFFDFB;text-shadow:0 2px 26px rgba(36,11,33,.7),0 1px 4px rgba(36,11,33,.45);text-wrap:balance;animation:clear-fade .9s ease .5s both">Agentic AI solutions for your business.</span></p>
      <div data-ref="msgRef" style="position:absolute;left:5.5%;right:5.5%;top:52%;transform:translateY(-50%);isolation:isolate;display:flex;flex-direction:column;align-items:center;text-align:center;opacity:0;visibility:hidden">
        <div aria-hidden="true" style="position:absolute;left:50%;top:50%;z-index:-1;width:min(1200px,130%);height:170%;transform:translate(-50%,-50%);pointer-events:none;background:radial-gradient(closest-side,rgba(36,11,33,.5) 0%,rgba(36,11,33,.36) 34%,rgba(36,11,33,.16) 64%,rgba(36,11,33,0) 100%)"></div>
        <p aria-hidden="true" style="margin:0;font-size:clamp(60px,9.5vw,176px);font-weight:500;line-height:.88;letter-spacing:-.066em;color:#FFFDFB;text-shadow:0 6px 60px rgba(14,4,13,.5)">useful <span class="clear-accent" style="display:inline-block;text-shadow:none;background-image:var(--acc,linear-gradient(100deg,#D9C2F8 0%,#CCADF5 28%,#FFFDFB 44%,#F3C9CC 52%,#EDB2B6 66%,#D9C2F8 100%));background-size:260% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:clear-sheen 6.5s ease-in-out 1s infinite">work.</span></p>
        <p style="margin:24px 0 0;max-width:44ch;font-size:18px;line-height:1.55;color:#F2E6EB">Pursuit finds the opportunity. DO does the work. Studio shows it. Nothing leaves without your yes.</p>
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:30px">
          <a href="/contact" style="display:inline-flex;align-items:center;gap:10px;min-height:56px;padding:0 26px;border-radius:999px;background:#FFFDFB;color:#240B21;font-size:16px;font-weight:600;box-shadow:0 3px 0 #D8C9D3,0 18px 40px -18px rgba(14,4,13,.8);transition:transform .22s ease,box-shadow .4s ease" class="clear-hover-6">Bring us the work <span aria-hidden="true">${arrow}</span></a>
          <a href="#try" style="display:inline-flex;align-items:center;gap:10px;min-height:56px;padding:0 26px;border-radius:999px;background:rgba(255,253,251,.08);color:#FFFDFB;font-size:16px;font-weight:600;box-shadow:inset 0 0 0 1px rgba(234,200,223,.4);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)" class="clear-hover-7">Give DO a job <span aria-hidden="true">${forwardArrow}</span></a>
        </div>
      </div>
      <div data-ref="cueRef" data-cue="" aria-hidden="true" style="position:absolute;left:50%;bottom:22px;transform:translateX(-50%)">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;font:400 10px/1 var(--font-mono),'IBM Plex Mono',monospace;letter-spacing:.2em;text-transform:uppercase;color:#EAC8DF;animation:clear-fade .9s ease 1.6s both"><span>scroll</span><i style="display:block;width:1px;height:28px;background:linear-gradient(#EAC8DF,rgba(234,200,223,0));animation:clear-drift 2.2s ease-in-out infinite"></i></div>
      </div>
    </div>
  </section>

  <section id="pursuit" data-sec="" data-screen-label="Pursuit" style="position:relative;min-height:130svh;display:flex;align-items:center;padding:160px 5.5%">
    <i aria-hidden="true" data-form="1" style="position:absolute;left:0;top:30%;width:1px;height:1px;pointer-events:none"></i>
    <i aria-hidden="true" data-form="2" style="position:absolute;left:0;top:72%;width:1px;height:1px;pointer-events:none"></i>
    <div data-par="" data-shade="" style="position:relative;max-width:720px;margin:-70px;padding:70px;isolation:isolate"><div aria-hidden="true" data-hide-sm="" style="position:absolute;inset:-6% -10%;z-index:-1;pointer-events:none;background:radial-gradient(closest-side,rgba(36,11,33,.5) 0%,rgba(36,11,33,.38) 32%,rgba(36,11,33,.2) 60%,rgba(36,11,33,.07) 82%,rgba(36,11,33,0) 100%)"></div>
      <p data-scramble="" style="margin:0 0 24px;font:400 11px/1.5 var(--font-mono),'IBM Plex Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#F2E6EB">01 · Pursuit · find it</p>
      <h2 data-split="" style="margin:0;font-size:clamp(48px,6.6vw,116px);font-weight:500;line-height:.92;letter-spacing:-.062em;text-wrap:balance;text-shadow:0 4px 40px rgba(14,4,13,.45)"><span data-w="" style="display:inline-block">An</span> <span data-w="" style="display:inline-block">opportunity</span> <span data-w="" style="display:inline-block">starts</span> <span data-w="" style="display:inline-block">with</span> <span data-w="" style="display:inline-block">a</span> <span class="clear-accent" data-w="" style="display: inline-block; text-shadow: none; background-image:var(--acc,linear-gradient(100deg,#D9C2F8 0%,#CCADF5 28%,#FFFDFB 44%,#F3C9CC 52%,#EDB2B6 66%,#D9C2F8 100%)); background-size: 260% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; ">signal.</span></h2>
      <p data-rv="200" style="margin:26px 0 0;max-width:38ch;font-size:19px;line-height:1.55;color:#F2E6EB;text-shadow:0 1px 18px rgba(36,11,33,.6)">Tenders, projects and market changes, brought back with the source attached.</p>
      <div data-rv="280"><a href="/pursuit" style="display:inline-flex;align-items:center;gap:10px;min-height:52px;margin-top:30px;padding:0 24px;border-radius:999px;background:#FFFDFB;color:#240B21;font-size:15px;font-weight:600;box-shadow:0 3px 0 #D8C9D3;transition:transform .22s ease,box-shadow .4s ease" class="clear-hover-8">Explore Pursuit <span aria-hidden="true">${arrow}</span></a></div>
    </div>
  </section>

  <section id="do" data-sec="" data-screen-label="DO" style="position:relative;min-height:115svh;display:flex;align-items:center;padding:160px 5.5%">
    <i aria-hidden="true" data-form="3" style="position:absolute;left:0;top:30%;width:1px;height:1px;pointer-events:none"></i>
    <i aria-hidden="true" data-form="4" style="position:absolute;left:0;top:72%;width:1px;height:1px;pointer-events:none"></i>
    <div data-par="" data-shade="" style="position:relative;max-width:720px;margin:-70px;padding:70px;isolation:isolate"><div aria-hidden="true" data-hide-sm="" style="position:absolute;inset:-6% -10%;z-index:-1;pointer-events:none;background:radial-gradient(closest-side,rgba(36,11,33,.5) 0%,rgba(36,11,33,.38) 32%,rgba(36,11,33,.2) 60%,rgba(36,11,33,.07) 82%,rgba(36,11,33,0) 100%)"></div>
      <p data-scramble="" style="margin:0 0 24px;font:400 11px/1.5 var(--font-mono),'IBM Plex Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#F2E6EB">02 · DO · do it</p>
      <h2 data-split="" style="margin:0;font-size:clamp(48px,6.6vw,116px);font-weight:500;line-height:.92;letter-spacing:-.062em;text-wrap:balance;text-shadow:0 4px 40px rgba(14,4,13,.45)"><span data-w="" style="display:inline-block">What</span> <span data-w="" style="display:inline-block">do</span> <span data-w="" style="display:inline-block">you</span> <span data-w="" style="display:inline-block">need</span> <span data-w="" style="display:inline-block">to</span> <span class="clear-accent" data-w="" style="display: inline-block; text-shadow: none; background-image:var(--acc,linear-gradient(100deg,#D9C2F8 0%,#CCADF5 28%,#FFFDFB 44%,#F3C9CC 52%,#EDB2B6 66%,#D9C2F8 100%)); background-size: 260% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; ">assembl?</span></h2>
      <p data-rv="200" style="margin:26px 0 0;max-width:38ch;font-size:19px;line-height:1.55;color:#F2E6EB;text-shadow:0 1px 18px rgba(36,11,33,.6)">Your personal agent. A draft, a plan or a next step, ready for your review.</p>
      <div data-rv="280"><a href="/do" style="display:inline-flex;align-items:center;gap:10px;min-height:52px;margin-top:30px;padding:0 24px;border-radius:999px;background:#FFFDFB;color:#240B21;font-size:15px;font-weight:600;box-shadow:0 3px 0 #D8C9D3;transition:transform .22s ease,box-shadow .4s ease" class="clear-hover-9">Open DO <span aria-hidden="true">${forwardArrow}</span></a></div>
    </div>
  </section>`;

/** Studio, Evidence and Contact sections — everything below Try DO. */
export const trailMarkup = `<section id="studio" data-sec="" data-screen-label="Studio" style="position:relative;min-height:130svh;display:flex;align-items:center;padding:160px 5.5%">
    <i aria-hidden="true" data-form="6" style="position:absolute;left:0;top:30%;width:1px;height:1px;pointer-events:none"></i>
    <i aria-hidden="true" data-form="7" style="position:absolute;left:0;top:72%;width:1px;height:1px;pointer-events:none"></i>
    <div data-par="" data-shade="" style="position:relative;max-width:720px;margin:-70px;padding:70px;isolation:isolate"><div aria-hidden="true" data-hide-sm="" style="position:absolute;inset:-6% -10%;z-index:-1;pointer-events:none;background:radial-gradient(closest-side,rgba(36,11,33,.5) 0%,rgba(36,11,33,.38) 32%,rgba(36,11,33,.2) 60%,rgba(36,11,33,.07) 82%,rgba(36,11,33,0) 100%)"></div>
      <p data-scramble="" style="margin:0 0 24px;font:400 11px/1.5 var(--font-mono),'IBM Plex Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#F2E6EB">03 · Studio · show it</p>
      <h2 data-split="" style="margin:0;font-size:clamp(48px,6.6vw,116px);font-weight:500;line-height:.92;letter-spacing:-.062em;text-wrap:balance;text-shadow:0 4px 40px rgba(14,4,13,.45)"><span data-w="" style="display:inline-block">Give</span> <span data-w="" style="display:inline-block">the</span> <span data-w="" style="display:inline-block">idea</span> <span data-w="" style="display:inline-block">a</span> <span class="clear-accent" data-w="" style="display:inline-block;text-shadow:none;background-image:var(--acc,linear-gradient(100deg,#D9C2F8 0%,#CCADF5 28%,#FFFDFB 44%,#F3C9CC 52%,#EDB2B6 66%,#D9C2F8 100%));background-size:260% 100%;-webkit-background-clip:text;background-clip:text;color:transparent">world</span> <span data-w="" style="display:inline-block">of</span> <span data-w="" style="display:inline-block">its</span> <span data-w="" style="display:inline-block">own.</span></h2>
      <p data-rv="200" style="margin:26px 0 0;max-width:38ch;font-size:19px;line-height:1.55;color:#F2E6EB;text-shadow:0 1px 18px rgba(36,11,33,.6)">Websites, campaigns, image and film. Work people can see, change and try.</p>
      <div data-rv="280"><a href="/creative-studio" style="display:inline-flex;align-items:center;gap:10px;min-height:52px;margin-top:30px;padding:0 24px;border-radius:999px;background:#FFFDFB;color:#240B21;font-size:15px;font-weight:600;box-shadow:0 3px 0 #D8C9D3;transition:transform .22s ease,box-shadow .4s ease" class="clear-hover-10">Explore Studio <span aria-hidden="true">${arrow}</span></a></div>
    </div>
  </section>

  <section data-sec="" data-screen-label="Evidence" style="position:relative;min-height:120svh;display:flex;align-items:center;padding:160px 5.5%">
    <i aria-hidden="true" data-form="8" style="position:absolute;left:0;top:30%;width:1px;height:1px;pointer-events:none"></i>
    <i aria-hidden="true" data-form="9" style="position:absolute;left:0;top:72%;width:1px;height:1px;pointer-events:none"></i>
    <div data-par="" data-shade="" style="position:relative;max-width:700px;margin:-70px;padding:70px;isolation:isolate"><div aria-hidden="true" data-hide-sm="" style="position:absolute;inset:-6% -10%;z-index:-1;pointer-events:none;background:radial-gradient(closest-side,rgba(36,11,33,.5) 0%,rgba(36,11,33,.38) 32%,rgba(36,11,33,.2) 60%,rgba(36,11,33,.07) 82%,rgba(36,11,33,0) 100%)"></div>
      <p data-scramble="" style="margin:0 0 20px;font:400 11px/1.5 var(--font-mono),'IBM Plex Mono',monospace;letter-spacing:.18em;text-transform:uppercase;color:#F2E6EB">evidence · why it is built this way</p>
      <h2 data-split="" style="margin:0;font-size:clamp(40px,4.8vw,76px);font-weight:500;line-height:.96;letter-spacing:-.055em;text-wrap:balance;text-shadow:0 4px 40px rgba(14,4,13,.45)"><span data-w="" style="display:inline-block">The</span> <span class="clear-accent" data-w="" style="display:inline-block;text-shadow:none;background-image:var(--acc,linear-gradient(100deg,#D9C2F8 0%,#CCADF5 28%,#FFFDFB 44%,#F3C9CC 52%,#EDB2B6 66%,#D9C2F8 100%));background-size:260% 100%;-webkit-background-clip:text;background-clip:text;color:transparent">rules</span> <span data-w="" style="display:inline-block">we</span> <span data-w="" style="display:inline-block">build</span> <span data-w="" style="display:inline-block">by,</span> <span data-w="" style="display:inline-block">and</span> <span data-w="" style="display:inline-block">where</span> <span data-w="" style="display:inline-block">they</span> <span data-w="" style="display:inline-block">come</span> <span data-w="" style="display:inline-block">from.</span></h2>
      <ol style="list-style:none;margin:30px 0 0;padding:0;border-top:1px solid rgba(234,200,223,.26)">
        <li data-rv="160" style="display:grid;grid-template-columns:44px minmax(0,1fr);gap:14px;padding:18px 0;border-bottom:1px solid rgba(234,200,223,.26)"><span style="font:400 11px/1.6 var(--font-mono),'IBM Plex Mono',monospace;color:#EAC8DF">01</span><span style="display:flex;flex-direction:column;gap:4px"><strong style="font-size:17px;font-weight:500">Indirect collection must be notified.</strong><span style="font:400 11px/1.4 var(--font-mono),'IBM Plex Mono',monospace;color:#F2E6EB">source · legislation.govt.nz · Privacy Act 2020, IPP 3A</span></span></li>
        <li data-rv="220" style="display:grid;grid-template-columns:44px minmax(0,1fr);gap:14px;padding:18px 0;border-bottom:1px solid rgba(234,200,223,.26)"><span style="font:400 11px/1.6 var(--font-mono),'IBM Plex Mono',monospace;color:#EAC8DF">02</span><span style="display:flex;flex-direction:column;gap:4px"><strong style="font-size:17px;font-weight:500">Nothing sends without a named person.</strong><span style="font:400 11px/1.4 var(--font-mono),'IBM Plex Mono',monospace;color:#F2E6EB">source · assembl product rules</span></span></li>
        <li data-rv="280" style="display:grid;grid-template-columns:44px minmax(0,1fr);gap:14px;padding:18px 0;border-bottom:1px solid rgba(234,200,223,.26)"><span style="font:400 11px/1.6 var(--font-mono),'IBM Plex Mono',monospace;color:#EAC8DF">03</span><span style="display:flex;flex-direction:column;gap:4px"><strong style="font-size:17px;font-weight:500">Every job leaves a receipt.</strong><span style="font:400 11px/1.4 var(--font-mono),'IBM Plex Mono',monospace;color:#F2E6EB">source · assembl evidence pack specification</span></span></li>
      </ol>
    </div>
  </section>

  <section id="contact" data-sec="" data-screen-label="Contact" style="position:relative;min-height:150svh;display:flex;align-items:flex-end;justify-content:center;padding:160px 5.5% 150px">
    <i aria-hidden="true" data-form="10" style="position:absolute;left:0;top:22%;width:1px;height:1px;pointer-events:none"></i>
    <i aria-hidden="true" data-form="11" style="position:absolute;left:0;top:58%;width:1px;height:1px;pointer-events:none"></i>
    <div data-shade="" style="width:100%;max-width:760px;text-align:center;margin:-60px;padding:60px;isolation:isolate">
      <h2 data-split="" style="margin:0;font-size:clamp(52px,7.4vw,128px);font-weight:500;line-height:.9;letter-spacing:-.065em;text-shadow:0 4px 40px rgba(14,4,13,.45)"><span class="clear-accent" data-w="" style="display:inline-block;text-shadow:none;background-image:linear-gradient(180deg,#E8DAFC 0%,#CCADF5 52%,#B08EF0 100%);-webkit-background-clip:text;background-clip:text;color:transparent">Some</span> <span class="clear-accent" data-w="" style="display:inline-block;text-shadow:none;background-image:linear-gradient(180deg,#E8DAFC 0%,#CCADF5 52%,#B08EF0 100%);-webkit-background-clip:text;background-clip:text;color:transparent">assembly</span> <span class="clear-accent" data-w="" style="display:inline-block;text-shadow:none;background-image:linear-gradient(180deg,#E8DAFC 0%,#CCADF5 52%,#B08EF0 100%);-webkit-background-clip:text;background-clip:text;color:transparent">required.</span><br>  </h2>
      <p data-rv="160" style="margin:28px auto 0;max-width:42ch;font-size:19px;line-height:1.55;color:#F2E6EB;text-shadow:0 1px 18px rgba(36,11,33,.6)">Bring a brief, an opportunity or a job that needs better thinking. We’ll agree the outcome and the first useful piece of work.</p>
      <div data-rv="240" style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:32px">
        <a href="/contact" style="display:inline-flex;align-items:center;gap:10px;min-height:56px;padding:0 26px;border-radius:999px;background:#FFFDFB;color:#240B21;font-size:16px;font-weight:600;box-shadow:0 3px 0 #D8C9D3;transition:transform .22s ease,box-shadow .4s ease" class="clear-hover-11">Bring us the work <span aria-hidden="true">${arrow}</span></a>
        <a href="#try" style="display:inline-flex;align-items:center;gap:10px;min-height:56px;padding:0 26px;border-radius:999px;background:rgba(255,253,251,.1);color:#FFFDFB;font-size:16px;font-weight:600;box-shadow:inset 0 0 0 1px rgba(234,200,223,.4)" class="clear-hover-12">Give DO a job <span aria-hidden="true">${forwardArrow}</span></a>
      </div>
    </div>
  </section>`;

export const footerMarkup = `<footer style="position:relative;z-index:2;overflow:hidden;margin-top:-1px;padding:90px 5.5% 76px;border-radius:44px 44px 0 0;background:radial-gradient(70% 90% at 85% 0%,rgba(234,178,208,.32),rgba(234,178,208,0) 60%),radial-gradient(60% 80% at 0% 100%,rgba(218,210,244,.22),rgba(218,210,244,0) 60%),linear-gradient(180deg,rgba(58,21,53,.82) 0%,#2A0F27 46%,#36142F 100%);-webkit-backdrop-filter:blur(22px) saturate(140%);backdrop-filter:blur(22px) saturate(140%);box-shadow:inset 0 1px 0 rgba(255,253,251,.16),inset 0 0 0 1px rgba(234,200,223,.14),0 -40px 80px -40px rgba(0,0,0,.6)">
  <div style="position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:36px 48px;align-items:start;max-width:1400px;margin:0 auto">
    <div style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;align-items:center;gap:14px"><img src="/direction-4c/assets/brand/assembl-a-glass.webp" alt="" style="width:72px;height:72px;flex-shrink:0;border-radius:50%;object-fit:cover;object-position:44% 50%;box-shadow:0 0 0 1px rgba(255,253,251,.55),0 10px 26px -10px rgba(234,178,208,.9)"></div>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#F2E6EB">Intelligence. Strategy. Software.<br>Built in Aotearoa New Zealand.</p>
      <a href="/contact" style="align-self:flex-start;display:inline-flex;align-items:center;gap:10px;min-height:52px;margin-top:8px;padding:0 24px;border-radius:999px;background:#FFFDFB;color:#240B21;font-size:15px;font-weight:600;box-shadow:0 3px 0 #D8C9D3,0 0 40px -10px rgba(214,165,189,.9);transition:transform .22s ease" class="clear-hover-13">Bring us the work <span aria-hidden="true">${arrow}</span></a>
    </div>
    <nav aria-label="Footer" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 24px;font-size:16px">
      <p style="grid-column:1/-1;margin:0 0 8px;font:400 10.5px/1.4 var(--font-mono),'IBM Plex Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#EAC8DF">explore</p>
      <a href="/pursuit" style="display:flex;align-items:center;min-height:44px;color:#FFFDFB;border-bottom:1px solid rgba(234,200,223,.16)" class="clear-hover-14">Pursuit</a>
      <a href="/creative-studio" style="display:flex;align-items:center;min-height:44px;color:#FFFDFB;border-bottom:1px solid rgba(234,200,223,.16)" class="clear-hover-15">Studio</a>
      <a href="/do" style="display:flex;align-items:center;min-height:44px;color:#FFFDFB;border-bottom:1px solid rgba(234,200,223,.16)" class="clear-hover-16">DO</a>
      <a href="/do/install" style="display:flex;align-items:center;min-height:44px;color:#FFFDFB;border-bottom:1px solid rgba(234,200,223,.16)" class="clear-hover-17">Install DO</a>
      <a href="/contact" style="display:flex;align-items:center;min-height:44px;color:#FFFDFB;border-bottom:1px solid rgba(234,200,223,.16)" class="clear-hover-18">Contact</a>
    </nav>
    <div style="display:flex;flex-direction:column;gap:10px;padding:20px 22px;border-radius:24px;background:rgba(255,253,251,.06);box-shadow:inset 0 0 0 1px rgba(234,200,223,.2)">
      <p style="margin:0;font:400 10.5px/1.4 var(--font-mono),'IBM Plex Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#EAC8DF">review before action</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#F2E6EB">DO tools have their own permissions and review steps. Availability and evidence coverage depend on the tool and connection. The optional walkthrough on this page is simulated.</p>
    </div>
  </div>
  <nav aria-label="Legal" class="clear-legal">
    <p>Legal</p>
    <a href="/legal/terms">Terms of Use</a>
    <a href="/legal/privacy">Privacy Policy</a>
    <a href="/legal/disclaimer">Disclaimer</a>
    <a href="/legal/meta-data-deletion">Meta data deletion</a>
  </nav>
  <p style="position:relative;max-width:1400px;margin:72px auto 0;text-align:center;font-size:min(25vw,400px);font-weight:600;line-height:.8;letter-spacing:-.055em;white-space:nowrap;background:linear-gradient(180deg,rgba(242,230,235,.32) 0%,rgba(234,200,223,.07) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;user-select:none">assembl</p>
</footer>`;
