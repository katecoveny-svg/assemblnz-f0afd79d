import {readFileSync,writeFileSync} from 'node:fs';
import {zodToJsonSchema} from 'zod-to-json-schema';
import {hubSchema} from '../../components/client-hub-migration/original/lib/pursuit-hub';
import {emptyOwnerHub} from '../../lib/client-hub-migration/owner-policy';

// Generated from the actual imported contract, not a hand-written schemaVersion check.
const schema=zodToJsonSchema(hubSchema,{name:'OwnerHub',target:'jsonSchema7',$refStrategy:'none',effectStrategy:'input',applyRegexFlags:true});
// Zod effects are not translated by the converter. Add the wire-boundary checks
// explicitly; SQL implements contrast and Radar approval refinements separately.
type Node={type?:string;format?:string;minLength?:number;maxLength?:number;pattern?:string;additionalProperties?:boolean;[key:string]:unknown};
const image='^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$';
const https='^[Hh][Tt][Tt][Pp][Ss]://[^/@\\s?#]+([/?#][^\\s]*)?$';
const http='^[Hh][Tt][Tt][Pp][Ss]?://[^/@\\s?#]+([/?#][^\\s]*)?$';
function harden(node:Node,path:string[]=[]){
 if(node.type==='object')node.additionalProperties=false;
 if(node.type==='string'){
  node.maxLength??=100; // The original date/history labels lacked a maximum.
  if(node.minLength && !node.pattern)node.pattern='\\S';
  const key=path.at(-1);
  if(node.format==='uri'){
   // Preserve original HTTPS/other regex checks alongside the credentials ban.
   if(node.pattern)node.allOf=[...((node.allOf as Node[]|undefined)||[]),{pattern:node.pattern}];
   node.pattern=path.includes('clientBrand')?https:http;
  }
  if(key==='brandLogo' || key==='logo'&&path.includes('sellerBrand'))node.pattern=`^$|${image}`;
  if(key==='logo'&&path.includes('clientBrand'))node.pattern=`^$|^/brands/(clubplus|mitre10|newworld)\\.svg$|${image}|${https}`;
  if(key==='source'&&path.includes('design'))node.pattern=`^$|${http}`;
 }
 for(const [key,value] of Object.entries(node)){
  if(key==='properties'&&value&&typeof value==='object')for(const [name,child] of Object.entries(value))harden(child as Node,[...path,name]);
  else if(Array.isArray(value)){for(const child of value)if(child&&typeof child==='object')harden(child as Node,path);}
  else if(value&&typeof value==='object')harden(value as Node,path);
 }
}
harden(schema as Node);
writeFileSync('docs/migration-review/owner-payload-schema.json',JSON.stringify(schema,null,2)+'\n');
writeFileSync('scripts/migration-review/synthetic-owner-payload.json',JSON.stringify(emptyOwnerHub('Example Studio'))+'\n');
const template=readFileSync('docs/migration-review/owner-schema-template.sql','utf8');
writeFileSync('docs/migration-review/owner-schema-proposal.sql',template.replace('__OWNER_PAYLOAD_SCHEMA__',JSON.stringify(schema)));
