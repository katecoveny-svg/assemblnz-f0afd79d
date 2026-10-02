import 'server-only';
import {createHash} from 'node:crypto';
export const DIRECT_SOURCE_URLS=Object.freeze([
 'https://www.assembl.co.nz/',
 'https://www.business.govt.nz/operations/getting-started-with-ai/safe-and-smart-ai-use',
]);
export const DIRECT_SOURCE_LIMITS={pages:2,bytesPerPage:256*1024,batchTimeoutMs:5000,textChars:6000,freshMs:5*60*1000} as const;
export type DirectSource={state:'verified';url:string;title:string;text:string;textTruncated:boolean;quoteCandidates:string[];bytes:number;sha256:string;textSha256:string;retrievedAt:string;expiresAt:string;publishedAt:null};
export type DirectSourceCheck=DirectSource|{state:'unavailable';url:string;reason:'source_unavailable';checkedAt:string};
const hash=(value:string|Uint8Array)=>createHash('sha256').update(value).digest('hex');
function plain(value:string){return value.replace(/&(?:#(\d+)|#x([\da-f]+)|(amp|lt|gt|quot|apos|nbsp|ndash|mdash|rsquo|lsquo|rdquo|ldquo));/gi,(_match,decimal,hex,named)=>{
 if(decimal||hex){const code=Number.parseInt(decimal??hex,decimal?10:16);return code>0&&code<=0x10ffff?String.fromCodePoint(code):' ';}
 return ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',ndash:'–',mdash:'—',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“'} as Record<string,string>)[String(named).toLowerCase()]??' ';
 }).replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,' ').replace(/\s+/g,' ').trim();}
async function readPage(response:Response,signal:AbortSignal){
 const length=response.headers.get('content-length');
 if(response.status!==200||response.redirected||!/^text\/html(?:;|$)/i.test(response.headers.get('content-type')??'')||!response.body||(length!==null&&(!/^\d+$/.test(length)||Number(length)>DIRECT_SOURCE_LIMITS.bytesPerPage))){void response.body?.cancel().catch(()=>undefined);throw new Error('source_rejected');}
 const reader=response.body.getReader();const abort=()=>{void reader.cancel().catch(()=>undefined);};signal.addEventListener('abort',abort,{once:true});
 const chunks:Uint8Array[]=[];let size=0;
 try{for(;;){if(signal.aborted)throw new Error('source_timeout');const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>DIRECT_SOURCE_LIMITS.bytesPerPage)throw new Error('source_size');chunks.push(part.value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}return bytes;
 }finally{signal.removeEventListener('abort',abort);void reader.cancel().catch(()=>undefined);}
}
/** Two fixed public HTTPS URLs, no redirects, credentials, retries, links or fallback pages. */
export async function retrieveDirectSources(options:{fetcher?:typeof fetch;now?:()=>number}={}):Promise<DirectSourceCheck[]>{
 const fetcher=options.fetcher??fetch;const now=options.now??Date.now;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),DIRECT_SOURCE_LIMITS.batchTimeoutMs);
 try{return await Promise.all(DIRECT_SOURCE_URLS.map(async url=>{
 let abort:()=>void=()=>undefined;
 const deadline=new Promise<never>((_,reject)=>{abort=()=>reject(new Error('source_timeout'));controller.signal.addEventListener('abort',abort,{once:true});});
 try{return await Promise.race([deadline,(async()=>{
 const response=await fetcher(url,{method:'GET',redirect:'error',credentials:'omit',cache:'no-store',signal:controller.signal,headers:{Accept:'text/html'}});
 if(response.url!==url){void response.body?.cancel().catch(()=>undefined);throw new Error('source_url');}
 const bytes=await readPage(response,controller.signal);const html=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
 const title=plain(/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]??'').slice(0,200);
 const main=/<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)?.[1];if(!title||!main)throw new Error('source_not_substantive');
 const cleanMain=main.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?(?:<\/\1>|$)/gi,' ').replace(/<!--[\s\S]*?-->/g,' ');
 const extracted=plain(main.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?(?:<\/\1>|$)/gi,' ').replace(/<!--[\s\S]*?-->/g,' ').replace(/<[^>]*>/g,' '));
 if(extracted.length<100)throw new Error('source_not_substantive');const text=extracted.slice(0,DIRECT_SOURCE_LIMITS.textChars);const quoteCandidates=[...cleanMain.matchAll(/<(p|h[1-3])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(match=>plain(match[2].replace(/<[^>]*>/g,' '))).filter(value=>value.length>=20&&value.length<=200&&value.split(/\s+/).length<=25&&text.includes(value)).slice(0,12);
 if(!quoteCandidates.length)throw new Error('source_not_substantive');const at=now();
 return {state:'verified' as const,url,title,text,textTruncated:extracted.length>text.length,quoteCandidates,bytes:bytes.byteLength,sha256:hash(bytes),textSha256:hash(text),retrievedAt:new Date(at).toISOString(),expiresAt:new Date(at+DIRECT_SOURCE_LIMITS.freshMs).toISOString(),publishedAt:null};
 })()]);}catch{return {state:'unavailable' as const,url,reason:'source_unavailable' as const,checkedAt:new Date(now()).toISOString()};}finally{controller.signal.removeEventListener('abort',abort);}
 }));}finally{clearTimeout(timer);controller.abort();}
}
export function freshDirectSources(checks:DirectSourceCheck[],now=Date.now()):DirectSource[]{
 if(checks.length!==DIRECT_SOURCE_URLS.length)throw new Error('direct_sources_unavailable');
 return DIRECT_SOURCE_URLS.map(url=>{
 const source=checks.find(check=>check.url===url);if(!source||source.state!=='verified'||Date.parse(source.retrievedAt)>now||Date.parse(source.expiresAt)<=now||!Number.isFinite(Date.parse(source.retrievedAt))||Date.parse(source.expiresAt)-Date.parse(source.retrievedAt)!==DIRECT_SOURCE_LIMITS.freshMs||hash(source.text)!==source.textSha256||source.text.length>DIRECT_SOURCE_LIMITS.textChars)throw new Error('direct_sources_unavailable');
 return source;
 });
}
