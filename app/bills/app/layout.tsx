import type { ReactNode } from 'react';
import { BillsShell } from '@/components/bills/BillsShell';

export default function BillsAppLayout({ children }: { children: ReactNode }) {
  return <BillsShell>{children}</BillsShell>;
}
