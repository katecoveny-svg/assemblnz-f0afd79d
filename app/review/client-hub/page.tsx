import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ConceptStudio from '@/components/client-hub-migration/original/app/hub/concept-studio';
import { isLocalReviewEnabled } from '@/lib/client-hub-migration/recipient-policy';
import './review.css';

export default async function ClientHubReview() {
  if (!isLocalReviewEnabled(process.env.NODE_ENV, process.env.ASSEMBL_HUB_MIGRATION_REVIEW, (await headers()).get('host'))) notFound();
  return <div className="client-hub-migration-review">
    <aside className="migration-boundary" role="status"><strong>assembl · local migration review</strong> Original workspace components. Synthetic examples only; drafts are ephemeral. No production data, paid generation or sharing connection.</aside>
    <ConceptStudio />
  </div>;
}
