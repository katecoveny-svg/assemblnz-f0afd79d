import { afterEach, describe, expect, it, vi } from 'vitest';
import { isProductionDeploy, showPreviewDeployLabel } from '@/lib/deploy-env';

describe('deploy-env', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('hides the preview label on Vercel production', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
    expect(isProductionDeploy()).toBe(true);
    expect(showPreviewDeployLabel()).toBe(false);
  });

  it('shows the preview label on Vercel preview', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');
    expect(isProductionDeploy()).toBe(false);
    expect(showPreviewDeployLabel()).toBe(true);
  });

  it('shows the preview label when env is unset (local)', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', undefined);
    vi.stubEnv('VERCEL_ENV', undefined);
    expect(isProductionDeploy()).toBe(false);
    expect(showPreviewDeployLabel()).toBe(true);
  });
});
