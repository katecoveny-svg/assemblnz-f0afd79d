'use client';

import { DoBuilder } from './DoBuilder';
import { DoGeminiLive } from './DoGeminiLive';

export function DoWorkspace(props: React.ComponentProps<typeof DoBuilder>) {
  return (
    <>
      <DoGeminiLive />
      <DoBuilder {...props} />
    </>
  );
}
