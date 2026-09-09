'use client';

import { Component, type ReactNode } from 'react';

/**
 * Isolates WebGL failures so a Canvas/drei crash cannot take down the
 * whole homepage (the classic Vercel "Application error" overlay).
 */
export class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (typeof console !== 'undefined') {
      console.warn('[cinematic-journey] WebGL stage failed; using fallback.', error);
    }
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback ?? <div className="cj-canvas cj-canvas-fallback" aria-hidden="true" />;
    }
    return this.props.children;
  }
}
