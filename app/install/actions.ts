'use server';

import { createInstall, type InstallResult } from '@/lib/living-site/install-store';

/**
 * The installer's generate step — the visitor's ten answers become real
 * genome rows under a fresh install tenant. Validation, caps and the write
 * all live in lib/living-site/install-store.
 */
export async function generateInstall(
  industry: string,
  answers: Record<string, string>,
): Promise<InstallResult> {
  return createInstall(industry, answers);
}
