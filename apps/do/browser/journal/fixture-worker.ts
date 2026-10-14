/** Dependent staged worker controller. Not imported by the installed pilot. */
import { browserScope, cartObservation, cartProposal, type BrowserScope, type CartObservation, type CartProposal } from '../contract';
import { executeReviewedCart, proposalDigest, type Approval, type CartAdapter } from '../executor';
import { LocalMutationJournal, withLocalJournal } from './local';
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
export interface FixtureWorkerHost {
  /** Native implementation must check extension sender, never page JSON. */
  companion(sender: unknown): boolean;
  owner(): Promise<string | null>;
  current(scope: BrowserScope): Promise<boolean>;
  adapter: CartAdapter;
}
type Session={generation:number;owner:string;scope:BrowserScope;expiresAt:number;read:boolean;observation:CartObservation|null;proposal:CartProposal|null;approval:Approval|null};
/** Exact module executed inside a real dedicated Worker by controlled proof.
 * Native MV3 sender/document transport remains a separately reviewed integration. */
export class JournalFixtureWorker {
  private session:Session|null=null;
  private busy=false;
  private generation=0;
  private recovery:{key:string;digest:string;observation:CartObservation}|null=null;
  constructor(private journal:LocalMutationJournal,private host:FixtureWorkerHost,private now=()=>Date.now()) {
    if(host.adapter.mode!=='controlled_fixture')throw new Error('Fixture only');
  }
  private invalidate() { this.generation++;this.session=null;this.recovery=null; }
  private live(session:Session) {
    if(this.session!==session||session.generation!==this.generation||session.expiresAt<=this.now()) throw new Error('Reconnect and review');
  }
  private async guard(session:Session) {
    try {
      this.live(session);
      const owner=await this.host.owner();this.live(session);
      if(owner!==session.owner)throw new Error('Owner changed');
      const current=await this.host.current(session.scope);this.live(session);
      if(!current)throw new Error('Tab changed');
      await this.journal.current();this.live(session);
      const finalOwner=await this.host.owner();this.live(session);
      if(finalOwner!==session.owner)throw new Error('Owner changed');
    } catch(error) {
      // A stale continuation must never invalidate a newer connection.
      if(this.session===session)this.invalidate();
      throw error;
    }
  }
  async dispatch(sender:unknown,command:unknown):Promise<unknown> {
    if(!this.host.companion(sender))throw new Error('Extension-owned review required');
    const c=command as {action?:string;scope?:BrowserScope;quantities?:{productId:string;targetQuantity:number}[];digest?:string};
    if(c.action==='cancel'){this.invalidate();return{connected:false};}
    if(c.action==='connect')this.invalidate();
    if(this.busy)throw new Error('Worker operation in progress');
    this.busy=true;
    try {
      if(c.action==='connect') {
        const generation=this.generation;
        const check=()=>{if(generation!==this.generation)throw new Error('Connection cancelled');};
        const owner=await this.host.owner();check();
        const scope=browserScope.parse(c.scope);
        if(!owner||scope.origin!=='http://127.0.0.1:4198')throw new Error('Verified fictional tab required');
        const current=await this.host.current(scope);check();
        if(!current)throw new Error('Verified fictional tab required');
        await this.journal.current();check();
        const finalOwner=await this.host.owner();check();
        if(finalOwner!==owner)throw new Error('Owner changed');
        this.session={generation,owner,scope,expiresAt:this.now()+120000,read:false,observation:null,proposal:null,approval:null};
        return{connected:true,readGranted:false};
      }
      const s=this.session;if(!s)throw new Error('Connect explicitly');await this.guard(s);
      if(c.action==='allow-read'){s.read=true;return{readGranted:true};}
      if(c.action==='observe'||c.action==='recover-read'){
        if(!s.read)throw new Error('Companion read approval required');
        const observed=cartObservation.parse(await this.host.adapter.observe());await this.guard(s);
        if(!equal(observed.scope,s.scope)||this.now()-observed.observedAt>10000||observed.observedAt>this.now())throw new Error('Fresh context-bound fixture required');
        s.observation=observed;s.proposal=null;s.approval=null;this.recovery=null;
        if(c.action==='observe')return observed;
        const pending=await this.journal.pending(s.owner);await this.guard(s);if(!pending)throw new Error('No pending operation');
        // Journal independently verifies owner/context at acknowledgement time.
        const digest=await digestObservation(observed);await this.guard(s);
        this.recovery={key:pending.key,digest,observation:observed};
        return{digest,items:pending.items.map(i=>({...i,current:observed.items.find(p=>p.productId===i.sku)?.quantity??null})),notice:'Outcome uncertain. Current quantity does not prove this operation caused it. Acknowledgement never retries.'};
      }
      if(c.action==='recover-ack'){
        const r=this.recovery;if(!r||r.digest!==c.digest)throw new Error('Recovery review changed');
        if(!s.read)throw new Error('Read approval required');
        const fresh=cartObservation.parse(await this.host.adapter.observe());await this.guard(s);
        const digest=await digestObservation(fresh);await this.guard(s);
        if(this.now()-fresh.observedAt>10000||fresh.observedAt>this.now()||digest!==r.digest)throw new Error('Cart changed since recovery review');
        await this.journal.reconcileAfterRestart(s.owner,r.key,fresh.retailerContext ?? {fixtureOrigin:'http://127.0.0.1:4198'},r.digest,async()=>{await this.guard(s);return true;},()=>this.live(s));
        await this.guard(s);
        this.recovery=null;s.observation=null;s.proposal=null;s.approval=null;
        return{acknowledged:true,retried:false};
      }
      if(c.action==='prepare'){
        if(!s.read||!s.observation||this.now()-s.observation.observedAt>10000||!Array.isArray(c.quantities))throw new Error('Read before review');
        const p=cartProposal.parse({protocol:'do.cart.v1',actionId:crypto.randomUUID(),revision:1,scope:s.scope,observedRevision:s.observation.revision,retailerContext:s.observation.retailerContext,expiresAt:s.expiresAt,items:c.quantities.map(q=>({...s.observation!.items.find(i=>i.productId===q.productId),targetQuantity:q.targetQuantity}))});
        const digest=await proposalDigest(p);await this.guard(s);s.proposal=p;s.approval=null;return{proposal:p,digest};
      }
      if(c.action==='approve'){
        const p=s.proposal;if(!p||c.digest!==await proposalDigest(p))throw new Error('Review changed');
        await this.guard(s);
        const a:Approval={id:crypto.randomUUID(),ownerId:s.owner,actionId:p.actionId,revision:p.revision,digest:c.digest,scope:s.scope,expiresAt:s.expiresAt,revoked:false};s.approval=a;
        const store=withLocalJournal(this.journal,{
          getApproval:async(owner,id)=>{await this.guard(s);return owner===s.owner&&id===s.approval?.id?s.approval:null;},
          isConnected:async(owner,scope)=>{await this.guard(s);return owner===s.owner&&equal(scope,s.scope);},
        },s.owner,p,this.now);
        const adapter:CartAdapter={mode:'controlled_fixture',
          observe:async()=>{await this.guard(s);const observed=await this.host.adapter.observe();await this.guard(s);return observed;},
          setQuantity:async(...args)=>{await this.guard(s);await this.host.adapter.setQuantity(...args);await this.guard(s);},
        };
        return await executeReviewedCart({ownerId:s.owner,approvalId:a.id,proposal:p},store,adapter,this.now);
      }
      throw new Error('Unsupported command');
    }finally{this.busy=false;}
  }
}
async function digestObservation(observation:CartObservation){
  const {observedAt:_time,...facts}=observation;
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(facts)))),b=>b.toString(16).padStart(2,'0')).join('');
}
