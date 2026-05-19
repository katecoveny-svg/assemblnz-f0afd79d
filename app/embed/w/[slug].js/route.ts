import { NextRequest } from 'next/server';
import { getKete } from '@/lib/kete';
import { getWorkflow } from '@/lib/workflows';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.pathname.split('/').pop()?.replace(/\.js$/, '') ?? '';
  const workflow = getWorkflow(slug);
  if (!workflow) {
    return new Response('console.warn("assembl workflow not found");', {
      status: 404,
      headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
    });
  }

  const kete = getKete(workflow.kete);
  const origin = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const script = `
(function () {
  var currentScript = document.currentScript;
  var tenant = currentScript && currentScript.getAttribute('data-org') || '';
  var host = ${JSON.stringify(origin)};
  var slug = ${JSON.stringify(workflow.slug)};
  var title = ${JSON.stringify(workflow.title)};
  var accent = ${JSON.stringify(kete.accent)};
  var root = document.createElement('div');
  root.id = 'assembl-w-' + slug;
  document.body.appendChild(root);
  var shadow = root.attachShadow({ mode: 'open' });
  shadow.innerHTML = '<style>' +
    ':host{all:initial}.aw-button{position:fixed;right:20px;bottom:20px;z-index:2147483000;border:0;border-radius:999px;background:'+accent+';color:#FAF7F2;padding:14px 18px;font:600 14px Inter,system-ui,sans-serif;box-shadow:0 14px 42px rgba(35,33,31,.22);cursor:pointer;display:inline-flex;align-items:center;gap:8px}.aw-button .aw-mark{font-family:Georgia,"Cormorant Garamond",serif;font-style:italic;font-weight:400;font-size:13px;opacity:.92}.aw-panel{position:fixed;right:20px;bottom:82px;z-index:2147483000;width:min(380px,calc(100vw - 40px));max-height:min(680px,calc(100vh - 120px));display:none;flex-direction:column;border:1px solid rgba(35,33,31,.14);border-radius:12px;background:#FAF7F2;color:#23211F;box-shadow:0 24px 90px rgba(35,33,31,.24);overflow:hidden;font:14px Inter,system-ui,sans-serif}.aw-panel.open{display:flex}.aw-head{padding:16px 18px;border-bottom:1px solid rgba(35,33,31,.10)}.aw-head .aw-eyebrow{display:block;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:rgba(35,33,31,.55);margin-bottom:6px}.aw-head .aw-eyebrow span{color:'+accent+';font-weight:700}.aw-head .aw-title{font-family:Georgia,"Cormorant Garamond",serif;font-size:20px;font-style:italic;font-weight:400;line-height:1.15}.aw-body{padding:16px;overflow:auto}.aw-body textarea{width:100%;min-height:120px;border:1px solid rgba(35,33,31,.16);border-radius:8px;padding:12px;font:14px Inter,system-ui,sans-serif;box-sizing:border-box}.aw-run{margin-top:10px;border:0;border-radius:999px;background:'+accent+';color:#fff;padding:10px 14px;font-weight:700;cursor:pointer}.aw-output{margin-top:14px;padding:12px;border-radius:8px;background:#fff;border:1px solid rgba(35,33,31,.10);line-height:1.5}.aw-foot{padding:12px 16px;border-top:1px solid rgba(35,33,31,.10);display:flex;align-items:center;justify-content:space-between;gap:8px;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(35,33,31,.55)}.aw-foot .aw-brand{color:'+accent+';font-family:Georgia,"Cormorant Garamond",serif;font-style:italic;text-transform:none;letter-spacing:0;font-size:14px;font-weight:400}.aw-foot a{color:inherit;text-decoration:none}.aw-foot a:hover{color:'+accent+'}' +
    '</style>' +
    '<button class="aw-button" type="button"><span class="aw-mark">assembl</span><span>·</span><span>'+title+'</span></button>' +
    '<section class="aw-panel" aria-label="'+title+' — by assembl">' +
    '<div class="aw-head"><span class="aw-eyebrow"><span>assembl</span> · workflow</span><div class="aw-title">'+title+'</div></div>' +
    '<div class="aw-body"><textarea placeholder="Paste the admin job your team needs drafted..."></textarea><button class="aw-run" type="button">Run workflow</button><div class="aw-output">Draft output will appear here.</div></div>' +
    '<div class="aw-foot"><span class="aw-brand">assembl</span><a target="_blank" rel="noreferrer" href="'+host+'/workflows/'+slug+'">Open on assembl.co.nz →</a></div>' +
    '</section>';
  var button = shadow.querySelector('.aw-button');
  var panel = shadow.querySelector('.aw-panel');
  var run = shadow.querySelector('.aw-run');
  var textarea = shadow.querySelector('textarea');
  var output = shadow.querySelector('.aw-output');
  button.addEventListener('click', function () { panel.classList.toggle('open'); });
  run.addEventListener('click', function () {
    output.textContent = 'Drafting...';
    fetch(host + '/api/workflows/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: slug, tenant: tenant, inputs: { brief: textarea.value } })
    }).then(function (res) { return res.text(); })
      .then(function (html) { output.innerHTML = html; })
      .catch(function () { output.textContent = 'This workflow is taking a short break. Open assembl.co.nz to try again.'; });
  });
})();`;

  return new Response(script, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
