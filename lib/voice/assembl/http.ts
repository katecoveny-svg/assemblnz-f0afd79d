import 'server-only';
import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson } from '@/apps/do/shared/http';
import { z } from 'zod';
import { presetSchema, voiceRequestSchema } from './model';
import { engineConfig, engineRequest, readVoiceAudio, readVoiceJob, VoiceServiceError } from './client';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:privateDoHeaders});
export async function voiceRoute(request:Request, jobId?:string, preset?:string) {
  try {
    if(['POST','DELETE'].includes(request.method)&&!sameDoOrigin(request))return json({message:'Open the voice studio to review this request.'},403);
    const owner=await doOwner(); if(!owner)return json({message:'Sign in with your assembl account to generate or retrieve voices.'},401);
    if(jobId&&!z.string().uuid().safeParse(jobId).success)return json({message:'Choose a valid voice job.'},400);
    if(preset&&!presetSchema.safeParse(preset).success)return json({message:'Choose a valid voice.'},400);
    if(request.method==='POST'&&!jobId) {
      let raw:unknown;
      try{raw=await readDoJson(request,4096);}catch(e){return json({message:'Use a valid script smaller than 4 KB.'},e instanceof Error&&e.message==='too_large'?413:400);}
      const input=voiceRequestSchema.safeParse(raw);
      if(!input.success)return json({message:'Check your script, voice choices and generation permission.'},400);
      return json(await readVoiceJob(await engineRequest(owner.id,'/jobs','POST',input.data)),202);
    }
    engineConfig();
    if(!jobId) {
      await engineRequest(owner.id,'/health');
      return json({available:true,language:'en-NZ',accentReview:'pending'});
    }
    const path='/jobs/'+jobId;
    if(request.method==='DELETE'){await engineRequest(owner.id,path,'DELETE');return new Response(null,{status:204,headers:privateDoHeaders});}
    if(preset) {
      const audio=await readVoiceAudio(await engineRequest(owner.id,path+'/audio/'+preset));
      return new Response(new Uint8Array(audio),{headers:{...privateDoHeaders,'Content-Type':'audio/wav','Content-Disposition':'inline; filename="assembl-'+preset+'.wav"'}});
    }
    return json(await readVoiceJob(await engineRequest(owner.id,path)));
  }catch(e){return json({message:e instanceof VoiceServiceError?e.message:'Voice generation is unavailable. Keep your script and try again.'},e instanceof VoiceServiceError?e.status:503);}
}
