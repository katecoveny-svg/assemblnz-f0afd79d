import { safeReturnPath } from '@/lib/auth/redirect';

/** Preserve only known non-content tool selectors when returning from DO sign-in. */
export function doReturnPath(pathname: string, search = ''): string {
  const path = safeReturnPath(pathname, '/do');
  if (!/^\/do(?:\/|$)/.test(path) || path.includes('?') || path.includes('#')) return '/do';
  const source = new URLSearchParams(search), target = new URLSearchParams();
  const task = source.get('task'), tool = source.get('tool');
  if (task && ['reply', 'rewrite', 'plan', 'brief', 'meeting-notes', 'compare', 'extract'].includes(task)) target.set('task', task);
  if (tool && ['write', 'talk', 'look'].includes(tool)) target.set('tool', tool);
  if (source.get('phone') === '1') target.set('phone', '1');
  return `${path}${target.size ? `?${target}` : ''}`;
}
