import { useMemo, useCallback } from 'react';
import { ihoRouter, type RoutingResult } from '@/data/agentSkillConfig';

/** Hook wrapping the IhoRouter for React components */
export function useIhoRouter() {
  const route = useCallback((intent: string): RoutingResult => {
    return ihoRouter.route(intent);
  }, []);

  return { route };
}
