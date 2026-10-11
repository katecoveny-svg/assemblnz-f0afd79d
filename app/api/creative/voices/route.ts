import { voiceRoute } from '@/lib/voice/assembl/http';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const GET=(request:Request)=>voiceRoute(request);
export const POST=(request:Request)=>voiceRoute(request);
