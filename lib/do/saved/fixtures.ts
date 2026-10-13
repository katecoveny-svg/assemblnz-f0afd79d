import type { SavedItem } from './save-intent';
/** Original fictional examples; asset provenance in docs/do-saved/README.md. */
export const savedExamples: SavedItem[] = [
  { id: 'example-home', kind: 'image', title: 'A little more room to breathe', text: 'Fictional timber terrace study. Keep the courtyard, generous windows and warm materials as ideas for a future space.', image: '/brand/agent-studies/arc-harbour-terraces.webp', tags: ['space', 'timber', 'home'] },
  { id: 'example-note', kind: 'note', title: 'Make space for the good bits.', text: 'A slower morning. A table big enough for friends. Something growing by the window.\n\nSmall things worth making room for.', tags: ['weekend', 'ideas'] },
  { id: 'example-studio', kind: 'image', title: 'Ideas taking shape', text: 'Fictional Assembl concept art. Paper, light and a quiet corner to make something.', image: '/studio/assembly/creative-work-taking-shape.webp', tags: ['creative', 'rose', 'light'] },
  { id: 'example-material', kind: 'image', title: 'How the pieces come together', text: 'Original conceptual timber construction illustration. An inspiration reference, not construction advice.', image: '/brand/agent-studies/arc-exploded-model.webp', tags: ['design', 'timber'] },
  { id: 'example-quote', kind: 'text', title: 'Start with one useful thing', text: 'Gather the ideas first. Choose one small next step when you are ready.', tags: ['words', 'focus'] },
  { id: 'example-link', kind: 'link', title: 'A place for a future adventure', text: 'Fictional bookmark example. Replace this with a public link you choose.', sourceUrl: 'https://example.com/', tags: ['weekend', 'travel'] },
].map(item => ({ version: 1, revision: 1, sourceUrl: '', createdAt: '2026-10-13T12:00:00.000Z', fictional: true, ...item }) as SavedItem);
