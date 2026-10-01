import {starterHub,type Hub} from "./pursuit-hub";
import {clients,starterEngine,isConstructionSector,type Sector} from "./concept-engine";
import {companies,companySector,defaultCompany} from "./pursuit-companies";

export function starterCompanyHub(sector:Sector="grocery",seller:string=companies[defaultCompany(sector)].name):Hub{
 sector=companySector(seller,sector);
 const h=starterHub(isConstructionSector(sector)?"construction":"custom"),p=clients[sector];
 const brief=p.brief.replaceAll(p.seller,seller);
 h.seller=seller;h.buyer=p.name;h.name=`${seller} for ${p.name}`.slice(0,140);
 h.engine={...starterEngine(sector),brief};h.sources=structuredClone(p.sources);h.offer=brief.slice(0,1200);
 h.film=undefined;h.reviewer="";h.privateNotes="";h.research="";
 h.design={...h.design,buyer:p.name,client:seller,brief,frame:{...h.design.frame,artwork:{src:p.image,alt:`Original illustrative ${sector} concept image`},tokens:{...h.design.frame.tokens,ink:p.accent,accent:p.accent,paper:"#f7f6f1"}}};
 return h;
}
