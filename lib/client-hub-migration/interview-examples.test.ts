import {describe,it,expect} from 'vitest';
import {createInterviewExample,independentNotice,interviewExamples,interviewArtworkFor} from './interview-examples';
import {conceptPublicData,conceptExperienceHtml} from '@/components/client-hub-migration/original/lib/concept-experience';
import {hubArtworkPolicy} from './visual-policy';
describe('independent interview examples',()=>{
 it.each(interviewExamples)('keeps $key synthetic, editable and explicit about its boundary',({key})=>{
  const h=createInterviewExample(key);expect(h.sources).toEqual([]);expect(h.privateNotes).toBe('');expect(h.research).toBe('');
  expect(h.engine?.concepts[0].journey.options).toHaveLength(3);expect(h.engine?.concepts[0].why).toContain(independentNotice);
  const selected=conceptPublicData({...h,privateNotes:'PRIVATE_SENTINEL',research:'PRIVATE_SENTINEL'});
  expect(JSON.stringify(selected)).not.toContain('PRIVATE_SENTINEL');expect(selected?.seller).toBe('Kate Hudson');
  expect(h.clientBrand).toBeUndefined();expect(h.cinema?.mode).toBe('still');
 });
 it('uses relevant airport/workflow imagery and no marina fallback',()=>{expect(hubArtworkPolicy(createInterviewExample('airnz')).src).toBe('/cinematic/concept-travel.webp');expect(hubArtworkPolicy(createInterviewExample('pwc')).src).toBe('/cinematic/interview-advisory.svg');});
 it('retains three substantial Deloitte ideas with distinct diagrams and no invented checked evidence',()=>{
  const h=createInterviewExample('deloitte'),ideas=h.engine!.concepts;
  expect(ideas.map(x=>x.title)).toEqual(['Cloud Platform Client Landscape Map','Role-Ready Research Pack','Evidence-to-Conversation Brief']);
  expect(new Set(ideas.map(x=>interviewArtworkFor(x.id)?.src)).size).toBe(3);
  expect(h.engine!.evidence).toEqual([]);expect(h.sources).toEqual([]);
 });
 it('carries the selected role-ready visual and original interactive controls into the presentation',()=>{
  const h=createInterviewExample('deloitte'),idea=h.engine!.concepts[1];h.engine!.selected=idea.id;h.design.frame.artwork=interviewArtworkFor(idea.id);
  const html=conceptExperienceHtml(h,undefined,'http://127.0.0.1:19189');
  expect(html).toContain('interview-research.svg');expect(html).toContain('Platform engineer');expect(html).toContain('id="permission"');expect(html).toContain('id="prepare"');expect(html).not.toContain('assembl-plum-aerial');
 });
});
