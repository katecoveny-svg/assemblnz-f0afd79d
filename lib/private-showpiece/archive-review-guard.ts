import {hubSchema,type Hub} from '@/components/client-hub-migration/original/lib/pursuit-hub';
/** Local-only binding; never sent to a provider or stored as provenance. */
export const hubReviewContext=(hub:Hub)=>JSON.stringify(hubSchema.parse(hub));
export function createArchiveReviewGuard(initialContext:string){
 let context=initialContext,epoch=0,loadedHash:string|undefined,review:{context:string;epoch:number;hash:string}|undefined;
 const current=(token:{context:string;epoch:number})=>token.context===context&&token.epoch===epoch;
 return {
  syncContext(next:string){if(next===context)return false;context=next;epoch++;loadedHash=undefined;review=undefined;return true;},
  beginLoad(){epoch++;loadedHash=undefined;review=undefined;return {context,epoch};},
  acceptLoad(token:{context:string;epoch:number},hash:string){if(!current(token))return false;loadedHash=hash;return true;},
  isCurrent:current,
  review(hash:string){if(hash!==loadedHash)throw Error('Archive changed before review.');review={context,epoch,hash};},
  clearReview(){review=undefined;},
  assertSelection(hash:string){if(!review||review.context!==context||review.epoch!==epoch||review.hash!==hash||loadedHash!==hash)throw Error('Review source provenance again for the current Hub and archive.');},
  invalidate(){epoch++;review=undefined;loadedHash=undefined;},
 };
}
