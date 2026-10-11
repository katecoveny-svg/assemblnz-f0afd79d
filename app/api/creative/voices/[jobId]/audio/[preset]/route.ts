import { voiceRoute } from '@/lib/voice/assembl/http';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request,context:{params:Promise<{jobId:string;preset:string}>}){
  const {jobId,preset}=await context.params;return voiceRoute(request,jobId,preset);
}
