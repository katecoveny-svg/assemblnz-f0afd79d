/**
 * Concept-demo generator.
 *
 *   node build.mjs            → writes ../assembling-<slug>/ for every client
 *   node build.mjs nzpost     → just that one
 *
 * The visual system is the one proven on the Giltrap build: dark paper, the
 * client's verified primary as the accent, assembl's champagne kept as our own
 * mark and never swapped for a client colour.
 */

import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIENTS } from './clients.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const RESEARCH = resolve(HERE, '..');
const DONOR = resolve(RESEARCH, 'assembling-summerset');

const esc = (s) => String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;');
const js = (s) => JSON.stringify(s);

/** Relative luminance, for deciding what is legible on a light phone screen. */
function lum(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function page(c) {
  const accent = c.primary;
  const accent2 = c.secondary || c.primary;
  /* The wait-phone screen is light, so a NEAR-BLACK primary turns the champagne
     ring into a black ring and the whole idea of it disappears. Only near-blacks
     swap — the threshold was 0.16 first, which also swapped away perfectly good
     dark-but-saturated accents like Nectar's teal (0.098). 0.05 catches the
     charcoals and indigos and leaves the real brand colours alone. */
  const phoneAccent = lum(accent) < 0.05 && lum(accent2) > lum(accent) * 2 ? accent2 : accent;
  const h1 = c.h1.map((line, i) =>
    i === c.h1Accent ? `<em class="g">${line}</em>` : line).join('<br>');

  return `<!DOCTYPE html>
<html lang="en-NZ">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>${esc(c.company)} · ${c.generic ? `a category demonstrator by assembl` : `an independent concept by assembl`}</title>
<meta name="description" content="${c.generic ? esc(c.company) + ` — a category demonstrator of an agentic customer journey by assembl. No real company; every name is invented.` : `An independent concept prepared for ` + esc(c.company) + `. Not affiliated with or endorsed by ` + esc(c.company) + `.`}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet">
<style>
:root{
  --ink:#0A0A0B; --ink-2:#111114; --paper:#FFFFFF; --muted:#8E9299; --muted-2:#6B6F76;
  --line:rgba(255,255,255,.13); --line-2:rgba(255,255,255,.07);
  --accent:${accent}; --accent-2:${accent2};
  --champ:#BFA37A; --champ-soft:rgba(191,163,122,.13);
  --sans:"Lato",-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{background:var(--ink);color:var(--paper);font-family:var(--sans);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
button:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:6px}
a{color:inherit}
.wrap{max-width:1140px;margin:0 auto;padding:0 26px}
.narrow{max-width:720px}
#scene{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
.veil{position:fixed;inset:0;z-index:1;pointer-events:none;
  background:radial-gradient(ellipse 120% 70% at 50% 42%,transparent 0%,rgba(10,10,11,.34) 55%,rgba(10,10,11,.88) 100%)}
.veil::after{content:"";position:absolute;inset:0;
  background:linear-gradient(100deg,rgba(10,10,11,.94) 0%,rgba(10,10,11,.86) 34%,rgba(10,10,11,.30) 58%,transparent 76%)}
@media(max-width:820px){.veil::after{background:linear-gradient(180deg,rgba(10,10,11,.80) 0%,rgba(10,10,11,.90) 100%)}}
main{position:relative;z-index:2}
.topbar{position:sticky;top:0;z-index:60;background:rgba(10,10,11,.82);backdrop-filter:blur(16px);border-bottom:1px solid var(--line-2)}
.topbar .wrap{display:flex;align-items:center;justify-content:space-between;height:62px;gap:18px}
.mark{display:flex;align-items:center;gap:11px;font-size:14.5px;font-weight:700;white-space:nowrap}
.mark .dot{width:10px;height:10px;border-radius:50%;background:var(--champ);box-shadow:0 0 14px rgba(191,163,122,.7)}
.mark small{color:var(--muted-2);font-weight:400}
.navlinks{display:flex;gap:26px;flex:1;justify-content:center}
.navlinks a{font-size:13px;color:var(--muted);text-decoration:none;white-space:nowrap;transition:color .2s}
.navlinks a:hover{color:var(--accent)}
@media(max-width:900px){.navlinks{display:none}}
.askbtn{background:var(--paper);color:var(--ink);font-size:13px;font-weight:700;padding:10px 20px;border-radius:999px;display:flex;gap:9px;align-items:center;white-space:nowrap}
.askbtn .d{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 2.4s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.signed{background:var(--ink-2);border-bottom:1px solid var(--line-2);position:relative;z-index:59}
.signed .wrap{padding:11px 26px;display:flex;gap:14px;align-items:baseline;flex-wrap:wrap}
.signed .k{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);font-weight:700}
.signed .v{font-size:13px;color:var(--muted)}
.signed .v b{color:var(--paper);font-weight:700}
section{padding:104px 0;position:relative}
.eyebrow{font-size:10.5px;font-weight:900;letter-spacing:.26em;text-transform:uppercase;color:var(--accent);margin-bottom:22px;display:flex;align-items:center;gap:12px}
.eyebrow::before{content:"";width:30px;height:1px;background:var(--accent);opacity:.6}
h1{font-weight:900;font-size:clamp(42px,7.2vw,88px);line-height:.99;letter-spacing:-.032em}
h2{font-weight:900;font-size:clamp(30px,4.6vw,54px);line-height:1.04;letter-spacing:-.024em}
h3{font-weight:700;font-size:clamp(20px,2.4vw,27px);line-height:1.18;letter-spacing:-.012em}
.lede{color:#C7CBD1;font-size:clamp(17px,2.05vw,21px);line-height:1.55;margin-top:24px;max-width:50ch;font-weight:300}
.kicker{color:var(--muted);font-size:16px;margin-top:16px;max-width:62ch;font-weight:300}
em.g{font-style:normal;color:var(--accent)}
.hero{min-height:clamp(560px,88vh,860px);display:flex;align-items:center;padding:70px 0 90px}
.hero .quote{margin-top:34px;padding-left:20px;border-left:2px solid var(--accent);max-width:46ch}
.hero .quote p{font-size:clamp(17px,2.1vw,21px);font-weight:300;line-height:1.45;color:#D6DAE0;font-style:italic}
.hero .quote cite{display:block;margin-top:11px;font-style:normal;font-size:11.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted-2)}
.btns{display:flex;gap:13px;margin-top:40px;flex-wrap:wrap}
.btn{padding:15px 28px;border-radius:999px;font-size:14.5px;font-weight:700;display:inline-flex;gap:10px;align-items:center;text-decoration:none;transition:transform .2s}
.btn:hover{transform:translateY(-2px)}
.btn.solid{background:var(--paper);color:var(--ink)}
.btn.solid .arw{color:var(--accent)}
.btn.ghost{border:1px solid var(--line)}
.btn.ghost:hover{border-color:var(--accent);color:var(--accent)}
.glass{background:rgba(255,255,255,.045);border:1px solid var(--line);border-radius:20px;padding:30px;backdrop-filter:blur(10px)}
.glass.tight{padding:22px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:26px;align-items:start}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
@media(max-width:860px){.grid2,.grid3{grid-template-columns:1fr}}

/* ══ THE WAIT, DEMONSTRATED ═══════════════════════════════════════════════
   A lit phone in a dark room. The screen stays light on purpose — a real app
   screen is light, and against this near-black page it becomes the one thing
   in the section your eye goes to. The three cards move alongside it so the
   section shows before it explains. */
/* ══ DENSITY ══════════════════════════════════════════════════════════════
   Kate: the demos read "text heavy and boring". The substance stays; what
   changes is that the REASONING is one line you can open, and the verdict is
   what you scan. Held checks open themselves, because those are the ones worth
   reading. */
.check .t{display:flex;align-items:center;gap:10px;width:100%;text-align:left;
  font-weight:700;font-size:15.5px;color:var(--paper);padding:0;cursor:pointer}
.check .t .more{font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--muted-2);border:1px solid var(--line);border-radius:99px;padding:3px 9px;flex-shrink:0}
.check .t:hover .more{border-color:var(--accent);color:var(--accent)}
.check .d[hidden]{display:none}
.ruletoggle{display:flex;align-items:center;gap:10px;margin-top:18px;padding:0;cursor:pointer;
  font-size:12px;letter-spacing:.13em;text-transform:uppercase;font-weight:700;color:var(--muted)}
.ruletoggle:hover{color:var(--accent)}
.ruletoggle .more{font-size:9.5px;border:1px solid var(--line);border-radius:99px;padding:3px 8px}
.rules[hidden]{display:none}
.waitgrid{display:grid;grid-template-columns:390px 1fr;gap:52px;align-items:start;margin-top:44px}
.waitcards{display:flex;flex-direction:column;gap:16px}
.waitdemo{position:sticky;top:88px}
.wp-invite{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--accent);
  margin-bottom:16px;font-weight:700}
/* The sculpture is a FIXED full-screen canvas, so a 4%-white panel reads straight
   through it and the copy becomes unreadable. Solidify the panel — never fade the
   canvas to win legibility. */
.waitcards .glass{background:rgba(13,13,15,.88);border-color:rgba(255,255,255,.10)}
.waitcards .kicker{background:rgba(13,13,15,.88);border:1px solid rgba(255,255,255,.08);
  border-radius:16px;padding:18px 22px}
@media(max-width:960px){.waitgrid{grid-template-columns:1fr;gap:36px;justify-items:center}
  .waitdemo{position:static}.waitcards{width:100%}}
/* the room — the private space every concept on this page would run in */
.roomgrid{display:grid;grid-template-columns:1fr 380px;gap:52px;align-items:start;margin-top:44px}
.room{border:1px solid var(--line);border-radius:18px;background:rgba(13,13,15,.92);overflow:hidden}
.roomhead{padding:16px 20px;border-bottom:1px solid var(--line-2);display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:14px}
.roomhead small{color:var(--muted-2);font-weight:400;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
.roommsg{padding:14px 20px;border-bottom:1px solid var(--line-2);display:flex;gap:12px}
.roommsg:last-child{border-bottom:0}
.roommsg .av{flex:0 0 auto;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:10px;font-weight:700;background:var(--champ-soft);color:var(--champ)}
.roommsg.agent .av{background:rgba(255,255,255,.07);color:var(--accent)}
.roommsg .b{font-size:13px;line-height:1.55;color:rgba(255,255,255,.88)}
.roommsg .b b{font-size:12px;display:block;margin-bottom:3px}
.roommsg .b b small{color:var(--muted-2);font-weight:400;margin-left:6px;font-size:10px;letter-spacing:.06em;text-transform:uppercase}
.receipt{margin-top:8px;display:inline-flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:10.5px;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:5px 10px}
.receipt em{font-style:normal;color:var(--champ)}
.roomrec{border:1px solid var(--line);border-radius:18px;padding:18px 20px;background:rgba(13,13,15,.88)}
.roomrec .rt{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-2);margin-bottom:12px}
.roomrec .rl{display:flex;gap:10px;font-size:12px;color:rgba(255,255,255,.8);padding:7px 0;border-bottom:1px dashed var(--line-2)}
.roomrec .rl:last-of-type{border-bottom:0}
.roomrec .rl span{color:var(--muted-2);font-variant-numeric:tabular-nums}
@media(max-width:960px){.roomgrid{grid-template-columns:1fr}}
/* the family of waits + how the wait is powered */
.momgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:34px}
.mom{border:1px solid var(--line);border-radius:14px;padding:14px 15px;background:rgba(13,13,15,.82)}
.mom b{display:block;font-size:13.5px;margin-bottom:4px}
.mom span{font-size:11.5px;color:var(--muted);letter-spacing:.02em}
.powgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin-top:38px}
.pow{border:1px solid var(--line-2);border-radius:16px;padding:16px 17px;background:rgba(13,13,15,.7)}
.pow i{font-style:normal;font-size:10px;letter-spacing:.14em;color:var(--accent)}
.pow b{display:block;font-size:13.5px;margin:6px 0 4px}
.pow span{font-size:12px;color:var(--muted);line-height:1.5}
.prinline{margin-top:16px;font-size:11px;letter-spacing:.06em;color:var(--muted-2);line-height:1.7}
.prinline em{font-style:normal;color:var(--champ)}
.tiersline{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:30px}
.tl{border:1px solid var(--line-2);border-radius:16px;padding:15px 17px;background:rgba(13,13,15,.6)}
.tl.on{border-color:var(--accent);background:rgba(13,13,15,.85)}
.tl i{font-style:normal;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.tl b{display:block;font-size:13.5px;margin:6px 0 4px}
.tl span{font-size:11.5px;color:var(--muted);line-height:1.5}
/* the explainer sits on the dark page, so it takes the page's own ink */
#wait-explain{--wpx-sans:var(--sans); --wpx-ink:var(--paper); --wpx-accent:var(--accent);
  --wp-mono:'IBM Plex Mono',ui-monospace,monospace;
  background:rgba(13,13,15,.88); border-color:rgba(255,255,255,.10)}
/* wait-phone.js, driven from this client's palette */
#wait-mount .wp{
  --wp-paper:#FAFAF8; --wp-ink:#111114; --wp-ink-2:#5C6066;
  --wp-accent:${phoneAccent}; --wp-done:var(--ink-2); --wp-line:rgba(17,17,20,.11);
  --wp-rim:color-mix(in srgb, ${phoneAccent} 58%, transparent);
  --wp-shell:linear-gradient(160deg,#2c3034 0%,#13161a 44%,#2c3034 100%);
  --wp-sans:var(--sans); --wp-app:var(--sans);
}
.num{font-size:10.5px;letter-spacing:.24em;color:var(--muted-2);font-weight:700;margin-bottom:14px}
.marqrow{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:24px}
.marqbtn{border:1px solid var(--line);border-radius:999px;padding:11px 21px;font-size:13.5px;font-weight:700;color:var(--muted);transition:.22s}
.marqbtn:hover{border-color:var(--accent);color:var(--paper)}
.marqbtn.on{background:var(--paper);color:var(--ink);border-color:var(--paper)}
.draft{min-height:280px}
.draft .chan{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:14px}
.draft .body{font-size:15.5px;line-height:1.62;color:#DDE0E5;font-weight:300;white-space:pre-line}
.draft .rules{margin-top:22px;padding-top:18px;border-top:1px solid var(--line-2);display:flex;flex-direction:column;gap:8px}
.draft .rules div{font-size:12.5px;color:var(--muted);display:flex;gap:10px;align-items:flex-start}
.draft .rules .tick{color:var(--accent);flex:0 0 auto;font-weight:700}
.fade{animation:fadein .42s ease}
@keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.check{border:1px solid var(--line);border-radius:14px;padding:17px 19px;margin-top:11px;display:flex;gap:14px;align-items:flex-start;background:rgba(255,255,255,.028)}
.check .ic{width:24px;height:24px;border-radius:50%;flex:0 0 auto;display:grid;place-items:center;font-size:12px;font-weight:700;margin-top:1px}
.check.pass .ic{background:rgba(255,255,255,.10);color:var(--accent)}
.check.block .ic{background:rgba(226,117,107,.16);color:#E2756B}
.check .t{font-size:14.5px;font-weight:700;line-height:1.35}
.check .d{font-size:13px;color:var(--muted);margin-top:5px;font-weight:300;line-height:1.5}
.check .law{font-size:11px;color:var(--muted-2);margin-top:7px}
.ops{width:100%;border-collapse:collapse}
.ops th{text-align:left;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted-2);font-weight:700;padding:0 12px 13px 0;border-bottom:1px solid var(--line)}
.ops td{padding:15px 12px;border-bottom:1px solid var(--line-2);font-size:14px;font-weight:300;color:#C7CBD1;vertical-align:top;padding-left:0}
.ops td b{font-weight:700;color:var(--paper)}
.ops .st{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 11px;border-radius:999px;white-space:nowrap;display:inline-block}
.ops .st.wait{background:rgba(255,255,255,.09);color:var(--accent)}
.ops .st.ok{background:rgba(255,255,255,.07);color:var(--muted)}
.ops .st.hot{background:rgba(226,117,107,.14);color:#E2756B}
@media(max-width:760px){.ops thead{display:none}.ops td{display:block;padding:6px 0;border:none}.ops tr{display:block;padding:16px 0;border-bottom:1px solid var(--line-2)}}
.receipt{background:var(--ink-2);border:1px solid var(--line);border-radius:18px;padding:28px;font-size:13.5px}
.receipt .rh{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:18px}
.receipt dl{display:grid;grid-template-columns:auto 1fr;gap:11px 22px}
.receipt dt{color:var(--muted-2);font-size:12px}
.receipt dd{color:#DDE0E5;font-weight:300;word-break:break-word}
.receipt .hash{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:var(--accent)}
.boundary{border:1px solid var(--accent);border-radius:20px;padding:34px;background:rgba(255,255,255,.04)}
.pilot .step{display:flex;gap:18px;padding:17px 0;border-bottom:1px solid var(--line-2)}
.pilot .step:last-child{border-bottom:none}
.pilot .n{flex:0 0 auto;width:27px;height:27px;border-radius:50%;border:1px solid var(--accent);color:var(--accent);font-size:12px;font-weight:700;display:grid;place-items:center;margin-top:2px}
.pilot .step h4{font-size:15.5px;font-weight:700;margin-bottom:5px}
.pilot .step p{font-size:14px;color:var(--muted);font-weight:300;line-height:1.55}
.verbs{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:26px}
@media(max-width:760px){.verbs{grid-template-columns:1fr}}
.verb{border:1px solid var(--line);border-radius:16px;padding:22px;text-decoration:none;display:block;transition:.22s}
.verb:hover{border-color:var(--accent);background:rgba(255,255,255,.05);transform:translateY(-2px)}
.verb .w{font-size:17px;font-weight:900;color:var(--accent)}
.verb .s{font-size:13px;color:var(--muted);margin-top:7px;font-weight:300;line-height:1.5}
.unfin input{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:12px;padding:15px 17px;font-size:15px;color:var(--paper);font-family:inherit;font-weight:300}
.unfin input::placeholder{color:var(--muted-2)}
.unfin .row{display:flex;gap:11px;margin-top:13px;flex-wrap:wrap}
.agentbtn{position:fixed;right:22px;bottom:22px;z-index:80;background:var(--paper);color:var(--ink);border-radius:999px;padding:15px 24px;font-weight:700;font-size:14.5px;box-shadow:0 18px 46px -14px rgba(0,0,0,.75);display:flex;gap:10px;align-items:center}
.agentbtn .d{width:7px;height:7px;border-radius:50%;background:var(--accent);animation:pulse 2.4s infinite}
.chat{position:fixed;right:22px;bottom:22px;z-index:90;width:410px;max-width:calc(100vw - 24px);height:620px;max-height:calc(100vh - 24px);background:var(--ink-2);border:1px solid var(--line);border-radius:22px;box-shadow:0 34px 90px -22px rgba(0,0,0,.85);display:none;flex-direction:column;overflow:hidden}
.chat.open{display:flex}
.chathead{padding:18px 20px;border-bottom:1px solid var(--line-2);display:flex;justify-content:space-between;align-items:center}
.chathead .t{font-weight:700;font-size:14.5px;display:flex;gap:10px;align-items:center}
.chathead .t .d{width:7px;height:7px;border-radius:50%;background:var(--accent)}
.chathead .t small{color:var(--muted-2);font-weight:400;font-size:11.5px}
.chathead .x{color:var(--muted);font-size:22px;padding:2px 8px;line-height:1}
.msgs{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:13px}
.msg{max-width:88%;padding:13px 16px;border-radius:16px;font-size:14.5px;line-height:1.55;font-weight:300}
.msg.a{background:rgba(255,255,255,.06);border:1px solid var(--line-2);align-self:flex-start;border-bottom-left-radius:5px}
.msg.u{background:var(--paper);color:var(--ink);align-self:flex-end;border-bottom-right-radius:5px;font-weight:400}
.sugg{display:flex;flex-wrap:wrap;gap:7px;padding:0 20px 12px}
.sugg button{border:1px solid var(--line);border-radius:999px;padding:9px 14px;font-size:12px;color:var(--muted)}
.sugg button:hover{border-color:var(--accent);color:var(--accent)}
.chatin{border-top:1px solid var(--line-2);padding:14px;display:flex;gap:10px}
.chatin input{flex:1;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:12px;padding:13px 15px;font-size:14.5px;color:var(--paper);font-family:inherit;font-weight:300}
.chatin .send{background:var(--paper);color:var(--ink);border-radius:12px;padding:0 18px;font-weight:700;font-size:14px}
.agentnote{font-size:11px;color:var(--muted-2);text-align:center;padding:0 20px 12px}
.typing{align-self:flex-start;color:var(--muted-2);font-size:13px;padding:5px 4px;font-weight:300}
footer{border-top:1px solid var(--line-2);padding:56px 0 70px;color:var(--muted-2);font-size:13px;line-height:1.75;font-weight:300;background:var(--ink-2)}
footer b{color:var(--muted);font-weight:700}
footer .fin{margin-top:26px;font-size:12px;color:#5A5E65}
.rise{opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s ease}
.rise.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.rise{opacity:1;transform:none}*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
</style>
</head>
<body>
<canvas id="scene"></canvas><div class="veil"></div>

<nav class="topbar"><div class="wrap">
  <div class="mark"><span class="dot"></span>assembl <small>· ${c.generic ? `a demonstrator` : `independent concept`}</small></div>
  <div class="navlinks">
    <a href="#wait">The wait</a><a href="#mirror">The work</a><a href="#guard">The guard</a>
    <a href="#room">The room</a><a href="#board">The board</a><a href="#pilot">The pilot</a>
  </div>
  <button class="askbtn" onclick="openChat()"><span class="d"></span> Ask it anything</button>
</div></nav>

<div class="signed"><div class="wrap">
  <span class="k">Prepared for</span>
  <span class="v" id="signedFor"><b>${esc(c.buyerTitle)}</b> · ${esc(c.buyerLine)}</span>
</div></div>

<main>
<header class="hero"><div class="wrap"><div class="narrow">
  <div class="eyebrow rise">${esc(c.eyebrow)}</div>
  <h1 class="rise">${h1}</h1>
  <p class="lede rise">${esc(c.lede)}</p>
  <div class="quote rise"><p>“${esc(c.quote)}”</p><cite>${esc(c.quoteCite)}</cite></div>
  <div class="btns rise">
    <a class="btn solid" href="#wait">See the moment <span class="arw">→</span></a>
    <button class="btn ghost" onclick="openChat()">Ask it about this</button>
  </div>
</div></div></header>

<section id="wait"><div class="wrap">
  <div class="num rise">01 — THE WAIT</div>
  <div class="narrow rise">
    <div class="eyebrow">${esc(c.waitWhen)}</div>
    <h2>${esc(c.waitTitle)}</h2>
    <p class="lede">${esc(c.waitBody)}</p>
    <p class="kicker" style="color:var(--accent)">${esc(c.whyNow)}</p>
  </div>
  ${c.waitPhone ? `
  <!-- The wait itself, not three paragraphs about it. Same component the
       assembl homepage runs; see wait-phone.js. -->
  <div class="waitgrid rise">
    <div class="waitdemo">
      <div class="wp-invite">Live — the wait itself, not a picture of it. It stops to ask you one thing.</div>
      <div id="wait-mount"></div>
    </div>
    <div class="waitcards">
      <div class="glass" id="wait-explain"></div>
      ${c.waitCards.map(([t, b]) => `<div class="glass tight"><h3 style="font-size:18px">${esc(t)}</h3><p class="kicker" style="margin-top:10px;font-size:14px">${esc(b)}</p></div>`).join('\n      ')}
    </div>
  </div>` : `
  <div class="grid3" style="margin-top:44px">
    ${c.waitCards.map(([t, b]) => `<div class="glass tight rise"><h3 style="font-size:19px">${esc(t)}</h3><p class="kicker" style="margin-top:11px;font-size:14px">${esc(b)}</p></div>`).join('\n    ')}
  </div>`}

  ${c.moments ? `
  <div class="narrow rise" style="margin-top:64px">
    <div class="eyebrow">Not one wait \u2014 a family of them</div>
    <h2 style="font-size:clamp(22px,3vw,30px)">${esc(c.momentsTitle || 'Every waiting moment, the same pattern.')}</h2>
    <p class="kicker">Each of these is a moment your customer already spends with you. Each can carry what the phone above shows: watch the work, earn the wait, answer one thing.</p>
  </div>
  <div class="momgrid rise">
    ${c.moments.map(([t, d]) => `<div class="mom"><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('\n    ')}
  </div>` : ''}
  <div class="powgrid rise">
    <div class="pow"><i>01 \u2014 INTENT SIGNAL</i><b>The agent detects the wait</b><span>What the customer is waiting for, and why it matters right now.</span></div>
    <div class="pow"><i>02 \u2014 HONEST DURATION</i><b>How long, truthfully</b><span>Real steps, real progress. No fake bars, and never a wait stretched to fill.</span></div>
    <div class="pow"><i>03 \u2014 VALUE DELIVERY</i><b>Something worth the minutes</b><span>The work shown as it happens \u2014 useful, short, skippable.</span></div>
    <div class="pow"><i>04 \u2014 VALUE EXCHANGE</i><b>The wait pays</b><span>The customer earns as they watch, and one optional question comes back the other way.</span></div>
  </div>
  <p class="prinline rise"><em>Be relevant</em> \u2014 right thing, right moment \u00b7 <em>Be respectful</em> \u2014 short, skippable, quiet by design \u00b7 <em>Be measurable</em> \u2014 real impact, on the record \u00b7 <em>Be Aotearoa</em> \u2014 built here, for how Kiwis actually wait</p>
  <div class="tiersline rise">
    <div class="tl on"><i>tier 01 \u00b7 this concept, live</i><b>The assembling loader</b><span>The wait shown, the wait paid \u2014 what this page runs.</span></div>
    <div class="tl"><i>tier 02 \u00b7 the path</i><b>The sponsored chat line</b><span>A labelled co-pilot behind this journey, stepping forward only with found value.</span></div>
    <div class="tl"><i>tier 03 \u00b7 the path</i><b>The joint-venture UI</b><span>A shared surface with your partners \u2014 every action still ends in a human approval.</span></div>
  </div>
</div></section>

<section id="mirror"><div class="wrap">
  <div class="num rise">02 — THE WORK, PREPARED</div>
  <div class="narrow rise">
    <div class="eyebrow">The same situation, four ways</div>
    <h2>${esc(c.mirrorTitle)}</h2>
    <p class="kicker">${esc(c.mirrorKicker)}</p>
  </div>
  <div style="margin-top:38px" class="rise">
    <div class="marqrow" id="marqrow"></div>
    <div class="grid2">
      <div class="glass draft" id="draftBox"></div>
      <div class="glass tight">
        <div class="num" style="margin-bottom:16px">WHY THIS ISN'T A TEMPLATE</div>
        <p class="kicker" style="font-size:14.5px;margin-top:0">A template sends the same thing to everyone and changes the name. What matters here is the case that should get something different — or nothing at all.</p>
        <p class="kicker" style="font-size:14.5px">The rules beside each draft are <b style="color:var(--paper);font-weight:700">placeholders</b>. A pilot replaces them with your actual policies. We have not seen those, and this concept does not guess at them.</p>
        <div class="check pass" style="margin-top:20px"><span class="ic">✓</span>
          <div><div class="t">Nothing here sends</div><div class="d">Every draft goes to a named person. No channel is connected by this concept.</div></div></div>
      </div>
    </div>
  </div>
</div></section>

<section id="guard"><div class="wrap">
  <div class="num rise">03 — THE GUARD</div>
  <div class="grid2">
    <div class="rise">
      <div class="eyebrow">Before a person ever reads it</div>
      <h2>${esc(c.guardTitle)}</h2>
      <p class="kicker">${esc(c.guardLede)}</p>
      <p class="kicker">Drafts are held against ${esc(c.laws)}</p>
      <button class="btn ghost" style="margin-top:24px" onclick="runGuard()" id="guardBtn">${esc(c.guardBtn)} →</button>
    </div>
    <div class="rise"><div id="guardOut"><p class="kicker" style="margin-top:0">Press run to see what it catches — and what it refuses to produce at all.</p></div></div>
  </div>
</div></section>

<section id="room"><div class="wrap">
  <div class="num rise">04 — THE ROOM</div>
  <div class="narrow rise">
    <div class="eyebrow">Where you watch it work</div>
    <h2>One room. Your people, your agents, every action on the record.</h2>
    <p class="kicker">Every concept on this page would run inside a private room like this: your team and the agents in the same space, drafts appearing with receipts, a named person saying yes. It runs on infrastructure you approve — and what is said in the room stays in it.</p>
  </div>
  <div class="roomgrid rise">
    <div class="room" aria-label="A concept picture of the private pilot room">
      <div class="roomhead"><span>${esc(c.short)} · pilot room</span><small>private · yours</small></div>
      <div class="roommsg agent"><span class="av">D</span><div class="b"><b>Drafter <small>agent</small></b>Draft ready for this morning&rsquo;s enquiry — prepared from your own rates and rules. Nothing has been sent.<br><span class="receipt"><em>receipt</em> sources: your rate card · rules: yours · <em>held for approval</em></span></div></div>
      <div class="roommsg"><span class="av">O</span><div class="b"><b>Operations <small>you</small></b>Approved — send the standard version.</div></div>
      <div class="roommsg agent"><span class="av">K</span><div class="b"><b>Keeper <small>agent</small></b>Sent and filed. The record shows who asked, what was used, and who said yes.</div></div>
    </div>
    <div class="roomrec">
      <div class="rt">the record — readable, kept</div>
      <div class="rl"><span>09:02</span> draft prepared from your sources</div>
      <div class="rl"><span>09:06</span> approved by a named person</div>
      <div class="rl"><span>09:06</span> sent · receipt filed</div>
      <p class="kicker" style="font-size:13px;margin:14px 0 0">Client information stays in your room. Six months later, &ldquo;where did this come from?&rdquo; is one line, not a search.</p>
    </div>
  </div>
  <div class="grid3" style="margin-top:38px">
    <div class="glass tight rise"><h3 style="font-size:18px">Yours</h3><p class="kicker" style="margin-top:10px;font-size:14px">Runs where you approve — your own room, your own record. Nothing in it leaves it.</p></div>
    <div class="glass tight rise"><h3 style="font-size:18px">On the record</h3><p class="kicker" style="margin-top:10px;font-size:14px">Every agent action lands as a line a person can read — not a log only a vendor can open.</p></div>
    <div class="glass tight rise"><h3 style="font-size:18px">People decide</h3><p class="kicker" style="margin-top:10px;font-size:14px">Drafts wait for a named person. The room shows who said yes, and when.</p></div>
  </div>
  <p class="kicker rise" style="font-size:12.5px;margin-top:22px;color:var(--muted)">This panel is a concept picture, not a live room — a pilot stands up the real one, on infrastructure you approve.</p>
</div></section>

<section id="board"><div class="wrap">
  <div class="num rise">05 — ON ONE SCREEN</div>
  <div class="narrow rise">
    <div class="eyebrow">Nothing here has been sent</div>
    <h2>${esc(c.opsTitle)}</h2>
    <p class="kicker">Illustrative and fictional. No production access is requested by this concept.</p>
  </div>
  <div class="glass rise" style="margin-top:34px;overflow-x:auto">
    <table class="ops">
      <thead><tr>${c.opsCols.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${c.ops.map((r) => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td><span class="st ${r[4]}">${esc(r[5])}</span></td></tr>`).join('')}</tbody>
    </table>
    <p style="font-size:12.5px;color:var(--muted-2);margin-top:18px;font-weight:300">${esc(c.opsNote)}</p>
  </div>
</div></section>

<section><div class="wrap">
  <div class="num rise">06 — HOW IT WAS MADE</div>
  <div class="grid2">
    <div class="rise">
      <div class="eyebrow">Mana Receipt</div>
      <h2>Every draft carries its own working.</h2>
      <p class="kicker">Not a log somebody has to go and find. The provenance travels with the work — what it read, which rules it held, who must approve it, and what it refused to do.</p>
      <p class="kicker">This matters most on the day someone asks why it said what it said.</p>
    </div>
    <div class="rise"><div class="receipt">
      <div class="rh">Mana Receipt · draft</div>
      <dl>
        <dt>Artefact</dt><dd id="rArt">${esc(c.receiptArtefact)}</dd>
        <dt>Read</dt><dd>${esc(c.receiptRead)}</dd>
        <dt>Rules held</dt><dd>${esc(c.receiptRules)}</dd>
        <dt>Refused</dt><dd>${esc(c.receiptRefused)}</dd>
        <dt>Approver</dt><dd>A named person. Unsent until then.</dd>
        <dt>Prepared</dt><dd id="rWhen">—</dd>
        <dt>Reference</dt><dd class="hash" id="rHash">—</dd>
      </dl>
    </div></div>
  </div>
</div></section>

<section id="pilot"><div class="wrap">
  <div class="num rise">07 — WHAT WE ARE ACTUALLY ASKING</div>
  <div class="grid2">
    <div class="rise"><div class="boundary">
      <div class="eyebrow" style="margin-bottom:16px">The boundary</div>
      <h3>What this will never do</h3>
      <p class="kicker" style="margin-top:14px">It does not send. It prepares, and a named person sends. It does not publish to any channel, commit spend, move money, or make a decision that belongs to a person. It does not pretend to be a person — every draft says it was prepared by a machine and approved by a human.</p>
      <p class="kicker">No production access is requested by this concept.</p>
    </div></div>
    <div class="rise"><div class="glass pilot">
      <div class="eyebrow" style="margin-bottom:8px">The pilot ask</div>
      <div class="step"><span class="n">1</span><div><h4>Scope</h4><p>${esc(c.pilotScope)}</p></div></div>
      <div class="step"><span class="n">2</span><div><h4>Access</h4><p>${esc(c.pilotAccess)}</p></div></div>
      <div class="step"><span class="n">3</span><div><h4>Scorecard</h4><p>${esc(c.pilotScorecard)}</p></div></div>
      <p class="kicker" style="margin-top:20px;color:var(--accent)">Fail any line of the scorecard and we change the design or stop.</p>
    </div></div>
  </div>

  <div class="narrow rise" style="margin-top:70px">
    <div class="eyebrow">Three ways to reply</div><h2>Pick a verb.</h2>
    <p class="kicker">Not “book a demo”. Any of these is a real next step, and the third is a perfectly good answer.</p>
  </div>
  <div class="verbs rise">
    <a class="verb" href="#" onclick="return verb('correct')"><div class="w">Correct us</div><div class="s">Something here is wrong about ${esc(c.short)}. Tell us which line and we will fix it or take the concept down.</div></a>
    <a class="verb" href="#" onclick="return verb('narrow')"><div class="w">Narrow it</div><div class="s">One situation, six weeks. Tell us which and we will scope it against how you actually work.</div></a>
    <a class="verb" href="#" onclick="return verb('decline')"><div class="w">Decline it</div><div class="s">Not now, or not at all. Say so and you will not hear from us again about this.</div></a>
  </div>

  <div class="glass unfin rise" style="margin-top:44px">
    <div class="eyebrow" style="margin-bottom:12px">The unfinished pane</div>
    <h3>What is the one constraint we have got wrong?</h3>
    <p class="kicker" style="margin-top:10px">Every concept is built from the outside. There is always something about how ${esc(c.short)} actually runs that we could not see. One line is enough.</p>
    <div class="row">
      <input id="constraint" placeholder="The thing we clearly don't understand about your business…" onkeydown="if(event.key==='Enter')sendConstraint()">
      <button class="btn solid" onclick="sendConstraint()">Send it <span class="arw">→</span></button>
    </div>
    <p style="font-size:12px;color:var(--muted-2);margin-top:12px" id="cnote">Opens your mail app to assembl@assembl.co.nz. Nothing is collected by this page.</p>
  </div>
</div></section>
</main>

<footer><div class="wrap narrow">
  ${c.generic ? `
  <p><b>A category demonstrator.</b> ${esc(c.company)} is not a real company. The name, the palette, the cast, the figures and every draft on this page were invented by assembl to show the shape of an agentic customer journey in this category, without borrowing anyone's brand to do it.</p>
  <p style="margin-top:16px">What is real: ${c.verified.map(esc).join(' ')}</p>` : `
  <p><b>An independent concept.</b> Not affiliated with, endorsed by, or commissioned by ${esc(c.company)}. Built by assembl from publicly available information. Cast, figures and drafts in this concept are illustrative and fictional.</p>
  <p style="margin-top:16px">Verified from ${esc(c.company)}'s own published material: ${c.verified.map(esc).join(' ')}</p>`}
  <p style="margin-top:16px">Ko tā mātou he whakarite i te mahi. Mā te tangata te whakatau. <span style="color:var(--muted-2)">We prepare the work. A person decides.</span></p>
  <p class="fin">assembl NZ Limited · NZBN 9429053514950 · assembl@assembl.co.nz · Tāmaki Makaurau Auckland, Aotearoa New Zealand</p>
</div></footer>

<button class="agentbtn" id="agentbtn" onclick="openChat()"><span class="d"></span> Ask it anything</button>
<div class="chat" id="chat">
  <div class="chathead">
    <div class="t"><span class="d"></span> ${esc(c.short)} concept <small>· it will say when it doesn't know</small></div>
    <button class="x" onclick="closeChat()" aria-label="Close">×</button>
  </div>
  <div class="msgs" id="msgs"></div><div class="sugg" id="sugg"></div>
  <div class="agentnote" id="agentnote"></div>
  <div class="chatin"><input id="chatinput" placeholder="Ask about the concept…" onkeydown="if(event.key==='Enter')sendChat()"><button class="send" onclick="sendChat()">Send</button></div>
</div>

<script src="three.min.js"></script>
<script>
var CFG={
  company:${js(c.company)}, short:${js(c.short)},
  accent:${js(accent)}, accent2:${js(accent2)},
  generic:${js(Boolean(c.generic))},
  execs:${js(c.execs)}, buyerTitle:${js(c.buyerTitle)}, buyerLine:${js(c.buyerLine)},
  variants:${js(c.variants)}, guard:${js(c.guard)},
  verified:${js(c.verified)}, laws:${js(c.laws)},
  pilotScope:${js(c.pilotScope)}, pilotAccess:${js(c.pilotAccess)}, pilotScorecard:${js(c.pilotScorecard)},
  verbNoun:${js(c.verbNoun)}, receiptArtefact:${js(c.receiptArtefact)}
};

(function(){
  var k=new URLSearchParams(location.search).get('for');
  if(k&&CFG.execs[k]) document.getElementById('signedFor').innerHTML='<b>'+CFG.execs[k]+'</b> · '+CFG.buyerLine;
})();

var cur=CFG.variants[0].key;
function byKey(k){return CFG.variants.filter(function(v){return v.key===k})[0]}
function renderTabs(){
  document.getElementById('marqrow').innerHTML=CFG.variants.map(function(v){
    return '<button class="marqbtn'+(v.key===cur?' on':'')+'" onclick="pick(\\''+v.key+'\\')">'+v.label+'</button>'}).join('');
}
function renderDraft(){
  var v=byKey(cur);
  document.getElementById('draftBox').innerHTML='<div class="fade"><div class="chan">'+v.chan+'</div><div class="body">'+v.body+'</div>'+
    '<button class="ruletoggle" type="button" aria-expanded="false">Why it is written this way<span class="more">'+v.rules.length+'</span></button>'+
    '<div class="rules" hidden>'+v.rules.map(function(r){return '<div><span class="tick">✓</span><span>'+r+'</span></div>'}).join('')+'</div></div>';
  var rt=document.getElementById('draftBox').querySelector('.ruletoggle'),rl=document.getElementById('draftBox').querySelector('.rules');
  rt.onclick=function(){var open=rl.hidden;rl.hidden=!open;rt.setAttribute('aria-expanded',String(open))};
  stamp();
}
function pick(k){cur=k;renderTabs();renderDraft()}
renderTabs();renderDraft();

function runGuard(){
  var out=document.getElementById('guardOut'),btn=document.getElementById('guardBtn');
  var blocked=CFG.guard.filter(function(g){return !g.ok}).length;
  btn.disabled=true;btn.style.opacity='.5';
  btn.textContent='Checked — '+blocked+' held, '+(CFG.guard.length-blocked)+' passed';
  out.innerHTML='';
  var red=matchMedia('(prefers-reduced-motion:reduce)').matches;
  CFG.guard.forEach(function(g,i){
    setTimeout(function(){
      var d=document.createElement('div');
      d.className='check '+(g.ok?'pass':'block')+' fade';
      d.innerHTML='<span class="ic">'+(g.ok?'✓':'!')+'</span><div><button class="t" type="button" aria-expanded="false">'+g.t+
        '<span class="more">why</span></button><div class="d" hidden>'+g.d+'<div class="law">'+g.law+'</div></div></div>';
      var head=d.querySelector('.t'),body=d.querySelector('.d');
      head.onclick=function(){var open=body.hidden;body.hidden=!open;head.setAttribute('aria-expanded',String(open));
        head.querySelector('.more').textContent=open?'close':'why'};
      /* A held check is the interesting one, so it opens itself. */
      if(!g.ok){body.hidden=false;head.setAttribute('aria-expanded','true');head.querySelector('.more').textContent='close'}
      out.appendChild(d);
    },red?0:i*420);
  });
}

function stamp(){
  var d=new Date(),p=function(n){return n<10?'0'+n:''+n};
  document.getElementById('rWhen').textContent=d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+' NZST';
  var seed=cur+d.toDateString(),h=0;
  for(var i=0;i<seed.length;i++){h=((h<<5)-h+seed.charCodeAt(i))|0}
  document.getElementById('rHash').textContent='mana:'+Math.abs(h).toString(16).padStart(8,'0')+'·concept·unsent';
}
stamp();

function verb(kind){
  var s={correct:'Correct the '+CFG.short+' concept',narrow:'Narrow the '+CFG.short+' concept',decline:'Decline — '+CFG.short+' concept'};
  var b={correct:'The line that is wrong is:\\n\\n\\n(We will fix it or take the concept down.)',
         narrow:'The one situation worth scoping:\\n\\n\\nThe six weeks that would suit:\\n\\n',
         decline:'Not now, or not at all — either is fine. You will not hear from us again about this.\\n\\n'};
  location.href='mailto:assembl@assembl.co.nz?subject='+encodeURIComponent(s[kind])+'&body='+encodeURIComponent(b[kind]);
  return false;
}
function sendConstraint(){
  var v=document.getElementById('constraint').value.trim();
  if(!v){document.getElementById('cnote').textContent='Write the one thing first — then send.';return}
  location.href='mailto:assembl@assembl.co.nz?subject='+encodeURIComponent('The constraint the '+CFG.short+' concept got wrong')+'&body='+encodeURIComponent(v+'\\n\\n');
  document.getElementById('cnote').textContent='Thank you — that is the most useful thing on the page.';
}

var GENOME=[
(CFG.generic?"You are an assistant on a CATEGORY DEMONSTRATOR built by assembl (a New Zealand agentic-AI studio). "+CFG.company+" is NOT a real company — it is an invented example for this category. Never claim it exists, never invent facts about a real competitor, and say plainly that this page demonstrates a shape rather than describing a real client.":"You are an independent concept assistant built by assembl (a New Zealand agentic-AI studio) for a concept microsite prepared for "+CFG.company+"."),
"You are NOT "+CFG.company+", you do not speak for them, and you must say so if asked.",
"",
"VERIFIED FACTS you may rely on (from "+CFG.company+"'s own published material):",
CFG.verified.map(function(v){return "- "+v}).join("\\n"),
"",
"WHAT THE CONCEPT IS: a layer that prepares work and then stops. Every draft goes to a named person. It never sends, publishes, commits spend, moves money, or makes a decision that belongs to a person.",
"The pilot asks for: scope — "+CFG.pilotScope+" Access — "+CFG.pilotAccess+" Scorecard — "+CFG.pilotScorecard+" Fail any line and we change the design or stop.",
"",
"RULES drafts are held against: "+CFG.laws,
"",
"HOW TO ANSWER: plain New Zealand English, short sentences, warm and direct. Macrons correct in te reo. Never invent a price, a statistic, a person's name, a figure or a policy detail — if you do not have it, say plainly that it was not published. It is much better to say 'I do not know that' than to guess. Never claim "+CFG.company+" endorses this concept. Keep answers under about 120 words.",
"Avoid these words entirely: seamless, unlock, empower, elevate, supercharge, cutting-edge, quietly."
].join("\\n");

var SUGG=["What is this actually asking for?","What would it never do?","Why does it refuse to draft some of these?","What have you verified about "+CFG.short+"?","Who is this for?"];
document.getElementById('sugg').innerHTML=SUGG.map(function(s){return '<button onclick="ask(this.textContent)">'+s+'</button>'}).join('');

var history=[];
function openChat(){
  document.getElementById('chat').classList.add('open');
  document.getElementById('agentbtn').style.display='none';
  if(!history.length) push('a',CFG.generic
    ?"Kia ora. This page is a DEMONSTRATOR built by assembl — "+CFG.short+" is not a real company, and I am not pretending otherwise.<br><br>What is real is the mechanic: a rewarded wait state that prepares work and stops before a person decides. Ask me anything about how it works, or about the boundaries."
    :"Kia ora. I am an independent concept assistant built by assembl — I am not "+CFG.short+" and I do not speak for them.<br><br>I know what they have published about themselves, and what this concept does and refuses to do. Ask me anything, including the awkward questions.");
  document.getElementById('agentnote').textContent='Independent concept · it will say plainly when something was not published';
}
function closeChat(){document.getElementById('chat').classList.remove('open');document.getElementById('agentbtn').style.display='flex'}
function push(r,t){var m=document.createElement('div');m.className='msg '+r;m.innerHTML=t;var b=document.getElementById('msgs');b.appendChild(m);b.scrollTop=b.scrollHeight}
function ask(q){document.getElementById('chatinput').value=q;sendChat()}
async function sendChat(){
  var inp=document.getElementById('chatinput'),q=inp.value.trim();if(!q)return;
  push('u',q.replace(/</g,'&lt;'));inp.value='';history.push({role:'user',content:q});
  var t=document.createElement('div');t.className='typing';t.textContent='Thinking…';
  document.getElementById('msgs').appendChild(t);
  var reply='';
  try{
    var res=await fetch('/api/agent',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({system:GENOME,messages:history.slice(-12)})});
    var d=await res.json();
    reply=(d.content||[]).filter(function(b){return b.type==='text'}).map(function(b){return b.text}).join('\\n');
  }catch(e){reply=''}
  t.remove();
  if(!reply)reply=grounded(q);
  push('a',reply.replace(/</g,'&lt;').replace(/\\n/g,'<br>'));
  history.push({role:'assistant',content:reply});
}
function grounded(q){
  var s=q.toLowerCase(),has=function(){return [].some.call(arguments,function(w){return s.indexOf(w)>-1})};
  if(has('never','not do','boundary','limit','refuse'))
    return "It does not send. It prepares, and a named person sends. It does not publish to any channel, commit spend, move money, or make a decision that belongs to a person. Where the right answer is to produce nothing at all, it produces nothing and says why. No production access is requested by this concept.";
  if(has('ask','pilot','cost','price','how much','scope'))
    return "Scope: "+CFG.pilotScope+" Access: "+CFG.pilotAccess+" It is scored on: "+CFG.pilotScorecard+" Fail any line of that and we change the design or stop. No price is published here.";
  if(has('verified','true','real','fact','know about'))
    return "From "+CFG.short+"'s own published material: "+CFG.verified.join(' ')+" Everything else on the page — the cast, the figures, the drafts — is illustrative and fictional.";
  if(has('law','legal','rule','compliance','comply'))
    return "Drafts are held against "+CFG.laws+" The checks that matter most are the ones that stop a draft being written at all.";
  if(has('who','for','buyer','audience'))
    return "It is prepared for whoever owns this work at "+CFG.short+" — the page is signed to "+CFG.buyerTitle+". If that is the wrong person, telling us so is genuinely useful.";
  if(has('data','access','production'))
    return "None of it is "+CFG.short+" data. The figures and drafts on this page are illustrative and fictional. The only real things here are what "+CFG.short+" has published about itself. No production access is requested by this concept.";
  return "I can tell you what this concept does, what it refuses to do, what we have actually verified about "+CFG.short+", or what the pilot asks for. What would be most useful? If I do not have something, I will say so rather than guess.";
}

(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.rise').forEach(function(el){io.observe(el)});
  setTimeout(function(){document.querySelectorAll('.hero .rise').forEach(function(el){el.classList.add('in')})},60);
})();

/* the assembly — client primary as the core, assembl's champagne as the rings */
(function(){
  if(typeof THREE==='undefined'){setTimeout(arguments.callee,120);return}
  var c=document.getElementById('scene');if(!c)return;
  var r=new THREE.WebGLRenderer({canvas:c,antialias:true,alpha:true});
  r.setSize(innerWidth,innerHeight);r.setPixelRatio(Math.min(devicePixelRatio,2));
  var s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,0.1,120);
  cam.position.set(0,0.6,11);
  /* softbox env — emissive planes on near-black. Directional lights alone bake to nothing. */
  var pmrem=new THREE.PMREMGenerator(r),env=new THREE.Scene();
  env.background=new THREE.Color('#0A0A0D');
  function box(w,h,x,y,z,rx,ry,col,pow){
    var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(pow)}));
    m.position.set(x,y,z);m.rotation.set(rx,ry,0);env.add(m);
  }
  box(16,9,0,9,2,-Math.PI/2,0,'#FFFFFF',5.0);
  box(11,7,-9,2.5,3,0,Math.PI/2,'#FFF3E2',3.2);
  box(11,7,9,2.5,1,0,-Math.PI/2,'#E8EEF6',2.6);
  box(14,5,0,1.5,-9,0,0,CFG.accent,1.8);
  s.environment=pmrem.fromScene(env,0.02).texture;
  s.add(new THREE.AmbientLight('#FFFFFF',0.18));
  var key=new THREE.DirectionalLight('#FFFFFF',1.4);key.position.set(5,9,6);s.add(key);

  /* matte ceramic for volumes — large flat metal faces mirror the dark studio and read as black */
  var core =new THREE.MeshStandardMaterial({color:CFG.accent,metalness:0,roughness:0.38,envMapIntensity:1.5});
  var sec  =new THREE.MeshStandardMaterial({color:CFG.accent2,metalness:0,roughness:0.40,envMapIntensity:1.4});
  var champ=new THREE.MeshStandardMaterial({color:'#BFA37A',metalness:1,roughness:0.13,envMapIntensity:2.0});
  var chrome=new THREE.MeshStandardMaterial({color:'#EDEFF2',metalness:1,roughness:0.09,envMapIntensity:2.0});

  var g=new THREE.Group();s.add(g);

  /* ══ THE INSTRUMENT ═══════════════════════════════════════════════════════
     Every object here has to MEAN something for the category it sits in — a
     generic faceted ball says nothing about a parcel, a claim or a loan. Each
     builder returns its moving parts, and each part gets its own axis and
     speed: one group spin reads as a screensaver, per-part motion reads as a
     mechanism. Linear members stay hairline (tube radius <= 0.035); anything
     thicker reads as plumbing.
     ═════════════════════════════════════════════════════════════════════════ */
  var glass=new THREE.MeshPhysicalMaterial({color:CFG.accent,metalness:0.1,roughness:0.22,
    transmission:0.72,transparent:true,opacity:0.42,envMapIntensity:1.6});
  var parts=[];
  function part(m,sx,sy2,sz){m.userData.spin={x:sx||0,y:sy2||0,z:sz||0};parts.push(m);g.add(m);return m}

  var OBJECTS={
    /* one continuous path through the whole thing — one application, one journey.
       Kate's chosen homepage direction, so it is the right default. */
    filament:function(){
      part(new THREE.Mesh(new THREE.TorusKnotGeometry(1.75,0.028,560,10,2,3),chrome),0.012,0.05,0);
      part(new THREE.Mesh(new THREE.TorusKnotGeometry(1.42,0.018,480,8,3,5),champ),-0.03,-0.035,0.01);
      part(new THREE.Mesh(new THREE.TorusKnotGeometry(2.05,0.020,420,8,2,5),core),0.02,0.022,0);
      part(new THREE.Mesh(new THREE.SphereGeometry(0.30,40,32),champ),0,0.09,0);
    },
    /* a great circle with a bead running it — a route, and someone on it */
    arc:function(){
      part(new THREE.Mesh(new THREE.SphereGeometry(1.30,44,36),glass),0,0.03,0);
      var a=part(new THREE.Mesh(new THREE.TorusGeometry(2.30,0.030,12,180,Math.PI*1.45),champ),0,0.04,0);
      a.rotation.set(Math.PI/2.6,0,Math.PI/9);
      var b=part(new THREE.Mesh(new THREE.TorusGeometry(2.85,0.020,10,180,Math.PI*1.1),chrome),0,-0.03,0);
      b.rotation.set(Math.PI/2.1,0.5,-Math.PI/6);
      /* the bead is parented to the arc, so the arc's own spin carries it along
         the route rather than leaving it parked at one point on the circle */
      var bead=new THREE.Mesh(new THREE.SphereGeometry(0.17,26,20),core);
      bead.position.set(2.30,0,0);a.add(bead);
    },
    /* a basket, assembled: small volumes finding their places on a lattice */
    lattice:function(){
      for(var i=0;i<26;i++){
        var sc=0.20+Math.random()*0.30;
        var m=part(new THREE.Mesh(new THREE.BoxGeometry(sc,sc,sc),
          i%3===0?champ:(i%3===1?core:sec)),
          (Math.random()-0.5)*0.06,(Math.random()-0.5)*0.06,(Math.random()-0.5)*0.06);
        var t=i/26*Math.PI*2, ring=1.15+(i%3)*0.52;
        m.position.set(Math.cos(t)*ring,(i%5-2)*0.42,Math.sin(t)*ring);
      }
      part(new THREE.Mesh(new THREE.IcosahedronGeometry(0.72,1),glass),0,0.05,0);
    },
    /* concentric arcs over one small volume — something kept safe, not enclosed */
    shelter:function(){
      [[1.55,0.030,champ,0],[1.95,0.024,chrome,0.22],[2.35,0.020,champ,0.44]].forEach(function(d,i){
        var m=part(new THREE.Mesh(new THREE.TorusGeometry(d[0],d[1],12,150,Math.PI*0.92),d[2]),
          0,0,(i%2?1:-1)*0.02);
        m.rotation.set(0,d[3],Math.PI);
      });
      part(new THREE.Mesh(new THREE.SphereGeometry(0.60,40,32),core),0,0.04,0).position.y=-0.30;
      part(new THREE.Mesh(new THREE.TorusGeometry(0.95,0.016,10,120),chrome),0.03,0,0).rotation.x=Math.PI/2;
    },
    /* an element in a coil — the thing that actually costs money to run */
    helix:function(){
      var pts=[];for(var i=0;i<=440;i++){var t=i/440*Math.PI*9;
        pts.push(new THREE.Vector3(Math.cos(t)*1.15,(i/440-0.5)*3.3,Math.sin(t)*1.15))}
      part(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),440,0.030,8,false),champ),0,0.05,0);
      part(new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,3.5,24),chrome),0,0.02,0);
      part(new THREE.Mesh(new THREE.TorusGeometry(1.85,0.020,10,150),core),0.02,0,0.03).rotation.x=Math.PI/2;
      part(new THREE.Mesh(new THREE.SphereGeometry(0.26,32,24),glass),0,0.06,0);
    },
    /* a box, and the path a thing takes through it */
    parcel:function(){
      var e=new THREE.EdgesGeometry(new THREE.BoxGeometry(2.0,2.0,2.0));
      var box2=new THREE.LineSegments(e,new THREE.LineBasicMaterial({color:'#BFA37A',transparent:true,opacity:0.85}));
      part(box2,0.010,0.035,0.006);
      part(new THREE.Mesh(new THREE.BoxGeometry(1.02,1.02,1.02),core),0.02,0.05,0.01);
      var pts=[];for(var i=0;i<=180;i++){var t=i/180*Math.PI*3.2;
        pts.push(new THREE.Vector3(Math.cos(t)*(2.6-i/180*1.2),(i/180-0.5)*2.4,Math.sin(t)*(2.6-i/180*1.2)))}
      part(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),180,0.017,7,false),chrome),0,-0.03,0);
    },
  };
  (OBJECTS[CFG.object]||OBJECTS.filament)();
  /* The horizon rings were 4.6/5.7 — wide enough that the assembly spilled left
     across the headline column even with the hero pose hard right. Compact. */
  var r1=new THREE.Mesh(new THREE.TorusGeometry(3.15,0.030,14,140),champ);r1.rotation.x=Math.PI/2.1;g.add(r1);
  var r2=new THREE.Mesh(new THREE.TorusGeometry(3.80,0.018,12,140),champ);r2.rotation.x=Math.PI/2.4;r2.rotation.z=Math.PI/7;g.add(r2);
  var orbs=[];
  [{geo:new THREE.OctahedronGeometry(0.38,0),m:sec,rad:2.55,sp:0.30,ph:0.4,ya:0.7},
   {geo:new THREE.TetrahedronGeometry(0.36,0),m:chrome,rad:2.95,sp:0.24,ph:2.1,ya:0.9},
   {geo:new THREE.IcosahedronGeometry(0.32,0),m:core,rad:2.75,sp:0.34,ph:4.0,ya:0.55},
   {geo:new THREE.TorusGeometry(0.30,0.10,14,44),m:champ,rad:3.20,sp:0.28,ph:5.4,ya:0.8}
  ].forEach(function(d){var m=new THREE.Mesh(d.geo,d.m);m.userData=d;g.add(m);orbs.push(m)});
  var N=80,pg=new THREE.BufferGeometry(),pp=new Float32Array(N*3);
  for(var i=0;i<N;i++){pp[i*3]=(Math.random()-0.5)*22;pp[i*3+1]=(Math.random()-0.5)*13;pp[i*3+2]=(Math.random()-0.5)*16}
  pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
  s.add(new THREE.Points(pg,new THREE.PointsMaterial({color:'#BFA37A',size:0.035,transparent:true,opacity:0.40})));

  /* hero pose sits hard right — the headline column owns the left half */
  var KEYS=[{p:0.00,x:5.70,y:-0.10,sc:0.72,ry:-0.4},{p:0.18,x:-2.70,y:0.15,sc:0.74,ry:0.7},
            {p:0.38,x:2.60,y:0.05,sc:0.76,ry:1.9},{p:0.58,x:-2.55,y:0.15,sc:0.74,ry:3.0},
            {p:0.78,x:2.50,y:0.05,sc:0.80,ry:4.2},{p:1.00,x:0.00,y:0.00,sc:1.05,ry:5.6}];
  function ss(a){return a*a*(3-2*a)}
  function pose(p){var i=0;while(i<KEYS.length-2&&KEYS[i+1].p<p)i++;
    var a=KEYS[i],b=KEYS[i+1],t=ss(Math.min(1,Math.max(0,(p-a.p)/(b.p-a.p))));
    return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,sc:a.sc+(b.sc-a.sc)*t,ry:a.ry+(b.ry-a.ry)*t}}
  var sy=0,mx=0,my=0;
  addEventListener('scroll',function(){sy=scrollY},{passive:true});
  addEventListener('mousemove',function(e){mx=(e.clientX/innerWidth-0.5)*2;my=(e.clientY/innerHeight-0.5)*2},{passive:true});
  addEventListener('resize',function(){r.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});
  var reduced=matchMedia('(prefers-reduced-motion:reduce)').matches,t=0;
  function anim(){
    requestAnimationFrame(anim);if(!reduced)t+=0.016;
    var max=document.body.scrollHeight-innerHeight,prog=max>0?Math.min(1,Math.max(0,sy/max)):0;
    var k=pose(prog),narrow=innerWidth<820,damp=narrow?0.30:1,sd=narrow?0.60:1;
    g.position.x=k.x*damp+mx*0.28;g.position.y=k.y+Math.sin(t*0.35)*0.12;
    g.scale.setScalar(k.sc*sd);g.rotation.y=k.ry+t*0.05;
    /* per-part motion — one group spin reads as a screensaver. Deltas are scaled
       by the same 0.016 step the clock uses, so spin 0.05 means 0.05 rad/sec. */
    if(!reduced)parts.forEach(function(m){var sp=m.userData.spin;if(!sp)return;
      m.rotation.x+=sp.x*0.016;m.rotation.y+=sp.y*0.016;m.rotation.z+=sp.z*0.016});
    r1.rotation.z=t*0.05;r2.rotation.z=-t*0.035;
    orbs.forEach(function(m){var d=m.userData,a=d.ph+t*d.sp+prog*Math.PI;
      m.position.set(Math.cos(a)*d.rad,Math.sin(t*0.25+d.ph)*d.ya,Math.sin(a)*d.rad);
      m.rotation.y=t*0.3+d.ph});
    cam.position.x=mx*0.5;cam.position.y=0.6-my*0.25;
    cam.lookAt(g.position.x*0.3,g.position.y*0.3,0);
    r.render(s,cam);
  }
  anim();
})();
</script>
${c.waitPhone ? `
<script src="wait-phone.js"></script>
<script>
/* ══ THE WAIT, ON A PHONE ═══════════════════════════════════════════════════
   The same component the assembl homepage runs. The ring is the idea, the
   number in the middle is the payoff, and the sheet is the one question that
   genuinely holds the line — a question, not a tick. Everything it says traces
   to this client's own published material; see \`verified\` in clients.mjs. */
(function(){
  var mount=document.getElementById('wait-mount');
  if(!mount||!window.WaitPhone)return;
  WaitPhone.mount(mount,${js(c.waitPhone)});
  WaitPhone.explain(document.getElementById('wait-explain'));
})();
</script>` : ''}
</body>
</html>`;
}


/** The honest one-pager — the concept boards' structure, only sourced facts.
    Prints clean to A4 (File → Print → PDF); every number names its source. */
function boardPage(c) {
  const accent = c.primary, accent2 = c.secondary;
  return `<!doctype html>
<html lang="en-NZ"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(c.short)} \u00d7 assembl \u2014 the monetised wait state, one page</title>
<style>
  :root{--a:${accent};--a2:${accent2};--ink:#101418;--soft:#5A6068;--line:#E3E1DB;--paper:#FCFBF8}
  *{box-sizing:border-box;margin:0}
  body{background:#EEECE6;color:var(--ink);font:15px/1.55 'Lato',-apple-system,system-ui,sans-serif;padding:34px 14px}
  .sheet{max-width:880px;margin:0 auto;background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:52px 56px;box-shadow:0 30px 70px -40px rgba(16,20,24,.35)}
  .mono{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase}
  .top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;border-bottom:3px solid var(--a);padding-bottom:22px}
  h1{font-size:34px;line-height:1.12;margin-top:10px}
  h1 em{font-style:normal;color:var(--a2)}
  .who{font-weight:700;font-size:15px}
  .who span{color:var(--soft);font-weight:400}
  .promise{margin-top:12px;color:var(--soft);max-width:58ch}
  h2{font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--a2);margin:36px 0 14px}
  .facts{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .fact{border:1px solid var(--line);border-left:4px solid var(--a);border-radius:12px;padding:14px 16px;background:#fff}
  .fact b{display:block;font-size:14.5px;line-height:1.45;margin-bottom:6px}
  .fact i{font-style:normal;font-size:11px;color:var(--soft)}
  .moms{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .mom{border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:#fff}
  .mom b{display:block;font-size:13px}
  .mom span{font-size:11.5px;color:var(--soft)}
  .pows{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  .pow{border:1px solid var(--line);border-radius:12px;padding:12px 13px;background:#fff}
  .pow i{font-style:normal;font-size:9.5px;letter-spacing:.12em;color:var(--a2);text-transform:uppercase}
  .pow b{display:block;font-size:12.5px;margin:5px 0 3px}
  .pow span{font-size:11px;color:var(--soft);line-height:1.45}
  .duo{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .panel{border:1px solid var(--line);border-radius:14px;padding:18px 20px;background:#fff}
  .panel b{display:block;margin-bottom:8px;font-size:14px}
  .panel p{font-size:13px;color:var(--soft)}
  .measure{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .foot{margin-top:38px;border-top:1px solid var(--line);padding-top:18px;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--soft)}
  .foot b{color:var(--ink)}
  @media(max-width:720px){.facts,.duo,.measure{grid-template-columns:1fr}.moms{grid-template-columns:1fr 1fr}.pows{grid-template-columns:1fr 1fr}.sheet{padding:34px 22px}}
  @media print{body{background:#fff;padding:0}.sheet{box-shadow:none;border:0;border-radius:0;max-width:none;padding:24px 30px}}
</style></head><body>
<div class="sheet">
  <div class="top">
    <div>
      <div class="who">${esc(c.short)} <span>\u00d7 assembl \u00b7 an independent concept</span></div>
      <h1>The monetised<br><em>wait state.</em></h1>
      <p class="promise">${esc(c.boardPromise || 'The moments your customers already wait, made visible, valuable, and on the record \u2014 every draft held for a person.')}</p>
    </div>
    <div class="mono" style="text-align:right;color:var(--a2)">the wait itself,<br>not a picture of it<br><br>${esc(new Date().toLocaleDateString('en-NZ',{month:'long',year:'numeric'}))}</div>
  </div>

  <h2>At a glance \u2014 every number carries its source</h2>
  <div class="facts">
    ${(c.boardFacts||[]).map(([f,src]) => `<div class="fact"><b>${esc(f)}</b><i>\u2014 ${esc(src)}</i></div>`).join('\n    ')}
  </div>

  ${c.moments ? `<h2>Every waiting moment, one pattern</h2>
  <div class="moms">
    ${c.moments.map(([t,d]) => `<div class="mom"><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('\n    ')}
  </div>` : ''}

  <h2>How assembl powers it</h2>
  <div class="pows">
    <div class="pow"><i>01 \u00b7 intent signal</i><b>The agent detects the wait</b><span>What the customer is waiting for, and why it matters now.</span></div>
    <div class="pow"><i>02 \u00b7 honest duration</i><b>How long, truthfully</b><span>Real steps, real progress \u2014 never a wait stretched to fill.</span></div>
    <div class="pow"><i>03 \u00b7 value delivery</i><b>Worth the minutes</b><span>The work shown as it happens \u2014 useful, short, skippable.</span></div>
    <div class="pow"><i>04 \u00b7 value exchange</i><b>The wait pays</b><span>The customer earns; one optional question comes back.</span></div>
  </div>

  <p style="margin-top:12px;font-size:12px;color:var(--soft)">This concept is <b style="color:var(--ink)">tier 01 of three</b> \u2014 the assembling loader. The path: a labelled sponsored chat line, then a joint-venture surface. Full framework: assembl.co.nz/assembling</p>

  <h2>The exchange</h2>
  <div class="duo">
    <div class="panel"><b>What the customer earns</b><p>${esc(c.boardEarn || 'Value they keep, funded by the business running the journey \u2014 never by selling the person waiting.')}</p></div>
    <div class="panel"><b>The one question</b><p>${esc(c.boardQuestion || 'One optional question, asked inside the wait \u2014 the only part of the journey that sends something back the other way. Decline it and the work still finishes.')}</p></div>
  </div>

  <h2>What a pilot measures \u2014 no projections on this page</h2>
  <div class="measure">
    <div class="panel"><b>Waits completed v. abandoned</b><p>Against your current spinner, on your own traffic.</p></div>
    <div class="panel"><b>Value earned and redeemed</b><p>What the waits gave, and who came back to spend it.</p></div>
    <div class="panel"><b>Questions answered v. declined</b><p>And what the answers changed in triage.</p></div>
    <div class="panel"><b>Approval, always human</b><p>Every output held for a named person \u2014 audited, on the record.</p></div>
  </div>

  <div class="foot">
    <span><b>The live concept:</b> assembling-${c.slug}.pages.dev</span>
    <span><b>assembl</b> \u2014 intuitive agentic customer journeys \u00b7 assembl.co.nz</span>
    <span>Independent concept \u00b7 not affiliated with ${esc(c.short)} \u00b7 no customer data used</span>
  </div>
</div>
</body></html>`;
}

const only = process.argv[2];
const targets = only ? CLIENTS.filter((c) => c.slug === only) : CLIENTS;
if (!targets.length) {
  console.error(`No client matched "${only}". Known: ${CLIENTS.map((c) => c.slug).join(', ')}`);
  process.exit(1);
}

for (const c of targets) {
  const dir = resolve(RESEARCH, `assembling-${c.slug}`);
  mkdirSync(resolve(dir, 'functions/api'), { recursive: true });
  writeFileSync(resolve(dir, 'index.html'), page(c));
  if (c.boardFacts) writeFileSync(resolve(dir, 'board.html'), boardPage(c));
  writeFileSync(resolve(dir, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n');
  writeFileSync(resolve(dir, 'wrangler.toml'),
    `name = "assembling-${c.slug}"\ncompatibility_date = "2025-10-01"\npages_build_output_dir = "."\n\n[ai]\nbinding = "AI"\n`);
  for (const f of ['three.min.js', 'functions/api/agent.js']) {
    if (!existsSync(resolve(dir, f))) copyFileSync(f === 'functions/api/agent.js' ? resolve(HERE, 'agent.js') : resolve(DONOR, f), resolve(dir, f));
  }
  /* wait-phone.js is re-copied EVERY build, unlike the two above — it is our own
     source and the template is the one place it should ever be edited. */
  if (c.waitPhone) {
    copyFileSync(resolve(RESEARCH, 'assembling-template/wait-phone.js'), resolve(dir, 'wait-phone.js'));
  }
  const warn = c.paletteConfidence === 'low' ? '  ⚠️  palette UNVERIFIED — confirm before sending' : '';
  console.log(`✓ assembling-${c.slug}  ${c.primary} / ${c.secondary}${warn}`);
}
