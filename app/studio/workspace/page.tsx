import { notFound } from 'next/navigation';
import { ownerSession } from '@/lib/client-hub-migration/owner-session';
import ConceptStudio from '@/components/client-hub-migration/original/app/hub/concept-studio';
import '@/app/review/client-hub/review.css';

export const dynamic='force-dynamic';
export const metadata={title:'Your private Studio · assembl',robots:{index:false,follow:false}};
export default async function OwnerWorkspace() {
  if(!await ownerSession())notFound();
  return <div className="client-hub-migration-review"><aside className="migration-boundary" role="status"><strong>Your private Studio</strong> New drafts only. Original hubs remain separate. Research, generation, uploads and sharing are not connected.</aside><ConceptStudio ownerMode /></div>;
}
