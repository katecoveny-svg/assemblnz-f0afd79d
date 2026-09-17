import type { PublicResearchResult } from './public-contract';

/** Standalone, editable HTML slide deck. No external scripts, fonts or tracking. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export function buildPitchHtml(result: PublicResearchResult): string {
  const d = result.draft;
  const e = escapeHtml;
  const list = (items: string[]) => items.map(item => `<p>${e(item)}</p>`).join('');
  const sourceList = d.evidence.map((fact, index) => `<article><small>SOURCE ${index + 1}</small><p>${e(fact.claim)}</p><a href="${e(fact.url)}" rel="noopener noreferrer">${e(fact.url)}</a></article>`).join('');
  const pages = [
    `<small>ASSEMBL / PURSUIT / INDEPENDENT DRAFT</small><h1>${e(d.title)}</h1><p class="lead">${e(d.summary)}</p><p>${e(d.company)}</p>`,
    `<small>01 / WHAT THE SOURCES SAY</small><h2>The opening.</h2><div class="sources">${sourceList}</div>`,
    `<small>02 / PROPOSED OPPORTUNITY</small><h2>A reason to act.</h2><p class="lead">${e(d.opportunity)}</p><p>Proposal for discussion. Not evidence of customer demand or budget.</p>`,
    `<small>03 / PROPOSED WORK</small><h2>Build something useful.</h2><p class="lead">${e(d.proposedWork)}</p><div class="items">${list(d.deliverables)}</div>`,
    `<small>04 / REVIEW BEFORE SHARING</small><h2>What still needs checking.</h2><div class="items">${list(d.unknowns)}</div><p>Source-linked research is not independent verification.</p>`,
    `<small>05 / THE NEXT CONVERSATION</small><h2>Make the next move.</h2><div class="items">${list(d.nextSteps)}</div><p>Prepared with Assembl public knowledge and live web research. No message was sent, publication made or private hub updated.</p>`,
  ];
  return `<!doctype html><html lang="en-NZ"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${e(d.company)} / pursuit draft</title><style>
*{box-sizing:border-box}body{margin:0;background:#e8e1e5;color:#240b21;font-family:'Instrument Sans',Arial,sans-serif}nav{padding:18px;text-align:center;font-size:13px}nav a{color:inherit;margin:0 12px}section{position:relative;width:min(1200px,96vw);min-height:675px;margin:24px auto;padding:65px 75px 85px;background:#fffdfb;box-shadow:0 20px 60px #240b2118;overflow-wrap:anywhere}section:first-of-type{background:#240b21;color:#fffdfb;display:flex;flex-direction:column;justify-content:center}small{font-size:11px;letter-spacing:.13em;color:#916a70}section:first-of-type small{color:#d9bccb}h1{font-size:64px;max-width:17ch;line-height:1.02;letter-spacing:-.055em;font-weight:500;margin:32px 0}h2{font-size:48px;line-height:1.08;letter-spacing:-.045em;font-weight:500;margin:28px 0}p{font-size:19px;line-height:1.5;max-width:65ch}.lead{font-size:25px;line-height:1.5}.items{display:grid;grid-template-columns:1fr 1fr;gap:10px 40px}.items p{border-top:1px solid #916a7050;padding-top:18px}.sources{display:grid;grid-template-columns:1fr 1fr;gap:26px 40px}.sources p{font-size:17px}.sources a{font-size:11px;color:#654a4e;word-break:break-all}footer{position:absolute;bottom:28px;left:75px;right:75px;display:flex;justify-content:space-between;gap:20px;font-size:10px;letter-spacing:.03em;opacity:.75}.edit-note{font-size:12px;text-align:center} [contenteditable]:focus{outline:2px solid #916a70;outline-offset:8px}@media(max-width:700px){section{padding:35px 27px 80px;min-height:700px}h1{font-size:45px}h2{font-size:36px}.lead{font-size:21px}.items,.sources{grid-template-columns:1fr}footer{left:27px;right:27px}}@media print{@page{size:landscape;margin:0}body{background:#fff}nav,.edit-note{display:none}section{width:100%;height:100vh;min-height:0;margin:0;box-shadow:none;break-after:page;padding:45px 60px 70px}h1{font-size:52px}h2{font-size:39px}p{font-size:17px}.lead{font-size:21px}footer{left:60px;right:60px}}
</style><nav><a href="#slide-1">Start</a><a href="#slide-2">Evidence</a><a href="#slide-6">Next steps</a></nav><p class="edit-note">Editable draft. Click the slide text to edit it. Use your browser’s Print command for a PDF copy; enable background graphics. This is an HTML deck, not a PowerPoint file.</p>${pages.map((page, index) => `<section id="slide-${index + 1}"><div contenteditable="true" spellcheck="true" aria-label="Editable slide ${index + 1}">${page}</div><footer><span>assembl / ${e(d.company)} / DRAFT</span><span>${e(result.trace.at.slice(0,10))} / ${index + 1} of ${pages.length}</span></footer></section>`).join('')}</html>`;
}
