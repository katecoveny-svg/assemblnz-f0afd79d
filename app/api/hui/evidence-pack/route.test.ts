import { describe, expect, it, vi } from 'vitest';
const rendered = vi.hoisted(() => vi.fn((pack: unknown) => { void pack; return Buffer.from('mock PDF'); }));
vi.mock('@/lib/hui/evidence-pdf', () => ({ renderHuiEvidencePdf: rendered }));
import { POST } from './route';
import { DEFAULT_HUI_TEMPLATE_ID } from '@/lib/hui/templates';
describe('meeting export provenance', () => {
  it('retains raw-note fallback in the hashed export and removes attributes', async () => {
    const response = await POST(new Request('http://localhost/api/hui/evidence-pack', { method: 'POST', body: JSON.stringify({ templateId: DEFAULT_HUI_TEMPLATE_ID, provenance: 'raw-notes-fallback', title: 'Fictional', html: '<h2 onclick="x()">Raw notes</h2><p>No decisions made.</p>' }) }));
    expect(response.status).toBe(200);
    const pack = rendered.mock.calls.at(-1)?.[0] as any;
    expect(JSON.stringify(pack)).toContain('raw-notes-fallback');
    expect(JSON.stringify(pack)).not.toContain('onclick');
    expect(pack.sections[1].draftedBy).toBe('user-supplied raw notes');
    expect(pack.status).toBe('draft');
  });
});
it('rejects oversized export input before rendering', async () => {
 rendered.mockClear();
 const response=await POST(new Request('http://localhost',{method:'POST',body:JSON.stringify({templateId:DEFAULT_HUI_TEMPLATE_ID,html:'x'.repeat(80001)})}));
 expect(response.status).toBe(400);expect(rendered).not.toHaveBeenCalled();
});
