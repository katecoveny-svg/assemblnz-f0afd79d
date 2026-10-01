import { z } from 'zod';
import { hubSchema, type Hub, type HubRecord } from '@/components/client-hub-migration/original/lib/pursuit-hub';
import { starterCompanyHub } from '@/components/client-hub-migration/original/lib/company-hub';

export function ownerWorkspaceEnabled(flag: string | undefined, allowlist: string | undefined, user: {id:string;is_anonymous?:boolean} | null) {
  return flag === '1' && !!user && !user.is_anonymous && (allowlist || '').split(',').map(x=>x.trim()).includes(user.id);
}
export const saveOwnerDraftSchema = z.object({ id:z.uuid().optional(), revision:z.number().int().nonnegative(), payload:z.unknown() }).strict();
export function parseOwnerDraft(input: unknown) {
  const body = saveOwnerDraftSchema.parse(input);
  if ((!body.id && body.revision !== 0) || (body.id && body.revision < 1)) throw new Error('Invalid revision.');
  const payload = hubSchema.parse(body.payload);
  if (new TextEncoder().encode(JSON.stringify(payload)).length > 1800000) throw new Error('Draft exceeds 1.8 MB.');
  return {...body,payload};
}
export function emptyOwnerHub(seller='Your company'):Hub {
  const h=starterCompanyHub('custom',seller);
  return hubSchema.parse({...h,name:'New client brief',buyer:'Your client',sources:[],privateNotes:'',research:'',
    engine:{...h.engine!,brief:'',concepts:[],selected:'',requirements:[],evidence:[],researchPacket:''},
    design:{...h.design,buyer:'Your client',frame:{...h.design.frame,artwork:undefined}}});
}
export function ownerRecord(row:{id:string;revision:number;updated_at:string;payload:unknown}):HubRecord {
  return {id:row.id,revision:row.revision,updatedAt:Date.parse(row.updated_at),payload:hubSchema.parse(row.payload)};
}
