'use client';

// Keep the ESM-only package behind a local dynamic-import boundary. Next's
// preload resolution can use a require condition for the dynamic target;
// react-spline exports only an import condition. Its static ESM re-export here
// preserves client-only lazy loading without bypassing package exports.
export { default } from '@splinetool/react-spline';
