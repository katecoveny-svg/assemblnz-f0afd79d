import {z} from "zod/v3";
import {contrast} from "./client-brand";
import type {Hub} from "./pursuit-hub";
const colour=z.string().regex(/^#[0-9a-f]{6}$/i);
export const deckSchema=z.object({id:z.string().uuid(),name:z.string().min(1).max(160),bytes:z.number().int().positive().max(12000000),type:z.enum(["pdf","pptx"])}).strict();
export const sellerBrandSchema=z.object({
 primary:colour,onPrimary:colour,accent:colour,paper:colour,ink:colour,
 font:z.enum(["sap72","system","arial","editorial"]),
 logo:z.string().max(220000).refine(v=>v===""||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v),"Upload a PNG, JPEG or WebP logo."),
 notes:z.string().max(3000),notesApproved:z.boolean(),decks:z.array(deckSchema).max(6),
}).strict().superRefine((v,ctx)=>{if(![v.primary,v.onPrimary,v.paper,v.ink].every(x=>/^#[0-9a-f]{6}$/i.test(x)))return;if(contrast(v.primary,v.onPrimary)<4.5)ctx.addIssue({code:z.ZodIssueCode.custom,path:["onPrimary"],message:"Use stronger contrast for button text."});if(contrast(v.paper,v.ink)<4.5)ctx.addIssue({code:z.ZodIssueCode.custom,path:["ink"],message:"Use stronger contrast for body text."});});
export type SellerBrand=z.infer<typeof sellerBrandSchema>;
export type BrandDeck=z.infer<typeof deckSchema>;
export const sellerFonts={sap72:'"SAP 72",Arial,Helvetica,sans-serif',system:'var(--font-body, "Instrument Sans"), system-ui,sans-serif',arial:'Arial,Helvetica,sans-serif',editorial:'Georgia,serif'};
export function defaultSellerBrand(seller:string):SellerBrand{
 const base={logo:"",notes:"",notesApproved:false,decks:[]};
 if(/^sap(?:\s|$)/i.test(seller))return {...base,primary:"#0070f2",onPrimary:"#ffffff",accent:"#1b90ff",paper:"#f5f9ff",ink:"#1d2d3e",font:"sap72"};
 if(/^southbase(?:\s|$)/i.test(seller))return {...base,primary:"#78be37",onPrimary:"#111111",accent:"#78be37",paper:"#ffffff",ink:"#151515",font:"system"};
 if(/^hawkins(?:\s|$)/i.test(seller))return {...base,primary:"#252525",onPrimary:"#ffffff",accent:"#6e7f88",paper:"#f7f7f5",ink:"#242424",font:"system"};
 return {...base,primary:"#240B21",onPrimary:"#ffffff",accent:"#916A70",paper:"#FFFDFB",ink:"#240B21",font:"system"};
}
export function resolveSellerBrand(h:Pick<Hub,"seller"|"sellerBrand">){return h.sellerBrand||defaultSellerBrand(h.seller);}
export function publicSellerBrand(h:Pick<Hub,"seller"|"sellerBrand">){const {primary,onPrimary,accent,paper,ink,font,logo}=resolveSellerBrand(h);return {primary,onPrimary,accent,paper,ink,font,logo};}
