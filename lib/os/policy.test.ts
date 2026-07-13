import { describe, expect, it } from 'vitest';
import {
  TASK_STATUSES,
  canTransitionTask,
  classifyActionRisk,
  isTaskStatus,
  requiresApproval,
} from './policy';

describe('classifyActionRisk', () => {
  it('classifies external actions as high', () => {
    expect(classifyActionRisk('email_draft')).toBe('high');
    expect(classifyActionRisk('webhook')).toBe('high');
    expect(classifyActionRisk('spend_money')).toBe('high');
    expect(classifyActionRisk('change_pricing')).toBe('high');
  });

  it('classifies internal record work as medium', () => {
    expect(classifyActionRisk('create_draft')).toBe('medium');
    expect(classifyActionRisk('create_task')).toBe('medium');
    expect(classifyActionRisk('suggest_genome_fact')).toBe('medium');
  });

  it('classifies read-only work as low', () => {
    expect(classifyActionRisk('summarise')).toBe('low');
    expect(classifyActionRisk('search_knowledge')).toBe('low');
    expect(classifyActionRisk('read_genome')).toBe('low');
  });

  it('defaults unknown kinds to high — never automatic', () => {
    expect(classifyActionRisk('brand_new_capability')).toBe('high');
    expect(classifyActionRisk('')).toBe('high');
  });

  it('is case/whitespace tolerant', () => {
    expect(classifyActionRisk(' Email_Draft ')).toBe('high');
  });
});

describe('requiresApproval', () => {
  it('low never needs approval, high always does', () => {
    expect(requiresApproval('low')).toBe(false);
    expect(requiresApproval('high')).toBe(true);
    expect(requiresApproval('high', true)).toBe(true);
  });

  it('medium follows tenant policy, conservative by default', () => {
    expect(requiresApproval('medium')).toBe(true);
    expect(requiresApproval('medium', true)).toBe(false);
  });
});

describe('task state machine', () => {
  it('accepts the happy path: proposed → … → completed', () => {
    expect(canTransitionTask('proposed', 'awaiting_approval')).toBe(true);
    expect(canTransitionTask('awaiting_approval', 'ready')).toBe(true);
    expect(canTransitionTask('ready', 'running')).toBe(true);
    expect(canTransitionTask('running', 'completed')).toBe(true);
  });

  it('terminal states never transition', () => {
    for (const to of TASK_STATUSES) {
      expect(canTransitionTask('completed', to)).toBe(false);
      expect(canTransitionTask('cancelled', to)).toBe(false);
    }
  });

  it('failed may be retried, only to ready', () => {
    expect(canTransitionTask('failed', 'ready')).toBe(true);
    expect(canTransitionTask('failed', 'running')).toBe(false);
  });

  it('refuses skipping approval', () => {
    expect(canTransitionTask('awaiting_approval', 'running')).toBe(false);
    expect(canTransitionTask('awaiting_approval', 'completed')).toBe(false);
  });

  it('isTaskStatus guards unknown strings', () => {
    expect(isTaskStatus('running')).toBe(true);
    expect(isTaskStatus('nope')).toBe(false);
  });
});
