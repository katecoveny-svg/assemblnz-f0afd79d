import type { PortableTask } from './contract';
import { CONTINUITY_BOUNDARY } from './contract';

/** Replaceable, inert preparation interface. Provider adapters must recheck consent,
 * entitlement and durable admission; neither memory nor tool authority is implied. */
export interface PortableExecutor {
  readonly id: 'worksheet-v1';
  prepare(task: Pick<PortableTask, 'id' | 'request' | 'context' | 'scope'>, signal?: AbortSignal): Promise<string>;
}
export const worksheetExecutor: PortableExecutor = {
  id: 'worksheet-v1',
  async prepare(task, signal) {
    signal?.throwIfAborted();
    return [
      'Editable EA worksheet · no model called', '', 'Request', task.request, '',
      'Selected context', ...task.context.map(item => `${item.label}: ${item.text}`),
      ...(task.context.length ? [] : ['No additional context selected.']), '',
      'Next steps to review', '1. Confirm dates, people and missing details.',
      '2. Draft the next message or checklist below.', '3. Review before taking any external action.', '',
      'Draft', '[Write or edit your draft here.]', '', CONTINUITY_BOUNDARY,
    ].join('\n');
  },
};
