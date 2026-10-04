import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ConceptStudio from '@/components/client-hub-migration/original/app/hub/concept-studio';
import { isLocalReviewEnabled } from '@/lib/client-hub-migration/recipient-policy';
import {isInterviewExampleKey} from '@/lib/client-hub-migration/interview-examples';
import './review.css';

export default async function ClientHubReview({searchParams}:{searchParams:Promise<{layout?:string;example?:string}>}) {
  if (!isLocalReviewEnabled(process.env.NODE_ENV, process.env.ASSEMBL_HUB_MIGRATION_REVIEW, (await headers()).get('host'))) notFound();
  const params=await searchParams,example=isInterviewExampleKey(params.example)?params.example:undefined;
  const ownerLayout=params.layout==='owner'||!!example;
  return <div className="client-hub-migration-review">
    <aside className="migration-boundary" role="status"><strong>assembl · local migration review</strong> {ownerLayout?'Owner layout preview only. Synthetic data; any save stays on this device. This is not authenticated cloud persistence.':'Original workspace components. Synthetic examples only; drafts are ephemeral.'} No production data, paid generation or sharing connection.</aside>
    <ConceptStudio ownerMode={ownerLayout} localPreview={ownerLayout} initialExample={example} />
  </div>;
}
