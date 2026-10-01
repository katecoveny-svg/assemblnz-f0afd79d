import {sectors, type Sector} from "./concept-engine";
import {sellerFocus, type ResearchFocus} from "./radar-scope";

export const companies = {
 assembl: {name:"assembl", focus:"agency", label:"Customer journeys & creative", clients:["custom","grocery","travel","trade","manufacturing","government","school","village","works"], targets:"Enterprise partners, agencies and organisations with a useful customer journey to develop"},
 sap: {name:"Example Technology Studio", focus:"technology", label:"Enterprise technology", clients:["grocery","manufacturing","trade","government","travel","custom"], targets:"Foodstuffs, Fonterra, Mitre 10 and New Zealand government technology buyers"},
 hawkins: {name:"Example Construction Studio", focus:"construction", label:"Construction & major projects", clients:["school","village","works","custom"], targets:"School property buyers, retirement developers and New Zealand government construction buyers"},
 southbase: {name:"Example Project Studio", focus:"construction", label:"Construction & major projects", clients:["school","village","works","custom"], targets:"School property buyers, retirement developers and New Zealand government construction buyers"},
 custom: {name:"Your company", focus:"other", label:"Agency or another company", clients:sectors, targets:"Your chosen clients and relevant New Zealand government opportunities"},
} as const;
export type CompanyKey=keyof typeof companies;
export function companyKey(name:string):CompanyKey {
 if(/^assembl(?:\s|$)/i.test(name.trim()))return "assembl";
 if(/^sap(?:\s|$)/i.test(name.trim()))return "sap";
 if(/^hawkins(?:\s|$)/i.test(name.trim()))return "hawkins";
 if(/^southbase(?:\s|$)/i.test(name.trim()))return "southbase";
 return "custom";
}
export function clientSectors(seller:string, focus?:ResearchFocus):readonly Sector[]{
 const key=companyKey(seller);
 if(key!=="custom")return companies[key].clients;
 const f=sellerFocus({name:seller,focus});
 return f==="construction"?companies.hawkins.clients:f==="technology"?companies.sap.clients:sectors;
}
export function defaultCompany(sector:Sector):CompanyKey{return ["school","village","works"].includes(sector)?"hawkins":sector==="custom"?"custom":"sap";}
export function companySector(seller:string,sector:Sector):Sector{
 const available=clientSectors(seller);return available.includes(sector)?sector:available[0];
}
export function inboxStartingPoint(item:{title:string;organisation?:string;summary?:string},preferredSeller="Your company"):{seller:string;sector:Sector}{
 const text=`${item.title} ${item.summary||""}`,account=item.organisation||"";
 const digital=/software|\bERP\b|\bCRM\b|digital (?:service|platform)|IT system|cloud service/i.test(text);
 const physical=!digital&&/construction|school (?:property|project|contract)|classroom|teaching space|main contractor|building works|retirement complex|civil works/i.test(text);
 if(physical){const sector=/school|education|\bMOE\b|classroom|teaching space/i.test(text+account)?"school":/retirement|village/i.test(text+account)?"village":"works";return {seller:sellerFocus({name:preferredSeller})==="construction"?preferredSeller:"Example Construction Studio",sector};}
 const sector:Sector=/fonterra|farm source/i.test(account+text)?"manufacturing":/foodstuffs|new world|grocery/i.test(account+text)?"grocery":/mitre ?(?:ten|10)/i.test(account+text)?"trade":/air new zealand|air nz|koru/i.test(account+text)?"travel":digital&&/ministry|government|\bMOE\b/i.test(account+text)?"government":"custom";
 return {seller:preferredSeller,sector:companySector(preferredSeller,sector)};
}
