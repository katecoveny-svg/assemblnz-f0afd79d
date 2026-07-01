/** Cookie set once the demo password is accepted. Shared by the unlock server
 *  action and the layout gate check. Kept out of the 'use server' module because
 *  those may only export async functions. */
export const UNLOCK_COOKIE = 'az_demo_unlock';
