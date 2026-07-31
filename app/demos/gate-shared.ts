/**
 * Shared /demos gate constants — kept out of gate-action.ts because a
 * 'use server' module may only export async functions.
 */
export const DEMOS_COOKIE = 'assembl_demos';

export type DemosGateState = { status: 'idle' } | { status: 'error'; message: string };
