import { describe, expect, it } from 'vitest';
import { doReturnPath } from './navigation';
import { DO_TASKS } from '@/apps/do/shared/preparation';
describe('DO sign-in return', () => {
  it('retains the actual task and capture tool', () => {
    expect(doReturnPath('/do/widget', '?task=plan&tool=look')).toBe('/do/widget?task=plan&tool=look');
    expect(doReturnPath('/do/meetings', '?phone=1')).toBe('/do/meetings?phone=1');
    expect(doReturnPath('/do')).toBe('/do');
    for (const task of DO_TASKS) expect(doReturnPath('/do/widget', `?task=${task.id}`)).toBe(`/do/widget?task=${task.id}`);
  });
  it('never forwards note contents, auth material or unknown selectors', () => {
    expect(doReturnPath('/do/widget', '?tool=look&note=private&token=secret&redirect=https://example.com')).toBe('/do/widget?tool=look');
    expect(doReturnPath('/do/widget', '?task=https://example.com&tool=unknown')).toBe('/do/widget');
    for (const path of ['https://example.com', '//example.com', '/app', '/do-other', '/do/../app']) expect(doReturnPath(path)).toBe('/do');
  });
  it('keeps native transient mode through sign-in only for its fixed widget route', () => {
    expect(doReturnPath('/do/widget','?nativeReview=1&tool=look&text=private&token=secret')).toBe('/do/widget?tool=look&nativeReview=1');
    expect(doReturnPath('/do/personal','?nativeReview=1')).toBe('/do/personal');
    expect(doReturnPath('/do/widget','?nativeReview=2')).toBe('/do/widget');
  });

});
