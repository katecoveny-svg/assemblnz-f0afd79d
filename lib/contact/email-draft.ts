/** A local email handoff, never a submission or stored lead. */
export const CONTACT_EMAIL = 'assembl@assembl.co.nz';
export const PROJECT_TOPICS = [
  { value: 'experience', label: 'Website or experience', prompt: 'Who is it for, and what should they be able to do?' },
  { value: 'workflow', label: 'A better way to work', prompt: 'What takes too much time, and what would a better result look like?' },
  { value: 'idea', label: 'An idea to explore', prompt: 'What is the opportunity, and what would you like to test first?' },
  { value: 'other', label: 'Something else', prompt: 'Tell us where you are now and what you would like to change.' },
] as const;
export type ContactBrief = { name: string; email: string; business: string; topic: string; message: string };
export function initialProjectTopic(product?: string): string {
  return ({ pursuit: 'idea', do: 'workflow', studio: 'experience', system: 'other' } as Record<string, string>)[product ?? '']
    ?? (PROJECT_TOPICS.some(topic => topic.value === product) ? product! : 'other');
}
export function contactEmailDraft(brief: ContactBrief) {
  const clean = (value: string, max: number) => value.trim().slice(0, max);
  const topic = PROJECT_TOPICS.find(topic => topic.value === brief.topic)?.label ?? 'Something else';
  const subject = `assembl enquiry — ${topic}`;
  const body = ['Kia ora assembl,', '', clean(brief.message, 4000), '', `Name: ${clean(brief.name, 120)}`, `Reply email: ${clean(brief.email, 254)}`, ...(brief.business.trim() ? [`Business: ${clean(brief.business, 160)}`] : []), `Project: ${topic}`].join('\n');
  return { to: CONTACT_EMAIL, subject, body, href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}
