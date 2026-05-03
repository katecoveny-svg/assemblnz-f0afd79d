/**
 * Minimal type declaration for js-yaml (already in project deps, @types not installed).
 * Only the functions used by the simulator are declared here.
 */
declare module 'js-yaml' {
  export function load(input: string): unknown;
}
