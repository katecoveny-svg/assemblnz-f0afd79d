import {z} from "zod/v3";
import {companies, type CompanyKey} from "./pursuit-companies";

export const studioKeys = ["assembl", "sap", "hawkins", "southbase"] as const;
export type StudioKey = typeof studioKeys[number];
export const studioKeySchema = z.enum(studioKeys);
export const studioWorlds: Record<StudioKey, {name:string; title:string; description:string; image:string; imageAlt:string; primary:string; paper:string; ink:string}> = {
  assembl: {name:"assembl", title:"Your next possibility, assembled.", description:"Client intelligence, creative ideas and experiences prepared for your next conversation.", image:"/cinematic/assembl-plum-aerial.jpg", imageAlt:"Generated overhead composition of white vessels gathering across deep plum water", primary:"#240B21", paper:"#FFFDFB", ink:"#240B21"},
  sap: {name:"SAP", title:"Let your buyers see what is possible.", description:"Client intelligence and interactive experiences for enterprise technology conversations.", image:"/cinematic/studio-sap-aerial.jpg", imageAlt:"Generated overhead study of coordinated distribution in SAP blue", primary:"#0070f2", paper:"#f5f9ff", ink:"#1d2d3e"},
  hawkins: {name:"Hawkins", title:"Make the proposed delivery tangible.", description:"Project intelligence, considered proposals and experiences for construction buyers.", image:"/cinematic/studio-hawkins-aerial.jpg", imageAlt:"Illustrative overhead assembly of learning spaces", primary:"#252525", paper:"#f7f7f5", ink:"#242424"},
  southbase: {name:"Southbase", title:"Give the project a clear next step.", description:"Project intelligence, delivery concepts and reviewable client experiences.", image:"/cinematic/studio-southbase-aerial.jpg", imageAlt:"Illustrative overhead assembly of infrastructure components", primary:"#466f20", paper:"#ffffff", ink:"#151515"},
};

export const studioShareSchema = z.object({
  company:studioKeySchema,
  title:z.string().trim().min(1).max(140),
  introduction:z.string().trim().max(600),
  reviewer:z.string().trim().min(1).max(100),
  tokens:z.array(z.string().uuid()).max(24).refine(v=>new Set(v).size===v.length,"Choose each experience once."),
}).strict();
export type StudioShare = z.infer<typeof studioShareSchema>;
export type StudioExperience = {token:string; title:string; seller:string; buyer:string; revision:number; image:string; href:string; example?:boolean};
export function isStudioKey(value:string):value is StudioKey {return studioKeySchema.safeParse(value).success;}
export function studioCompany(key:StudioKey){return companies[key].name;}
export function studioForCompany(key:CompanyKey):StudioKey|undefined{return isStudioKey(key)?key:undefined;}
export function buyerImage(buyer:string){
  if(/foodstuffs|new world|club\+|pak.?n.?save|four square/i.test(buyer))return "/cinematic/foodstuffs-aerial.jpg";
  if(/fonterra|farm source/i.test(buyer))return "/cinematic/nadir-manufacturing.jpg";
  if(/mitre\s*(10|ten)/i.test(buyer))return "/cinematic/nadir-trade.jpg";
  if(/air new zealand|air nz|koru/i.test(buyer))return "/cinematic/nadir-travel.jpg";
  if(/retirement|village/i.test(buyer))return "/cinematic/nadir-village.jpg";
  if(/school|learning/i.test(buyer))return "/cinematic/nadir-school.jpg";
  if(/construction|civil/i.test(buyer))return "/cinematic/nadir-works.jpg";
  if(/government|ministry/i.test(buyer))return "/cinematic/nadir-government.jpg";
  return "";
}
