"use client";
import { useCallback, useLayoutEffect, useRef } from 'react';

// React 19.0-compatible event callback: external subscriptions keep a stable
// identity while invoking the latest committed workspace scope. Never write a
// ref during render or restart hydration on every editable draft change.
export function useCommittedCallback<A extends unknown[], R>(callback: (...args: A) => R) {
  const committed = useRef(callback);
  useLayoutEffect(() => { committed.current = callback; }, [callback]);
  return useCallback((...args: A) => committed.current(...args), []);
}
