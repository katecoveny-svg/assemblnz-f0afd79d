import type { ReactNode } from 'react';

export function TeReo({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <span lang="mi" title={title} className={className}>
      {children}
    </span>
  );
}

