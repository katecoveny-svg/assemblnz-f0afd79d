// ═══════════════════════════════════════════════
// ASSEMBL SELF-HEALING ENGINE — Retry & Recovery
// ═══════════════════════════════════════════════

export interface WorkflowStep {
  agentId: string;
  action: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'retrying' | 'healed';
  retryCount: number;
  maxRetries: number;
  error?: string;
  healingAction?: string;
  startedAt?: string;
  completedAt?: string;
}

export function createStep(agentId: string, action: string, maxRetries = 3): WorkflowStep {
  return { agentId, action, status: 'pending', retryCount: 0, maxRetries };
}

export async function executeWithHealing(
  step: WorkflowStep,
  executeFn: () => Promise<any>,
  healingFn?: () => Promise<any>,
  onStatusChange?: (step: WorkflowStep) => void
): Promise<any> {
  step.status = 'running';
  step.startedAt = new Date().toISOString();
  onStatusChange?.(step);

  for (let attempt = 0; attempt <= step.maxRetries; attempt++) {
    try {
      const result = await executeFn();
      step.status = 'success';
      step.completedAt = new Date().toISOString();
      onStatusChange?.(step);
      return result;
    } catch (error: any) {
      step.retryCount = attempt + 1;
      step.error = error?.message || 'Unknown error';

      if (attempt < step.maxRetries) {
        step.status = 'retrying';
        onStatusChange?.(step);
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
        continue;
      }

      // All retries exhausted — attempt healing
      if (healingFn) {
        try {
          step.status = 'healed';
          step.healingAction = 'Applied automatic fix';
          onStatusChange?.(step);
          return await healingFn();
        } catch {
          step.status = 'failed';
          step.healingAction = 'Automatic fix failed — queued for manual review';
          onStatusChange?.(step);
        }
      } else {
        step.status = 'failed';
        onStatusChange?.(step);
      }
    }
  }

  return null;
}

// ── Healing strategies ──

export const HEALING_STRATEGIES: Record<string, { description: string; action: string }> = {
  token_expired: {
    description: 'Connection token has expired',
    action: 'Queue data, show reconnect prompt with one-click re-auth',
  },
  rate_limit: {
    description: 'API rate limit exceeded',
    action: 'Queue message, process when rate limit resets',
  },
  timeout: {
    description: 'Request timed out',
    action: 'Retry with exponential backoff',
  },
  file_too_large: {
    description: 'File exceeds size limit',
    action: 'Auto-compress and retry',
  },
  smtp_error: {
    description: 'Email delivery failed',
    action: 'Queue for retry in 5 minutes, try backup service',
  },
};

// ── User-friendly error messages ──

export function getUserFriendlyError(agentName: string, error: string, healed: boolean): string {
  if (healed) {
    return `${agentName} hit an issue and fixed it automatically. Your data is safe.`;
  }

  if (/token|auth|expired|unauthorized/i.test(error)) {
    return `${agentName} couldn't connect because your access has expired. Your data is saved safely.`;
  }
  if (/rate|limit|throttle|429/i.test(error)) {
    return `${agentName} is handling a lot of requests right now. Your request is queued and will process shortly.`;
  }
  if (/timeout|timed out/i.test(error)) {
    return `${agentName} took too long to respond. Try again in a moment.`;
  }
  if (/size|large|too big/i.test(error)) {
    return `The file was too large to process. Try a smaller file or compress it first.`;
  }

  return `${agentName} encountered an issue. Your data is safe — try again in a moment.`;
}

// ── Workflow chain executor ──

export async function executeWorkflowChain(
  steps: WorkflowStep[],
  executors: Record<string, () => Promise<any>>,
  onStepChange?: (steps: WorkflowStep[], currentIndex: number) => void
): Promise<{ success: boolean; completedSteps: number; steps: WorkflowStep[] }> {
  let completedSteps = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const executor = executors[step.agentId];

    if (!executor) {
      step.status = 'failed';
      step.error = `No executor found for ${step.agentId}`;
      onStepChange?.(steps, i);
      break;
    }

    onStepChange?.(steps, i);

    await executeWithHealing(
      step,
      executor,
      undefined,
      () => onStepChange?.(steps, i)
    );

    if (step.status === 'success' || step.status === 'healed') {
      completedSteps++;
    } else {
      break; // Stop chain on failure
    }
  }

  return { success: completedSteps === steps.length, completedSteps, steps };
}
