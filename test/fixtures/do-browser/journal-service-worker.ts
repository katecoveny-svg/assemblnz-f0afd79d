/** Test-only service-worker transport. Never packaged in the extension. */
import './journal-worker-entry';
type LifetimeMessage = MessageEvent & {waitUntil:(promise:Promise<void>)=>void};
const realm = crypto.randomUUID();
const scope=self as unknown as {
  onmessage: (event: LifetimeMessage) => Promise<void>;
  addEventListener: (name:string, callback:(event:{waitUntil:(promise:Promise<unknown>)=>void})=>void)=>void;
  skipWaiting:()=>Promise<void>;clients:{claim:()=>Promise<void>};
};
let client:{postMessage:(message:unknown)=>void}|null=null;
Object.defineProperty(self,'postMessage',{value:(message:unknown)=>{if(!client)throw new Error('Synthetic client missing');client.postMessage({...message as object, serviceWorkerRealm:realm});}});
const receive=scope.onmessage;
scope.onmessage=(event:LifetimeMessage)=>{
 client=event.source as typeof client;
 const work=receive(event);event.waitUntil(work);return work;
};
scope.addEventListener('install',event=>event.waitUntil(scope.skipWaiting()));
scope.addEventListener('activate',event=>event.waitUntil(scope.clients.claim()));
