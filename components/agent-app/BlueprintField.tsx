'use client';

import type { ReactNode } from 'react';
import './blueprint-craft.css';

/**
 * BlueprintField — hairline grid on the plum field.
 * Reusable shell for agent-app verticals (Arc first; Forge later).
 */
export function BlueprintField({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'aside';
}) {
  return <Tag className={`bp-field ${className}`.trim()}>{children}</Tag>;
}
