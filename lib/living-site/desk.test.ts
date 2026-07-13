import { describe, expect, it } from 'vitest';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import { deterministicDeskAnswer, genomeFactsCitedInAnswer, rankGenomeFacts } from './desk';

const facts: GenomeFact[] = [
  { id: 'service', section: 'services', label: 'Initial assessment', value: '$95 · 45 min', readBy: ['website'] },
  { id: 'g-booking-rules', section: 'operations', label: 'Booking rules', value: '24h cancellation', readBy: ['booking'] },
  { id: 'safety', section: 'knowledge', label: 'Safety policy', value: 'Urgent issues go to a clinician', readBy: ['support'] },
];

describe('Living Site resident desk', () => {
  it('ranks exact label matches first', () => {
    expect(rankGenomeFacts('What is the safety policy?', facts)[0]?.id).toBe('safety');
  });

  it('answers price questions from service facts', () => {
    const result = deterministicDeskAnswer({ question: 'How much is an assessment?', facts, businessName: 'Sample Clinic', owner: 'Mia' });
    expect(result.answer).toContain('$95');
    expect(result.answer).toContain('Mia confirms');
  });

  it('never claims a requested time is confirmed', () => {
    const result = deterministicDeskAnswer({ question: 'Can I book tomorrow?', facts, businessName: 'Sample Clinic', owner: 'Mia' });
    expect(result.answer).toContain('not confirmed');
  });

  it('derives displayed sources from citations in the generated answer', () => {
    expect(genomeFactsCitedInAnswer('The assessment costs $95 [service].', facts).map((fact) => fact.id)).toEqual(['service']);
    expect(genomeFactsCitedInAnswer('No source marker.', facts)).toEqual([]);
  });
});
