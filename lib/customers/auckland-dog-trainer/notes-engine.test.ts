import { describe, expect, it } from 'vitest';
import {
  transformSessionNotes,
  DEFAULT_NOTE,
} from '@/lib/customers/auckland-dog-trainer/notes-engine';

describe('Sam OS session notes engine', () => {
  it('transforms the Bruno sample into the six killer outputs', () => {
    const plan = transformSessionNotes(DEFAULT_NOTE);
    expect(plan.dogProfile.name).toBe('Bruno');
    expect(plan.dogProfile.breed).toMatch(/staffy/i);
    expect(plan.dogProfile.issues).toEqual(
      expect.arrayContaining(['reactivity', 'moving-object triggers', 'handler timing']),
    );
    expect(plan.weeklyHomework.length).toBeGreaterThanOrEqual(3);
    expect(plan.courseMatch.module).toMatch(/threshold/i);
    expect(plan.nextBooking.offer).toMatch(/reactivity/i);
    expect(plan.clientSummary).toMatch(/Bruno/);
    expect(plan.trainerHandover).toMatch(/Bruno/);
    expect(plan.followUp.message.length).toBeGreaterThan(20);
    expect(plan.contentIdea.length).toBeGreaterThan(10);
  });

  it('routes recall-focused notes to Recall Mastery', () => {
    const plan = transformSessionNotes(
      'Met Diesel today. Two-year-old lab cross. Selective hearing off-leash. Started recall proofing with ethical e-collar communication.',
    );
    expect(plan.dogProfile.name).toBe('Diesel');
    expect(plan.nextBooking.offer).toMatch(/recall/i);
    expect(plan.courseMatch.module).toMatch(/recall/i);
  });

  it('falls back safely on empty input', () => {
    const plan = transformSessionNotes('   ');
    expect(plan.dogProfile.name).toBeTruthy();
    expect(plan.weeklyHomework.length).toBeGreaterThan(0);
  });
});
