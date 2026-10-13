import { z } from 'zod/v3';
import { PURSUIT_EXAMPLES } from '@/components/site/pursuit/pursuit-examples';
import type { VideoDesign } from './motion-video';

export const MAX_PROJECT_BYTES = 32 * 1024;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const line = (max: number) => z.string().trim().min(1).max(max).refine(value => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value), 'Unsupported control character');
export const publicProjectSchema = z.object({
  kind: z.literal('assembl-public-storyboard'),
  version: z.literal(1),
  example: z.enum(['property', 'customer', 'services']),
  title: line(80),
  brief: line(600),
  concept: line(300),
  format: z.enum(['landscape', 'portrait', 'square']),
  seconds: z.union([z.literal(4), z.literal(6), z.literal(8)]),
  scenes: z.array(z.object({ title: line(80), body: line(240) }).strict()).length(4),
}).strict();
export type PublicProject = z.infer<typeof publicProjectSchema>;
export function seedProject(id = 'customer'): PublicProject {
  const example = PURSUIT_EXAMPLES.find(item => item.id === id) ?? PURSUIT_EXAMPLES[1];
  const company = example.companies[0];
  return {
    kind: 'assembl-public-storyboard', version: 1, example: example.id,
    title: company.name, brief: example.signal, concept: company.opportunity,
    format: 'landscape', seconds: 4,
    scenes: [
      { title: company.headline, body: company.support },
      { title: 'An opening to explore.', body: example.signal },
      { title: example.choices[0].name, body: company.opportunity },
      { title: 'Start a conversation.', body: example.unknown },
    ],
  };
}
export function parsePublicProject(text: string): PublicProject {
  if (new TextEncoder().encode(text).byteLength > MAX_PROJECT_BYTES) throw Error('Project is too large. Choose a Studio project under 32 KB.');
  try { return publicProjectSchema.parse(JSON.parse(text)); }
  catch { throw Error('This is not a supported Studio project. Use an exported version 1 project with four scenes; media and extra fields are not accepted.'); }
}
export function exportPublicProject(project: PublicProject): string {
  return JSON.stringify(publicProjectSchema.parse(project), null, 2);
}
export function projectVideo(project: PublicProject, font: string): VideoDesign {
  return {
    client: project.title, approved: null,
    scenes: project.scenes.map((scene, i) => ({ ...scene, label: ['THE POSSIBILITY', 'THE OPPORTUNITY', 'THE CONCEPT', 'THE NEXT STEP'][i] })),
    frame: { tokens: { ink: '#240B21', font }, content: { headline: '', intro: '', problem: '', solution: '', next: '' } },
  };
}
export function validateMedia(file: Pick<File, 'size' | 'type'>, kind: 'image' | 'audio') {
  const allowed = kind === 'image' ? ['image/png', 'image/jpeg', 'image/webp'] : ['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/webm'];
  const limit = kind === 'image' ? MAX_IMAGE_BYTES : MAX_AUDIO_BYTES;
  if (!file.size || file.size > limit || !allowed.includes(file.type)) {
    throw Error(kind === 'image' ? 'Choose a PNG, JPEG or WebP image up to 5 MB. SVG and animated formats are not supported.' : 'Choose WAV, MP3, M4A, Ogg or WebM audio up to 10 MB.');
  }
}
