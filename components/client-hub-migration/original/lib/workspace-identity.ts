import type {Hub} from "./pursuit-hub";
import {companySector} from "./pursuit-companies";

export const companyIdentity=(seller:string)=>seller.trim().toLocaleLowerCase("en-NZ").replace(/\s+/g," ");
export const clientIdentity=(buyer:string)=>buyer.trim().toLocaleLowerCase("en-NZ").replace(/\s+/g," ");
export const localHubKey=(seller:string,sector:string)=>`assembl-pursuit-preview-v2:${encodeURIComponent(companyIdentity(seller))}:${sector}`;
export function companyContextIssue(h:Hub){
 if(h.sellerProfile&&companyIdentity(h.sellerProfile.name)!==companyIdentity(h.seller))return "The saved company profile belongs to a different company. Start a new pitch in the correct company hub.";
 if(h.radar&&companyIdentity(h.radar.seller.name)!==companyIdentity(h.seller))return "This Radar record belongs to a different company. Open it from that company’s hub.";
 if(h.engine&&companySector(h.seller,h.engine.sector)!==h.engine.sector)return "This experience belongs to a different company offering. Choose the company and client before developing it.";
 return "";
}
