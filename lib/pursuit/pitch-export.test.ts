import { describe,it,expect } from 'vitest';
import { buildPitchHtml,escapeHtml } from './pitch-export';
import { searchPublicKnowledge } from './public-knowledge';
import type { PublicPresentationResult } from './public-contract';
import { readFileSync } from 'node:fs';

describe('public pursuit export and copy',()=>{
  it('escapes untrusted markup',()=>{ expect(escapeHtml('<script>"&')).toBe('&lt;script&gt;&quot;&amp;'); });
  it('creates six source-linked editable slides, not executable generated markup',()=>{
    const r={draft:{company:'Example & Co',title:'A <script>proposal</script>',summary:'A proposed piece of work for review.',evidence:[{claim:'A published source.',url:'https://www.nzbn.govt.nz/'}],opportunity:'Propose a source-backed next step.',proposedWork:'Prepare a small demonstrator for review.',deliverables:['A source brief','A demonstrator'],nextSteps:['Review sources','Discuss scope'],unknowns:['Budget is not known']},trace:{at:'2026-09-18T00:00:00Z'}} as PublicPresentationResult;
    const html=buildPitchHtml(r);
    expect(html.match(/<section id=/g)).toHaveLength(6);expect(html).toContain('contenteditable="true"');expect(html).toContain('https://www.nzbn.govt.nz/');expect(html).not.toContain('<script>');expect(html).toContain('#240b21');expect(html).toContain('DRAFT');
  });
  it('searches only owned public records',()=>{const r=searchPublicKnowledge('Pursuit Studio');expect(r.length).toBeGreaterThan(0);expect(r.every(x=>x.scope==='owned_public')).toBe(true);expect(searchPublicKnowledge('zzzzzzzzz')).toHaveLength(0);});
  it('keeps new public copy specific and source honest',()=>{
    for(const path of ['components/site/pursuit/LivePursuitCanvas.tsx','components/site/pursuit/PursuitLanding.tsx','app/tools/agents/page.tsx']){
      const text=readFileSync(path,'utf8');expect(text).not.toMatch(/\b(quiet|quietly|seamless|unlock|unleash|revolutionary|game-changing|world-class)\b/i);
    }
  });
});

it('labels direct-source exports without claiming web research',()=>{
 const direct={mode:'direct_source_brief',draft:{company:'assembl',title:'Scoped review proposal',summary:'A hypothetical small consultancy engagement.',evidence:[{claim:'The source describes human review.',url:'https://www.assembl.co.nz/'}],opportunity:'Propose a human review assessment.',proposedWork:'Prepare a small workflow demonstrator.',deliverables:['A source brief','A demonstrator'],nextSteps:['Review sources','Discuss scope'],unknowns:['Demand remains unknown']},trace:{at:'2026-10-02T00:00:00Z'}} as PublicPresentationResult;const html=buildPitchHtml(direct);expect(html).toContain('zero web searches');expect(html).toContain('Publication dates unknown');expect(html).not.toContain('live web research');
});

 it('keeps the full unverified visitor brief in JSON and safely escaped in the starter-plan deck',()=>{
 const goal='Explore a <script>alert("fixture")</script> experience & a useful service handoff.';
 const r={mode:'direct_source_brief',scopedPlan:{kind:'authored_starter_plan',yourBrief:goal,focus:'creative'},draft:{company:'assembl',title:'Proposal: make the selected idea tangible',summary:'A bounded proposal for review.',evidence:[{claim:'A public source quotation.',url:'https://www.assembl.co.nz/'}],opportunity:'Propose a small creative investigation.',proposedWork:'Prepare a demonstration to review.',deliverables:['A proposed brief','A demonstration'],nextSteps:['Review sources','Discuss scope'],unknowns:['Demand remains unknown']},trace:{at:'2026-10-02T00:00:00Z'}} as PublicPresentationResult;
 const html=buildPitchHtml(r);expect(JSON.parse(JSON.stringify(r)).scopedPlan.yourBrief).toBe(goal);expect(html).toContain(escapeHtml(goal));expect(html).not.toContain('<script>');expect(html).toContain('Your brief');expect(html).toContain('Unverified user input');expect(html).toContain('AUTHORED STARTER PLAN');expect(html).toContain('not bespoke discovery');expect(html).toContain('Creative work or an interactive experience');expect(html.match(/<section id=/g)).toHaveLength(7);
 });
