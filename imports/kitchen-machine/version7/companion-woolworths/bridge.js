(()=>{
if(globalThis.__assemblWWBridge)return;globalThis.__assemblWWBridge=true;
const origin='https://kitchen-machine-kate.katecoveny.chatgpt.site';
if(location.origin!==origin||window.top!==window)return;
const allowed=new Set(['status','prepare','open','disconnect']);
window.addEventListener('message',async e=>{
 const m=e.data;if(e.source!==window||e.origin!==origin||m?.channel!=='assembl.woolworths.request'||!allowed.has(m.action)||typeof m.id!=='string'||m.id.length>100)return;
 try{const r=await chrome.runtime.sendMessage({from:'kitchen-site',action:m.action,plan:m.plan});window.postMessage({channel:'assembl.woolworths.response',id:m.id,...r},origin);}catch{window.postMessage({channel:'assembl.woolworths.response',id:m.id,ok:false,error:'Companion disconnected. Open the extension to reconnect.'},origin);}
});
})();
