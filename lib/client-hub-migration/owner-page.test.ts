import {describe,it,expect,vi,beforeEach} from 'vitest';
const state=vi.hoisted(()=>({session:vi.fn()}));
vi.mock('@/lib/client-hub-migration/owner-session',()=>({ownerSession:state.session}));
vi.mock('next/navigation',()=>({notFound:()=>{throw Error('OWNER_NOT_FOUND');}}));
vi.mock('@/components/client-hub-migration/original/app/hub/concept-studio',()=>({default:()=>null}));
import OwnerWorkspace from '@/app/studio/workspace/page';
describe('owner page authorization boundary',()=>{
 beforeEach(()=>state.session.mockReset());
 it('returns no workspace when ownerSession denies the request',async()=>{state.session.mockResolvedValue(null);await expect(OwnerWorkspace()).rejects.toThrow('OWNER_NOT_FOUND');});
 it('renders only owner mode after a test-configured approved session, without fixture or recipient props',async()=>{
  state.session.mockResolvedValue({userId:'11111111-1111-4111-8111-111111111111',client:{}});
  const page=await OwnerWorkspace();expect(page.props.children[1].props).toEqual({ownerMode:true});
 });
});
