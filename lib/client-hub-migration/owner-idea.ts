import { conceptSchema, type Concept } from '@/components/client-hub-migration/original/lib/concept-engine';
import type { Hub } from '@/components/client-hub-migration/original/lib/pursuit-hub';

export function newOwnerIdea(h:Hub):Concept {
  return conceptSchema.parse({id:crypto.randomUUID(),title:`${h.buyer}: working idea`.slice(0,150),promise:'',why:'',agent:'',value:'',metric:'',
    origin:'owner draft',createdAt:new Date().toISOString(),evidenceIds:[],reviewFlags:[],
    journey:{before:'',during:'',after:'',wait:'',reviewer:'Reviewer to appoint',question:'What would make your next step easier?',
      options:[{label:'My priorities',detail:'Write the useful output for this choice.',items:[]},{label:'My next step',detail:'Write the questions for the responsible reviewer.',items:[]}]},
    pilot:'',gaps:['Confirm the facts, permissions and responsible reviewer.']});
}
