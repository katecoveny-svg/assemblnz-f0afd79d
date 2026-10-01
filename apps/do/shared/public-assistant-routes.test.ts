import { describe, expect, it } from 'vitest';
import { publicDoAssistantIsolated } from './public-assistant-routes';
describe('Public assistant route isolation at every viewport', () => {
  it.each(['/do', '/do/personal', '/pursuit', '/admin/jobs', '/auth/callback', '/login', '/signup', '/start', '/start/signup', '/echo', '/echo/session', '/studio', '/studio/project', '/build-an-agent', '/build-an-agent/review', '/agents/example/chat', '/customers/winger', '/for/winger', '/preview/home'])('suppresses the public panel on %s', path => expect(publicDoAssistantIsolated(path)).toBe(true));
  it.each(['/', '/contact', '/pricing', '/about', '/field-notes'])('allows company drafting on %s', path => expect(publicDoAssistantIsolated(path)).toBe(false));
});
