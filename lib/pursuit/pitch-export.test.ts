import { describe,it,expect } from 'vitest';
import { buildPitchHtml,escapeHtml } from './pitch-export';
import { searchPublicKnowledge } from './public-knowledge';
import type { PublicResearchResult } from './public-contract';
import { readFileSync } from 'node:fs';

describe('public pursuit export and copy',()=>{
  it('escapes untrusted markup',()=>{ expect(escapeHtml('<script>"&')).toBe('&lt;script&gt;&quot;&amp;'); });
  it('creates six source-linked editable slides, not executable generated markup',()=>{
    const r={draft:{company:'Example & Co',title:'A <script>proposal</script>',summary:'A proposed piece of work for review.',evidence:[{claim:'A published source.',url:'https://www.nzbn.govt.nz/'}],opportunity:'Propose a source-backed next step.',proposedWork:'Prepare a small demonstrator for review.',deliverables:['A source brief','A demonstrator'],nextSteps:['Review sources','Discuss scope'],unknowns:['Budget is not known']},trace:{at:'2026-09-18T00:00:00Z'}} as PublicResearchResult;
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
