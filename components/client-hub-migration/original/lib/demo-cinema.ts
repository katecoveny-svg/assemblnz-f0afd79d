import {z} from "zod/v3";
import type {Hub} from "./pursuit-hub";
import type {Sector} from "./concept-engine";
import {clientSectors} from "./pursuit-companies";
import {hubVisuals,isPresetArtwork,cinemaArtwork} from "./hub-visuals";

export const cinemaSchema=z.object({
 mode:z.enum(["automatic","still","upload"]),
 mediaId:z.string().uuid().optional(),
 title:z.string().max(140).default(""),
 description:z.string().max(1500).default(""),
}).strict().refine(v=>v.mode!=="upload"||!!v.mediaId,"Choose a company video.");
export type Cinema=z.infer<typeof cinemaSchema>;
export type DemoVideo={id:string;company:string;filename:string;size:number;type:"video/mp4"|"video/webm";createdAt:number};
export const VIDEO_LIMIT=25_000_000;
export const sceneFilms=Object.fromEntries(Object.entries(hubVisuals).filter(([,v])=>v.film).map(([sector,v])=>[sector,{src:`/cinematic/nadir-${sector}.mp4`,poster:v.poster,title:v.title,description:`Original illustrative film: ${v.subject.toLowerCase()}. An aerial design assembly made for this sector. It does not depict a real client process, issued design, live project or approved method.`}])) as Partial<Record<Sector,{src:string;poster:string;title:string;description:string}>>;
export function sceneFilm(h:Hub){const sector=h.engine?.sector;return sector&&clientSectors(h.seller,h.sellerProfile?.focus).includes(sector)?sceneFilms[sector]||null:null;}
export function cinemaFor(h:Hub,origin:string,privateSource?:string){
 const setting=h.cinema,film=sceneFilm(h);
 if(setting?.mode==="still")return null;
 if(setting?.mode==="upload"){
  const valid=privateSource&&(/^data:video\/(?:mp4|webm);base64,[A-Za-z0-9+/=]+$/.test(privateSource)||/^blob:https?:\/\//.test(privateSource)||privateSource.startsWith(origin+"/room/")&&/\/room\/[0-9a-f-]{36}\/film$/.test(privateSource));
  return valid?{src:privateSource!,title:setting.title||"Proposed client experience film",description:setting.description}:null;
 }
 if(cinemaArtwork(h)==="/cinematic/assembl-plum-aerial.jpg")return {src:origin+"/cinematic/assembl-plum-aerial.mp4",poster:"/cinematic/assembl-plum-aerial.jpg",title:"Objects, assembled",description:"Original generated overhead film: white vessels gather across deep plum water. An assembl brand study, not an actual client operation."};
 if(!film||!isPresetArtwork(h))return null;
 return {...film,src:privateSource&&/^data:video\/(?:mp4|webm);base64,[A-Za-z0-9+/=]+$/.test(privateSource)?privateSource:origin+film.src};
}
export function videoSignature(bytes:Uint8Array,type:string){
 if(type==="video/mp4")return bytes.length>=12&&new TextDecoder().decode(bytes.slice(4,8))==="ftyp";
 return type==="video/webm"&&bytes[0]===0x1a&&bytes[1]===0x45&&bytes[2]===0xdf&&bytes[3]===0xa3;
}
export function byteRange(value:string|null,size:number){
 if(!value)return null;
 const match=/^bytes=(\d*)-(\d*)$/.exec(value);if(!match||!match[1]&&!match[2])return false;
 const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
 const end=match[1]?(match[2]?Math.min(Number(match[2]),size-1):size-1):size-1;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start)return false;
 return {offset:start,length:end-start+1};
}
