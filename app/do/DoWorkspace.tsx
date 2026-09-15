'use client';

import type { ComponentProps } from 'react';
import { DoBuilder } from './DoBuilder';
import { DoGeminiLive } from './DoGeminiLive';

export function DoWorkspace(props: ComponentProps<typeof DoBuilder>) {
  return (
    <>
      <DoGeminiLive embedded={Boolean(props.embedded)} />
      <DoBuilder {...props} />
    </>
  );
}
