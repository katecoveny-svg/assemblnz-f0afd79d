/**
 * Deployment environment helpers for UI that must differ between
 * Vercel production and preview/branch deploys.
 *
 * Prefer NEXT_PUBLIC_VERCEL_ENV (inlined into client bundles). Fall back to
 * VERCEL_ENV for server-only callers.
 */

function vercelEnv(): string | undefined {
  return process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;
}

/** True only on Vercel production deploys. */
export function isProductionDeploy(): boolean {
  return vercelEnv() === 'production';
}

/**
 * Show the "preview · not production" footer label only on preview/branch
 * (and local/dev) deploys — never on production.
 */
export function showPreviewDeployLabel(): boolean {
  return !isProductionDeploy();
}
