import 'server-only';
import { createHmac } from 'node:crypto';
import { voiceJobSchema, type VoiceRequest } from './model';

export class VoiceServiceError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function engineConfig() {
  const secret = process.env.ASSEMBL_VOICE_ENGINE_SECRET || '';
  const raw = process.env.ASSEMBL_VOICE_ENGINE_URL || '';
  if (secret.length < 32 || !raw) throw new VoiceServiceError(503, 'Voice generation is not configured yet.');
  let url: URL;
  try { url = new URL(raw); } catch { throw new VoiceServiceError(503, 'Voice generation is not configured correctly.'); }
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
      !(url.protocol === 'https:' || (url.protocol === 'http:' && ['127.0.0.1','localhost','[::1]'].includes(url.hostname)))) {
    throw new VoiceServiceError(503, 'Voice generation requires a private HTTPS service.');
  }
  return { url:url.origin, secret };
}
export function ownerToken(owner: string, secret: string) { return createHmac('sha256',secret).update('assembl-voice-owner:'+owner).digest('hex'); }
export async function engineRequest(owner: string, path: string, method='GET', body?: VoiceRequest) {
  const config = engineConfig();
  try {
    const response = await fetch(config.url + path, {
      method, redirect:'error', cache:'no-store', signal:AbortSignal.timeout(15000),
      headers:{ Authorization:'Bearer '+config.secret, 'X-Assembl-Owner':ownerToken(owner,config.secret), 'Content-Type':'application/json' },
      ...(body ? {body:JSON.stringify(body)} : {}),
    });
    if (!response.ok) {
      const status = [400,404,413,429].includes(response.status) ? response.status : 503;
      throw new VoiceServiceError(status, status===404?'This voice job is unavailable or has expired.':status===429?'The voice queue is busy or your hourly limit has been reached. Try later.':'Voice generation is unavailable. Keep your script and try again.');
    }
    return response;
  } catch(e) {
    if(e instanceof VoiceServiceError) throw e;
    throw new VoiceServiceError(503,'The voice service could not be reached. Keep your script and try again.');
  }
}
async function bounded(response: Response, max: number) {
  const reader=response.body?.getReader(); if(!reader) throw new VoiceServiceError(502,'Empty voice response.');
  const chunks:Uint8Array[]=[];let size=0;
  try { for(;;) {const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new VoiceServiceError(502,'Voice response was too large.');}chunks.push(value);} }
  finally{reader.releaseLock();}
  return Buffer.concat(chunks);
}
export async function readVoiceJob(response:Response) {
  try{return voiceJobSchema.parse(JSON.parse((await bounded(response,12000)).toString('utf8')));}
  catch{throw new VoiceServiceError(502,'The voice service returned an invalid job.');}
}
export async function readVoiceAudio(response:Response) {
  const data=await bounded(response,2000000);
  if(data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WAVE')throw new VoiceServiceError(502,'No valid audio was returned.');
  return data;
}
