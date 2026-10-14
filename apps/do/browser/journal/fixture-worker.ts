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
type Session={owner:string;scope:BrowserScope;expiresAt:number;read:boolean;observation:CartObservation|null;proposal:CartProposal|null;approval:Approval|null};
/** Exact module executed inside a real dedicated Worker by controlled proof.
 * Native MV3 sender/document transport remains a separately reviewed integration. */
export class JournalFixtureWorker {
  private session:Session|null=null;
  private busy=false;
  private recovery:{key:string;digest:string;observation:CartObservation}|null=null;
  constructor(private journal:LocalMutationJournal,private host:FixtureWorkerHost,private now=()=>Date.now()) {
    if(host.adapter.mode!=='controlled_fixture')throw new Error('Fixture only');
  }
  private async guard(session:Session) {
    if(this.session!==session||session.expiresAt<=this.now()||session.owner!==await this.host.owner()||!await this.host.current(session.scope)) {
      this.session=null;this.recovery=null;throw new Error('Reconnect and review');
    }
    await this.journal.current();
  }
  async dispatch(sender:unknown,command:unknown):Promise<unknown> {
    if(!this.host.companion(sender))throw new Error('Extension-owned review required');
    const c=command as {action?:string;scope?:BrowserScope;quantities?:{productId:string;targetQuantity:number}[];digest?:string};
    if(c.action==='cancel'){this.session=null;this.recovery=null;return{connected:false};}
    if(this.busy)throw new Error('Worker operation in progress');
    this.busy=true;
    try {
      if(c.action==='connect') {
        this.session=null;this.recovery=null;
        const owner=await this.host.owner();
        const scope=browserScope.parse(c.scope);
        if(!owner||scope.origin!=='http://127.0.0.1:4198'||!await this.host.current(scope))throw new Error('Verified fictional tab required');
        await this.journal.current();
        this.session={owner,scope,expiresAt:this.now()+120000,read:false,observation:null,proposal:null,approval:null};
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
        const pending=await this.journal.pending(s.owner);if(!pending)throw new Error('No pending operation');
        // Journal independently verifies owner/context at acknowledgement time.
        const digest=await digestObservation(observed);
        this.recovery={key:pending.key,digest,observation:observed};
        return{digest,items:pending.items.map(i=>({...i,current:observed.items.find(p=>p.productId===i.sku)?.quantity??null})),notice:'Outcome uncertain. Current quantity does not prove this operation caused it. Acknowledgement never retries.'};
      }
      if(c.action==='recover-ack'){
        const r=this.recovery;if(!r||r.digest!==c.digest)throw new Error('Recovery review changed');
        if(!s.read)throw new Error('Read approval required');
        const fresh=cartObservation.parse(await this.host.adapter.observe());await this.guard(s);
        if(this.now()-fresh.observedAt>10000||fresh.observedAt>this.now()||await digestObservation(fresh)!==r.digest)throw new Error('Cart changed since recovery review');
        await this.journal.reconcileAfterRestart(s.owner,r.key,fresh.retailerContext ?? {fixtureOrigin:'http://127.0.0.1:4198'},r.digest,async()=>{await this.guard(s);return true;});
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
        return executeReviewedCart({ownerId:s.owner,approvalId:a.id,proposal:p},store,this.host.adapter,this.now);
      }
      throw new Error('Unsupported command');
    }finally{this.busy=false;}
  }
}
async function digestObservation(observation:CartObservation){
  const {observedAt:_time,...facts}=observation;
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(facts)))),b=>b.toString(16).padStart(2,'0')).join('');
}
