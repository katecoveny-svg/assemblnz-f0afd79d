import { Suspense } from 'react';
import { AssembledExperience } from '@/components/customers/everyday-rewards/assembled/AssembledExperience';

export default function AssembledPage() {
  return (
    <Suspense fallback={null}>
      <AssembledExperience />
    </Suspense>
  );
}
