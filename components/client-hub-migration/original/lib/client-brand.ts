import {z} from "zod/v3";
import {clientBrandAssets} from "./client-brand-assets";
import type {Hub} from "./pursuit-hub";
const colour=z.string().regex(/^#[0-9a-f]{6}$/i);
const web=z.string().max(1500).url().refine(value=>{try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password;}catch{return false;}});
const logo=z.string().max(220000).refine(value=>value===""||/^\/brands\/(clubplus|mitre10|newworld)\.svg$/.test(value)||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)||web.safeParse(value).success,"Use a public HTTPS image or a PNG, JPEG or WebP logo.");
export function contrast(a:string,b:string){const luminance=(hex:string)=>{const n=hex.slice(1).match(/../g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));return n[0]*.2126+n[1]*.7152+n[2]*.0722;};const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export const clientBrandSchema=z.object({
 preset:z.enum(["clubplus","mitre10","custom"]),name:z.string().trim().min(1).max(90),programme:z.string().max(100),
 primary:colour,onPrimary:colour,accent:colour,paper:colour,ink:colour,logo,
 sourceUrl:z.union([web,z.literal("")]),checked:z.string().max(40),
}).strict().superRefine((v,ctx)=>{
 if(![v.primary,v.onPrimary,v.paper,v.ink].every(x=>/^#[0-9a-f]{6}$/i.test(x)))return;
 if(contrast(v.primary,v.onPrimary)<4.5)ctx.addIssue({code:z.ZodIssueCode.custom,path:["onPrimary"],message:"Choose button text with stronger contrast against the primary colour."});
 if(contrast(v.paper,v.ink)<4.5)ctx.addIssue({code:z.ZodIssueCode.custom,path:["ink"],message:"Choose body text with stronger contrast against the background."});
});
export type ClientBrand=z.infer<typeof clientBrandSchema>;
export const brandPresets:Record<"clubplus"|"mitre10",ClientBrand>={
 clubplus:{preset:"clubplus",name:"Club+",programme:"Club+ app · proposed addition",primary:"#5d1edc",onPrimary:"#ffffff",accent:"#a296ff",paper:"#f5f3ff",ink:"#282820",logo:"/brands/clubplus.svg",sourceUrl:"https://www.clubplus.co.nz/",checked:"13 September 2026"},
 mitre10:{preset:"mitre10",name:"Mitre 10",programme:"Trade Hub · proposed mobile experience",primary:"#ff6d00",onPrimary:"#171717",accent:"#ffb777",paper:"#fff7f0",ink:"#171717",logo:"/brands/mitre10.svg",sourceUrl:"https://www.mitre10.co.nz/club",checked:"13 September 2026"},
};
export function resolveClientBrand(h:Pick<Hub,"buyer"|"clientBrand">):ClientBrand|undefined{
 if(h.clientBrand)return h.clientBrand;
 if(/\bfoodstuffs\b|\bnew world\b|club\+|pak.?n.?save|four square/i.test(h.buyer))return brandPresets.clubplus;
 if(/\bmitre\s*(10|ten)\b/i.test(h.buyer))return brandPresets.mitre10;
}
export function customClientBrand(buyer:string):ClientBrand{return {preset:"custom",name:buyer.slice(0,90)||"Your client",programme:"Proposed customer experience",primary:"#60354b",onPrimary:"#ffffff",accent:"#d6b8c8",paper:"#f8f4f6",ink:"#2f222a",logo:"",sourceUrl:"",checked:"Review needed"};}
export function brandAsset(logo:string,origin:string){return clientBrandAssets[logo]||(logo.startsWith("/brands/")?origin+logo:logo);}
