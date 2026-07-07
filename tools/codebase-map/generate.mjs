#!/usr/bin/env node
// Codebase map generator.
//
// Scans the repository, builds a nested file/directory tree with size + line
// counts, aggregates per-extension stats, and writes a fully self-contained
// interactive website (single index.html with the data + all JS/CSS inlined)
// to tools/codebase-map/index.html.
//
// Usage: node tools/codebase-map/generate.mjs

import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, extname, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const OUT = join(__dirname, 'index.html');

const EXCLUDE_DIRS = new Set([
  '.git', 'node_modules', '.next', 'dist', 'out', 'build', 'coverage',
  '.turbo', '.vercel', '.cache', '.pnpm-store', '.vite',
]);

// Extensions we treat as text and count lines for.
const TEXT_EXT = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json', 'css', 'scss', 'less',
  'html', 'md', 'mdx', 'sql', 'sh', 'bash', 'yml', 'yaml', 'toml', 'txt',
  'py', 'rs', 'go', 'java', 'rb', 'php', 'vue', 'svelte', 'graphql', 'env',
  'xml', 'svg', 'csv', 'ini', 'conf',
]);

const MAX_LINE_COUNT_BYTES = 2 * 1024 * 1024; // skip line counting for >2MB

const extStats = new Map(); // ext -> { count, bytes, lines }

function bump(ext, bytes, lines) {
  const key = ext || '(none)';
  const s = extStats.get(key) || { count: 0, bytes: 0, lines: 0 };
  s.count += 1;
  s.bytes += bytes;
  s.lines += lines;
  extStats.set(key, s);
}

let totalFiles = 0;
let totalDirs = 0;
let totalBytes = 0;
let totalLines = 0;

function countLines(path, bytes) {
  if (bytes > MAX_LINE_COUNT_BYTES) return 0;
  try {
    const buf = readFileSync(path);
    // crude binary sniff: NUL byte in first chunk
    const sniff = buf.subarray(0, Math.min(buf.length, 4096));
    if (sniff.includes(0)) return 0;
    if (buf.length === 0) return 0;
    let lines = 1;
    for (let i = 0; i < buf.length; i++) if (buf[i] === 10) lines++;
    return lines;
  } catch {
    return 0;
  }
}

function walk(absDir, relDir) {
  let entries;
  try {
    entries = readdirSync(absDir, { withFileTypes: true });
  } catch {
    return null;
  }
  const children = [];
  // sort: dirs first, then files, alpha
  entries.sort((a, b) => {
    const ad = a.isDirectory() ? 0 : 1;
    const bd = b.isDirectory() ? 0 : 1;
    if (ad !== bd) return ad - bd;
    return a.name.localeCompare(b.name);
  });

  for (const ent of entries) {
    if (ent.name.startsWith('.git') && ent.name === '.git') continue;
    const abs = join(absDir, ent.name);
    const rel = relDir ? `${relDir}/${ent.name}` : ent.name;

    if (ent.isDirectory()) {
      if (EXCLUDE_DIRS.has(ent.name)) continue;
      const node = walk(abs, rel);
      if (node) {
        totalDirs += 1;
        children.push(node);
      }
    } else if (ent.isFile()) {
      let st;
      try {
        st = statSync(abs);
      } catch {
        continue;
      }
      const bytes = st.size;
      const ext = extname(ent.name).slice(1).toLowerCase();
      const lines = TEXT_EXT.has(ext) ? countLines(abs, bytes) : 0;
      totalFiles += 1;
      totalBytes += bytes;
      totalLines += lines;
      bump(ext, bytes, lines);
      children.push({
        n: ent.name,
        p: rel,
        e: ext,
        s: bytes,
        l: lines,
      });
    }
  }

  // aggregate dir size/lines from children
  let size = 0;
  let lines = 0;
  let files = 0;
  for (const c of children) {
    if (c.c) {
      size += c.s;
      lines += c.l;
      files += c.f;
    } else {
      size += c.s;
      lines += c.l;
      files += 1;
    }
  }

  return {
    n: relDir ? relDir.split('/').pop() : (ROOT.split('/').pop() || 'repo'),
    p: relDir || '',
    s: size,
    l: lines,
    f: files,
    c: children,
  };
}

const tree = walk(ROOT, '');

const languages = [...extStats.entries()]
  .map(([ext, s]) => ({ ext, ...s }))
  .sort((a, b) => b.lines - a.lines || b.bytes - a.bytes);

const data = {
  generatedAt: new Date().toISOString(),
  repo: ROOT.split('/').pop(),
  totals: { files: totalFiles, dirs: totalDirs, bytes: totalBytes, lines: totalLines },
  languages,
  tree,
};

const json = JSON.stringify(data);

const html = buildHtml(json);
writeFileSync(OUT, html);
console.log(
  `Wrote ${relative(ROOT, OUT)} — ${totalFiles} files, ${totalDirs} dirs, ` +
    `${(totalBytes / 1024 / 1024).toFixed(1)} MB, ${totalLines.toLocaleString()} lines.`,
);

function buildHtml(dataJson) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>assembl — codebase map</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
:root{
  --cream:#FAF7F2; --pounamu:#2B6B57; --pounamu-deep:#1A4D3D; --pounamu-bright:#4FA887;
  --amber:#D9A85A; --brass:#B8964F; --ink:#3D4250; --ink-soft:#5C6273; --taupe:#9D8C7D;
  --card:#FFFFFF; --line:#E7E0D5;
  --serif:'Cormorant Garamond',Georgia,serif;
  --sans:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--cream);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}
.wrap{max-width:1400px;margin:0 auto;padding:28px 28px 60px}
header.hero{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:12px;border-bottom:1px solid var(--line);padding-bottom:18px;margin-bottom:22px}
.brand{font-family:var(--serif);font-size:40px;font-weight:600;letter-spacing:-.5px;color:var(--pounamu-deep);line-height:1}
.brand .dot{color:var(--amber)}
.eyebrow{font-family:var(--mono);text-transform:uppercase;letter-spacing:.18em;font-size:11px;color:var(--taupe)}
.subtitle{font-family:var(--serif);font-size:20px;color:var(--ink-soft);margin-top:4px}
.meta{font-family:var(--mono);font-size:11px;color:var(--taupe);text-align:right}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
.stat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;box-shadow:0 1px 0 rgba(0,0,0,.02)}
.stat .k{font-family:var(--mono);text-transform:uppercase;letter-spacing:.14em;font-size:10px;color:var(--taupe)}
.stat .v{font-family:var(--serif);font-size:34px;font-weight:600;color:var(--pounamu);line-height:1.1;margin-top:6px}
.grid{display:grid;grid-template-columns:1fr 340px;gap:20px}
@media(max-width:960px){.grid{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr)}}
.panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px}
.panel h2{font-family:var(--serif);font-weight:600;font-size:22px;margin:2px 0 4px;color:var(--pounamu-deep)}
.panel .hint{font-family:var(--mono);font-size:11px;color:var(--taupe);margin-bottom:12px}
#metrics{display:flex;align-items:center;gap:6px;margin-bottom:10px}
#metrics .mlabel{font-family:var(--mono);text-transform:uppercase;letter-spacing:.12em;font-size:10px;color:var(--taupe);margin-right:4px}
#metrics button{font-family:var(--mono);font-size:11px;padding:4px 12px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink-soft);cursor:pointer;transition:all .12s}
#metrics button:hover{border-color:var(--pounamu-bright)}
#metrics button.on{background:var(--pounamu);border-color:var(--pounamu);color:#fff}
#crumbs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:10px;font-family:var(--mono);font-size:12px}
#crumbs button{font-family:var(--mono);font-size:12px;background:transparent;border:none;color:var(--pounamu);cursor:pointer;padding:2px 4px;border-radius:6px}
#crumbs button:hover{background:rgba(43,107,87,.08)}
#crumbs .sep{color:var(--taupe)}
#treemap{position:relative;width:100%;height:560px;border-radius:12px;overflow:hidden;background:var(--cream);border:1px solid var(--line)}
.tile{position:absolute;overflow:hidden;border:2px solid var(--cream);border-radius:8px;padding:8px 9px;cursor:pointer;transition:filter .12s ease, transform .12s ease;color:#fff}
.tile:hover{filter:brightness(1.06)}
.tile .tn{font-family:var(--mono);font-size:11px;font-weight:500;line-height:1.25;word-break:break-word;text-shadow:0 1px 2px rgba(0,0,0,.28)}
.tile .ts{font-family:var(--mono);font-size:10px;opacity:.9;margin-top:2px;text-shadow:0 1px 2px rgba(0,0,0,.28)}
.tile.file{cursor:default}
.tile.small .ts{display:none}
.tile.small{padding:5px 6px}
.tile.tiny{padding:3px 4px}
.tile.tiny .tn{font-size:10px;line-height:1.15;white-space:nowrap;text-overflow:ellipsis}
.tile.micro{padding:0}
.tile.micro .tn,.tile.micro .ts{display:none}
.legend{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;font-family:var(--mono);font-size:11px;color:var(--ink-soft)}
.legend .li{display:flex;align-items:center;gap:6px}
.swatch{width:11px;height:11px;border-radius:3px;display:inline-block}
.langrow{display:flex;align-items:center;gap:10px;margin-bottom:9px}
.langrow .name{font-family:var(--mono);font-size:12px;width:52px;color:var(--ink)}
.bar{flex:1;height:9px;background:var(--cream);border-radius:5px;overflow:hidden;border:1px solid var(--line)}
.bar > span{display:block;height:100%;background:linear-gradient(90deg,var(--pounamu),var(--pounamu-bright))}
.langrow .num{font-family:var(--mono);font-size:11px;color:var(--taupe);width:78px;text-align:right}
#tooltip{position:fixed;pointer-events:none;background:var(--ink);color:#fff;font-family:var(--mono);font-size:11px;padding:7px 9px;border-radius:8px;opacity:0;transition:opacity .1s;z-index:50;max-width:280px;box-shadow:0 6px 20px rgba(0,0,0,.25)}
#tooltip b{color:var(--amber)}
.detail{font-family:var(--mono);font-size:12px;color:var(--ink-soft);line-height:1.7}
.detail .dk{color:var(--taupe)}
footer{margin-top:26px;font-family:var(--mono);font-size:11px;color:var(--taupe);text-align:center}
</style>
</head>
<body>
<div class="wrap">
  <header class="hero">
    <div>
      <div class="eyebrow">codebase map</div>
      <div class="brand">assembl<span class="dot">.</span></div>
      <div class="subtitle" id="subtitle">a living map of the repository</div>
    </div>
    <div class="meta" id="meta"></div>
  </header>

  <section class="stats" id="stats"></section>

  <div class="grid">
    <div class="panel">
      <h2>directory treemap</h2>
      <div class="hint">click a folder to zoom in · hover for detail</div>
      <div id="metrics">
        <span class="mlabel">size by</span>
        <button data-m="s" class="on">bytes</button>
        <button data-m="l">lines</button>
        <button data-m="f">files</button>
      </div>
      <div id="crumbs"></div>
      <div id="treemap"></div>
      <div class="legend" id="legend"></div>
    </div>
    <div class="panel">
      <h2>languages</h2>
      <div class="hint">by lines of code (top 14)</div>
      <div id="langs"></div>
      <h2 style="margin-top:20px">selection</h2>
      <div class="hint">last hovered / focused node</div>
      <div class="detail" id="detail">Hover a tile to inspect.</div>
    </div>
  </div>

  <footer id="footer"></footer>
</div>
<div id="tooltip"></div>

<script id="data" type="application/json">${dataJson}</script>
<script>
const DATA = JSON.parse(document.getElementById('data').textContent);

// ---------- helpers ----------
const fmtBytes = (b) => {
  if (b < 1024) return b + ' B';
  const u = ['KB','MB','GB'];
  let i = -1; do { b /= 1024; i++; } while (b >= 1024 && i < u.length - 1);
  return b.toFixed(b < 10 ? 1 : 0) + ' ' + u[i];
};
const fmtNum = (n) => n.toLocaleString();

// color palette for extensions
const EXT_COLOR = {
  ts:'#2B6B57', tsx:'#1A4D3D', js:'#D9A85A', jsx:'#B8964F', mjs:'#8a6d3b', cjs:'#8a6d3b',
  json:'#5C6273', css:'#4FA887', scss:'#3f8a70', md:'#9D8C7D', mdx:'#8a7a6c',
  sql:'#6b7a8f', sh:'#556', yml:'#7a8', yaml:'#7a8', svg:'#c98f4a', html:'#c46', py:'#4b6',
};
const DIR_COLORS = ['#2B6B57','#1A4D3D','#4FA887','#D9A85A','#B8964F','#5C6273','#7a8f6b','#8f6b7a','#6b7a8f','#9D8C7D','#3f8a70','#c98f4a'];
const colorForExt = (e) => EXT_COLOR[e] || '#9D8C7D';

// ---------- stats ----------
(function(){
  const t = DATA.totals;
  const cards = [
    ['files', fmtNum(t.files)],
    ['directories', fmtNum(t.dirs)],
    ['lines of code', fmtNum(t.lines)],
    ['on-disk size', fmtBytes(t.bytes)],
  ];
  document.getElementById('stats').innerHTML = cards.map(
    ([k,v]) => '<div class="stat"><div class="k">'+k+'</div><div class="v">'+v+'</div></div>'
  ).join('');
  document.getElementById('meta').innerHTML =
    'repo: <b>'+DATA.repo+'</b><br>generated '+new Date(DATA.generatedAt).toISOString().replace('T',' ').slice(0,16)+' UTC';
  document.getElementById('footer').textContent =
    'assembl codebase map · '+fmtNum(t.files)+' files · '+fmtNum(t.lines)+' lines · generated '+DATA.generatedAt;
})();

// ---------- languages ----------
(function(){
  const langs = DATA.languages.filter(l => l.lines > 0).slice(0, 14);
  const max = Math.max(...langs.map(l => l.lines), 1);
  document.getElementById('langs').innerHTML = langs.map(l =>
    '<div class="langrow">'+
      '<span class="name" style="color:'+colorForExt(l.ext)+'">.'+l.ext+'</span>'+
      '<span class="bar"><span style="width:'+(l.lines/max*100).toFixed(1)+'%;background:'+colorForExt(l.ext)+'"></span></span>'+
      '<span class="num">'+fmtNum(l.lines)+'</span>'+
    '</div>'
  ).join('');
})();

// ---------- treemap ----------
const tm = document.getElementById('treemap');
const tooltip = document.getElementById('tooltip');
const detail = document.getElementById('detail');
let stack = [DATA.tree]; // navigation stack; last = focused node
let metric = 's'; // 's' bytes | 'l' lines | 'f' files
const METRIC_LABEL = { s:'bytes', l:'lines', f:'files' };

function focused(){ return stack[stack.length - 1]; }

// value of a node under the current metric
function valueOf(node){
  if (metric === 'f') return node.c ? node.f : 1;
  if (metric === 'l') return node.l;
  return node.s;
}
function fmtMetric(node){
  if (metric === 'f') return fmtNum(node.c ? node.f : 1) + (node.c ? ' files' : ' file');
  if (metric === 'l') return fmtNum(node.l) + ' lines';
  return fmtBytes(node.s);
}

function showTip(html, x, y){
  tooltip.innerHTML = html;
  tooltip.style.opacity = '1';
  const pad = 14;
  let left = x + pad, top = y + pad;
  const w = tooltip.offsetWidth, h = tooltip.offsetHeight;
  if (left + w > window.innerWidth) left = x - w - pad;
  if (top + h > window.innerHeight) top = y - h - pad;
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}
function hideTip(){ tooltip.style.opacity = '0'; }

function setDetail(node){
  const isDir = !!node.c;
  detail.innerHTML =
    '<div><span class="dk">name:</span> '+node.n+'</div>'+
    '<div><span class="dk">path:</span> '+(node.p||'/')+'</div>'+
    '<div><span class="dk">type:</span> '+(isDir?'directory':'.'+ (node.e||'file'))+'</div>'+
    (isDir?'<div><span class="dk">files:</span> '+fmtNum(node.f)+'</div>':'')+
    '<div><span class="dk">lines:</span> '+fmtNum(node.l)+'</div>'+
    '<div><span class="dk">size:</span> '+fmtBytes(node.s)+'</div>';
}

// squarified treemap layout
function squarify(children, x, y, w, h){
  const nodes = children.map(c => ({ ref:c, value: Math.max(valueOf(c), 0.0001) }));
  const total = nodes.reduce((s,n)=>s+n.value,0) || 1;
  const area = w * h;
  nodes.forEach(n => n.area = n.value / total * area);
  const out = [];
  let rx = x, ry = y, rw = w, rh = h;

  function worst(row, len){
    const sum = row.reduce((s,n)=>s+n.area,0);
    const max = Math.max(...row.map(n=>n.area));
    const min = Math.min(...row.map(n=>n.area));
    const s2 = sum*sum, l2 = len*len;
    return Math.max(l2*max/s2, s2/(l2*min));
  }
  function layoutRow(row, len, horizontal){
    const sum = row.reduce((s,n)=>s+n.area,0);
    const thick = sum / len;
    let off = 0;
    for (const n of row){
      const cell = n.area / thick;
      if (horizontal){
        out.push({ ref:n.ref, x: rx, y: ry + off, w: thick, h: cell });
      } else {
        out.push({ ref:n.ref, x: rx + off, y: ry, w: cell, h: thick });
      }
      off += cell;
    }
    if (horizontal){ rx += thick; rw -= thick; }
    else { ry += thick; rh -= thick; }
  }

  let i = 0;
  while (i < nodes.length){
    const horizontal = rw < rh ? false : true; // choose shorter side
    const len = horizontal ? rh : rw;
    let row = [nodes[i]];
    let j = i + 1;
    while (j < nodes.length){
      const test = row.concat(nodes[j]);
      if (worst(test, len) <= worst(row, len)) { row = test; j++; }
      else break;
    }
    layoutRow(row, len, horizontal);
    i = j;
  }
  return out;
}

function renderCrumbs(){
  const el = document.getElementById('crumbs');
  el.innerHTML = '';
  stack.forEach((node, idx) => {
    const b = document.createElement('button');
    b.textContent = idx === 0 ? (DATA.repo + '/') : node.n;
    b.onclick = () => { stack = stack.slice(0, idx + 1); render(); };
    el.appendChild(b);
    if (idx < stack.length - 1){
      const s = document.createElement('span');
      s.className = 'sep'; s.textContent = '›';
      el.appendChild(s);
    }
  });
}

function render(){
  const node = focused();
  renderCrumbs();
  setDetail(node);
  document.getElementById('subtitle').textContent =
    node.p ? node.p + '/' : 'a living map of the repository';
  tm.innerHTML = '';
  const children = (node.c || [])
    .filter(c => valueOf(c) > 0)
    .sort((a,b)=>valueOf(b) - valueOf(a));
  if (!children.length){
    tm.innerHTML = '<div style="padding:20px;font-family:var(--mono);color:var(--taupe)">nothing to show for this metric</div>';
    return;
  }
  const W = tm.clientWidth, H = tm.clientHeight;
  const rects = squarify(children, 0, 0, W, H);
  const topLevel = stack.length === 1;
  let ci = 0;
  for (const r of rects){
    const c = r.ref;
    const isDir = !!c.c;
    const div = document.createElement('div');
    div.className = 'tile' + (isDir ? '' : ' file');
    if (r.w < 90 || r.h < 46) div.classList.add('small');
    if (r.w < 58 || r.h < 32) div.classList.add('tiny');
    if (r.w < 40 || r.h < 22) div.classList.add('micro');
    div.style.left = r.x + 'px'; div.style.top = r.y + 'px';
    div.style.width = Math.max(r.w - 0, 0) + 'px'; div.style.height = Math.max(r.h - 0, 0) + 'px';
    let bg;
    if (isDir){ bg = topLevel ? DIR_COLORS[ci % DIR_COLORS.length] : 'var(--pounamu)'; ci++; }
    else bg = colorForExt(c.e);
    div.style.background = bg;
    const label = c.n + (isDir ? '/' : '');
    div.innerHTML = '<div class="tn">'+label+'</div>'+
      '<div class="ts">'+fmtMetric(c)+'</div>';
    div.addEventListener('mousemove', (e)=>{
      showTip('<b>'+label+'</b><br>'+(isDir?fmtNum(c.f)+' files · ':'') +
        fmtNum(c.l)+' lines · '+fmtBytes(c.s), e.clientX, e.clientY);
      setDetail(c);
    });
    div.addEventListener('mouseleave', hideTip);
    if (isDir){
      div.addEventListener('click', ()=>{ stack.push(c); hideTip(); render(); });
    }
    tm.appendChild(div);
  }
}

// top-level dir legend
(function(){
  const el = document.getElementById('legend');
  const dirs = (DATA.tree.c||[]).filter(c=>c.c).sort((a,b)=>b.s-a.s).slice(0,12);
  el.innerHTML = dirs.map((d,i)=>
    '<span class="li"><span class="swatch" style="background:'+DIR_COLORS[i%DIR_COLORS.length]+'"></span>'+d.n+'/</span>'
  ).join('');
})();

// metric toggle
document.querySelectorAll('#metrics button').forEach(btn => {
  btn.addEventListener('click', () => {
    metric = btn.dataset.m;
    document.querySelectorAll('#metrics button').forEach(b => b.classList.toggle('on', b === btn));
    hideTip();
    render();
  });
});

window.addEventListener('resize', () => render());
render();
</script>
</body>
</html>`;
}
